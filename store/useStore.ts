import { create } from "zustand";
import { supabase } from "../lib/supabase"; // supabase import 추가

interface Board {
  id: number;
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
  setBoards: (boards: Board[]) => set({ boards }), 
  addBoard: async (board) => {
    // 상태 업데이트 시, 타입을 명확히 지정
    set((state) => ({
      boards: [...state.boards, board] as Board[] // 타입 명시
    }));
    // 만약 필요한 경우, supabase에서 보드 목록을 다시 가져올 수 있음
    const { data, error } = await supabase.from("boards").select("*");
    if (error) {
      console.error("보드 목록을 가져오는 데 실패했습니다.", error);
      return;
    }
    set({ boards: data as Board[] }); // boards 상태 업데이트
  },
  fetchBoards: async () => {
    const { data, error } = await supabase.from("boards").select("*");

    if (error) {
      console.error("보드 목록을 불러오는 중 오류가 발생했습니다.", error);
      return;
    }

    set({ boards: data as Board[] });
  },
}));
