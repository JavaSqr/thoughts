import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../theme/theme';
import { useI18n } from '../i18n/i18n';
import { makeAttachment } from '../models/models';

// Copy a picked file into the app's documents dir.
// The original URI from the picker can be temporary.
async function persistFile(uri) {
  try {
    const dir = FileSystem.documentDirectory + 'attachments/';
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    const ext = uri.split('.').pop().split('?')[0] || 'dat';
    const dest = `${dir}${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch (e) {
    console.warn('persistFile failed', e);
    return uri; // fall back to the original URI
  }
}

export default function NoteInput({ onSubmit }) {
  const theme = useTheme();
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [focused, setFocused] = useState(false);

  const pickMedia = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('', 'Нужно разрешение на доступ к медиатеке');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 6,
    });
    if (result.canceled) return;

    const added = [];
    for (const asset of result.assets) {
      const uri = await persistFile(asset.uri);
      const type =
        asset.type === 'video'
          ? 'video'
          : (asset.fileName || asset.uri).toLowerCase().endsWith('.gif')
          ? 'gif'
          : 'image';
      added.push(makeAttachment({ uri, type }));
    }
    setAttachments((prev) => [...prev, ...added]);
  }, []);

  const removeAttachment = useCallback((id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const submit = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0 && attachments.length === 0) return;
    onSubmit(trimmed, attachments);
    setText('');
    setAttachments([]);
  }, [text, attachments, onSubmit]);

  const canSend = text.trim().length > 0 || attachments.length > 0;
  const expanded = focused || text.length > 0 || attachments.length > 0;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.inputBg,
          borderColor: focused ? theme.primary : 'transparent',
          shadowColor: theme.shadow,
        },
      ]}
    >
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.attachScroll}
          contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
        >
          {attachments.map((a) => (
            <View key={a.id} style={styles.attachPreview}>
              <Image source={{ uri: a.uri }} style={styles.attachImg} />
              {a.type === 'video' && (
                <View style={styles.miniPlay}>
                  <Ionicons name="play" size={16} color="#fff" />
                </View>
              )}
              <Pressable
                style={styles.removeBtn}
                onPress={() => removeAttachment(a.id)}
                hitSlop={6}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.row}>
        <TouchableOpacity
          onPress={pickMedia}
          style={styles.iconBtn}
          hitSlop={8}
        >
          <Ionicons name="add-circle-outline" size={26} color={theme.primary} />
        </TouchableOpacity>

        <TextInput
          value={text}
          onChangeText={setText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={t('note_hint')}
          placeholderTextColor={theme.inputPlaceholder}
          multiline
          underlineColorAndroid="transparent"
          selectionColor={theme.primary}
          style={[
            styles.input,
            {
              color: theme.inputText,
              maxHeight: expanded ? 140 : 44,
            },
          ]}
        />

        <TouchableOpacity
          onPress={submit}
          disabled={!canSend}
          style={[
            styles.sendBtn,
            {
              backgroundColor: canSend ? theme.primary : theme.divider,
              opacity: canSend ? 1 : 0.5,
            },
          ]}
          hitSlop={6}
        >
          <Ionicons name="arrow-up" size={22} color={theme.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 26,
    borderWidth: 1.5,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginHorizontal: 12,
    marginBottom: 10,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  attachScroll: { paddingHorizontal: 8, paddingTop: 6 },
  attachPreview: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  attachImg: { width: '100%', height: '100%' },
  miniPlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  removeBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  iconBtn: { padding: 6, marginBottom: 2 },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 6,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 44,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
