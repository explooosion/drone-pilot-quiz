const PREFIX = 'dronequiz';

export const STORAGE_KEYS = {
  theme: `${PREFIX}-theme`,
  practiceProgress: (type: string) => `${PREFIX}-progress-${type}`,
  readQuestions: (type: string) => `${PREFIX}-read-${type}`,
  bookmarks: (type: string) => `${PREFIX}-bookmarks-${type}`,
  examHistory: `${PREFIX}-exam-history`,
  prefExamAutoAdvance: `${PREFIX}-pref-exam-auto-advance`,
  prefPracticeShowAnswer: `${PREFIX}-pref-practice-show-answer`,
  privacyConsent: `${PREFIX}-privacy-consent`,
} as const;

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    // Block writes (except the consent key itself) when user has not accepted
    if (
      key !== STORAGE_KEYS.privacyConsent &&
      localStorage.getItem(STORAGE_KEYS.privacyConsent) !== 'true'
    ) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
