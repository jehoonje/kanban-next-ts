"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { useKanbanStore } from "../store/kanbanStore"; // 추가

interface Board {
  id: number;
  name: string;
}

interface BoardListProps {
  boards: Board[];
}

export default function BoardList({ boards }: BoardListProps) {
  const { fetchBoards } = useStore();
  const { todoStats } = useKanbanStore(); // Zustand에서 todoStats 가져오기
  const [showIcons, setShowIcons] = useState<Record<number, boolean>>({});
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    fetchBoards();
    fetchTodoStats(); // 초기 통계 가져오기
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

  const toggleIcons = (boardId: number) => {
    setShowIcons((prev) => ({
      ...prev,
      [boardId]: !prev[boardId],
    }));
  };

  const handleEditClick = (boardId: number, currentName: string) => {
    setEditingBoardId(boardId);
    setEditingValue(currentName);
  };

  const handleConfirmEdit = async (boardId: number) => {
    if (editingValue.length > 10) {
      alert("보드 이름은 최대 10자까지만 가능합니다.");
      return;
    }
    if (!editingValue.trim()) {
      alert("보드 이름은 비워둘 수 없습니다.");
      return;
    }

    const { error } = await supabase
      .from("boards")
      .update({ name: editingValue })
      .eq("id", boardId);

    if (error) {
      alert("수정 중 오류가 발생했습니다.");
      return;
    }

    fetchBoards();
    setEditingBoardId(null);
    setEditingValue("");
  };

  const handleDelete = async (boardId: number) => {
    const isConfirmed = window.confirm("정말로 이 보드를 삭제하시겠습니까?");
    if (!isConfirmed) return;
    const { error } = await supabase
      .from("boards")
      .delete()
      .eq("id", boardId);

    if (error) {
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }
    fetchBoards();
    fetchTodoStats();
  };

  const iconVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  };

  return (
    <div className="flex flex-wrap mt-6 gap-10">
      {boards.map((board) => {
        const isEditing = editingBoardId === board.id;
        const iconsVisible = showIcons[board.id] || false;
        const stats = todoStats[board.id] || { total: 0, todoCount: 0 };
        const completionPercentage =
          stats.total === 0 ? 0 : Math.round(((stats.total - stats.todoCount) / stats.total) * 100);

        return (
          <div key={board.id} className="flex flex-col items-center gap-2 relative">
            <button
              onClick={() => toggleIcons(board.id)}
              className="w-16 h-16 bg-transparent backdrop-blur-lg border-2 rounded-lg text-white flex justify-center items-center
                         hover:bg-gray-100 hover:text-black transition-colors duration-300
                         text-lg font-semibold"
            >
              {completionPercentage}%
            </button>

            {!isEditing ? (
              <div className="text-xs text-gray-100 font-medium">
                {board.name}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value.slice(0, 10))}
                  maxLength={10}
                  className="border text-xs p-1 w-16 rounded"
                />
                <button
                  onClick={() => handleConfirmEdit(board.id)}
                  className="text-green-600 hover:text-green-800 text-lg"
                  title="Save"
                >
                  ✅
                </button>
              </div>
            )}

            <AnimatePresence>
              {iconsVisible && (
                <motion.div
                  className="absolute top-full mt-2 flex gap-2"
                  key="icons"
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <Link
                    href={`/board/${board.id}`}
                    className="bg-gray-300 p-1 rounded hover:bg-gray-200"
                    title="입장"
                  >
                    ➡️
                  </Link>
                  {!isEditing && (
                    <button
                      onClick={() => handleEditClick(board.id, board.name)}
                      className="bg-gray-300 p-1 rounded hover:bg-gray-200"
                      title="수정"
                    >
                      ✏️
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(board.id)}
                    className="bg-gray-300 p-1 rounded hover:bg-gray-200"
                    title="삭제"
                  >
                    🗑️
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}