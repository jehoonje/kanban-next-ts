import { create } from "zustand";

export interface Todo {
  id: number;
  board_id: number;
  user_name: string;
  title: string;
  status: string;
  date?: string | null;
  description: string;
  is_error: boolean;
  comment?: string | null;
}

export interface Column {
  id: number;
  board_id: number;
  title: string;
  status: string;
  color: string;
}

interface KanbanState {
  normalTodos: Todo[];
  errorTodos: Todo[];
  boardName: string;
  editMode: boolean;
  columnEditMode: boolean;
  deleteMode: boolean;
  errorMode: boolean;
  selectedForDelete: number[];
  selectedForError: number[];
  todoStats: Record<number, { total: number; todoCount: number }>;

  setBoardName: (name: string) => void;
  setNormalTodos: (todos: Todo[]) => void;
  setErrorTodos: (todos: Todo[] | ((prevTodos: Todo[]) => Todo[])) => void;
  addNormalTodo: (todo: Todo) => void;
  addErrorTodo: (todo: Todo) => void;
  updateTodo: (id: number, data: Partial<Todo>) => void;
  removeTodos: (ids: number[]) => void;
  toggleEditMode: (value?: boolean) => void;
  toggleDeleteMode: (value?: boolean) => void;
  toggleErrorMode: (value?: boolean) => void;
  toggleColumnEditMode: () => void;
  toggleSelectDelete: (id: number) => void;
  clearSelectedDelete: () => void;
  toggleSelectError: (id: number) => void;
  clearSelectedError: () => void;
  setTodoStats: (
    boardId: number,
    stats: { total: number; todoCount: number }
  ) => void; //
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  normalTodos: [],
  errorTodos: [],
  boardName: "",
  editMode: false,
  deleteMode: false,
  errorMode: false,
  columnEditMode: false,
  selectedForDelete: [],
  selectedForError: [],
  todoStats: {},

  setBoardName: (name) => set({ boardName: name }),
  setNormalTodos: (todos) => set({ normalTodos: todos }),
  setErrorTodos: (updateFn) =>
    set((state) => ({
      errorTodos:
        typeof updateFn === "function" ? updateFn(state.errorTodos) : updateFn,
    })),
  addNormalTodo: (todo) =>
    set((state) => ({ normalTodos: [...state.normalTodos, todo] })),
  addErrorTodo: (todo) =>
    set((state) => ({ errorTodos: [...state.errorTodos, todo] })),
  updateTodo: (id, data) =>
    set((state) => ({
      normalTodos: state.normalTodos.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    })),
  removeTodos: (ids) =>
    set((state) => ({
      normalTodos: state.normalTodos.filter((t) => !ids.includes(t.id)),
    })),
    toggleEditMode: () =>
      set((state) => ({
        editMode: !state.editMode,
        deleteMode: false,
        errorMode: false,
      })),
    toggleDeleteMode: () =>
      set((state) => ({
        deleteMode: !state.deleteMode,
        editMode: false,
        errorMode: false,
      })),
    toggleErrorMode: () =>
      set((state) => ({
        errorMode: !state.errorMode,
        editMode: false,
        deleteMode: false,
      })),
    toggleColumnEditMode: () =>
      set((state) => ({ columnEditMode: !state.columnEditMode })),
    toggleSelectDelete: (id) =>
      set((state) => {
        const isSelected = state.selectedForDelete.includes(id);
        return {
          selectedForDelete: isSelected
            ? state.selectedForDelete.filter((item) => item !== id)
            : [...state.selectedForDelete, id],
        };
      }),
    clearSelectedDelete: () => set({ selectedForDelete: [] }),
    toggleSelectError: (id) =>
      set((state) => {
        const isSelected = state.selectedForError.includes(id);
        return {
          selectedForError: isSelected
            ? state.selectedForError.filter((item) => item !== id)
            : [...state.selectedForError, id],
        };
      }),
  clearSelectedError: () => set({ selectedForError: [] }),
  setTodoStats: (boardId, stats) =>
    set((state) => ({
      todoStats: { ...state.todoStats, [boardId]: stats },
    })),
}));
