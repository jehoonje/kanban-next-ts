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
  comment?: string;
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
  deleteMode: boolean;
  // errorMode: 선택한 Todo를 에러룸으로 보낼 모드
  errorMode: boolean;
  selectedForDelete: number[];
  selectedForError: number[];

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
  toggleSelectDelete: (id: number) => void;
  clearSelectedDelete: () => void;
  toggleSelectError: (id: number) => void;
  clearSelectedError: () => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  normalTodos: [],
  errorTodos: [],
  boardName: "",
  editMode: false,
  deleteMode: false,
  errorMode: false, // 에러 모드 추가
  selectedForDelete: [],
  selectedForError: [],
  setBoardName: (name) => set({ boardName: name }),
  setNormalTodos: (todos) => set({ normalTodos: todos }),
  setErrorTodos: (updateFn) => set((state) => ({ 
    errorTodos: typeof updateFn === 'function' ? updateFn(state.errorTodos) : updateFn 
  })),
  addNormalTodo: (todo) => set((state) => ({ normalTodos: [...state.normalTodos, todo] })),
  addErrorTodo: (todo) => set((state) => ({ errorTodos: [...state.errorTodos, todo] })),
  updateTodo: (id, data) =>
    set((state) => ({
      normalTodos: state.normalTodos.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  removeTodos: (ids) =>
    set((state) => ({
      normalTodos: state.normalTodos.filter((t) => !ids.includes(t.id)),
    })),
  toggleEditMode: (value) =>
    set((state) => ({ editMode: value !== undefined ? value : !state.editMode })),
  toggleDeleteMode: (value) =>
    set((state) => ({ deleteMode: value !== undefined ? value : !state.deleteMode })),
  toggleErrorMode: (value) => // 에러 모드 상태 변경
    set((state) => ({ errorMode: value !== undefined ? value : !state.errorMode })),
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
}));
