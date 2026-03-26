import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { lightTheme, darkTheme, Theme } from '@/constants/colors';

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app_theme_mode';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          setMode(stored);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setThemeMode = async (newMode: ThemeMode) => {
    try {
      setMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  const theme: Theme = mode === 'light' ? lightTheme : darkTheme;

  return {
    mode,
    theme,
    setThemeMode,
    toggleTheme,
    isLoading,
  };
});
