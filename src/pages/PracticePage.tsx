import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { QuestionBankType } from '../types';
import { useQuestions } from '../hooks/useQuestions';
import { useProgress } from '../hooks/useProgress';
import { useSwipe } from '../hooks/useSwipe';
import { usePreferences } from '../hooks/usePreferences';
import { BANK_LABELS } from '../utils/exam-config';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { ProgressBar } from '../components/quiz/ProgressBar';
import { QuestionNav } from '../components/quiz/QuestionNav';
import { AlertDialog } from '../components/ui/AlertDialog';

export function PracticePage() {
  const { type } = useParams<{ type: string }>();
  const bankType = type as QuestionBankType;

  const { questions, loading } = useQuestions(bankType);
  const { currentIndex, setCurrentIndex, markAsRead, resetProgress } = useProgress(bankType);

  const { practiceShowAnswer } = usePreferences();

  const [bookmarks, setBookmarks] = useState<number[]>(() =>
    getStorageItem<number[]>(STORAGE_KEYS.bookmarks(bankType), []),
  );
  const [showResumeDialog, setShowResumeDialog] = useState(
    () => getStorageItem(STORAGE_KEYS.practiceProgress(bankType), 0) > 0,
  );

  // Per-question reveal answers (used when practiceShowAnswer=false)
  const [revealAnswers, setRevealAnswers] = useState<Map<number, number>>(new Map());
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Mark current question as read
  useEffect(() => {
    const q = questions[currentIndex];
    if (q) markAsRead(q.id);
  }, [currentIndex, questions, markAsRead]);

  const toggleBookmark = useCallback(() => {
    const q = questions[currentIndex];
    if (!q) return;
    setBookmarks((prev) => {
      const next = prev.includes(q.id) ? prev.filter((id) => id !== q.id) : [...prev, q.id];
      setStorageItem(STORAGE_KEYS.bookmarks(bankType), next);
      return next;
    });
  }, [currentIndex, questions, bankType]);

  const handleRevealAnswer = useCallback(
    (idx: number) => {
      const q = questions[currentIndex];
      if (!q || revealAnswers.has(q.id)) return;
      setRevealAnswers((prev) => new Map(prev).set(q.id, idx));
      if (idx === q.answer) {
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = setTimeout(() => {
          autoAdvanceTimerRef.current = null;
          setCurrentIndex(Math.min(currentIndex + 1, questions.length - 1));
        }, 400);
      }
    },
    [questions, currentIndex, revealAnswers, setCurrentIndex],
  );

  const swipeHandlers = useSwipe(
    () => setCurrentIndex(Math.min(currentIndex + 1, questions.length - 1)),
    () => setCurrentIndex(Math.max(currentIndex - 1, 0)),
  );

  if (loading || questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
        載入中…
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {/* Compact title + progress bar on one line */}
      <ProgressBar
        compact
        title={BANK_LABELS[bankType]}
        current={currentIndex + 1}
        total={questions.length}
      />

      {/* Card — swipe left = next, swipe right = prev */}
      <div className="mt-4 touch-pan-y select-none" {...swipeHandlers}>
        <QuestionCard
          question={question}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          mode="practice"
          showAnswer={practiceShowAnswer}
          isBookmarked={bookmarks.includes(question.id)}
          onToggleBookmark={toggleBookmark}
          selectedAnswer={!practiceShowAnswer ? revealAnswers.get(question.id) : undefined}
          onSelectAnswer={!practiceShowAnswer ? handleRevealAnswer : undefined}
        />
      </div>

      {/* Swipe hint */}
      <p className="mt-3 text-center text-sm text-gray-400 dark:text-gray-500">
        ← 左右滑動切換題目 →
      </p>

      {/* Nav */}

      {/* Nav */}
      <QuestionNav
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onPrev={() => setCurrentIndex(Math.max(currentIndex - 1, 0))}
        onNext={() => setCurrentIndex(Math.min(currentIndex + 1, questions.length - 1))}
        onGoTo={setCurrentIndex}
      />

      {/* Resume dialog */}
      <AlertDialog
        isOpen={showResumeDialog}
        title="繼續上次進度"
        message={`上次閱讀到第 ${currentIndex + 1} 題，是否繼續？`}
        confirmText="繼續"
        cancelText="從頭開始"
        onConfirm={() => setShowResumeDialog(false)}
        onCancel={() => {
          resetProgress();
          setShowResumeDialog(false);
        }}
      />
    </div>
  );
}
