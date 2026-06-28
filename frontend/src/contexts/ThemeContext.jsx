import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // 1. Expand state to handle 'light', 'dark', and 'system'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  // This derived state tells the app if it is ACTUALLY in dark mode
  // regardless of whether 'dark' or 'system' is selected.
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Function to determine if we should apply dark mode
    const applyTheme = () => {
      const rootTheme = theme === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;

      if (rootTheme === 'dark') {
        root.classList.add('dark');
        setIsDarkMode(true);
      } else {
        root.classList.remove('dark');
        setIsDarkMode(false);
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    // 2. System Theme Listener
    // If the user is on 'system' mode and changes their OS theme 
    // while the app is open, the app will now update instantly.
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  // A smarter toggle that cycles through: Light -> Dark -> System
  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  const setThemeMode = (mode) => {
    setTheme(mode);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme,           // 'light' | 'dark' | 'system'
        isDarkMode,      // boolean (the actual resulting state)
        toggleTheme,     // Cycle through modes
        setThemeMode     // Set specifically
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};