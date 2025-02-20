import { create } from "zustand";

interface Board {
  id: number;
  name: string;
}

interface BoardStore {
  boards: Board[];
  setBoards: (boards: Board[]) => void;
  addBoard: (board: Board) => void;
}

export const useStore = create<BoardStore>((set) => ({
  boards: [],
  setBoards: (boards) => set({ boards }),
  addBoard: (board) =>
    set((state) => ({
      boards: [...state.boards, board],
    })),
}));
