import { Link } from 'react-router-dom';
import { HiOutlineMenu } from 'react-icons/hi';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { to: '/', label: '首頁' },
  { to: '/history', label: '考試紀錄' },
  { to: '/bookmarks', label: '我的收藏' },
];

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white pt-[env(safe-area-inset-top)] dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="text-primary-800 dark:text-primary-300 text-lg font-bold">
          無人機學科題庫
        </Link>

        <div className="flex items-center gap-2">
          <nav className="mr-2 hidden items-center gap-1 md:flex">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              >
                {label}
              </Link>
            ))}
          </nav>

          <ThemeToggle />

          <button
            type="button"
            aria-label="開啟選單"
            onClick={onMenuToggle}
            className="ml-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <HiOutlineMenu className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
