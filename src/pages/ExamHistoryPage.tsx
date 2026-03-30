import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineX } from 'react-icons/hi';
import type { ExamRecord } from '../types';
import { BANK_LABELS } from '../utils/exam-config';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';
import { AlertDialog } from '../components/ui/AlertDialog';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ExamHistoryPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ExamRecord[]>(() =>
    getStorageItem<ExamRecord[]>(STORAGE_KEYS.examHistory, []),
  );
  const [showClearDialog, setShowClearDialog] = useState(false);

  const deleteRecord = (id: string) => {
    const next = records.filter((r) => r.id !== id);
    setRecords(next);
    setStorageItem(STORAGE_KEYS.examHistory, next);
  };

  const clearAll = () => {
    setRecords([]);
    setStorageItem(STORAGE_KEYS.examHistory, []);
    setShowClearDialog(false);
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 dark:text-gray-400">
        <p className="text-lg">尚無測驗紀錄</p>
        <button
          type="button"
          onClick={() => navigate('/exam/select')}
          className="text-primary-600 dark:text-primary-400 mt-4 cursor-pointer underline"
        >
          前往模擬測驗
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">測驗紀錄</h1>

      <div className="flex flex-col gap-3">
        {records.map((record) => (
          <div
            key={record.id}
            className="relative rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900"
          >
            <button
              type="button"
              onClick={() => navigate(`/exam/${record.type}/result`, { state: record })}
              className="w-full cursor-pointer text-left"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {BANK_LABELS[record.type]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    record.passed
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}
                >
                  {record.passed ? '通過' : '未通過'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{formatDate(record.date)}</span>
                <span>{record.score} 分</span>
                <span>{formatTime(record.timeUsed)}</span>
              </div>
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => deleteRecord(record.id)}
              className="absolute top-3 right-3 cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:text-red-500"
              aria-label="刪除紀錄"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Clear all */}
      <button
        type="button"
        onClick={() => setShowClearDialog(true)}
        className="mt-8 inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-red-300 px-6 py-3 font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
      >
        清除全部紀錄
      </button>

      <AlertDialog
        isOpen={showClearDialog}
        title="清除全部紀錄"
        message="確定要刪除所有測驗紀錄嗎？此操作無法復原。"
        confirmText="清除"
        cancelText="取消"
        onConfirm={clearAll}
        onCancel={() => setShowClearDialog(false)}
        variant="danger"
      />
    </div>
  );
}
