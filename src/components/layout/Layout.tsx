import { useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { MobileMenu } from './MobileMenu';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

// Active quiz pages have a fixed bottom QuestionNav — footer is unreachable there
const QUIZ_ROUTE = /^\/(practice|exam)\/(basic|professional|renewal)$/;

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isQuizPage = QUIZ_ROUTE.test(pathname);

  return (
    <>
      <Header onMenuToggle={() => setIsMenuOpen((prev) => !prev)} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-8">
        {children}
      </main>

      {!isQuizPage && <Footer />}
    </>
  );
}
