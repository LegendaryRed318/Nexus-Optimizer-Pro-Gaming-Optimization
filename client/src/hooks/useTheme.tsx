import { useState, useEffect } from 'react';
import type { ThemeType } from '@/types/system';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeType>('green');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('nexus-theme') as ThemeType;
    const savedDarkMode = localStorage.getItem('nexus-dark-mode');
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus-theme', theme);
    
    // Update CSS variables based on theme
    const root = document.documentElement;
    
    switch (theme) {
      case 'green':
        root.style.setProperty('--theme-primary', '0, 255, 136');
        root.style.setProperty('--theme-secondary', '0, 212, 255');
        break;
      case 'blue':
        root.style.setProperty('--theme-primary', '0, 212, 255');
        root.style.setProperty('--theme-secondary', '157, 78, 221');
        break;
      case 'purple':
        root.style.setProperty('--theme-primary', '157, 78, 221');
        root.style.setProperty('--theme-secondary', '255, 196, 0');
        break;
      case 'yellow':
        root.style.setProperty('--theme-primary', '255, 196, 0');
        root.style.setProperty('--theme-secondary', '0, 255, 136');
        break;
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nexus-dark-mode', isDarkMode.toString());
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return {
    theme,
    setTheme,
    isDarkMode,
    setIsDarkMode,
  };
}
