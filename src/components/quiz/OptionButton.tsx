import { HiCheck, HiX } from 'react-icons/hi';

const stateStyles = {
  default:
    'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100',
  selected:
    'bg-primary-50 dark:bg-primary-950 border-primary-500 text-primary-800 dark:text-primary-200',
  correct:
    'bg-success-50 dark:bg-success-700/20 border-success-500 text-success-800 dark:text-success-200',
  wrong:
    'bg-danger-50 dark:bg-danger-700/20 border-danger-500 text-danger-800 dark:text-danger-200',
} as const;

const badgeStyles = {
  default:
    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600',
  selected:
    'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200 border-primary-500',
  correct:
    'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-200 border-success-500',
  wrong: 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-200 border-danger-500',
} as const;

interface OptionButtonProps {
  label: string;
  text: string;
  state: 'default' | 'selected' | 'correct' | 'wrong';
  disabled?: boolean;
  onClick?: () => void;
}

export function OptionButton({ label, text, state, disabled, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      className={`flex min-h-[48px] w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${stateStyles[state]} ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600'}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${badgeStyles[state]}`}
      >
        {state === 'correct' ? (
          <HiCheck className="h-4 w-4" />
        ) : state === 'wrong' ? (
          <HiX className="h-4 w-4" />
        ) : (
          label
        )}
      </span>
      <span className="text-base">{text}</span>
    </button>
  );
}
