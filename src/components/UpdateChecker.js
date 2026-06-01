import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { checkForUpdate } from '../services/updateCheck';
import { useI18n } from '../i18n/i18n';

// Runs once at startup. If a newer GitHub release exists, prompts the user
// to download the new APK. Silent in dev mode.
export default function UpdateChecker() {
  const { t } = useI18n();

  useEffect(() => {
    if (__DEV__) return;
    let cancelled = false;
    (async () => {
      const update = await checkForUpdate();
      if (cancelled || !update) return;
      Alert.alert(
        `${t('update_available')} ${update.version}`,
        update.notes ? update.notes.slice(0, 300) : '',
        [
          { text: t('update_later'), style: 'cancel' },
          {
            text: t('update_download'),
            onPress: () => Linking.openURL(update.url),
          },
        ]
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  return null;
}
