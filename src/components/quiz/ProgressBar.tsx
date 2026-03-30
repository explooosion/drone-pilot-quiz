interface ProgressBarProps {
  current: number;
  total: number;
  answeredCount?: number;
  compact?: boolean;
  title?: string;
}

export function ProgressBar({ current, total, answeredCount, compact, title }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  if (compact) {
    return (
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3">
        {title && (
          <span className="shrink-0 text-base font-bold text-gray-900 dark:text-gray-100">
            {title}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="bg-primary-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 text-sm text-gray-500 tabular-nums dark:text-gray-400">
          {current}/{total}
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-1.5 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          題目 {current} / {total}
        </span>
        {answeredCount != null && (
          <span>
            已作答 {answeredCount} / {total}
          </span>
        )}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
