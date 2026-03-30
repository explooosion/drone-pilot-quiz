import { createContext, useCallback, useState, type ReactNode } from 'react';

const CONSENT_KEY = 'dronequiz-privacy-consent';

export type ConsentState = 'accepted' | 'declined' | 'pending';

interface ConsentContextValue {
  consentState: ConsentState;
  openConsentDialog: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components -- context + provider colocated is intentional
export const ConsentContext = createContext<ConsentContextValue>({
  consentState: 'pending',
  openConsentDialog: () => {},
});

function getInitialState(): ConsentState {
  const val = localStorage.getItem(CONSENT_KEY);
  if (val === 'true') return 'accepted';
  if (val === 'false') return 'declined';
  return 'pending';
}

// ─── Privacy Dialog ────────────────────────────────────────────────────────────

const storageFeatures = [
  '深色／淺色主題偏好',
  '練習模式的閱讀進度與已讀紀錄',
  '收藏題目清單',
  '模擬考試歷史成績',
  '偏好設定（自動跳題、顯示答案）',
];

interface ConsentDialogProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

function ConsentDialog({ isOpen, onAccept, onDecline }: ConsentDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <h2 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">隱私權政策</h2>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">最後更新：2025 年 1 月</p>

        <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
          本網站（無人機學科題庫）為純客戶端學習工具，不設後端伺服器、不蒐集個人資料，亦不與第三方共享任何資訊。
        </p>

        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          本網站將在您的裝置上使用 <strong>localStorage</strong> 儲存以下資料：
        </p>
        <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {storageFeatures.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          以上資料僅存於您的瀏覽器本機，隨時可透過清除瀏覽器資料刪除。若您不同意，上述功能將無法正常儲存資料（網頁仍可瀏覽，但進度與偏好不會保留）。
        </p>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onAccept}
            className="bg-primary-700 hover:bg-primary-800 w-full cursor-pointer rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors sm:w-auto"
          >
            同意並繼續
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="w-full cursor-pointer rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            不同意
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConsentState>(getInitialState);
  const [isOpen, setIsOpen] = useState(() => getInitialState() === 'pending');

  const openConsentDialog = useCallback(() => setIsOpen(true), []);

  const handleAccept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setState('accepted');
    setIsOpen(false);
  }, []);

  const handleDecline = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'false');
    setState('declined');
    setIsOpen(false);
  }, []);

  return (
    <ConsentContext value={{ consentState: state, openConsentDialog }}>
      {children}
      <ConsentDialog isOpen={isOpen} onAccept={handleAccept} onDecline={handleDecline} />
    </ConsentContext>
  );
}
