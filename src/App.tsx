import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CategorySelectPage } from './pages/CategorySelectPage';
import { PracticePage } from './pages/PracticePage';
import { ExamPage } from './pages/ExamPage';
import { ExamResultPage } from './pages/ExamResultPage';
import { ExamHistoryPage } from './pages/ExamHistoryPage';
import { BookmarksPage } from './pages/BookmarksPage';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/practice/select" element={<CategorySelectPage />} />
        <Route path="/practice/:type" element={<PracticePage />} />
        <Route path="/exam/select" element={<CategorySelectPage />} />
        <Route path="/exam/:type" element={<ExamPage />} />
        <Route path="/exam/:type/result" element={<ExamResultPage />} />
        <Route path="/history" element={<ExamHistoryPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
      </Routes>
    </Layout>
  );
}
