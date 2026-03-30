import { useEffect, useState } from 'react';
import type { Question, QuestionBank, QuestionBankType } from '../types';

const cache = new Map<QuestionBankType, QuestionBank>();

export function useQuestions(type: QuestionBankType) {
  const [bank, setBank] = useState<QuestionBank | null>(cache.get(type) ?? null);
  const [loading, setLoading] = useState(!cache.has(type));

  useEffect(() => {
    if (cache.has(type)) {
      setBank(cache.get(type)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    import(`../data/${type}.json`).then((mod) => {
      if (cancelled) return;
      const data = mod.default as QuestionBank;
      cache.set(type, data);
      setBank(data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [type]);

  const questions: Question[] = bank?.questions ?? [];
  return { questions, bank, loading };
}
