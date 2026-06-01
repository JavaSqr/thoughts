import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import { useI18n } from '../i18n/i18n';
import MediaViewer from './MediaViewer';

const COLLAPSED_MAX_LINES = 3;

function formatDate(ts, t) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (sameDay) return `${t('today')}, ${hh}:${mm}`;
  if (isYesterday) return `${t('yesterday')}, ${hh}:${mm}`;
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mo}.${d.getFullYear()} ${hh}:${mm}`;
}

function AttachmentThumb({ attachment, size = 96, onPress }) {
  const theme = useTheme();
  const isVideo = attachment.type === 'video';
  return (
    <Pressable
      onPress={onPress}
      style={[styles.thumb, { width: size, height: size }]}
    >
      <Image
        source={{ uri: attachment.uri }}
        style={styles.thumbImg}
        resizeMode="cover"
      />
      {isVideo && (
        <View style={styles.playOverlay}>
          <Ionicons name="play" size={22} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

export default function NoteCard({
  note,
  isDragging = false,
  forceCollapsed = false,
  onEdit,
  onMove,
  onDelete,
}) {
  const theme = useTheme();
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  // Index of the attachment to open in the fullscreen viewer; null = closed.
  const [viewerIndex, setViewerIndex] = useState(null);

  // Collapse the card while it's being dragged.
  useEffect(() => {
    if ((isDragging || forceCollapsed) && expanded) {
      setExpanded(false);
    }
  }, [isDragging, forceCollapsed]);

  const toggle = () => {
    setExpanded((e) => !e);
  };

  const hasText = note.text && note.text.trim().length > 0;
  const hasAttachments = note.attachments && note.attachments.length > 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          shadowColor: theme.shadow,
          marginVertical: isDragging ? 4 : 6,
          // elevation on Android softens text rendering, so keep it off
          // in the resting state and only enable it while dragging.
          elevation: isDragging ? 10 : 0,
          opacity: isDragging ? 0.97 : 1,
          transform: isDragging ? [{ scale: 1.03 }] : [],
        },
      ]}
    >
      <Pressable onPress={toggle} style={styles.inner}>
        {/* Text */}
        {hasText &&
          (expanded ? (
            <Text style={[styles.text, { color: theme.cardText }]}>
              {note.text}
            </Text>
          ) : (
            <Text
              numberOfLines={COLLAPSED_MAX_LINES}
              ellipsizeMode="tail"
              style={[styles.text, { color: theme.cardText }]}
            >
              {note.text}
            </Text>
          ))}

        {/* Attachments. All thumbs stay mounted so <Image> keeps its
            content when the card collapses; extras are just hidden. */}
        {hasAttachments && (
          <View style={[styles.attachRow, hasText && { marginTop: 10 }]}>
            {note.attachments.map((a, i) => {
              const visible = expanded || i < 3;
              return (
                <View
                  key={a.id}
                  style={{ display: visible ? 'flex' : 'none' }}
                >
                  <AttachmentThumb
                    attachment={a}
                    size={expanded ? 104 : 64}
                    onPress={() => setViewerIndex(i)}
                  />
                </View>
              );
            })}
            {!expanded && note.attachments.length > 3 && (
              <View
                style={[
                  styles.moreThumb,
                  { backgroundColor: theme.surface },
                ]}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>
                  +{note.attachments.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer for the expanded card */}
        {expanded && (
          <View style={styles.footer}>
            <Text style={[styles.date, { color: theme.cardTextSecondary }]}>
              {formatDate(note.createdAt, t)}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => onEdit && onEdit(note)}
                hitSlop={8}
                style={styles.actionBtn}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={theme.cardTextSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onMove && onMove(note)}
                hitSlop={8}
                style={styles.actionBtn}
              >
                <Ionicons
                  name="folder-open-outline"
                  size={20}
                  color={theme.cardTextSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete && onDelete(note)}
                hitSlop={8}
                style={styles.actionBtn}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.deleteRed}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Pressable>

      <MediaViewer
        visible={viewerIndex != null}
        attachments={note.attachments}
        startIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    // Light iOS shadow. On Android the shadow comes from elevation (above).
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  inner: { paddingHorizontal: 18, paddingVertical: 14 },
  text: { fontSize: 16, lineHeight: 23 },
  attachRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#00000022',
  },
  thumbImg: { width: '100%', height: '100%' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  moreThumb: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: { fontSize: 12 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { paddingHorizontal: 9, paddingVertical: 4 },
});
