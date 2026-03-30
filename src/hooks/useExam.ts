import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExamAnswer, ExamRecord, Question, QuestionBankType } from '../types';
import { EXAM_CONFIGS } from '../utils/exam-config';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';
import { useQuestions } from './useQuestions';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useExam(type: QuestionBankType) {
  const config = EXAM_CONFIGS[type];
  const { questions: bankQuestions } = useQuestions(type);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(config.timeLimitMinutes * 60);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const startTimeRef = useRef(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const buildRecord = useCallback((): ExamRecord => {
    const examAnswers: ExamAnswer[] = questions.map((q) => ({
      questionId: q.id,
      selected: answers.get(q.id) ?? -1,
      correct: q.answer,
    }));
    const correctCount = examAnswers.filter((a) => a.selected === a.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const timeLimit = config.timeLimitMinutes * 60;
    const timeUsed = timeLimit - timeRemaining;

    const record: ExamRecord = {
      id: crypto.randomUUID(),
      type,
      date: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      correctCount,
      timeUsed,
      timeLimit,
      passed: score >= config.passScore,
      answers: examAnswers,
      questions,
    };

    const history = getStorageItem<ExamRecord[]>(STORAGE_KEYS.examHistory, []);
    setStorageItem(STORAGE_KEYS.examHistory, [record, ...history]);

    return record;
  }, [questions, answers, timeRemaining, type, config]);

  const submitExam = useCallback((): ExamRecord => {
    cleanup();
    setIsFinished(true);
    return buildRecord();
  }, [cleanup, buildRecord]);

  // Auto-submit ref to avoid stale closures in the timer
  const submitRef = useRef(submitExam);
  useEffect(() => {
    submitRef.current = submitExam;
  }, [submitExam]);

  const startExam = useCallback(() => {
    const shuffled = shuffleArray(bankQuestions).slice(0, config.questionCount);
    setQuestions(shuffled);
    setAnswers(new Map());
    setCurrentIndex(0);
    setTimeRemaining(config.timeLimitMinutes * 60);
    setIsFinished(false);
    setIsStarted(true);
    startTimeRef.current = Date.now();

    cleanup();
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          submitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [bankQuestions, config, cleanup]);

  useEffect(() => cleanup, [cleanup]);

  const selectAnswer = useCallback((questionId: number, optionIndex: number) => {
    setAnswers((prev) => new Map(prev).set(questionId, optionIndex));
  }, []);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) setCurrentIndex(index);
    },
    [questions.length],
  );

  const nextQuestion = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const abandonExam = useCallback(() => {
    cleanup();
    setIsStarted(false);
    setIsFinished(false);
    setQuestions([]);
    setAnswers(new Map());
    setCurrentIndex(0);
    setTimeRemaining(config.timeLimitMinutes * 60);
  }, [cleanup, config.timeLimitMinutes]);

  return {
    questions,
    answers,
    currentIndex,
    timeRemaining,
    isStarted,
    isFinished,
    startExam,
    selectAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitExam,
    abandonExam,
  };
}
