import { useEffect } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineBookmark,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import { usePreferences } from '../../hooks/usePreferences';
import { ConsentContext } from '../../contexts/ConsentContext';

const menuLinks = [
  { to: '/', label: '首頁', icon: <HiOutlineHome className="size-5" /> },
  { to: '/practice/select', label: '練習模式', icon: <HiOutlineBookOpen className="size-5" /> },
  { to: '/exam/select', label: '模擬測驗', icon: <HiOutlineClipboardCheck className="size-5" /> },
  { to: '/history', label: '考試紀錄', icon: <HiOutlineClock className="size-5" /> },
  { to: '/bookmarks', label: '我的收藏', icon: <HiOutlineBookmark className="size-5" /> },
];

interface PrefToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function PrefToggle({ label, checked, onChange }: PrefToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-2.5">
      <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${
          checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { examAutoAdvance, setExamAutoAdvance, practiceShowAnswer, setPracticeShowAnswer } =
    usePreferences();
  const { openConsentDialog } = React.use(ConsentContext);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className={`fixed top-0 right-0 z-50 flex h-full w-64 flex-col bg-white shadow-lg transition-transform duration-300 dark:bg-gray-900 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">無人機學科題庫</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">遙控無人機操作證練習</p>
          </div>
          <button
            type="button"
            aria-label="關閉選單"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        <ul className="flex flex-col gap-1 p-3">
          {menuLinks.map(({ to, label, icon }) => (
            <li key={to}>
              <Link
                to={to}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {icon}
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Preferences */}
        <div className="border-t border-gray-200 px-1 pb-4 dark:border-gray-800">
          <p className="px-4 py-2 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
            偏好設定
          </p>
          <PrefToggle
            label="模擬考試自動跳下一題"
            checked={examAutoAdvance}
            onChange={setExamAutoAdvance}
          />
          <PrefToggle
            label="題庫練習顯示答案"
            checked={practiceShowAnswer}
            onChange={setPracticeShowAnswer}
          />
        </div>

        {/* Privacy */}
        <div className="border-t border-gray-200 px-1 pb-4 dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              openConsentDialog();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <HiOutlineShieldCheck className="size-5 shrink-0" />
            隱私權政策
          </button>
        </div>
      </nav>
    </>
  );
}
