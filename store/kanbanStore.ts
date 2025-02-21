import { create } from "zustand";

export interface Todo {
  id: number;
  board_id: number;
  user_name: string;
  title: string;
  status: string;
  date?: string | null;
  description: string;
}

export interface Column {
  id: number;
  board_id: number;
  title: string;
  status: string;
  color: string;
}

interface KanbanState {
  todos: Todo[];
  boardName: string;
  editMode: boolean;
  deleteMode: boolean;
  selectedForDelete: number[];

  setBoardName: (name: string) => void;
  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (id: number, data: Partial<Todo>) => void;
  removeTodos: (ids: number[]) => void;
  toggleEditMode: (value?: boolean) => void;
  toggleDeleteMode: (value?: boolean) => void;
  toggleSelectDelete: (id: number) => void;
  clearSelectedDelete: () => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  todos: [],
  boardName: "",
  editMode: false,
  deleteMode: false,
  selectedForDelete: [],
  setBoardName: (name) => set({ boardName: name }),
  setTodos: (todos) => set({ todos }),
  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
  updateTodo: (id, data) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  removeTodos: (ids) =>
    set((state) => ({
      todos: state.todos.filter((t) => !ids.includes(t.id)),
    })),
  toggleEditMode: (value) =>
    set((state) => ({ editMode: value !== undefined ? value : !state.editMode })),
  toggleDeleteMode: (value) =>
    set((state) => ({ deleteMode: value !== undefined ? value : !state.deleteMode })),
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
}));
