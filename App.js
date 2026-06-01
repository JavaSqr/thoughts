import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
} from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StatusBar, Animated, StyleSheet } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';

import { SettingsProvider, useSettings } from './src/store/SettingsStore';
import { NotesProvider } from './src/store/NotesStore';
import { ThemeProvider } from './src/theme/theme';
import { I18nProvider } from './src/i18n/i18n';

import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SidePanel from './src/components/SidePanel';
import UpdateChecker from './src/components/UpdateChecker';

// Keep the splash visible until our content is ready.
SplashScreen.preventAutoHideAsync().catch(() => {});

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
  // Overlay opacity for the splash fade-out (1 = fully covering, 0 = invisible).
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const [splashVisible, setSplashVisible] = useState(true);

  // Keep the native window background in sync with the theme so the
  // Android system doesn't flash white when the keyboard opens.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.bg).catch(() => {});
  }, [theme.bg]);

  // When data is loaded: hide the native splash and fade out our overlay.
  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {});
    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setSplashVisible(false));
  }, [ready, splashOpacity]);

  // Match the navigation theme to our background so transitions don't flash.
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
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        {ready && (
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
        )}

        {/* Solid-color overlay that fades out once content is ready.
            Color matches the theme so the splash blends into the app. */}
        {splashVisible && (
          <Animated.View
            pointerEvents={ready ? 'none' : 'auto'}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.bg, opacity: splashOpacity },
            ]}
          />
        )}
      </View>
    </ThemeProvider>
  );
}

// Bridge: pull locale from settings and feed it into I18nProvider.
function LocalizedRoot() {
  const { locale } = useSettings();
  return (
    <I18nProvider locale={locale}>
      <NotesProvider>
        <UpdateChecker />
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
