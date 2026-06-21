'use client';

import { useCallback, useEffect, useState } from 'react';
import { VerifySkillsTab } from '@/components/verify-skills-tab';
import type { VerifySkill } from '@/lib/verify-skills';

type Tab = 'brief' | 'interview' | 'questions' | 'profile' | 'pipeline' | 'skills';

type Track = 'Generalist' | 'Full-Stack' | 'ML/AI' | 'Data' | 'Backend';
type Focus = 'Technical reasoning' | 'System design' | 'Evaluation & metrics' | 'Production rigor';
type PipelineStatus =
  | 'Researching'
  | 'Applied'
  | 'Assessment'
  | 'Interview'
  | 'Active'
  | 'Paused'
  | 'Rejected';

interface SavedQuestion {
  id: string;
  question: string;
  track: Track;
  focus: Focus;
  savedAt: string;
}

interface PipelineEntry {
  id: string;
  platform: string;
  role: string;
  status: PipelineStatus;
  notes: string;
  updatedAt: string;
}

interface ScoreResult {
  score: number;
  strengths: string[];
  improvements: string[];
  strongerVersion: string;
}

interface ProfileResult {
  headline: string;
  summary: string;
  bullets: string[];
}

interface AppState {
  track: Track;
  focus: Focus;
  years: number;
  stack: string;
  projects: string;
  profileSummary: string;
  currentQuestion: string;
  answer: string;
  savedQuestions: SavedQuestion[];
  pipeline: PipelineEntry[];
  lastScore: ScoreResult | null;
  lastProfile: ProfileResult | null;
  sessionScores: number[];
  selectedSkill: VerifySkill;
  screeningQuestion: string;
  screeningAnswer: string;
  lastScreeningScore: ScoreResult | null;
  screeningSessionScores: number[];
}

const STORAGE_KEY = 'ai-interview-desk-v1';

const DEFAULT_STATE: AppState = {
  track: 'Generalist',
  focus: 'Technical reasoning',
  years: 3,
  stack: '',
  projects: '',
  profileSummary: '',
  currentQuestion: '',
  answer: '',
  savedQuestions: [],
  pipeline: [],
  lastScore: null,
  lastProfile: null,
  sessionScores: [],
  selectedSkill: 'JavaScript',
  screeningQuestion: '',
  screeningAnswer: '',
  lastScreeningScore: null,
  screeningSessionScores: [],
};

const PLATFORMS = ['Mercor', 'Outlier', 'Mindrift', 'Alignerr', 'Other'];
const PIPELINE_STATUSES: PipelineStatus[] = [
  'Researching',
  'Applied',
  'Assessment',
  'Interview',
  'Active',
  'Paused',
  'Rejected',
];

const BRIEF_POINTS = [
  'Lead with systems thinking: architecture, tradeoffs, and measurable impact — not buzzwords.',
  'Mercor and Alignerr reward depth on evaluation, monitoring, and production AI workflows.',
  'Outlier assessments often probe reasoning under ambiguity; structure answers as context → approach → tradeoffs → outcome.',
  'Mindrift values clear communication plus technical rigor; practice concise 2-minute openers.',
  'Keep a running log of platform-specific questions and iterate your profile bullets after each session.',
];

async function callInterviewApi(body: Record<string, unknown>) {
  const res = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function avgScore(scores: number[]) {
  if (!scores.length) return null;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('brief');
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newPlatform, setNewPlatform] = useState(PLATFORMS[0]);
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState<PipelineStatus>('Researching');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const patch = useCallback((partial: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const runAction = async (action: string, payload: Record<string, unknown>, label: string) => {
    setLoading(label);
    setError(null);
    try {
      return await callInterviewApi({ action, ...payload });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      return null;
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateQuestion = async () => {
    const data = await runAction(
      'question',
      { track: state.track, focus: state.focus },
      'question'
    );
    if (data?.question) {
      patch({ currentQuestion: data.question, answer: '', lastScore: null });
    }
  };

  const handleScoreAnswer = async () => {
    if (!state.currentQuestion.trim() || !state.answer.trim()) {
      setError('Add a question and answer before scoring.');
      return;
    }
    const data = await runAction(
      'score',
      {
        question: state.currentQuestion,
        answer: state.answer,
        profileSummary: state.profileSummary || undefined,
      },
      'score'
    ) as ScoreResult | null;
    if (data?.score != null) {
      patch({
        lastScore: data,
        sessionScores: [...state.sessionScores, data.score],
      });
    }
  };

  const handleBuildProfile = async () => {
    const data = await runAction(
      'profile',
      {
        track: state.track,
        years: state.years,
        stack: state.stack,
        projects: state.projects,
      },
      'profile'
    ) as ProfileResult | null;
    if (data?.headline) {
      const summary = `${data.headline}\n\n${data.summary}\n\n${data.bullets.map((b) => `• ${b}`).join('\n')}`;
      patch({ lastProfile: data, profileSummary: summary });
    }
  };

  const handleSaveQuestion = () => {
    if (!state.currentQuestion.trim()) return;
    const entry: SavedQuestion = {
      id: uid(),
      question: state.currentQuestion,
      track: state.track,
      focus: state.focus,
      savedAt: new Date().toISOString(),
    };
    patch({ savedQuestions: [entry, ...state.savedQuestions] });
  };

  const handleDeleteQuestion = (id: string) => {
    patch({ savedQuestions: state.savedQuestions.filter((q) => q.id !== id) });
  };

  const handleLoadQuestion = (q: SavedQuestion) => {
    patch({ currentQuestion: q.question, track: q.track, focus: q.focus });
    setTab('interview');
  };

  const handleAddPipeline = () => {
    if (!newRole.trim()) return;
    const entry: PipelineEntry = {
      id: uid(),
      platform: newPlatform,
      role: newRole.trim(),
      status: newStatus,
      notes: newNotes.trim(),
      updatedAt: new Date().toISOString(),
    };
    patch({ pipeline: [entry, ...state.pipeline] });
    setNewRole('');
    setNewNotes('');
  };

  const handleUpdatePipelineStatus = (id: string, status: PipelineStatus) => {
    patch({
      pipeline: state.pipeline.map((p) =>
        p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
      ),
    });
  };

  const handleDeletePipeline = (id: string) => {
    patch({ pipeline: state.pipeline.filter((p) => p.id !== id) });
  };

  const handleGenerateScreeningQuestion = async () => {
    const data = await runAction(
      'screening_question',
      { skill: state.selectedSkill },
      'screening_question'
    );
    if (data?.question) {
      patch({ screeningQuestion: data.question, screeningAnswer: '', lastScreeningScore: null });
    }
  };

  const handleScoreScreeningAnswer = async () => {
    if (!state.screeningQuestion.trim() || !state.screeningAnswer.trim()) {
      setError('Add a question and answer before scoring.');
      return;
    }
    const data = (await runAction(
      'screening_score',
      {
        skill: state.selectedSkill,
        question: state.screeningQuestion,
        answer: state.screeningAnswer,
      },
      'screening_score'
    )) as ScoreResult | null;
    if (data?.score != null) {
      patch({
        lastScreeningScore: data,
        screeningSessionScores: [...state.screeningSessionScores, data.score],
      });
    }
  };

  const handleClearScreeningSession = () => {
    patch({ screeningSessionScores: [], lastScreeningScore: null });
  };

  const sessionAvg = avgScore(state.sessionScores);
  const scoreRingOffset = state.lastScore
    ? 283 - (283 * state.lastScore.score) / 10
    : 283;

  if (!hydrated) {
    return (
      <div className="app-container py-16 text-center text-muted">
        <span className="loading"><span className="spinner" /> Loading…</span>
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <div className="app-container flex items-center justify-between py-4 gap-4 flex-wrap">
          <div>
            <div className="wordmark">AI Interview Desk</div>
            <p className="text-sm text-muted mt-1">Mock-interview coach for AI contract platforms</p>
          </div>
          <div className="instrument-strip">
            <div className="stat">
              <span className="stat-label">Track</span>
              <span className="stat-value">{state.track}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Session Avg</span>
              <span className="stat-value">{sessionAvg ?? '—'}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Saved Qs</span>
              <span className="stat-value">{state.savedQuestions.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Pipeline</span>
              <span className="stat-value">{state.pipeline.length}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-container py-8 flex-1">
        <nav className="tab-bar mb-8" aria-label="Main navigation">
          {(
            [
              ['brief', 'Brief'],
              ['interview', 'Interview'],
              ['questions', 'Question Bank'],
              ['profile', 'Profile'],
              ['pipeline', 'Pipeline'],
              ['skills', 'Verify Skills'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`tab${tab === id ? ' active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        {error && (
          <div className="error-box mb-6" role="alert">
            {error}
          </div>
        )}

        {tab === 'brief' && (
          <section className="card">
            <h2 className="section-title">Interview Brief</h2>
            <p className="text-muted mb-6 text-sm leading-relaxed">
              Orientation for high-tier AI engineering contract roles. No API calls on this tab — read,
              configure your track below, then move to Interview when ready.
            </p>
            <ul className="space-y-3 mb-8">
              {BRIEF_POINTS.map((point) => (
                <li key={point} className="text-sm leading-relaxed pl-4 border-l-2 border-gold" style={{ borderColor: 'var(--gold)' }}>
                  {point}
                </li>
              ))}
            </ul>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="brief-track">Track</label>
                <select
                  id="brief-track"
                  className="select"
                  value={state.track}
                  onChange={(e) => patch({ track: e.target.value as Track })}
                >
                  {(['Generalist', 'Full-Stack', 'ML/AI', 'Data', 'Backend'] as Track[]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="brief-focus">Focus</label>
                <select
                  id="brief-focus"
                  className="select"
                  value={state.focus}
                  onChange={(e) => patch({ focus: e.target.value as Focus })}
                >
                  {(
                    [
                      'Technical reasoning',
                      'System design',
                      'Evaluation & metrics',
                      'Production rigor',
                    ] as Focus[]
                  ).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {tab === 'interview' && (
          <section className="space-y-6">
            <div className="card">
              <h2 className="section-title">AI Mock Interview</h2>
              <p className="text-muted text-sm mb-6">
                Generate a question, write your answer, then score it. Each step runs only when you click.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div>
                  <label className="label" htmlFor="int-track">Track</label>
                  <select
                    id="int-track"
                    className="select"
                    value={state.track}
                    onChange={(e) => patch({ track: e.target.value as Track })}
                  >
                    {(['Generalist', 'Full-Stack', 'ML/AI', 'Data', 'Backend'] as Track[]).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="int-focus">Focus</label>
                  <select
                    id="int-focus"
                    className="select"
                    value={state.focus}
                    onChange={(e) => patch({ focus: e.target.value as Focus })}
                  >
                    {(
                      [
                        'Technical reasoning',
                        'System design',
                        'Evaluation & metrics',
                        'Production rigor',
                      ] as Focus[]
                    ).map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={loading === 'question'}
                  onClick={handleGenerateQuestion}
                >
                  {loading === 'question' ? <span className="loading"><span className="spinner" /> Generating…</span> : 'Generate Question'}
                </button>
                {state.currentQuestion && (
                  <button type="button" className="btn" onClick={handleSaveQuestion}>
                    Save to Question Bank
                  </button>
                )}
              </div>
              {state.currentQuestion && (
                <div className="panel p-4 mb-6">
                  <p className="label mb-2">Question</p>
                  <p className="text-sm leading-relaxed">{state.currentQuestion}</p>
                </div>
              )}
              <div className="mb-6">
                <label className="label" htmlFor="answer">Your Answer</label>
                <textarea
                  id="answer"
                  className="textarea"
                  value={state.answer}
                  onChange={(e) => patch({ answer: e.target.value })}
                  placeholder="Structure your answer: context, approach, tradeoffs, measurable outcome…"
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading === 'score'}
                onClick={handleScoreAnswer}
              >
                {loading === 'score' ? <span className="loading"><span className="spinner" /> Scoring…</span> : 'Score Answer'}
              </button>
            </div>

            {state.lastScore && (
              <div className="card">
                <h3 className="section-title">Score & Feedback</h3>
                <div className="flex flex-wrap gap-8 items-start">
                  <div className="score-ring">
                    <svg viewBox="0 0 100 100">
                      <circle className="bg" cx="50" cy="50" r="45" />
                      <circle
                        className="progress"
                        cx="50"
                        cy="50"
                        r="45"
                        strokeDasharray="283"
                        strokeDashoffset={scoreRingOffset}
                      />
                    </svg>
                    <div className="score-value">{state.lastScore.score}</div>
                  </div>
                  <div className="flex-1 min-w-240 space-y-4">
                    <div>
                      <p className="label">Strengths</p>
                      <ul className="strengths text-sm space-y-1 pl-5 relative">
                        {state.lastScore.strengths.map((s) => (
                          <li key={s} className="relative">{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="label">Improvements</p>
                      <ul className="improvements text-sm space-y-1 pl-5 relative">
                        {state.lastScore.improvements.map((s) => (
                          <li key={s} className="relative">{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="divider" />
                <div>
                  <p className="label">Stronger Version</p>
                  <p className="text-sm leading-relaxed text-muted">{state.lastScore.strongerVersion}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === 'questions' && (
          <section className="card">
            <h2 className="section-title">Question Bank</h2>
            <p className="text-muted text-sm mb-6">
              Saved questions from interview sessions. Click one to load it back into the Interview tab.
            </p>
            {state.savedQuestions.length === 0 ? (
              <p className="text-muted text-sm">No saved questions yet. Generate one in Interview and click &quot;Save to Question Bank&quot;.</p>
            ) : (
              <ul className="space-y-4">
                {state.savedQuestions.map((q) => (
                  <li key={q.id} className="panel p-4">
                    <div className="flex flex-wrap justify-between gap-3 mb-2">
                      <span className="mono text-xs text-muted">
                        {q.track} · {q.focus} · {new Date(q.savedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button type="button" className="btn btn-sm" onClick={() => handleLoadQuestion(q)}>
                          Load
                        </button>
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleDeleteQuestion(q.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{q.question}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'profile' && (
          <section className="space-y-6">
            <div className="card">
              <h2 className="section-title">AI Profile Builder</h2>
              <p className="text-muted text-sm mb-6">
                Paste your raw background; the model rewrites it for platform matchers. Runs only when you click Build Profile.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div>
                  <label className="label" htmlFor="prof-track">Track</label>
                  <select
                    id="prof-track"
                    className="select"
                    value={state.track}
                    onChange={(e) => patch({ track: e.target.value as Track })}
                  >
                    {(['Generalist', 'Full-Stack', 'ML/AI', 'Data', 'Backend'] as Track[]).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="years">Years Building</label>
                  <input
                    id="years"
                    type="number"
                    min={0}
                    max={40}
                    className="input"
                    value={state.years}
                    onChange={(e) => patch({ years: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="label" htmlFor="stack">Core Stack</label>
                <input
                  id="stack"
                  className="input"
                  value={state.stack}
                  onChange={(e) => patch({ stack: e.target.value })}
                  placeholder="e.g. Python, TypeScript, Next.js, PyTorch, Postgres, AWS"
                />
              </div>
              <div className="mb-6">
                <label className="label" htmlFor="projects">Strongest Projects (raw)</label>
                <textarea
                  id="projects"
                  className="textarea"
                  value={state.projects}
                  onChange={(e) => patch({ projects: e.target.value })}
                  placeholder="Bullet your best work — messy is fine, the model will polish it."
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading === 'profile'}
                onClick={handleBuildProfile}
              >
                {loading === 'profile' ? <span className="loading"><span className="spinner" /> Building…</span> : 'Build Profile'}
              </button>
            </div>

            {state.lastProfile && (
              <div className="card">
                <h3 className="section-title">Optimized Profile</h3>
                <p className="text-lg font-semibold mb-3">{state.lastProfile.headline}</p>
                <p className="text-sm text-muted mb-4 leading-relaxed">{state.lastProfile.summary}</p>
                <ul className="space-y-2">
                  {state.lastProfile.bullets.map((b) => (
                    <li key={b} className="text-sm leading-relaxed pl-4 border-l-2" style={{ borderColor: 'var(--teal)' }}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {tab === 'pipeline' && (
          <section className="space-y-6">
            <div className="card">
              <h2 className="section-title">Application Pipeline</h2>
              <p className="text-muted text-sm mb-6">
                Track applications across contract platforms. Stored locally — no API calls.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div>
                  <label className="label" htmlFor="plat">Platform</label>
                  <select
                    id="plat"
                    className="select"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="role">Role</label>
                  <input
                    id="role"
                    className="input"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Senior AI Engineer"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div>
                  <label className="label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as PipelineStatus)}
                  >
                    {PIPELINE_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="notes">Notes</label>
                  <input
                    id="notes"
                    className="input"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <button type="button" className="btn btn-primary" onClick={handleAddPipeline}>
                Add Application
              </button>
            </div>

            {state.pipeline.length > 0 && (
              <div className="card overflow-x-auto">
                <table className="pipeline-table">
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th>Notes</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {state.pipeline.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.platform}</td>
                        <td>{entry.role}</td>
                        <td>
                          <select
                            className="select"
                            style={{ width: 'auto', minWidth: '8rem' }}
                            value={entry.status}
                            onChange={(e) =>
                              handleUpdatePipelineStatus(entry.id, e.target.value as PipelineStatus)
                            }
                          >
                            {PIPELINE_STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <span className={`status-badge status-${entry.status} ml-2`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="mono text-xs">
                          {new Date(entry.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="text-muted text-sm">{entry.notes || '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleDeletePipeline(entry.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === 'skills' && (
          <VerifySkillsTab
            selectedSkill={state.selectedSkill}
            onSelectSkill={(skill) =>
              patch({
                selectedSkill: skill,
                screeningQuestion: '',
                screeningAnswer: '',
                lastScreeningScore: null,
              })
            }
            question={state.screeningQuestion}
            answer={state.screeningAnswer}
            onAnswerChange={(a) => patch({ screeningAnswer: a })}
            lastScore={state.lastScreeningScore}
            sessionScores={state.screeningSessionScores}
            loading={loading}
            onGenerateQuestion={handleGenerateScreeningQuestion}
            onScoreAnswer={handleScoreScreeningAnswer}
            onClearSession={handleClearScreeningSession}
          />
        )}
      </main>

      <footer className="border-t border-line py-6 mt-auto" style={{ borderColor: 'var(--line)' }}>
        <div className="app-container text-center text-xs text-muted">
          AI Interview Desk — study tool & portfolio piece. All model calls are user-initiated.
        </div>
      </footer>
    </>
  );
}
