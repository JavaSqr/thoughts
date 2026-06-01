import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: WIN_W, height: WIN_H } = Dimensions.get('window');

function MediaPage({ attachment, active }) {
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  // Pause the video when this page is no longer active (user swiped away).
  useEffect(() => {
    if (!active && videoRef.current) {
      videoRef.current.pauseAsync().catch(() => {});
    }
  }, [active]);

  if (attachment.type === 'video') {
    return (
      <View style={styles.page}>
        <Video
          ref={videoRef}
          source={{ uri: attachment.uri }}
          style={styles.media}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          isLooping={false}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
        {loading && (
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            color="#fff"
            size="large"
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Image
        source={{ uri: attachment.uri }}
        style={styles.media}
        resizeMode="contain"
      />
    </View>
  );
}

export default function MediaViewer({ visible, attachments, startIndex = 0, onClose }) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(startIndex);
  const listRef = useRef(null);

  // Reset to the requested page each time the viewer opens.
  useEffect(() => {
    if (visible) {
      setIndex(startIndex);
      // Defer to next frame so the FlatList is laid out before we scroll.
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: startIndex * WIN_W,
          animated: false,
        });
      });
    }
  }, [visible, startIndex]);

  if (!attachments || attachments.length === 0) return null;

  const onScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / WIN_W);
    if (i !== index) setIndex(i);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        <FlatList
          ref={listRef}
          data={attachments}
          horizontal
          pagingEnabled
          keyExtractor={(a) => a.id}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: WIN_W, offset: WIN_W * i, index: i })}
          initialScrollIndex={startIndex}
          onMomentumScrollEnd={onScroll}
          renderItem={({ item, index: i }) => (
            <MediaPage attachment={item} active={i === index} />
          )}
        />

        {/* Close button */}
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeBtn, { top: insets.top + 8 }]}
          hitSlop={10}
        >
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>

        {/* Counter */}
        {attachments.length > 1 && (
          <View style={[styles.counter, { top: insets.top + 14 }]}>
            <Text style={styles.counterText}>
              {index + 1} / {attachments.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  page: {
    width: WIN_W,
    height: WIN_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  media: { width: WIN_W, height: WIN_H },
  closeBtn: {
    position: 'absolute',
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
  },
  counterText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
