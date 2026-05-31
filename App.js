import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
} from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StatusBar, Platform } from 'react-native';
import * as SystemUI from 'expo-system-ui';

import { SettingsProvider, useSettings } from './src/store/SettingsStore';
import { NotesProvider } from './src/store/NotesStore';
import { ThemeProvider } from './src/theme/theme';
import { I18nProvider } from './src/i18n/i18n';

import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SidePanel from './src/components/SidePanel';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function DrawerNav() {
  const { theme } = useSettings();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SidePanel {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: '78%', backgroundColor: theme.bg },
        sceneContainerStyle: { backgroundColor: theme.bg },
        overlayColor: 'rgba(0,0,0,0.4)',
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
    </Drawer.Navigator>
  );
}

function Root() {
  const { theme, ready } = useSettings();

  // Синхронизируем фон нативного корневого view с темой.
  // Это нужно, чтобы при открытии клавиатуры на Android
  // не проглядывал белый фон активити во время анимации resize окна.
  useEffect(() => {
    if (ready) {
      SystemUI.setBackgroundColorAsync(theme.bg).catch(() => {});
    }
  }, [theme.bg, ready]);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.bg,
        }}
      >
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  // Тема навигации — чтобы при переходах между экранами фон совпадал с фоном приложения
  const baseNavTheme = theme.mode === 'dark' ? NavDarkTheme : NavDefaultTheme;
  const navTheme = {
    ...baseNavTheme,
    colors: {
      ...baseNavTheme.colors,
      background: theme.bg,
      card: theme.bg,
      text: theme.textPrimary,
      border: 'transparent',
      primary: theme.primary,
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
        translucent={false}
      />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Drawer" component={DrawerNav} />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ presentation: 'card' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

// Мост: язык берём из настроек и пробрасываем в I18nProvider
function LocalizedRoot() {
  const { locale } = useSettings();
  return (
    <I18nProvider locale={locale}>
      <NotesProvider>
        <Root />
      </NotesProvider>
    </I18nProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <LocalizedRoot />
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
