'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext<{ dark: boolean; toggle: () => void }>({
  dark: false, toggle: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rev-theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    setDark(d => {
      const next = !d;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('rev-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
