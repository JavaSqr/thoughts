import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { useI18n } from '../i18n/i18n';
import { useSettings } from '../store/SettingsStore';

// ==== Replace with your own contacts ====
const TELEGRAM_HANDLE = '@javaSqr';
const BUG_EMAIL = 'javasqrt@gmail.com';
// =========================================

export default function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const settings = useSettings();
  const insets = useSafeAreaInsets();

  const SectionHeader = ({ text }) => (
    <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
      {text}
    </Text>
  );

  const Card = ({ children }) => (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      {children}
    </View>
  );

  const OptionRow = ({ icon, label, selected, onPress, isLast }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.optionRow,
        !isLast && { borderBottomColor: theme.divider, borderBottomWidth: 1 },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={theme.textPrimary}
          style={{ marginRight: 12 }}
        />
      )}
      <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>
        {label}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
      )}
    </TouchableOpacity>
  );

  const LinkRow = ({ icon, label, value, onPress, isLast }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.optionRow,
        !isLast && { borderBottomColor: theme.divider, borderBottomWidth: 1 },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={theme.textPrimary}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>
          {label}
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
          {value}
        </Text>
      </View>
      <Ionicons name="open-outline" size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  const ToggleRow = ({ icon, label, hint, value, onValueChange, isLast }) => (
    <View
      style={[
        styles.optionRow,
        !isLast && { borderBottomColor: theme.divider, borderBottomWidth: 1 },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={theme.textPrimary}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>
          {label}
        </Text>
        {hint && (
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
            {hint}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.divider, true: theme.primary }}
        thumbColor="#fff"
      />
    </View>
  );

  const langs = [
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const themes = [
    { mode: 'system', label: t('theme_system'), icon: 'phone-portrait-outline' },
    { mode: 'light', label: t('theme_light'), icon: 'sunny-outline' },
    { mode: 'dark', label: t('theme_dark'), icon: 'moon-outline' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('settings')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <SectionHeader text={t('theme')} />
        <Card>
          {themes.map((th, i) => (
            <OptionRow
              key={th.mode}
              icon={th.icon}
              label={th.label}
              selected={settings.themeMode === th.mode}
              onPress={() => settings.setThemeMode(th.mode)}
              isLast={i === themes.length - 1}
            />
          ))}
        </Card>

        <SectionHeader text={t('language')} />
        <Card>
          {langs.map((lg, i) => (
            <OptionRow
              key={lg.code}
              label={`${lg.flag}  ${lg.label}`}
              selected={locale === lg.code}
              onPress={() => settings.setLocale(lg.code)}
              isLast={i === langs.length - 1}
            />
          ))}
        </Card>

        <SectionHeader text={t('behavior')} />
        <Card>
          <ToggleRow
            icon="shield-checkmark-outline"
            label={t('confirm_delete')}
            hint={t('confirm_delete_hint')}
            value={settings.confirmDelete}
            onValueChange={settings.setConfirmDelete}
            isLast
          />
        </Card>

        <SectionHeader text={t('contact')} />
        <Card>
          <LinkRow
            icon="paper-plane-outline"
            label={t('telegram')}
            value={TELEGRAM_HANDLE}
            onPress={() =>
              Linking.openURL(
                `https://t.me/${TELEGRAM_HANDLE.replace('@', '')}`
              )
            }
          />
          <LinkRow
            icon="bug-outline"
            label={t('email_bug')}
            value={BUG_EMAIL}
            isLast
            onPress={() =>
              Linking.openURL(
                `mailto:${BUG_EMAIL}?subject=Bug report - Thoughts`
              )
            }
          />
        </Card>

        <Text style={[styles.about, { color: theme.textSecondary }]}>
          {t('about_text')}
        </Text>
        <Text style={[styles.version, { color: theme.textSecondary }]}>
          v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 22,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { borderRadius: 18, overflow: 'hidden' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  optionLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  about: { textAlign: 'center', marginTop: 30, fontSize: 13 },
  version: { textAlign: 'center', marginTop: 4, fontSize: 12, opacity: 0.7 },
});
