import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

interface QuestionNavProps {
  currentIndex: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  showSubmit?: boolean;
  onSubmit?: () => void;
  answeredSet?: Set<number>;
}

export function QuestionNav({
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  onGoTo,
  showSubmit,
  onSubmit,
  answeredSet,
}: QuestionNavProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        {/* Prev */}
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="上一題"
        >
          <HiOutlineChevronLeft className="h-6 w-6" />
        </button>

        {/* Question selector */}
        <select
          value={currentIndex}
          onChange={(e) => onGoTo(Number(e.target.value))}
          className="focus:ring-primary-500 cursor-pointer appearance-none rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-center text-sm font-medium text-gray-900 focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          {Array.from({ length: totalQuestions }, (_, i) => {
            const answered = answeredSet?.has(i);
            return (
              <option key={i} value={i}>
                第 {i + 1} 題{answered ? ' ✓' : ''}
              </option>
            );
          })}
        </select>

        {/* Next / Submit */}
        {isLast && showSubmit ? (
          <button
            type="button"
            onClick={onSubmit}
            className="bg-danger-600 hover:bg-danger-700 inline-flex h-12 cursor-pointer items-center justify-center rounded-lg px-5 font-semibold text-white transition-colors"
          >
            交卷
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={isLast}
            className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="下一題"
          >
            <HiOutlineChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
