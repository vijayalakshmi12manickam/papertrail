import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildTheme } from '../theme';

const STORAGE_KEY = 'papertrail:themePreference'; // 'light' | 'dark' | 'system'

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [preference, setPreference] = useState('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setPreference(stored);
      setLoaded(true);
    });
  }, []);

  const setThemePreference = async (pref) => {
    setPreference(pref);
    await AsyncStorage.setItem(STORAGE_KEY, pref);
  };

  const resolvedMode = preference === 'system' ? (systemScheme || 'light') : preference;
  const theme = useMemo(() => buildTheme(resolvedMode), [resolvedMode]);

  // Avoid a flash of the wrong theme before AsyncStorage resolves.
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, preference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
