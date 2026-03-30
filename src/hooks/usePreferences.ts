import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';

export function usePreferences() {
  const [examAutoAdvance, setExamAutoAdvance] = useLocalStorage(
    STORAGE_KEYS.prefExamAutoAdvance,
    true,
  );
  const [practiceShowAnswer, setPracticeShowAnswer] = useLocalStorage(
    STORAGE_KEYS.prefPracticeShowAnswer,
    true,
  );
  return { examAutoAdvance, setExamAutoAdvance, practiceShowAnswer, setPracticeShowAnswer };
}
