import { useCallback, useMemo, useState } from 'react';
import type { Question, QuestionBankType } from '../types';
import { useQuestions } from '../hooks/useQuestions';
import { BANK_LABELS } from '../utils/exam-config';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';
import { QuestionCard } from '../components/quiz/QuestionCard';

const bankTypes: QuestionBankType[] = ['basic', 'professional', 'renewal'];
type FilterType = 'all' | QuestionBankType;

const filterTabs: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'basic', label: '普通操作證' },
  { key: 'professional', label: '專業操作證' },
  { key: 'renewal', label: '屆期換證' },
];

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
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">收藏題目</h1>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-primary-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  {BANK_LABELS[item.bankType]}
                </span>
              </div>
              <QuestionCard
                question={item.question}
                questionNumber={item.question.id}
                totalQuestions={0}
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
