"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BoardList from "../components/BoardList";
import { useStore } from "../store/useStore";
import { useEffect, useState } from "react"; 
import { useKanbanStore } from "../store/kanbanStore";
import { supabase } from "../lib/supabase"; 

export default function Home() {
  const router = useRouter();
  const { boards, fetchBoards } = useStore(); // fetchBoards 추가
  const { todoStats } = useKanbanStore(); // Zustand에서 todoStats 가져오기
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await fetchBoards(); // boards 불러오기
      await fetchTodoStats(); // 통계 가져오기
      setLoading(false); // 데이터 로드 완료 후 상태 업데이트
    };

    fetchData();
  }, [fetchBoards]);

  const fetchTodoStats = async () => {
    for (const board of boards) {
      const { data: todos, error: todoError } = await supabase
        .from("todos")
        .select("*")
        .eq("board_id", board.id)
        .eq("is_error", false);

      if (todoError) {
        console.error(`Error fetching todos for board ${board.id}:`, todoError);
        continue;
      }

      const total = todos.length;
      const todoCount = todos.filter((todo) => todo.status === "todo").length;
      useKanbanStore.getState().setTodoStats(board.id, { total, todoCount });
    }
  };

  const goToCreateBoard = () => {
    router.push("/create");
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col justify-start items-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute text-[18px] pt-24 font-sans font-semibold text-gray-200"
        >
          Bridge knowledge and action with effective task management.
        </motion.h1>

        <motion.div
          className="flex items-center justify-center gap-10 flex-grow"
          layout
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <div>Loading...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-start items-center">
      {/* 상단 h1 (고정된 위치) */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute text-[18px] pt-24 font-sans font-semibold text-gray-200"
      >
        Bridge knowledge and action with effective task management.
      </motion.h1>

      {/* 보드 목록과 + 버튼을 감싸는 컨테이너 (가운데 정렬) */}
      <motion.div
        className="flex items-center justify-center gap-10 flex-grow"
        layout
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <BoardList boards={boards} />
        <motion.button
          onClick={goToCreateBoard}
          className="border-2 rounded-lg text-white w-16 h-16 pb-1 flex justify-center items-center text-3xl hover:bg-gray-100 hover:text-black transition duration-300"
          layout
        >
          +
        </motion.button>
      </motion.div>
    </div>
  );
}
