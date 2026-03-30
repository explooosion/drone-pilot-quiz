import { useCallback, useMemo, useState } from 'react';
import type { QuestionBankType } from '../types';
import { getStorageItem, removeStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';

export function useProgress(type: QuestionBankType) {
  const [currentIndex, setCurrentIndexState] = useState<number>(() =>
    getStorageItem(STORAGE_KEYS.practiceProgress(type), 0),
  );

  const [readIdArray, setReadIdArray] = useState<number[]>(() =>
    getStorageItem<number[]>(STORAGE_KEYS.readQuestions(type), []),
  );

  const readIds = useMemo(() => new Set(readIdArray), [readIdArray]);

  const setCurrentIndex = useCallback(
    (index: number) => {
      setCurrentIndexState(index);
      setStorageItem(STORAGE_KEYS.practiceProgress(type), index);
    },
    [type],
  );

  const markAsRead = useCallback(
    (id: number) => {
      setReadIdArray((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        setStorageItem(STORAGE_KEYS.readQuestions(type), next);
        return next;
      });
    },
    [type],
  );

  const resetProgress = useCallback(() => {
    setCurrentIndexState(0);
    setReadIdArray([]);
    removeStorageItem(STORAGE_KEYS.practiceProgress(type));
    removeStorageItem(STORAGE_KEYS.readQuestions(type));
  }, [type]);

  return { currentIndex, setCurrentIndex, readIds, markAsRead, resetProgress };
}
