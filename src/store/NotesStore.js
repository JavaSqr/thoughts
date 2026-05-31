import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { StorageService } from '../services/storage';
import { makeNote, makeCategory } from '../models/models';

const NOTES_PER_PAGE = 20;

const NotesContext = createContext(null);

export const useNotes = () => useContext(NotesContext);

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // null = "Все мысли"; filterNoCategoryOnly = true => без категории
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [filterNoCategoryOnly, setFilterNoCategoryOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Чтобы не сохранять при самой первой загрузке
  const skipPersist = useRef(true);

  useEffect(() => {
    (async () => {
      const [n, c] = await Promise.all([
        StorageService.loadNotes(),
        StorageService.loadCategories(),
      ]);
      c.sort((a, b) => a.order - b.order);
      setNotes(n);
      setCategories(c);
      setLoaded(true);
    })();
  }, []);

  // Персист при изменениях (после первичной загрузки)
  useEffect(() => {
    if (!loaded) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    StorageService.saveNotes(notes);
  }, [notes, loaded]);

  useEffect(() => {
    if (!loaded) return;
    StorageService.saveCategories(categories);
  }, [categories, loaded]);

  // === Фильтры ===
  const selectAllCategories = useCallback(() => {
    setSelectedCategoryId(null);
    setFilterNoCategoryOnly(false);
    setCurrentPage(0);
  }, []);

  const selectNoCategory = useCallback(() => {
    setSelectedCategoryId(null);
    setFilterNoCategoryOnly(true);
    setCurrentPage(0);
  }, []);

  const selectCategory = useCallback((id) => {
    setSelectedCategoryId(id);
    setFilterNoCategoryOnly(false);
    setCurrentPage(0);
  }, []);

  const setSearch = useCallback((q) => {
    setSearchQuery(q);
    setCurrentPage(0);
  }, []);

  // === Производные: фильтрованный список ===
  const filteredNotes = useMemo(() => {
    let result = notes;
    if (filterNoCategoryOnly) {
      result = result.filter((n) => n.categoryId == null);
    } else if (selectedCategoryId != null) {
      result = result.filter((n) => n.categoryId === selectedCategoryId);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q.length > 0) {
      result = result.filter((n) => n.text.toLowerCase().includes(q));
    }
    const list = [...result];
    list.sort((a, b) => {
      const byOrder = a.order - b.order;
      if (byOrder !== 0) return byOrder;
      return b.createdAt - a.createdAt;
    });
    return list;
  }, [notes, filterNoCategoryOnly, selectedCategoryId, searchQuery]);

  const totalPages = useMemo(() => {
    const n = filteredNotes.length;
    if (n === 0) return 1;
    return Math.floor((n - 1) / NOTES_PER_PAGE) + 1;
  }, [filteredNotes]);

  // Удерживаем currentPage в допустимых границах
  const safePage = Math.min(currentPage, totalPages - 1);

  const pageNotes = useMemo(() => {
    const start = safePage * NOTES_PER_PAGE;
    const end = Math.min(start + NOTES_PER_PAGE, filteredNotes.length);
    if (start >= filteredNotes.length) return [];
    return filteredNotes.slice(start, end);
  }, [filteredNotes, safePage]);

  // === CRUD заметок ===
  const addNote = useCallback(
    (text, { categoryId = null, attachments = [] } = {}) => {
      const trimmed = (text || '').trim();
      if (trimmed.length === 0 && attachments.length === 0) return;
      setNotes((prev) => {
        let maxOrder = 0;
        for (const n of prev) {
          const inGroup =
            (categoryId == null && n.categoryId == null) ||
            (categoryId != null && n.categoryId === categoryId);
          if (inGroup && n.order > maxOrder) maxOrder = n.order;
        }
        const note = makeNote({
          text: trimmed,
          categoryId,
          attachments,
          order: maxOrder + 1,
        });
        return [...prev, note];
      });
    },
    []
  );

  const updateNote = useCallback((updated) => {
    setNotes((prev) => {
      const i = prev.findIndex((e) => e.id === updated.id);
      if (i < 0) return prev;
      const copy = [...prev];
      copy[i] = { ...updated, updatedAt: Date.now() };
      return copy;
    });
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const moveNoteToCategory = useCallback((noteId, categoryId) => {
    setNotes((prev) => {
      const i = prev.findIndex((e) => e.id === noteId);
      if (i < 0) return prev;
      let maxOrder = 0;
      for (const n of prev) {
        const inGroup =
          (categoryId == null && n.categoryId == null) ||
          (categoryId != null && n.categoryId === categoryId);
        if (inGroup && n.order > maxOrder) maxOrder = n.order;
      }
      const copy = [...prev];
      copy[i] = { ...copy[i], categoryId, order: maxOrder + 1 };
      return copy;
    });
  }, []);

  // Переупорядочивание в пределах текущей видимой группы.
  // fromIndex/toIndex — индексы внутри pageNotes (ReorderableList-семантика).
  const reorderNotes = useCallback(
    (fromIndex, toIndex) => {
      const visible = [...pageNotes];
      if (fromIndex < 0 || fromIndex >= visible.length) return;
      let to = toIndex;
      if (to < 0) to = 0;
      if (to > visible.length) to = visible.length;
      if (to === fromIndex) return;

      const moved = visible.splice(fromIndex, 1)[0];
      const insertAt = to > fromIndex ? to - 1 : to;
      visible.splice(insertAt, 0, moved);

      // Текущая группа целиком (отсортирована по order)
      const groupList = notes
        .filter((n) => {
          if (filterNoCategoryOnly) return n.categoryId == null;
          if (selectedCategoryId != null)
            return n.categoryId === selectedCategoryId;
          return true;
        })
        .sort((a, b) => a.order - b.order);

      const pageStart = safePage * NOTES_PER_PAGE;
      const visibleIds = new Set(visible.map((e) => e.id));
      const outOfPage = groupList.filter((n) => !visibleIds.has(n.id));

      // Назначаем новые order: позиции страницы берём из visible,
      // остальные сохраняют относительный порядок
      const orderById = {};
      let outIdx = 0;
      let counter = 1;
      for (let i = 0; i < groupList.length; i++) {
        let target = null;
        if (i >= pageStart && i < pageStart + visible.length) {
          target = visible[i - pageStart];
        } else if (outIdx < outOfPage.length) {
          target = outOfPage[outIdx++];
        }
        if (target) orderById[target.id] = counter++;
      }

      setNotes((prev) =>
        prev.map((n) =>
          orderById[n.id] != null ? { ...n, order: orderById[n.id] } : n
        )
      );
    },
    [pageNotes, notes, filterNoCategoryOnly, selectedCategoryId, safePage]
  );

  // === CRUD категорий ===
  const addCategory = useCallback((name, emoji = '📁') => {
    const trimmed = (name || '').trim();
    if (trimmed.length === 0) return;
    setCategories((prev) => {
      const maxOrder = prev.reduce((m, c) => Math.max(m, c.order), 0);
      return [...prev, makeCategory({ name: trimmed, emoji, order: maxOrder + 1 })];
    });
  }, []);

  const renameCategory = useCallback((id, name, emoji) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, name: name.trim() || c.name, emoji: emoji || c.emoji }
          : c
      )
    );
  }, []);

  const deleteCategory = useCallback(
    (id) => {
      // Заметки этой категории становятся "без категории"
      setNotes((prev) =>
        prev.map((n) => (n.categoryId === id ? { ...n, categoryId: null } : n))
      );
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategoryId === id) {
        selectAllCategories();
      }
    },
    [selectedCategoryId, selectAllCategories]
  );

  const countInCategory = useCallback(
    (categoryId) => {
      if (categoryId == null) {
        return notes.filter((n) => n.categoryId == null).length;
      }
      return notes.filter((n) => n.categoryId === categoryId).length;
    },
    [notes]
  );

  const value = {
    notes,
    categories,
    loaded,
    selectedCategoryId,
    filterNoCategoryOnly,
    searchQuery,
    currentPage: safePage,
    totalPages,
    filteredNotes,
    pageNotes,
    notesPerPage: NOTES_PER_PAGE,
    // фильтры
    selectAllCategories,
    selectNoCategory,
    selectCategory,
    setSearch,
    setPage: setCurrentPage,
    // заметки
    addNote,
    updateNote,
    deleteNote,
    moveNoteToCategory,
    reorderNotes,
    // категории
    addCategory,
    renameCategory,
    deleteCategory,
    countInCategory,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}
