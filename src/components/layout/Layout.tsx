import { useState } from 'react';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { MobileMenu } from './MobileMenu';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Header onMenuToggle={() => setIsMenuOpen((prev) => !prev)} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-14 pb-8">{children}</main>

      <Footer />
    </>
  );
}
