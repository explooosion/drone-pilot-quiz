import { HiOutlineClock } from 'react-icons/hi';

interface TimerProps {
  timeRemaining: number;
}

export function Timer({ timeRemaining }: TimerProps) {
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  let colorClass = 'text-gray-700 dark:text-gray-300';
  if (timeRemaining < 60) {
    colorClass = 'text-danger-600 dark:text-danger-400 animate-pulse';
  } else if (timeRemaining < 300) {
    colorClass = 'text-warning-600 dark:text-warning-400';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono text-base font-semibold ${colorClass}`}
    >
      <HiOutlineClock className="h-5 w-5" />
      <span>{display}</span>
    </div>
  );
}
