import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { useI18n } from '../i18n/i18n';
import { useNotes } from '../store/NotesStore';

const EMOJI_CHOICES = [
  // Basic
  '📁', '📂', '🗂️', '📋', '📌', '📍', '🏷️', '🔖',
  // Ideas & work
  '💡', '📝', '✏️', '✍️', '📚', '📖', '🎓', '💼',
  // Emotions & personal
  '⭐', '🌟', '✨', '❤️', '💛', '💚', '💙', '💜',
  // Action
  '🔥', '⚡', '🎯', '🚀', '🏆', '🎁', '🎉', '🎨',
  // Life
  '🏠', '✈️', '🚗', '🌍', '🌱', '🌸', '🍔', '☕',
  // Hobbies
  '🎵', '🎮', '📷', '🎬', '⚽', '🏃', '🧘', '🛒',
  // Misc
  '💭', '🤔', '😊', '😎', '🌙', '☀️', '🌈', '💎',
];

function CategoryModal({ visible, initial, onClose, onSubmit, t, theme }) {
  const [name, setName] = useState(initial?.name || '');
  // `emoji` is the value that gets saved and shown in the big preview.
  // `emojiInput` is whatever the user is typing in the field.
  // They stay independent so typing doesn't keep overwriting the preview.
  const [emoji, setEmoji] = useState(initial?.emoji || '📁');
  const [emojiInput, setEmojiInput] = useState('');

  React.useEffect(() => {
    if (visible) {
      setName(initial?.name || '');
      setEmoji(initial?.emoji || '📁');
      setEmojiInput('');
    }
  }, [visible, initial]);

  // Promote whatever's in the input field to the active emoji.
  const applyCustomEmoji = () => {
    const v = emojiInput.trim();
    if (v.length > 0) setEmoji(v);
    setEmojiInput('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: theme.bg }]}
          onPress={() => {}}
        >
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
            {initial ? t('rename_category') : t('new_category')}
          </Text>

          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
            {t('category_emoji')}
          </Text>

          {/* Current preview + free-form input for a custom emoji */}
          <View style={styles.currentEmojiRow}>
            <View
              style={[
                styles.currentEmojiBox,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text style={{ fontSize: 28 }}>{emoji}</Text>
            </View>
            <TextInput
              value={emojiInput}
              onChangeText={setEmojiInput}
              onSubmitEditing={applyCustomEmoji}
              onBlur={applyCustomEmoji}
              placeholder="🙂"
              placeholderTextColor={theme.textSecondary}
              underlineColorAndroid="transparent"
              selectionColor={theme.primary}
              returnKeyType="done"
              style={[
                styles.customEmojiInput,
                {
                  color: theme.textPrimary,
                  backgroundColor: theme.surface,
                  borderColor: theme.divider,
                },
              ]}
            />
            {emojiInput.length > 0 && (
              <TouchableOpacity
                onPress={applyCustomEmoji}
                style={[styles.applyEmojiBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>OK</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={{ maxHeight: 200 }}
            contentContainerStyle={styles.emojiGrid}
            showsVerticalScrollIndicator={false}
          >
            {EMOJI_CHOICES.map((em) => (
              <TouchableOpacity
                key={em}
                onPress={() => {
                  setEmoji(em);
                  setEmojiInput('');
                }}
                style={[
                  styles.emojiBtn,
                  {
                    backgroundColor:
                      emoji === em ? theme.primary : theme.surface,
                  },
                ]}
              >
                <Text style={{ fontSize: 20 }}>{em}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
            {t('category_name')}
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('category_name')}
            placeholderTextColor={theme.textSecondary}
            underlineColorAndroid="transparent"
            selectionColor={theme.primary}
            style={[
              styles.modalInput,
              {
                color: theme.textPrimary,
                backgroundColor: theme.surface,
                borderColor: theme.divider,
              },
            ]}
            autoFocus
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={styles.modalActionBtn}>
              <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (name.trim().length === 0) return;
                // If there's text in the input, use it as the emoji.
                const finalEmoji =
                  emojiInput.trim().length > 0 ? emojiInput.trim() : emoji;
                onSubmit(name.trim(), finalEmoji);
                onClose();
              }}
              style={[
                styles.modalActionBtn,
                { backgroundColor: theme.primary, borderRadius: 12 },
              ]}
            >
              <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>
                {initial ? t('save') : t('create')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function SidePanel({ navigation }) {
  const theme = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const store = useNotes();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const openCreate = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };
  const openEdit = (cat) => {
    setEditingCategory(cat);
    setModalVisible(true);
  };

  const handleSubmit = (name, emoji) => {
    if (editingCategory) {
      store.renameCategory(editingCategory.id, name, emoji);
    } else {
      store.addCategory(name, emoji);
    }
  };

  const Row = ({ active, emoji, label, count, onPress, onLongPress }) => (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.row,
        active && { backgroundColor: theme.primary + '22' },
      ]}
    >
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <Text
        style={[
          styles.rowLabel,
          { color: active ? theme.primary : theme.textPrimary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {count != null && (
        <Text style={[styles.rowCount, { color: theme.textSecondary }]}>
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );

  const allActive =
    store.selectedCategoryId == null && !store.filterNoCategoryOnly;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {t('categories')}
        </Text>
        <TouchableOpacity onPress={openCreate} hitSlop={8}>
          <Ionicons name="add" size={26} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <Row
          active={allActive}
          emoji="🗂️"
          label={t('all_notes')}
          count={store.notes.length}
          onPress={() => {
            store.selectAllCategories();
            navigation.closeDrawer();
          }}
        />
        <Row
          active={store.filterNoCategoryOnly}
          emoji="📭"
          label={t('no_category')}
          count={store.countInCategory(null)}
          onPress={() => {
            store.selectNoCategory();
            navigation.closeDrawer();
          }}
        />

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {store.categories.map((cat) => (
          <Row
            key={cat.id}
            active={store.selectedCategoryId === cat.id}
            emoji={cat.emoji}
            label={cat.name}
            count={store.countInCategory(cat.id)}
            onPress={() => {
              store.selectCategory(cat.id);
              navigation.closeDrawer();
            }}
            onLongPress={() => openEdit(cat)}
          />
        ))}

        {store.categories.length === 0 && (
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            {t('new_category')} +
          </Text>
        )}
      </ScrollView>

      {/* Settings button */}
      <TouchableOpacity
        style={[styles.settingsBtn, { borderTopColor: theme.divider }]}
        onPress={() => {
          navigation.closeDrawer();
          navigation.navigate('Settings');
        }}
      >
        <Ionicons name="settings-outline" size={20} color={theme.textPrimary} />
        <Text style={[styles.settingsLabel, { color: theme.textPrimary }]}>
          {t('settings')}
        </Text>
      </TouchableOpacity>

      <CategoryModal
        visible={modalVisible}
        initial={editingCategory}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        t={t}
        theme={theme}
      />

      {/* Floating delete button shown while editing an existing category */}
      {editingCategory && modalVisible && (
        <DeleteCategoryButton
          theme={theme}
          t={t}
          onDelete={() => {
            store.deleteCategory(editingCategory.id);
            setModalVisible(false);
          }}
        />
      )}
    </View>
  );
}

// Small floating delete button that appears while editing a category.
function DeleteCategoryButton({ theme, t, onDelete }) {
  return (
    <View pointerEvents="box-none" style={styles.deleteFloatWrap}>
      <TouchableOpacity
        onPress={onDelete}
        style={[styles.deleteFloat, { backgroundColor: theme.deleteRed }]}
      >
        <Ionicons name="trash-outline" size={18} color="#fff" />
        <Text style={styles.deleteFloatText}>{t('delete')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginVertical: 2,
  },
  rowEmoji: { fontSize: 18, marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  rowCount: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1, marginVertical: 10, marginHorizontal: 8 },
  hint: { textAlign: 'center', marginTop: 20, fontSize: 14 },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  settingsLabel: { fontSize: 16, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: { width: '100%', borderRadius: 24, padding: 22 },
  modalTitle: { fontSize: 19, fontWeight: '800', marginBottom: 16 },
  modalLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 6 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentEmojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  currentEmojiBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customEmojiInput: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 22,
    textAlign: 'center',
  },
  applyEmojiBtn: {
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  modalActionBtn: { paddingVertical: 10, paddingHorizontal: 18 },
  deleteFloatWrap: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  deleteFloat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    gap: 8,
  },
  deleteFloatText: { color: '#fff', fontWeight: '700' },
});
