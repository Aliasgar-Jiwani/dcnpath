/* ─── Content Type System ─── */

/** All simulator IDs across the platform */
export type SimId =
  | 'topology-explorer'
  | 'signal-viewer'
  | 'line-coding'
  | 'modulation'
  | 'sampling-pcm'
  | 'channel-capacity'
  | 'multiplexing'
  | 'parity-lrc'
  | 'crc-division'
  | 'checksum'
  | 'hamming'
  | 'arq-simulator'
  | 'hdlc-framing'
  | 'csma-cd'
  | 'token-ring'
  | 'switching-compare'
  | 'isdn-channels';

/** A single topic within a unit */
export interface Topic {
  id: string;
  title: string;
  summary: string;
  /** Rich explanatory content — 3–6 paragraphs or key points */
  body: string;
  formulas?: string[];
  keyPoints: string[];
  /** e.g. "Forouzan, Ch. 4" */
  textbookRef: string;
  /** Optional link to a simulator */
  sim?: SimId;
}

/** Course Outcomes CO1–CO5 */
export type CourseOutcome = 'CO1' | 'CO2' | 'CO3' | 'CO4' | 'CO5';

/** A full unit (chapter) */
export interface Unit {
  id: string;
  number: 1 | 2 | 3 | 4 | 5;
  title: string;
  courseOutcome: CourseOutcome;
  hours: number;
  topics: Topic[];
  objectives: string[];
}

/** Bloom's taxonomy levels */
export type BloomLevel = 'BT1' | 'BT2' | 'BT3' | 'BT4' | 'BT5' | 'BT6';

/** Question difficulty */
export type Difficulty = 1 | 2 | 3;

/** A quiz question */
export interface Question {
  id: string;
  unitId: string;
  topicId: string;
  co: CourseOutcome;
  bloomLevel: BloomLevel;
  /** The Bloom's verb the stem starts with */
  verb: string;
  stem: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  difficulty: Difficulty;
}

/** Score record for a topic quiz */
export interface TopicQuizScore {
  score: number;
  total: number;
  passed: boolean;
  completedAt: string;
}

/** Progress for a single unit */
export interface UnitProgress {
  completedTopicIds: string[];
  bestScore: number | null;
  /** Per-CO scores */
  coScores: Partial<Record<CourseOutcome, number>>;
  /** Per-topic quiz score history */
  topicScores?: Record<string, TopicQuizScore>;
}

/** Full progress state */
export interface ProgressState {
  units: Record<string, UnitProgress>;
  lastVisitedTopicId: string | null;
  lastVisitedUnitId: string | null;
}
