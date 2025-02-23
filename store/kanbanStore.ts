import { create } from "zustand";
import { supabase } from "../lib/supabase";

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
  order?: number;
}

interface KanbanState {
  normalTodos: Todo[];
  errorTodos: Todo[];
  columns: Column[];
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
  setColumns: (columns: Column[] | ((prevColumns: Column[]) => Column[])) => void;
  updateColumnOrder: (columnId: number, newIndex: number) => Promise<void>; // 새로운 액션 추가
  setTodoStats: (
    boardId: number,
    stats: { total: number; todoCount: number }
  ) => void; //
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  normalTodos: [],
  columns: [],
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
  updateColumnOrder: async (columnId: number, newIndex: number) => {
    const currentColumns = get().columns;
    const updatedColumns = [...currentColumns];
    const columnToMove = updatedColumns.find((col) => col.id === columnId);
    if (!columnToMove) return;

    const oldIndex = updatedColumns.indexOf(columnToMove);
    updatedColumns.splice(oldIndex, 1);
    updatedColumns.splice(newIndex, 0, columnToMove);

    const columnsWithOrder = updatedColumns.map((col, idx) => ({
      ...col,
      order: idx,
    }));

    set({ columns: columnsWithOrder });

    try {
      const updates = await Promise.all(
        columnsWithOrder.map((col) =>
          supabase.from("kanban_columns").update({ order: col.order }).eq("id", col.id)
        )
      );
      console.log("Column order updated in Supabase:", updates);
    } catch (error) {
      console.error("Failed to update column order in Supabase:", error);
      // 실패 시 롤백 가능성 고려
      set({ columns: currentColumns });
    }
  },
  
  
  setTodoStats: (boardId, stats) =>
    set((state) => ({
      todoStats: { ...state.todoStats, [boardId]: stats },
    })),
  setColumns: (update) =>
    set((state) => ({
      ...state, // Spread the existing state
      columns: typeof update === "function" ? update(state.columns) : update,
    })),
}));
