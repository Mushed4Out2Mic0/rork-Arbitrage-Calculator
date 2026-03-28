import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { lightTheme, darkTheme, Theme } from '@/constants/colors';

type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'app_theme_mode';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored === 'light' || stored === 'dark') setMode(stored);
      } catch (e) {
        console.error('[Theme] Load error:', e);
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      void AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    void AsyncStorage.setItem(THEME_KEY, newMode);
  }, []);

  const theme: Theme = mode === 'light' ? lightTheme : darkTheme;

  return useMemo(() => ({ mode, theme, toggleTheme, setThemeMode }), [mode, theme, toggleTheme, setThemeMode]);
});
