import React, { createContext, useContext } from 'react';

export const translations = {
  ru: {
    app_title: 'Мысли',
    search_hint: 'Поиск...',
    all_notes: 'Все мысли',
    no_category: 'Без категории',
    categories: 'Категории',
    new_category: 'Новая категория',
    category_name: 'Название категории',
    create: 'Создать',
    cancel: 'Отмена',
    settings: 'Настройки',
    theme: 'Тема',
    theme_light: 'Светлая',
    theme_dark: 'Тёмная',
    theme_system: 'Системная',
    language: 'Язык',
    contact: 'Контакт',
    telegram: 'Telegram',
    email_bug: 'Почта для багов',
    note_hint: 'Запиши свою мысль...',
    empty_notes: 'Пока нет мыслей.\nЗапиши первую!',
    empty_search: 'Ничего не найдено',
    page: 'Страница',
    of: 'из',
    delete_hint: 'Перетащи сюда чтобы удалить',
    delete_note: 'Удалить мысль?',
    delete_category: 'Удалить категорию?',
    delete_category_confirm:
      'Все мысли из этой категории станут «Без категории»',
    delete: 'Удалить',
    rename: 'Переименовать',
    rename_category: 'Переименовать категорию',
    move_to: 'Переместить в...',
    edit: 'Редактировать',
    save: 'Сохранить',
    today: 'Сегодня',
    yesterday: 'Вчера',
    attach_photo: 'Фото',
    attach_video: 'Видео',
    about: 'О приложении',
    about_text: 'Приложение для записи внезапных мыслей',
    category_emoji: 'Эмодзи',
    no_notes_in_category: 'В этой категории пока пусто',
    move_here: 'Переместить сюда',
    drag_hint: 'Удерживай и перетаскивай для сортировки',
    confirm_delete: 'Подтверждать удаление',
    confirm_delete_hint: 'Спрашивать перед удалением заметки',
    delete_confirm_title: 'Удалить заметку?',
    delete_confirm_message: 'Это действие нельзя отменить',
    behavior: 'Поведение',
    update_available: 'Доступна новая версия',
    update_later: 'Позже',
    update_download: 'Скачать',
  },
  en: {
    app_title: 'Thoughts',
    search_hint: 'Search...',
    all_notes: 'All thoughts',
    no_category: 'No category',
    categories: 'Categories',
    new_category: 'New category',
    category_name: 'Category name',
    create: 'Create',
    cancel: 'Cancel',
    settings: 'Settings',
    theme: 'Theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',
    language: 'Language',
    contact: 'Contact',
    telegram: 'Telegram',
    email_bug: 'Bug report email',
    note_hint: 'Write your thought...',
    empty_notes: 'No thoughts yet.\nWrite your first one!',
    empty_search: 'Nothing found',
    page: 'Page',
    of: 'of',
    delete_hint: 'Drop here to delete',
    delete_note: 'Delete thought?',
    delete_category: 'Delete category?',
    delete_category_confirm:
      'All thoughts from this category will become "No category"',
    delete: 'Delete',
    rename: 'Rename',
    rename_category: 'Rename category',
    move_to: 'Move to...',
    edit: 'Edit',
    save: 'Save',
    today: 'Today',
    yesterday: 'Yesterday',
    attach_photo: 'Photo',
    attach_video: 'Video',
    about: 'About',
    about_text: 'App for capturing sudden thoughts',
    category_emoji: 'Emoji',
    no_notes_in_category: 'This category is empty',
    move_here: 'Move here',
    drag_hint: 'Hold and drag to reorder',
    confirm_delete: 'Confirm deletion',
    confirm_delete_hint: 'Ask before deleting a note',
    delete_confirm_title: 'Delete note?',
    delete_confirm_message: 'This action cannot be undone',
    behavior: 'Behavior',
    update_available: 'New version available',
    update_later: 'Later',
    update_download: 'Download',
  },
};

export const supportedLocales = ['ru', 'en'];

export function translate(locale, key) {
  return (
    translations[locale]?.[key] ?? translations.en[key] ?? key
  );
}

export const I18nContext = createContext({ locale: 'ru', t: (k) => k });

export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ locale, children }) {
  const value = {
    locale,
    t: (key) => translate(locale, key),
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
