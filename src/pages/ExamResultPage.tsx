import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import type { ExamRecord } from '../types';
import { BANK_LABELS } from '../utils/exam-config';
import { QuestionCard } from '../components/quiz/QuestionCard';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ExamResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const record = location.state as ExamRecord | undefined;
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!record) return <Navigate to="/" replace />;

  const wrongAnswers = record.answers.filter((a) => a.selected !== a.correct);
  const accuracy = Math.round((record.correctCount / record.totalQuestions) * 100);
  const strokeDash = 2 * Math.PI * 54; // circle circumference for r=54
  const scoreOffset = strokeDash - (strokeDash * record.score) / 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      {/* Score circle */}
      <div className="mb-8 flex flex-col items-center">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={strokeDash}
              strokeDashoffset={scoreOffset}
              className={record.passed ? 'text-green-500' : 'text-red-500'}
              stroke="currentColor"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {record.score}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">分</span>
          </div>
        </div>

        <span
          className={`mt-4 inline-block rounded-full px-4 py-1 text-sm font-semibold ${
            record.passed
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}
        >
          {record.passed ? '通過' : '未通過'}
        </span>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="作答時間" value={formatTime(record.timeUsed)} />
        <StatCard label="答對題數" value={`${record.correctCount} / ${record.totalQuestions}`} />
        <StatCard label="正確率" value={`${accuracy}%`} />
        <StatCard label="及格分數" value={`${BANK_LABELS[record.type] ? 70 : 70}`} />
      </div>

      {/* Wrong questions */}
      {wrongAnswers.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
            答錯題目（{wrongAnswers.length} 題）
          </h2>
          <div className="flex flex-col gap-4">
            {wrongAnswers.map((wa) => {
              const question = record.questions.find((q) => q.id === wa.questionId);
              if (!question) return null;
              const isExpanded = expandedId === wa.questionId;
              return (
                <div key={wa.questionId}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : wa.questionId)}
                    className="w-full cursor-pointer rounded-xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md dark:bg-gray-900"
                  >
                    <p className="line-clamp-2 text-sm text-gray-900 dark:text-gray-100">
                      {question.question}
                    </p>
                  </button>
                  {isExpanded && (
                    <div className="mt-2">
                      <QuestionCard
                        question={question}
                        questionNumber={
                          record.questions.findIndex((q) => q.id === wa.questionId) + 1
                        }
                        totalQuestions={record.totalQuestions}
                        mode="review"
                        selectedAnswer={wa.selected}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate(`/exam/${record.type}`)}
          className="bg-primary-700 hover:bg-primary-800 inline-flex flex-1 cursor-pointer items-center justify-center rounded-lg px-6 py-3 font-semibold text-white transition-colors"
        >
          重新測驗
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          返回首頁
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 text-center shadow-sm dark:bg-gray-900">
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
