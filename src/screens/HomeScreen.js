import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { useI18n } from '../i18n/i18n';
import { useNotes } from '../store/NotesStore';
import { useSettings } from '../store/SettingsStore';
import NoteInput from '../components/NoteInput';
import DraggableNoteList from '../components/DraggableNoteList';
import { EditNoteModal, MoveNoteModal } from '../components/NoteModals';

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const { t } = useI18n();
  const store = useNotes();
  const { confirmDelete } = useSettings();
  const insets = useSafeAreaInsets();

  const [dragging, setDragging] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [moveNote, setMoveNote] = useState(null);

  const [topBarBottomY, setTopBarBottomY] = useState(140);

  const currentTitle = (() => {
    if (store.filterNoCategoryOnly) return t('no_category');
    if (store.selectedCategoryId != null) {
      const c = store.categories.find((x) => x.id === store.selectedCategoryId);
      return c ? `${c.emoji} ${c.name}` : t('all_notes');
    }
    return t('all_notes');
  })();

  const handleSubmit = useCallback(
    (text, attachments) => {
      const categoryId = store.filterNoCategoryOnly
        ? null
        : store.selectedCategoryId;
      store.addNote(text, { categoryId, attachments });
    },
    [store]
  );

  const handleDelete = useCallback(
    (note) => {
      if (!confirmDelete) {
        store.deleteNote(note.id);
        return;
      }
      Alert.alert(
        t('delete_confirm_title'),
        t('delete_confirm_message'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('delete'),
            style: 'destructive',
            onPress: () => store.deleteNote(note.id),
          },
        ],
        { cancelable: true }
      );
    },
    [confirmDelete, store, t]
  );

  const pageNotes = store.pageNotes;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Top bar / delete zone */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        onLayout={(e) =>
          setTopBarBottomY(
            e.nativeEvent.layout.y + e.nativeEvent.layout.height + insets.top + 8
          )
        }
      >
        {dragging ? (
          <View
            style={[
              styles.deleteZone,
              {
                backgroundColor: deleteHover
                  ? theme.deleteRed
                  : theme.deleteRedTransparent,
                borderColor: theme.deleteRed,
              },
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={deleteHover ? 28 : 22}
              color={deleteHover ? '#fff' : theme.deleteRed}
            />
            <Text
              style={[
                styles.deleteText,
                { color: deleteHover ? '#fff' : theme.deleteRed },
              ]}
            >
              {t('delete_hint')}
            </Text>
          </View>
        ) : (
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={[styles.iconBtn, { backgroundColor: theme.surface }]}
              hitSlop={8}
            >
              <Ionicons name="menu" size={22} color={theme.textPrimary} />
            </TouchableOpacity>

            <View
              style={[
                styles.searchBox,
                { backgroundColor: theme.surface },
              ]}
            >
              <Ionicons name="search" size={18} color={theme.textSecondary} />
              <TextInput
                value={store.searchQuery}
                onChangeText={store.setSearch}
                placeholder={t('search_hint')}
                placeholderTextColor={theme.textSecondary}
                underlineColorAndroid="transparent"
                selectionColor={theme.primary}
                style={[styles.searchInput, { color: theme.textPrimary }]}
              />
              {store.searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => store.setSearch('')} hitSlop={8}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {!dragging && (
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {currentTitle}
          </Text>
        )}
      </View>

      {/* Notes list */}
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          scrollEnabled={!dragging}
          keyboardShouldPersistTaps="handled"
        >
          {pageNotes.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 52 }}>
                {store.searchQuery.length > 0 ? '🔍' : '💭'}
              </Text>
              <Text
                style={[styles.emptyText, { color: theme.textSecondary }]}
              >
                {store.searchQuery.length > 0
                  ? t('empty_search')
                  : t('empty_notes')}
              </Text>
            </View>
          ) : (
            <DraggableNoteList
              notes={pageNotes}
              deleteZoneY={topBarBottomY}
              onReorder={(from, to) => store.reorderNotes(from, to)}
              onDragStateChange={setDragging}
              onDeleteHoverChange={setDeleteHover}
              onDeleteDrop={(id) => {
                const note = pageNotes.find((n) => n.id === id);
                if (note) handleDelete(note);
              }}
              onEdit={(n) => setEditNote(n)}
              onMove={(n) => setMoveNote(n)}
              onDelete={handleDelete}
            />
          )}
        </ScrollView>

        {/* Pagination */}
        {store.totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              disabled={store.currentPage === 0}
              onPress={() => store.setPage(store.currentPage - 1)}
              style={[
                styles.pageBtn,
                {
                  backgroundColor: theme.surface,
                  opacity: store.currentPage === 0 ? 0.4 : 1,
                },
              ]}
            >
              <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.pageText, { color: theme.textSecondary }]}>
              {t('page')} {store.currentPage + 1} {t('of')} {store.totalPages}
            </Text>
            <TouchableOpacity
              disabled={store.currentPage >= store.totalPages - 1}
              onPress={() => store.setPage(store.currentPage + 1)}
              style={[
                styles.pageBtn,
                {
                  backgroundColor: theme.surface,
                  opacity:
                    store.currentPage >= store.totalPages - 1 ? 0.4 : 1,
                },
              ]}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textPrimary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <NoteInput onSubmit={handleSubmit} />
      </KeyboardAvoidingView>

      <EditNoteModal
        note={editNote}
        visible={editNote != null}
        onClose={() => setEditNote(null)}
      />
      <MoveNoteModal
        note={moveNote}
        visible={moveNote != null}
        onClose={() => setMoveNote(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  deleteZone: {
    marginHorizontal: 12,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  deleteText: { fontSize: 14.5, fontWeight: '700' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 23,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  pageBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageText: { fontSize: 14, fontWeight: '600' },
});
