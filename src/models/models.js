import uuid from 'react-native-uuid';

// Attachment: photo, video, or gif.
export function makeAttachment({ uri, type }) {
  return {
    id: uuid.v4(),
    uri,
    type, // 'image' | 'video' | 'gif'
  };
}

// A note: no title, just body text and optional attachments.
export function makeNote({ text = '', categoryId = null, attachments = [], order = 0 }) {
  const now = Date.now();
  return {
    id: uuid.v4(),
    text,
    categoryId,
    attachments,
    order,
    createdAt: now,
    updatedAt: now,
  };
}

// Category.
export function makeCategory({ name, emoji = '📁', order = 0 }) {
  return {
    id: uuid.v4(),
    name,
    emoji,
    order,
  };
}
