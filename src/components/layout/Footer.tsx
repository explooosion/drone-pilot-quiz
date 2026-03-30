import { HiOutlineExternalLink } from 'react-icons/hi';
import metadata from '../../data/metadata.json';

function formatDate(d: string) {
  return d === 'unknown' ? '待更新' : d;
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          題庫更新日期 — 學習類：{formatDate(metadata.basic.updateDate)} ｜ 專業類：
          {formatDate(metadata.professional.updateDate)} ｜ 換證類：
          {formatDate(metadata.renewal.updateDate)}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          >
            GitHub
            <HiOutlineExternalLink className="size-3" />
          </a>
          <span>·</span>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
