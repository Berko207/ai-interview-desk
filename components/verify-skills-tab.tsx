'use client';

import { useState } from 'react';
import {
  VERIFY_SKILLS,
  getSkillInfo,
  type VerifySkill,
} from '@/lib/verify-skills';

interface ScoreResult {
  score: number;
  strengths: string[];
  improvements: string[];
  strongerVersion: string;
}

interface VerifySkillsTabProps {
  selectedSkill: VerifySkill;
  onSelectSkill: (skill: VerifySkill) => void;
  question: string;
  answer: string;
  onAnswerChange: (a: string) => void;
  lastScore: ScoreResult | null;
  sessionScores: number[];
  loading: string | null;
  onGenerateQuestion: () => void;
  onScoreAnswer: () => void;
  onClearSession: () => void;
}

function avgScore(scores: number[]) {
  if (!scores.length) return null;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

export function VerifySkillsTab({
  selectedSkill,
  onSelectSkill,
  question,
  answer,
  onAnswerChange,
  lastScore,
  sessionScores,
  loading,
  onGenerateQuestion,
  onScoreAnswer,
  onClearSession,
}: VerifySkillsTabProps) {
  const [mode, setMode] = useState<'study' | 'practice'>('study');
  const skill = getSkillInfo(selectedSkill);
  const sessionAvg = avgScore(sessionScores);
  const scoreRingOffset = lastScore ? 283 - (283 * lastScore.score) / 10 : 283;

  return (
    <section className="space-y-6">
      <div className="card">
        <h2 className="section-title">Verify Skills</h2>
        <p className="text-muted text-sm mb-6 leading-relaxed">
          Mercor skill screenings unlock project access. Study the topics below, then practice
          with AI-generated questions in the same style. Choose the skill you&apos;re most
          experienced in for best results on the real assessment.
        </p>

        <p className="label mb-3">Available screenings</p>
        <div className="skill-grid mb-6">
          {VERIFY_SKILLS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`skill-chip${selectedSkill === s.id ? ' active' : ''}`}
              onClick={() => onSelectSkill(s.id)}
            >
              <span className="skill-chip-label">{s.label}</span>
              {s.subtitle && <span className="skill-chip-sub">{s.subtitle}</span>}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`tab${mode === 'study' ? ' active' : ''}`}
            onClick={() => setMode('study')}
          >
            Study Guide
          </button>
          <button
            type="button"
            className={`tab${mode === 'practice' ? ' active' : ''}`}
            onClick={() => setMode('practice')}
          >
            Practice
          </button>
        </div>
      </div>

      {mode === 'study' && (
        <div className="card">
          <h3 className="section-title">
            {skill.label}
            {skill.subtitle && (
              <span className="text-muted font-normal text-sm"> — {skill.subtitle}</span>
            )}
          </h3>
          <p className="text-sm text-muted mb-6 leading-relaxed">{skill.format}</p>

          <p className="label mb-2">Core topics</p>
          <ul className="space-y-2 mb-6">
            {skill.topics.map((topic) => (
              <li
                key={topic}
                className="text-sm leading-relaxed pl-4 border-l-2"
                style={{ borderColor: 'var(--teal)' }}
              >
                {topic}
              </li>
            ))}
          </ul>

          <p className="label mb-2">Study tips</p>
          <ul className="space-y-2">
            {skill.tips.map((tip) => (
              <li
                key={tip}
                className="text-sm leading-relaxed pl-4 border-l-2"
                style={{ borderColor: 'var(--gold)' }}
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {mode === 'practice' && (
        <>
          <div className="card">
            <div className="flex flex-wrap justify-between gap-4 mb-6">
              <div>
                <h3 className="section-title mb-1">{skill.label} — Practice</h3>
                <p className="text-muted text-sm">
                  Generate screening-style questions, answer them, then score your response.
                </p>
              </div>
              <div className="instrument-strip" style={{ borderRadius: '12px' }}>
                <div className="stat">
                  <span className="stat-label">Session Avg</span>
                  <span className="stat-value">{sessionAvg ?? '—'}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Attempts</span>
                  <span className="stat-value">{sessionScores.length}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading === 'screening_question'}
                onClick={onGenerateQuestion}
              >
                {loading === 'screening_question' ? (
                  <span className="loading">
                    <span className="spinner" /> Generating…
                  </span>
                ) : (
                  'Generate Question'
                )}
              </button>
              {sessionScores.length > 0 && (
                <button type="button" className="btn btn-ghost" onClick={onClearSession}>
                  Clear session scores
                </button>
              )}
            </div>

            {question ? (
              <div className="panel p-4 mb-6">
                <p className="label mb-2">Question</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{question}</p>
              </div>
            ) : (
              <p className="text-muted text-sm mb-6">
                Click Generate Question to get a {skill.label} screening-style prompt.
              </p>
            )}

            <div className="mb-6">
              <label className="label" htmlFor="screening-answer">
                Your Answer
              </label>
              <textarea
                id="screening-answer"
                className="textarea"
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder={
                  selectedSkill === 'Spanish'
                    ? 'Responde en español. Sé claro y usa registro profesional…'
                    : 'Write your answer — code snippets, explanations, or step-by-step reasoning…'
                }
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              disabled={loading === 'screening_score'}
              onClick={onScoreAnswer}
            >
              {loading === 'screening_score' ? (
                <span className="loading">
                  <span className="spinner" /> Scoring…
                </span>
              ) : (
                'Score Answer'
              )}
            </button>
          </div>

          {lastScore && (
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
                  <div className="score-value">{lastScore.score}</div>
                </div>
                <div className="flex-1 min-w-240 space-y-4">
                  <div>
                    <p className="label">Strengths</p>
                    <ul className="strengths text-sm space-y-1 pl-5 relative">
                      {lastScore.strengths.map((s) => (
                        <li key={s} className="relative">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="label">Improvements</p>
                    <ul className="improvements text-sm space-y-1 pl-5 relative">
                      {lastScore.improvements.map((s) => (
                        <li key={s} className="relative">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="divider" />
              <div>
                <p className="label">Stronger Version</p>
                <p className="text-sm leading-relaxed text-muted whitespace-pre-wrap">
                  {lastScore.strongerVersion}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
