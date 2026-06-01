import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import NoteCard from './NoteCard';

// We measure each row's actual height via onLayout since cards
// have variable heights; that's used to compute drop positions.

function DraggableRow({
  note,
  index,
  positionsRef,
  onMeasure,
  onDragStart,
  onDragActive,
  onDragEnd,
  isAnyDragging,
  draggingId,
  onEdit,
  onMove,
  onDelete,
}) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);
  const elevation = useSharedValue(0);

  const isDragging = draggingId === note.id;

  const longPress = Gesture.Pan()
    .activateAfterLongPress(400)
    .onStart((e) => {
      scale.value = withSpring(1.04);
      zIndex.value = 999;
      elevation.value = 12;
      runOnJS(onDragStart)(note.id, index);
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
      runOnJS(onDragActive)(note.id, index, e.absoluteY, e.translationY);
    })
    .onEnd((e) => {
      runOnJS(onDragEnd)(note.id, index, e.absoluteY, e.translationY);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = 0;
      elevation.value = 0;
    })
    .onFinalize(() => {
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = 0;
      elevation.value = 0;
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    zIndex: zIndex.value,
    elevation: elevation.value,
  }));

  return (
    <Animated.View
      style={animStyle}
      onLayout={(ev) => onMeasure(note.id, index, ev.nativeEvent.layout)}
    >
      <GestureDetector gesture={longPress}>
        <View>
          <NoteCard
            note={note}
            isDragging={isDragging}
            forceCollapsed={isAnyDragging}
            onEdit={onEdit}
            onMove={onMove}
            onDelete={onDelete}
          />
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

export default function DraggableNoteList({
  notes,
  onReorder,
  onDragStateChange,
  onDeleteHoverChange,
  onDeleteDrop,
  deleteZoneY, // absolute Y of the bottom edge of the delete zone
  onEdit,
  onMove,
  onDelete,
}) {
  const [draggingId, setDraggingId] = useState(null);
  const layouts = useRef({}); // id -> {y, height} in list coords
  const positionsRef = useRef([]);
  const fromIndexRef = useRef(-1);

  const handleMeasure = useCallback((id, index, layout) => {
    layouts.current[id] = { y: layout.y, height: layout.height };
  }, []);

  const handleDragStart = useCallback(
    (id, index) => {
      fromIndexRef.current = index;
      setDraggingId(id);
      onDragStateChange && onDragStateChange(true);
    },
    [onDragStateChange]
  );

  const handleDragActive = useCallback(
    (id, index, absoluteY, translationY) => {
      // Highlight the delete zone if the finger is above its bottom edge.
      if (onDeleteHoverChange && deleteZoneY != null) {
        onDeleteHoverChange(absoluteY < deleteZoneY);
      }
    },
    [onDeleteHoverChange, deleteZoneY]
  );

  const handleDragEnd = useCallback(
    (id, index, absoluteY, translationY) => {
      const wasInDeleteZone =
        deleteZoneY != null && absoluteY < deleteZoneY;

      setDraggingId(null);
      onDragStateChange && onDragStateChange(false);
      onDeleteHoverChange && onDeleteHoverChange(false);

      if (wasInDeleteZone) {
        onDeleteDrop && onDeleteDrop(id);
        return;
      }

      // Estimate the new index from how far the row was dragged.
      const rowHeight =
        layouts.current[id]?.height || 80;
      const shift = Math.round(translationY / rowHeight);
      let target = index + shift;
      if (target < 0) target = 0;
      if (target > notes.length - 1) target = notes.length - 1;

      if (target !== index) {
        // onReorder uses ReorderableList semantics: when moving down,
        // bump the insertion index by 1.
        const insertIndex = target > index ? target + 1 : target;
        onReorder(index, insertIndex);
      }
    },
    [notes.length, deleteZoneY, onReorder, onDragStateChange, onDeleteHoverChange, onDeleteDrop]
  );

  return (
    <View style={styles.list}>
      {notes.map((note, index) => (
        <DraggableRow
          key={note.id}
          note={note}
          index={index}
          positionsRef={positionsRef}
          onMeasure={handleMeasure}
          onDragStart={handleDragStart}
          onDragActive={handleDragActive}
          onDragEnd={handleDragEnd}
          isAnyDragging={draggingId != null}
          draggingId={draggingId}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 8 },
});
