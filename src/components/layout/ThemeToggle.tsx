import { HiOutlineSun, HiOutlineMoon, HiOutlineDesktopComputer } from 'react-icons/hi';
import type { ThemeMode } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

const modes: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <HiOutlineSun className="size-4" />, label: '淺色' },
  { value: 'dark', icon: <HiOutlineMoon className="size-4" />, label: '深色' },
  { value: 'system', icon: <HiOutlineDesktopComputer className="size-4" />, label: '系統' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
      {modes.map(({ value, icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          onClick={() => setTheme(value)}
          className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
            theme === value
              ? 'bg-primary-600 text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
