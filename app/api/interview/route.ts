import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

function extractJSON(text: string): any {
  try {
    let cleaned = text.replace(/```(?:json)?\s*|\s*```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!OPENROUTER_API_KEY?.trim()) {
    return NextResponse.json(
      { error: 'OPENROUTER_API_KEY is not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { action, ...payload } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    let systemPrompt = '';
    let userMessage = '';

    if (action === 'question') {
      const { track = 'Generalist', focus = 'Technical reasoning' } = payload;
      systemPrompt = `You are a senior technical interviewer for high-tier AI engineering contract roles at platforms like Mercor, Outlier, Mindrift, and Alignerr.\n\nGenerate ONE incisive, open-ended interview question for the ${track} track, focused on ${focus}.\n\nThe question must probe systems thinking, architectural depth, tradeoffs, evaluation rigor, or production reasoning — the kind that separates the $70–$200+/hr engineering tier from the labeling tier.\n\nMake it realistic for a 15–25 minute AI-avatar interview. Avoid trivia, yes/no questions, or shallow prompts.\n\nReturn ONLY valid JSON with no markdown, no explanation, no extra text:\n{"question": "your generated question here"}`;
      userMessage = `Generate one strong question for a ${track} candidate focusing on ${focus}.`;

    } else if (action === 'score') {
      const { question = '', answer = '', profileSummary } = payload;
      systemPrompt = `You are an expert interviewer and coach for AI contract platforms (Mercor, Outlier, etc).\n\nScore the candidate's answer on a 1-10 integer scale for:\n- Depth of systems thinking and architecture\n- Clarity and structure\n- Relevance to high-tier engineering roles\n- Use of tradeoffs, metrics, and evaluation mindset\n\nUse the candidate's profile summary (if provided) to personalize feedback.\n\nReturn ONLY valid JSON, no markdown, no prose outside the object:\n{\n  "score": 7,\n  "strengths": ["specific strength 1", "specific strength 2"],\n  "improvements": ["actionable improvement 1", "actionable improvement 2"],\n  "strongerVersion": "A polished, concise rewrite of the answer that demonstrates stronger systems thinking, clearer tradeoffs, and measurable impact. Keep the candidate's voice but elevate it."
}`;
      userMessage = `QUESTION:\n${question}\n\nCANDIDATE ANSWER:\n${answer}\n\n${profileSummary ? `CANDIDATE PROFILE SUMMARY:\n${profileSummary}` : 'No profile summary provided.'}\n\nScore the answer now.`;

    } else if (action === 'profile') {
      const { track = 'Generalist', years = 3, stack = '', projects = '' } = payload;
      systemPrompt = `You are a profile optimizer for senior AI engineering contractors targeting Mercor, Outlier, Mindrift, Alignerr and similar platforms.\n\nTransform the raw background into a high-signal professional profile that signals senior systems/architecture/evaluation depth to LLM-based candidate matchers.\n\nEmphasize:\n- Concrete technical decisions and tradeoffs\n- Measurable impact (latency, reliability, cost, users)\n- Evaluation, monitoring, or production rigor\n- Precise language that rewards depth\n\nReturn ONLY valid JSON, no markdown:\n{\n  "headline": "Senior Full-Stack Engineer | Systems Architecture & Production AI",\n  "summary": "Two to three sentences that position the candidate at engineering tier.",
  "bullets": [
    "Architected X that delivered Y measurable outcome using A, B, C with rationale for choices.",
    "Implemented evaluation harness for Z that improved metric from A to B.",
    "Led migration / productionization of W with focus on reliability and observability."
  ]
}`;
      userMessage = `TRACK: ${track}\nYEARS BUILDING: ${years}\nCORE STACK: ${stack}\nSTRONGEST PROJECTS (raw): ${projects}\n\nRewrite into a high-tier profile now.`;

    } else if (action === 'screening_question') {
      const { skill = 'JavaScript' } = payload;
      systemPrompt = `You are a skill verification item writer for Mercor-style contractor screenings.\n\nGenerate ONE realistic screening question for the skill: ${skill}.\n\nMatch the style of timed platform skill assessments:\n- For programming skills (JavaScript, TypeScript, Python, C#, React, Frontend Development): mix conceptual depth with code reading, debugging, or short implementation prompts. Avoid trivia; test applied understanding.\n- For Git / Git and Docker: scenario-based workflow questions (branching, conflicts, recovery, Dockerfile, compose).\n- For Spanish (Español): professional Spanish — grammar, reading comprehension, translation, or a short written response prompt IN SPANISH.\n\nThe question should be completable in 3–8 minutes. One clear prompt only.\n\nReturn ONLY valid JSON, no markdown:\n{"question": "the full question text"}`;
      userMessage = `Generate one ${skill} screening question now.`;

    } else if (action === 'screening_score') {
      const { skill = 'JavaScript', question = '', answer = '' } = payload;
      systemPrompt = `You are an expert grader for Mercor-style skill verification screenings.\n\nScore the candidate's answer for ${skill} mastery on a 1–10 integer scale.\n\nCriteria:\n- Correctness and completeness for the skill domain\n- Clarity of explanation (or Spanish fluency for Spanish screenings)\n- Practical, production-relevant depth — not textbook fluff\n- For code answers: idiomatic style and edge-case awareness\n\nReturn ONLY valid JSON, no markdown:\n{\n  "score": 7,\n  "strengths": ["specific strength 1", "specific strength 2"],\n  "improvements": ["actionable gap 1", "actionable gap 2"],\n  "strongerVersion": "A polished model answer that would likely pass the real screening."
}`;
      userMessage = `SKILL: ${skill}\n\nQUESTION:\n${question}\n\nCANDIDATE ANSWER:\n${answer}\n\nScore this answer now.`;

    } else {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const openRouterRes = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-interview-desk.vercel.app',
        'X-Title': 'AI Interview Desk',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text();
      console.error('OpenRouter API error:', errText);
      let detail = errText;
      try {
        const errJson = JSON.parse(errText);
        detail = errJson?.error?.message || errText;
      } catch {
        /* use raw text */
      }
      return NextResponse.json(
        { error: `OpenRouter API error: ${openRouterRes.status} — ${detail}` },
        { status: 502 }
      );
    }

    const data: OpenRouterResponse = await openRouterRes.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message || 'OpenRouter error' }, { status: 502 });
    }

    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: 'No response content from model' }, { status: 502 });
    }

    const parsed = extractJSON(rawContent);
    if (!parsed) {
      return NextResponse.json({ error: 'Failed to parse model response as JSON' }, { status: 502 });
    }

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('Interview API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
