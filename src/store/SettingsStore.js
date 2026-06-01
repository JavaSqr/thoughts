import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useColorScheme } from 'react-native';
import * as Localization from 'expo-localization';
import { StorageService } from '../services/storage';
import { LightTheme, DarkTheme } from '../theme/theme';
import { supportedLocales } from '../i18n/i18n';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [themeMode, setThemeMode] = useState('system'); // system|light|dark
  const [locale, setLocale] = useState('ru');
  const [confirmDelete, setConfirmDelete] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const savedMode = await StorageService.loadThemeMode();
      const savedLocale = await StorageService.loadLocale();
      const savedConfirm = await StorageService.loadConfirmDelete();
      setThemeMode(savedMode || 'system');
      setConfirmDelete(savedConfirm);

      if (savedLocale && supportedLocales.includes(savedLocale)) {
        setLocale(savedLocale);
      } else {
        // Fall back to device language if it's one we support.
        const device = Localization.getLocales?.()[0]?.languageCode;
        setLocale(supportedLocales.includes(device) ? device : 'ru');
      }
      setReady(true);
    })();
  }, []);

  const changeThemeMode = useCallback((mode) => {
    setThemeMode(mode);
    StorageService.saveThemeMode(mode);
  }, []);

  const changeLocale = useCallback((loc) => {
    setLocale(loc);
    StorageService.saveLocale(loc);
  }, []);

  const changeConfirmDelete = useCallback((value) => {
    setConfirmDelete(value);
    StorageService.saveConfirmDelete(value);
  }, []);

  const effectiveScheme =
    themeMode === 'system' ? systemScheme || 'light' : themeMode;
  const theme = effectiveScheme === 'dark' ? DarkTheme : LightTheme;

  const value = {
    themeMode,
    setThemeMode: changeThemeMode,
    locale,
    setLocale: changeLocale,
    confirmDelete,
    setConfirmDelete: changeConfirmDelete,
    theme,
    ready,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
