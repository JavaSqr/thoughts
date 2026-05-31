import uuid from 'react-native-uuid';

// Вложение: фото / видео / gif
export function makeAttachment({ uri, type }) {
  return {
    id: uuid.v4(),
    uri,
    type, // 'image' | 'video' | 'gif'
  };
}

// Заметка — без заголовка, только тело + вложения
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

// Категория
export function makeCategory({ name, emoji = '📁', order = 0 }) {
  return {
    id: uuid.v4(),
    name,
    emoji,
    order,
  };
}
