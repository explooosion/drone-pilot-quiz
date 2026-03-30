import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import type { QuestionBankType } from '../types';
import { useExam } from '../hooks/useExam';
import { useSwipe } from '../hooks/useSwipe';
import { usePreferences } from '../hooks/usePreferences';
import { EXAM_CONFIGS, BANK_LABELS } from '../utils/exam-config';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { ProgressBar } from '../components/quiz/ProgressBar';
import { Timer } from '../components/quiz/Timer';
import { QuestionNav } from '../components/quiz/QuestionNav';
import { AlertDialog } from '../components/ui/AlertDialog';

export function ExamPage() {
  const { type } = useParams<{ type: string }>();
  const bankType = type as QuestionBankType;
  const config = EXAM_CONFIGS[bankType];
  const navigate = useNavigate();

  const {
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
  } = useExam(bankType);

  const { examAutoAdvance } = usePreferences();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const blocker = useBlocker(isStarted && !isFinished);

  const swipeHandlers = useSwipe(nextQuestion, prevQuestion);

  const answeredCount = answers.size;
  const unansweredCount = questions.length - answeredCount;

  const answeredSet = useMemo(() => {
    const set = new Set<number>();
    questions.forEach((q, i) => {
      if (answers.has(q.id)) set.add(i);
    });
    return set;
  }, [questions, answers]);

  // Navigate to result when finished
  useEffect(() => {
    if (isFinished && questions.length > 0) {
      // Build record was already called by submitExam; build inline for navigation state
      const record = buildResultFromState();
      navigate(`/exam/${bankType}/result`, { state: record, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // Warn on tab close
  useEffect(() => {
    if (!isStarted || isFinished) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isStarted, isFinished]);

  function buildResultFromState() {
    const examAnswers = questions.map((q) => ({
      questionId: q.id,
      selected: answers.get(q.id) ?? -1,
      correct: q.answer,
    }));
    const correctCount = examAnswers.filter((a) => a.selected === a.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const timeUsed = config.timeLimitMinutes * 60 - timeRemaining;
    return {
      type: bankType,
      date: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      correctCount,
      timeUsed,
      timeLimit: config.timeLimitMinutes * 60,
      passed: score >= config.passScore,
      answers: examAnswers,
      questions,
    };
  }

  const handleSubmit = useCallback(() => {
    setShowSubmitDialog(true);
  }, []);

  const confirmSubmit = useCallback(() => {
    setShowSubmitDialog(false);
    const record = submitExam();
    navigate(`/exam/${bankType}/result`, { state: record, replace: true });
  }, [submitExam, navigate, bankType]);

  const handleSelectAnswer = useCallback(
    (questionId: number, idx: number) => {
      selectAnswer(questionId, idx);
      if (examAutoAdvance && currentIndex < questions.length - 1) {
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = setTimeout(() => {
          autoAdvanceTimerRef.current = null;
          nextQuestion();
        }, 400);
      }
    },
    [selectAnswer, examAutoAdvance, currentIndex, questions.length, nextQuestion],
  );

  // Cancel pending auto-advance when user manually changes question
  useEffect(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, [currentIndex]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Pre-exam info card
  if (!isStarted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <div className="rounded-xl bg-white p-6 text-center shadow-sm md:p-10 dark:bg-gray-900">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {BANK_LABELS[bankType]}
          </h1>
          <p className="mb-8 text-gray-500 dark:text-gray-400">模擬測驗</p>

          <div className="mb-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-primary-700 dark:text-primary-400 text-2xl font-bold">
                {config.questionCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">題數</p>
            </div>
            <div>
              <p className="text-primary-700 dark:text-primary-400 text-2xl font-bold">
                {config.timeLimitMinutes}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">分鐘</p>
            </div>
            <div>
              <p className="text-primary-700 dark:text-primary-400 text-2xl font-bold">
                {config.passScore}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">及格分數</p>
            </div>
          </div>

          <button
            type="button"
            onClick={startExam}
            className="bg-primary-700 hover:bg-primary-800 inline-flex cursor-pointer items-center justify-center rounded-lg px-8 py-3 font-semibold text-white transition-colors"
          >
            開始測驗
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {/* Timer + progress */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {BANK_LABELS[bankType]}
        </h2>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAbandonDialog(true)}
            className="text-sm text-gray-400 transition-colors hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
          >
            放棄
          </button>
          <Timer timeRemaining={timeRemaining} />
        </div>
      </div>

      <ProgressBar
        current={currentIndex + 1}
        total={questions.length}
        answeredCount={answeredCount}
      />

      {/* Question — swipe left = next, swipe right = prev */}
      <div className="mt-6 touch-pan-y select-none" {...swipeHandlers}>
        <QuestionCard
          question={question}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          mode="exam"
          selectedAnswer={answers.get(question.id)}
          onSelectAnswer={(idx) => handleSelectAnswer(question.id, idx)}
        />
      </div>

      {/* Nav */}
      <QuestionNav
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onPrev={prevQuestion}
        onNext={nextQuestion}
        onGoTo={goToQuestion}
        showSubmit
        onSubmit={handleSubmit}
        answeredSet={answeredSet}
      />

      {/* Submit confirmation */}
      <AlertDialog
        isOpen={showSubmitDialog}
        title="確定交卷嗎？"
        message={
          unansweredCount > 0
            ? `還有 ${unansweredCount} 題尚未作答，確定要交卷嗎？`
            : '確定要交卷嗎？'
        }
        confirmText="交卷"
        cancelText="繼續作答"
        onConfirm={confirmSubmit}
        onCancel={() => setShowSubmitDialog(false)}
      />

      {/* Abandon exam */}
      <AlertDialog
        isOpen={showAbandonDialog}
        title="放棄考試？"
        message="確定要放棄此次考試嗎？成績不會被記錄。"
        confirmText="放棄考試"
        cancelText="繼續作答"
        variant="danger"
        onConfirm={() => {
          setShowAbandonDialog(false);
          abandonExam();
          navigate('/');
        }}
        onCancel={() => setShowAbandonDialog(false)}
      />

      {/* Navigation blocker (back button / link click) */}
      <AlertDialog
        isOpen={blocker.state === 'blocked'}
        title="離開考試？"
        message="離開頁面將中止此次考試，成績不會被記錄。"
        confirmText="離開"
        cancelText="繼續作答"
        variant="danger"
        onConfirm={() => {
          abandonExam();
          blocker.proceed?.();
        }}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
