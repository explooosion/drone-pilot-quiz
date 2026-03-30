export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number; // 0-based index of the correct option
}

export interface QuestionBank {
  type: QuestionBankType;
  label: string;
  questions: Question[];
  updateDate: string; // ROC date e.g. "115.2.2"
  lastParsed: string; // ISO date
}

export type QuestionBankType = 'basic' | 'professional' | 'renewal';

export interface ExamConfig {
  type: QuestionBankType;
  label: string;
  questionCount: number;
  timeLimitMinutes: number;
  passScore: number;
}

export interface ExamAnswer {
  questionId: number;
  selected: number; // 0-based index, -1 if unanswered
  correct: number; // 0-based index
}

export interface ExamRecord {
  id: string;
  type: QuestionBankType;
  date: string; // ISO timestamp
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeUsed: number; // seconds
  timeLimit: number; // seconds
  passed: boolean;
  answers: ExamAnswer[];
  questions: Question[];
}

export interface PracticeProgress {
  currentIndex: number;
  readIds: number[];
}

export type ThemeMode = 'light' | 'dark' | 'system';
