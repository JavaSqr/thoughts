import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  notes: '@tk_notes',
  categories: '@tk_categories',
  themeMode: '@tk_theme_mode',
  locale: '@tk_locale',
  confirmDelete: '@tk_confirm_delete',
};

export const StorageService = {
  async loadNotes() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.notes);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('loadNotes failed', e);
      return [];
    }
  },

  async saveNotes(notes) {
    try {
      await AsyncStorage.setItem(KEYS.notes, JSON.stringify(notes));
    } catch (e) {
      console.warn('saveNotes failed', e);
    }
  },

  async loadCategories() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.categories);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('loadCategories failed', e);
      return [];
    }
  },

  async saveCategories(categories) {
    try {
      await AsyncStorage.setItem(KEYS.categories, JSON.stringify(categories));
    } catch (e) {
      console.warn('saveCategories failed', e);
    }
  },

  async loadThemeMode() {
    try {
      return (await AsyncStorage.getItem(KEYS.themeMode)) || 'system';
    } catch (e) {
      return 'system';
    }
  },

  async saveThemeMode(mode) {
    try {
      await AsyncStorage.setItem(KEYS.themeMode, mode);
    } catch (e) {
      console.warn('saveThemeMode failed', e);
    }
  },

  async loadLocale() {
    try {
      return await AsyncStorage.getItem(KEYS.locale);
    } catch (e) {
      return null;
    }
  },

  async saveLocale(locale) {
    try {
      await AsyncStorage.setItem(KEYS.locale, locale);
    } catch (e) {
      console.warn('saveLocale failed', e);
    }
  },

  async loadConfirmDelete() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.confirmDelete);
      // По умолчанию подтверждение включено
      if (raw == null) return true;
      return raw === 'true';
    } catch (e) {
      return true;
    }
  },

  async saveConfirmDelete(value) {
    try {
      await AsyncStorage.setItem(KEYS.confirmDelete, value ? 'true' : 'false');
    } catch (e) {
      console.warn('saveConfirmDelete failed', e);
    }
  },
};
