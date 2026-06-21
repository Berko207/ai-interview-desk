export type VerifySkill =
  | 'Spanish'
  | 'C#'
  | 'Frontend Development'
  | 'JavaScript'
  | 'Python'
  | 'Git'
  | 'Git and Docker'
  | 'TypeScript'
  | 'React';

export interface VerifySkillInfo {
  id: VerifySkill;
  label: string;
  subtitle?: string;
  format: string;
  topics: string[];
  tips: string[];
}

export const VERIFY_SKILLS: VerifySkillInfo[] = [
  {
    id: 'Spanish',
    label: 'Spanish',
    subtitle: 'Español',
    format: 'Timed language assessment — reading comprehension, grammar, and practical usage.',
    topics: [
      'Verb conjugation (present, preterite, imperfect, subjunctive)',
      'Ser vs estar, por vs para',
      'Reading short passages and answering in Spanish',
      'Formal vs informal register (tú/usted)',
      'Common idioms and workplace vocabulary',
    ],
    tips: [
      'Mercor screens for professional fluency, not tourist phrases — practice explaining technical work in Spanish.',
      'Review subjunctive triggers (doubt, desire, emotion, impersonal expressions).',
      'Read news or docs in Spanish and summarize aloud in 2–3 sentences.',
    ],
  },
  {
    id: 'C#',
    label: 'C#',
    format: 'Conceptual and code-reading questions on .NET fundamentals.',
    topics: [
      'OOP: inheritance, interfaces, abstract classes, polymorphism',
      'LINQ queries and deferred execution',
      'async/await and Task-based concurrency',
      'Value vs reference types, structs, nullable types',
      'Exception handling, IDisposable, using statements',
    ],
    tips: [
      'Know when to use IEnumerable vs IQueryable and what deferred execution means.',
      'Be ready to trace async code — order of await continuations trips people up.',
      'Review common collections (List, Dictionary) and their time complexity.',
    ],
  },
  {
    id: 'Frontend Development',
    label: 'Frontend Development',
    format: 'Broad front-end assessment — HTML, CSS, JavaScript, and UX basics.',
    topics: [
      'Semantic HTML and accessibility (ARIA, landmarks)',
      'CSS layout: flexbox, grid, responsive breakpoints',
      'DOM APIs, events, and event delegation',
      'Performance: lazy loading, critical CSS, bundle size',
      'Cross-browser concerns and progressive enhancement',
    ],
    tips: [
      'Practice explaining how you would build a responsive component from scratch.',
      'Know the difference between accessibility fixes at markup vs JS layers.',
      'Be ready for “fix this layout” or “what’s wrong with this CSS?” style prompts.',
    ],
  },
  {
    id: 'JavaScript',
    label: 'JavaScript',
    format: 'Core language mechanics — closures, async, prototypes, and ES6+.',
    topics: [
      'Closures, scope, hoisting, and the event loop',
      'Promises, async/await, and microtask ordering',
      'Array/object methods: map, filter, reduce, destructuring',
      'this binding, arrow functions, and prototypes',
      'Modules, imports, and common runtime errors',
    ],
    tips: [
      'Trace callback vs Promise vs async/await execution order on paper.',
      'Review == vs ===, truthy/falsy, and nullish coalescing (??).',
      'Practice explaining event loop + setTimeout(0) + Promise.resolve() ordering.',
    ],
  },
  {
    id: 'Python',
    label: 'Python',
    format: 'Language fundamentals, stdlib, and idiomatic Python.',
    topics: [
      'Lists, dicts, sets, comprehensions, and generators',
      'OOP: dunder methods, inheritance, MRO',
      'Exception handling and context managers (with)',
      'Decorators and higher-order functions',
      'File I/O, json, and common stdlib modules',
    ],
    tips: [
      'Know list vs tuple vs set tradeoffs and when to use each.',
      'Review *args/**kwargs and default mutable argument gotchas.',
      'Be fluent reading tracebacks and predicting output of short snippets.',
    ],
  },
  {
    id: 'Git',
    label: 'Git',
    format: 'Version-control workflows — branching, merging, and recovery.',
    topics: [
      'Branching strategies (feature branches, trunk-based)',
      'merge vs rebase and when each is appropriate',
      'Resolving merge conflicts',
      'git log, diff, stash, cherry-pick, revert',
      'Recovering from mistakes (reflog, reset modes)',
    ],
    tips: [
      'Draw branch diagrams for merge vs rebase scenarios.',
      'Know soft vs mixed vs hard reset and what each preserves.',
      'Practice explaining a clean PR workflow from fork to merge.',
    ],
  },
  {
    id: 'Git and Docker',
    label: 'Git and Docker',
    format: 'Combined DevOps basics — Git workflows plus container fundamentals.',
    topics: [
      'Everything in the Git screening',
      'Dockerfile instructions (FROM, RUN, COPY, CMD, ENTRYPOINT)',
      'Images vs containers, layers, and caching',
      'docker-compose services, networks, volumes',
      'Multi-stage builds and .dockerignore',
    ],
    tips: [
      'Write a minimal Dockerfile from memory and explain each line.',
      'Know why order of Dockerfile instructions affects build cache.',
      'Practice mapping a local dev setup to a compose file with env vars.',
    ],
  },
  {
    id: 'TypeScript',
    label: 'TypeScript',
    format: 'Static typing — types, generics, narrowing, and TS + JS interop.',
    topics: [
      'Basic types, unions, intersections, literal types',
      'Interfaces vs type aliases',
      'Generics and constrained type parameters',
      'Type narrowing (typeof, in, discriminated unions)',
      'Utility types (Partial, Pick, Omit, Record)',
    ],
    tips: [
      'Practice reading complex generic signatures without running code.',
      'Know when `unknown` is safer than `any` and how to narrow it.',
      'Review strict mode implications (strictNullChecks, noImplicitAny).',
    ],
  },
  {
    id: 'React',
    label: 'React',
    format: 'Component model, hooks, state, and rendering behavior.',
    topics: [
      'useState, useEffect, useMemo, useCallback, useRef',
      'Controlled vs uncontrolled components',
      'Props vs state, lifting state up',
      'Keys, lists, and reconciliation',
      'Context, composition, and common performance patterns',
    ],
    tips: [
      'Trace re-renders: what triggers them and how to reduce unnecessary ones.',
      'Know useEffect dependency array rules and cleanup functions.',
      'Practice explaining when to extract custom hooks vs inline logic.',
    ],
  },
];

export function getSkillInfo(skill: VerifySkill): VerifySkillInfo {
  return VERIFY_SKILLS.find((s) => s.id === skill) ?? VERIFY_SKILLS[0];
}
