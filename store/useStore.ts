import { create } from "zustand";
import { supabase } from "../lib/supabase"; // supabase import 추가

interface Board {
  id: string;
  name: string;
}

interface BoardStore {
  boards: Board[];
  setBoards: (boards: Board[]) => void;
  addBoard: (board: Board) => void;
  fetchBoards: () => void;
}

export const useStore = create<BoardStore>((set) => ({
  boards: [],
  setBoards: (boards) => set({ boards }),
  addBoard: async (board) => {
    // 새로운 보드 추가 후, 상태 업데이트
    set((state) => ({ boards: [...state.boards, board] }));

    // 만약 필요한 경우, supabase에서 보드 목록을 다시 가져올 수 있음
    const { data, error } = await supabase.from("boards").select("*");
    if (error) {
      console.error("보드 목록을 가져오는 데 실패했습니다.", error);
      return;
    }
    set({ boards: data }); // boards 상태 업데이트
  },
  fetchBoards: async () => {
    const { data, error } = await supabase.from("boards").select("*");

    if (error) {
      console.error("보드 목록을 불러오는 중 오류가 발생했습니다.", error);
      return;
    }

    set({ boards: data });
  },
}));
