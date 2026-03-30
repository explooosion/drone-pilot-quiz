import { useLocation, useNavigate } from 'react-router-dom';
import type { QuestionBankType } from '../types';
import { EXAM_CONFIGS, BANK_LABELS } from '../utils/exam-config';
import metadata from '../data/metadata.json';

const bankTypes: QuestionBankType[] = ['basic', 'professional', 'renewal'];

export function CategorySelectPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isExam = pathname.startsWith('/exam');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100">選擇題庫</h1>
      <p className="mt-2 text-center text-gray-500 dark:text-gray-400">
        {isExam ? '選擇要模擬測驗的題庫類別' : '選擇要練習的題庫類別'}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {bankTypes.map((type) => {
          const config = EXAM_CONFIGS[type];
          const meta = metadata[type];
          const target = isExam ? `/exam/${type}` : `/practice/${type}`;

          return (
            <button
              key={type}
              type="button"
              onClick={() => navigate(target)}
              className="flex cursor-pointer flex-col items-start gap-2 rounded-xl bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900"
            >
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {BANK_LABELS[type]}
              </span>
              {isExam ? (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  抽 {config.questionCount} 題 / {config.timeLimitMinutes} 分鐘
                </span>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  共 {meta.questionCount} 題
                </span>
              )}
              {isExam && (
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  及格分數 {config.passScore} 分
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
