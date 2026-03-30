import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineBookmark,
} from 'react-icons/hi';

const menuLinks = [
  { to: '/', label: '首頁', icon: <HiOutlineHome className="size-5" /> },
  { to: '/practice/select', label: '練習模式', icon: <HiOutlineBookOpen className="size-5" /> },
  { to: '/exam/select', label: '模擬測驗', icon: <HiOutlineClipboardCheck className="size-5" /> },
  { to: '/history', label: '考試紀錄', icon: <HiOutlineClock className="size-5" /> },
  { to: '/bookmarks', label: '我的收藏', icon: <HiOutlineBookmark className="size-5" /> },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
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
        <div className="flex h-14 items-center justify-end border-b border-gray-200 px-4 dark:border-gray-800">
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
      </nav>
    </>
  );
}
