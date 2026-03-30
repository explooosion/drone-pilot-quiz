import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuestionBankType } from '../types';
import { useExam } from '../hooks/useExam';
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
  } = useExam(bankType);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

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
    <div className="mx-auto max-w-2xl px-4 py-4 pb-24">
      {/* Timer + progress */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {BANK_LABELS[bankType]}
        </h2>
        <Timer timeRemaining={timeRemaining} />
      </div>

      <ProgressBar
        current={currentIndex + 1}
        total={questions.length}
        answeredCount={answeredCount}
      />

      {/* Question */}
      <div className="mt-6">
        <QuestionCard
          question={question}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          mode="exam"
          selectedAnswer={answers.get(question.id)}
          onSelectAnswer={(idx) => selectAnswer(question.id, idx)}
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
    </div>
  );
}
