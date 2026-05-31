import React, { createContext, useContext } from 'react';

// Палитра из референсов пользователя:
//  - Светлая: бежево-кремовый фон #EFE7D8, золотой акцент #C9A26B,
//    тёмные карточки #1E1E1E (как в смарт-хом приложении)
//  - Тёмная: фиолетовая палитра #2D2837 -> #756988
export const Palette = {
  // золото / акцент
  gold: '#C9A26B',
  goldSoft: '#D8B888',
  // светлая тема
  lightBg: '#EFE7D8',
  lightCard: '#1E1E1E',
  lightCardText: '#F3ECDD',
  lightSurface: '#E4D9C4',
  lightTextPrimary: '#2B2620',
  lightTextSecondary: '#8A7E6B',
  lightDivider: '#D7CAB2',
  // тёмная тема
  darkBg: '#2D2837',
  darkCard: '#3A3349',
  darkSurface: '#453D57',
  darkPrimary: '#9E8FB8',
  darkTextPrimary: '#ECE7F2',
  darkTextSecondary: '#9D93AE',
  darkDivider: '#4A4259',
  // общее
  deleteRed: '#E74C3C',
  deleteRedTransparent: 'rgba(231, 76, 60, 0.18)',
  white: '#FFFFFF',
};

export const LightTheme = {
  mode: 'light',
  bg: Palette.lightBg,
  card: Palette.lightCard,
  cardText: Palette.lightCardText,
  cardTextSecondary: 'rgba(243, 236, 221, 0.6)',
  surface: Palette.lightSurface,
  primary: Palette.gold,
  onPrimary: '#1E1E1E',
  textPrimary: Palette.lightTextPrimary,
  textSecondary: Palette.lightTextSecondary,
  divider: Palette.lightDivider,
  deleteRed: Palette.deleteRed,
  deleteRedTransparent: Palette.deleteRedTransparent,
  inputBg: Palette.lightCard,
  inputText: Palette.lightCardText,
  inputPlaceholder: 'rgba(243, 236, 221, 0.45)',
  shadow: '#000000',
};

export const DarkTheme = {
  mode: 'dark',
  bg: Palette.darkBg,
  card: Palette.darkCard,
  cardText: Palette.darkTextPrimary,
  cardTextSecondary: Palette.darkTextSecondary,
  surface: Palette.darkSurface,
  primary: Palette.darkPrimary,
  onPrimary: '#1E1A24',
  textPrimary: Palette.darkTextPrimary,
  textSecondary: Palette.darkTextSecondary,
  divider: Palette.darkDivider,
  deleteRed: Palette.deleteRed,
  deleteRedTransparent: Palette.deleteRedTransparent,
  inputBg: Palette.darkSurface,
  inputText: Palette.darkTextPrimary,
  inputPlaceholder: Palette.darkTextSecondary,
  shadow: '#000000',
};

export const ThemeContext = createContext(LightTheme);

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ theme, children }) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
