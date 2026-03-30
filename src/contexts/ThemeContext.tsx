import { createContext, useCallback, useEffect, useState } from 'react';
import * as React from 'react';
import type { ThemeMode } from '../types';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    getStorageItem<ThemeMode>(STORAGE_KEYS.theme, 'system'),
  );
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    setStorageItem(STORAGE_KEYS.theme, next);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  return <ThemeContext value={{ theme, setTheme, resolvedTheme }}>{children}</ThemeContext>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook colocated is intentional
export function useTheme(): ThemeContextValue {
  const ctx = React.use(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
