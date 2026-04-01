// src/core/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    console.log("🎨 ThemeContext: Tema inicial desde localStorage:", savedTheme || 'dark (default)');
    return savedTheme || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    console.log("🎨 ThemeContext: Aplicando tema", theme);
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    localStorage.setItem('theme', theme);
    
    // 👇 VERIFICAR QUE SE APLICÓ
    console.log("🎨 ThemeContext: Clases del HTML:", root.className);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const setSpecificTheme = (newTheme) => {
    console.log("🎨 ThemeContext: setSpecificTheme llamado con", newTheme);
    if (newTheme === 'dark' || newTheme === 'light') {
      setTheme(newTheme);
    } else {
      console.warn("⚠️ ThemeContext: Tema inválido:", newTheme);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setSpecificTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};