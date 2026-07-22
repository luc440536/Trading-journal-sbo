import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ThemePref } from '@/types';

interface ThemeContextType {
  theme: ThemePref;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemePref>(() => {
    const saved = localStorage.getItem('sbo-theme') as ThemePref | null;
    return saved ?? 'dark';
  });

  useEffect(() => {
    localStorage.setItem('sbo-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  return context;
}
