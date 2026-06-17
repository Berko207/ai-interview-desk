import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const MODEL = 'claude-3-5-sonnet-20241022';

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
  id: string;
  model: string;
  role: string;
}

function parseAnthropicResponse(data: AnthropicResponse): string {
  if (!data.content || !Array.isArray(data.content)) return '';
  return data.content
    .filter((block): block is { type: string; text: string } => block.type === 'text' && !!block.text)
    .map(block => block.text)
    .join('\n')
    .trim();
}

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
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
      systemPrompt = `You are a senior technical interviewer for high-tier AI engineering contract roles at platforms like Mercor, Outlier, Mindrift, and Alignerr.\n\nGenerate ONE incisive, open-ended interview question for the ${track} track, focused on ${focus}.\n\nThe question must probe systems thinking, architectural depth, tradeoffs, evaluation rigor, or production reasoning \u2014 the kind that separates the $70\u2013$200+/hr engineering tier from the labeling tier.\n\nMake it realistic for a 15\u201325 minute AI-avatar interview. Avoid trivia, yes/no questions, or shallow prompts.\n\nReturn ONLY valid JSON with no markdown, no explanation, no extra text:\n{"question": "your generated question here"}`;
      userMessage = `Generate one strong question for a ${track} candidate focusing on ${focus}.`;

    } else if (action === 'score') {
      const { question = '', answer = '', profileSummary } = payload;
      systemPrompt = `You are an expert interviewer and coach for AI contract platforms (Mercor, Outlier, etc).\n\nScore the candidate's answer on a 1-10 integer scale for:\n- Depth of systems thinking and architecture\n- Clarity and structure\n- Relevance to high-tier engineering roles\n- Use of tradeoffs, metrics, and evaluation mindset\n\nUse the candidate's profile summary (if provided) to personalize feedback.\n\nReturn ONLY valid JSON, no markdown, no prose outside the object:\n{\n  "score": 7,\n  "strengths": ["specific strength 1", "specific strength 2"],\n  "improvements": ["actionable improvement 1", "actionable improvement 2"],\n  "strongerVersion": "A polished, concise rewrite of the answer that demonstrates stronger systems thinking, clearer tradeoffs, and measurable impact. Keep the candidate's voice but elevate it."\n}`;
      userMessage = `QUESTION:\n${question}\n\nCANDIDATE ANSWER:\n${answer}\n\n${profileSummary ? `CANDIDATE PROFILE SUMMARY:\n${profileSummary}` : 'No profile summary provided.'}\n\nScore the answer now.`;

    } else if (action === 'profile') {
      const { track = 'Generalist', years = 3, stack = '', projects = '' } = payload;
      systemPrompt = `You are a profile optimizer for senior AI engineering contractors targeting Mercor, Outlier, Mindrift, Alignerr and similar platforms.\n\nTransform the raw background into a high-signal professional profile that signals senior systems/architecture/evaluation depth to LLM-based candidate matchers.\n\nEmphasize:\n- Concrete technical decisions and tradeoffs\n- Measurable impact (latency, reliability, cost, users)\n- Evaluation, monitoring, or production rigor\n- Precise language that rewards depth\n\nReturn ONLY valid JSON, no markdown:\n{\n  "headline": "Senior Full-Stack Engineer | Systems Architecture & Production AI",\n  "summary": "Two to three sentences that position the candidate at engineering tier.",\n  "bullets": [\n    "Architected X that delivered Y measurable outcome using A, B, C with rationale for choices.",\n    "Implemented evaluation harness for Z that improved metric from A to B.",\n    "Led migration / productionization of W with focus on reliability and observability."\n  ]\n}`;
      userMessage = `TRACK: ${track}\nYEARS BUILDING: ${years}\nCORE STACK: ${stack}\nSTRONGEST PROJECTS (raw): ${projects}\n\nRewrite into a high-tier profile now.`;

    } else {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const anthropicRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic API error:', errText);
      return NextResponse.json(
        { error: `Anthropic API error: ${anthropicRes.status}` },
        { status: 502 }
      );
    }

    const anthropicData: AnthropicResponse = await anthropicRes.json();
    const rawText = parseAnthropicResponse(anthropicData);

    if (!rawText) {
      return NextResponse.json({ error: 'Empty response from Anthropic' }, { status: 502 });
    }

    const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('Interview API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error processing interview action' },
      { status: 500 }
    );
  }
}
