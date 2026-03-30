import type { Question } from '../../types';
import { HiOutlineBookmark, HiBookmark, HiCheck } from 'react-icons/hi';
import { OptionButton } from './OptionButton';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  mode: 'practice' | 'exam' | 'review';
  selectedAnswer?: number;
  onSelectAnswer?: (index: number) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  isRead?: boolean;
  /** practice mode: show correct answer immediately (default true) */
  showAnswer?: boolean;
}

function getOptionState(
  mode: QuestionCardProps['mode'],
  index: number,
  correctAnswer: number,
  selectedAnswer: number | undefined,
  showAnswer: boolean,
): 'default' | 'selected' | 'correct' | 'wrong' {
  if (mode === 'practice') {
    if (showAnswer) return index === correctAnswer ? 'correct' : 'default';
    // reveal mode: only highlight after answered
    if (selectedAnswer === undefined) return 'default';
    if (index === correctAnswer) return 'correct';
    if (index === selectedAnswer && selectedAnswer !== correctAnswer) return 'wrong';
    return 'default';
  }
  if (mode === 'exam') {
    return index === selectedAnswer ? 'selected' : 'default';
  }
  // review
  if (index === correctAnswer) return 'correct';
  if (index === selectedAnswer && selectedAnswer !== correctAnswer) return 'wrong';
  return 'default';
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  mode,
  selectedAnswer,
  onSelectAnswer,
  isBookmarked,
  onToggleBookmark,
  isRead,
  showAnswer = true,
}: QuestionCardProps) {
  const interactive =
    mode === 'exam' || (mode === 'practice' && !showAnswer && selectedAnswer === undefined);

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-white p-5 shadow-sm md:p-8 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold">
            第 {questionNumber} / {totalQuestions} 題
          </span>
          {mode === 'practice' && isRead && (
            <span className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500">
              <HiCheck className="h-3.5 w-3.5" />
              已讀
            </span>
          )}
        </div>
        {onToggleBookmark && (
          <button
            type="button"
            onClick={onToggleBookmark}
            className="hover:text-warning-500 cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors"
            aria-label={isBookmarked ? '取消收藏' : '收藏題目'}
          >
            {isBookmarked ? (
              <HiBookmark className="text-primary-600 dark:text-primary-400 h-6 w-6" />
            ) : (
              <HiOutlineBookmark className="h-6 w-6" />
            )}
          </button>
        )}
      </div>

      {/* Question text */}
      <p className="mb-6 text-lg font-medium text-gray-900 dark:text-gray-100">
        {question.question}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => (
          <OptionButton
            key={i}
            label={OPTION_LABELS[i]}
            text={opt}
            state={getOptionState(mode, i, question.answer, selectedAnswer, showAnswer)}
            disabled={!interactive}
            onClick={interactive ? () => onSelectAnswer?.(i) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
