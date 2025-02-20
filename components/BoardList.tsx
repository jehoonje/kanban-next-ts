"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../lib/supabase"; // supabase 직접 import
import { AnimatePresence, motion } from "framer-motion";

interface Board {
  id: number;
  name: string;
}

export default function BoardList({ boards: initialBoards }: { boards: Board[] }) {
  // 보드 목록을 로컬 상태로 관리 (수정/삭제 후 반영)
  const [boards, setBoards] = useState<Board[]>(initialBoards);

  // 아이콘 버튼 표시 여부를 보관. board.id -> boolean
  const [showIcons, setShowIcons] = useState<Record<number, boolean>>({});

  // 수정 중인 보드 (board.id), 수정용 입력 값
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // 0% 버튼 클릭 시 아이콘 표시/숨김 토글
  const toggleIcons = (boardId: number) => {
    setShowIcons((prev) => ({
      ...prev,
      [boardId]: !prev[boardId],
    }));
  };

  // 수정 아이콘 클릭 시
  const handleEditClick = (boardId: number, currentName: string) => {
    setEditingBoardId(boardId);
    setEditingValue(currentName);
  };

  // 수정 확인 (체크) 버튼 클릭 시
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

    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, name: editingValue } : b))
    );

    setEditingBoardId(null);
    setEditingValue("");
  };

  // 보드 삭제
  const handleDelete = async (boardId: number) => {
    const { error } = await supabase
      .from("boards")
      .delete()
      .eq("id", boardId);

    if (error) {
      alert("삭제 중 오류가 발생했습니다.");
      return;
    }

    setBoards((prev) => prev.filter((b) => b.id !== boardId));
  };

  // 아이콘(입장, 수정, 삭제) 모션 설정
  const iconVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  };

  return (
    <div className="flex flex-wrap gap-10">
      {boards.map((board) => {
        const isEditing = editingBoardId === board.id;
        const iconsVisible = showIcons[board.id] || false;

        return (
          <div key={board.id} className="flex flex-col items-center gap-2 relative">
            {/* 0% 박스 (클릭하면 아이콘 pop / 다시 클릭하면 사라짐) */}
            <button
              onClick={() => toggleIcons(board.id)}
              className="w-16 h-16 border rounded-md flex justify-center items-center
                         hover:bg-gray-100 transition-colors duration-300
                         text-lg font-semibold"
            >
              0%
            </button>

            {/* 보드 이름 or 인풋 */}
            {!isEditing ? (
              <div className="text-xs text-gray-800 font-medium">
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

            {/* 아이콘 버튼들 (AnimatePresence로 "Pop" 효과) */}
            <AnimatePresence>
              {iconsVisible && (
                <motion.div
                  className="absolute top-full mt-2 flex gap-2" // absolute로 위치 고정
                  key="icons"
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  {/* 입장 아이콘 (➡️) */}
                  <Link
                    href={`/board/${board.id}`}
                    className="border p-1 rounded hover:bg-gray-200"
                    title="입장"
                  >
                    ➡️
                  </Link>

                  {/* 수정 아이콘 (✏️) - 수정모드가 아닐 때만 보이도록 */}
                  {!isEditing && (
                    <button
                      onClick={() => handleEditClick(board.id, board.name)}
                      className="border p-1 rounded hover:bg-gray-200"
                      title="수정"
                    >
                      ✏️
                    </button>
                  )}

                  {/* 삭제 아이콘 (🗑️) */}
                  <button
                    onClick={() => handleDelete(board.id)}
                    className="border p-1 rounded hover:bg-gray-200"
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
