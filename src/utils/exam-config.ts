import type { ExamConfig, QuestionBankType } from '../types';

export const EXAM_CONFIGS: Record<QuestionBankType, ExamConfig> = {
  basic: {
    type: 'basic',
    label: '普通操作證',
    questionCount: 40,
    timeLimitMinutes: 30,
    passScore: 70,
  },
  professional: {
    type: 'professional',
    label: '專業操作證',
    questionCount: 80,
    timeLimitMinutes: 60,
    passScore: 70,
  },
  renewal: {
    type: 'renewal',
    label: '專業操作證屆期換證',
    questionCount: 40,
    timeLimitMinutes: 30,
    passScore: 70,
  },
};

export const BANK_LABELS: Record<QuestionBankType, string> = {
  basic: '普通操作證',
  professional: '專業操作證',
  renewal: '專業操作證屆期換證',
};
