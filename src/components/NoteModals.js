import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import { useI18n } from '../i18n/i18n';
import { useNotes } from '../store/NotesStore';

export function EditNoteModal({ note, visible, onClose }) {
  const theme = useTheme();
  const { t } = useI18n();
  const store = useNotes();
  const [text, setText] = useState('');

  useEffect(() => {
    if (visible && note) setText(note.text);
  }, [visible, note]);

  if (!note) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.bg }]}
          onPress={() => {}}
        >
          <View style={styles.handle} />
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {t('edit')}
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            underlineColorAndroid="transparent"
            selectionColor={theme.primary}
            style={[
              styles.input,
              {
                color: theme.textPrimary,
                backgroundColor: theme.surface,
                borderColor: theme.divider,
              },
            ]}
            autoFocus
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.btn}>
              <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                store.updateNote({ ...note, text: text.trim() });
                onClose();
              }}
              style={[styles.btn, { backgroundColor: theme.primary, borderRadius: 12 }]}
            >
              <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>
                {t('save')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function MoveNoteModal({ note, visible, onClose }) {
  const theme = useTheme();
  const { t } = useI18n();
  const store = useNotes();

  if (!note) return null;

  const Item = ({ emoji, label, targetId }) => {
    const active = note.categoryId === targetId;
    return (
      <TouchableOpacity
        style={[
          styles.moveRow,
          { borderBottomColor: theme.divider },
          active && { backgroundColor: theme.primary + '22' },
        ]}
        onPress={() => {
          store.moveNoteToCategory(note.id, targetId);
          onClose();
        }}
      >
        <Text style={{ fontSize: 18, marginRight: 12 }}>{emoji}</Text>
        <Text style={[styles.moveLabel, { color: theme.textPrimary }]}>
          {label}
        </Text>
        {active && (
          <Ionicons name="checkmark" size={20} color={theme.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.bg, maxHeight: '70%' }]}
          onPress={() => {}}
        >
          <View style={styles.handle} />
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {t('move_to')}
          </Text>
          <ScrollView>
            <Item emoji="📭" label={t('no_category')} targetId={null} />
            {store.categories.map((c) => (
              <Item key={c.id} emoji={c.emoji} label={c.name} targetId={c.id} />
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9993',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 19, fontWeight: '800', marginBottom: 16 },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  btn: { paddingVertical: 10, paddingHorizontal: 18 },
  moveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 10,
  },
  moveLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
});
