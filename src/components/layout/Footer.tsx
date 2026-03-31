import { HiOutlineExternalLink } from 'react-icons/hi';
import metadata from '../../data/metadata.json';

function formatDate(d: string) {
  return d === 'unknown' ? '待更新' : d;
}

const DATES = [
  { label: '普通操作證', date: formatDate(metadata.basic.updateDate) },
  { label: '專業操作證', date: formatDate(metadata.professional.updateDate) },
  { label: '屆期換證', date: formatDate(metadata.renewal.updateDate) },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center">
        {/* Update dates — 3-column grid, never wraps */}
        <div>
          <p className="mb-1.5 text-sm tracking-wide text-gray-400 dark:text-gray-600">題庫版本</p>
          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
            {DATES.map(({ label, date }) => (
              <div key={label} className="px-3 first:pl-0 last:pr-0">
                <p className="text-sm text-gray-400 dark:text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-600 tabular-nums dark:text-gray-300">
                  {date}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500">
          <a
            href="https://github.com/explooosion/drone-pilot-quiz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          >
            GitHub
            <HiOutlineExternalLink className="size-3.5" />
          </a>
          <span>·</span>
          <a
            href="https://github.com/explooosion/drone-pilot-quiz/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          >
            問題回報
            <HiOutlineExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
