import { useCallback, useMemo, useState } from 'react';
import type { Question, QuestionBankType } from '../types';
import { useQuestions } from '../hooks/useQuestions';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';
import { HiOutlineFilter } from 'react-icons/hi';
import { QuestionCard } from '../components/quiz/QuestionCard';

const bankTypes: QuestionBankType[] = ['basic', 'professional', 'renewal'];
type FilterType = 'all' | QuestionBankType;

const filterOptions: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部題庫' },
  { key: 'basic', label: '普通操作證' },
  { key: 'professional', label: '專業操作證' },
  { key: 'renewal', label: '屆期換證' },
];

const bankTypeLabels: Record<QuestionBankType, string> = {
  basic: '普通操作證',
  professional: '專業操作證',
  renewal: '屆期換證',
};

interface BookmarkedQuestion {
  question: Question;
  bankType: QuestionBankType;
}

export function BookmarksPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [bookmarksMap, setBookmarksMap] = useState<Record<QuestionBankType, number[]>>(() => ({
    basic: getStorageItem<number[]>(STORAGE_KEYS.bookmarks('basic'), []),
    professional: getStorageItem<number[]>(STORAGE_KEYS.bookmarks('professional'), []),
    renewal: getStorageItem<number[]>(STORAGE_KEYS.bookmarks('renewal'), []),
  }));

  const { questions: basicQ } = useQuestions('basic');
  const { questions: proQ } = useQuestions('professional');
  const { questions: renewalQ } = useQuestions('renewal');

  const questionsMap: Record<QuestionBankType, Question[]> = useMemo(
    () => ({ basic: basicQ, professional: proQ, renewal: renewalQ }),
    [basicQ, proQ, renewalQ],
  );

  const bookmarkedItems: BookmarkedQuestion[] = useMemo(() => {
    const items: BookmarkedQuestion[] = [];
    for (const bt of bankTypes) {
      const ids = bookmarksMap[bt];
      const qs = questionsMap[bt];
      for (const id of ids) {
        const q = qs.find((x) => x.id === id);
        if (q) items.push({ question: q, bankType: bt });
      }
    }
    return items;
  }, [bookmarksMap, questionsMap]);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? bookmarkedItems
        : bookmarkedItems.filter((item) => item.bankType === filter),
    [bookmarkedItems, filter],
  );

  const removeBookmark = useCallback((bankType: QuestionBankType, questionId: number) => {
    setBookmarksMap((prev) => {
      const next = { ...prev, [bankType]: prev[bankType].filter((id) => id !== questionId) };
      setStorageItem(STORAGE_KEYS.bookmarks(bankType), next[bankType]);
      return next;
    });
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">收藏題目</h1>

        {/* Filter select */}
        <div className="relative">
          <HiOutlineFilter className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="focus:border-primary-500 focus:ring-primary-500 cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2 pr-8 pl-9 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600"
          >
            {filterOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
          尚未收藏任何題目
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map((item) => (
            <div key={`${item.bankType}-${item.question.id}`}>
              <QuestionCard
                question={item.question}
                progressLabel={bankTypeLabels[item.bankType]}
                mode="practice"
                isBookmarked
                onToggleBookmark={() => removeBookmark(item.bankType, item.question.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
