import { useNavigate } from 'react-router-dom';
import { HiOutlineBookOpen, HiOutlineClipboardCheck } from 'react-icons/hi';

const modes = [
  {
    title: '題庫練習',
    description: '瀏覽完整題庫，每題顯示正確答案',
    icon: HiOutlineBookOpen,
    to: '/practice/select',
  },
  {
    title: '模擬測驗',
    description: '依照正式考試規則進行模擬測驗',
    icon: HiOutlineClipboardCheck,
    to: '/exam/select',
  },
] as const;

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-gray-100">
        台灣遙控無人機操作證
      </h1>
      <p className="mt-2 text-center text-gray-500 dark:text-gray-400">
        學科測驗題庫練習，一起通過考試吧！
      </p>

      {/* Mode cards */}
      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.to}
              type="button"
              onClick={() => navigate(mode.to)}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-xl bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900"
            >
              <Icon className="text-primary-700 dark:text-primary-400 h-10 w-10" />
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {mode.title}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{mode.description}</span>
            </button>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
        線上題庫僅供參考，實際考試內容以
        <a
          href="https://www.caa.gov.tw"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-1 underline transition-colors hover:text-gray-600 dark:hover:text-gray-400"
        >
          交通部民用航空局
        </a>
        公告為準。
      </p>
    </div>
  );
}
