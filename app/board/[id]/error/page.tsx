"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useKanbanStore, Todo } from "../../../../store/kanbanStore";

export default function ErrorRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const boardId = params.id;
  const searchParams = useSearchParams();
  const userName = searchParams.get("user") || "";
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [commentInput, setCommentInput] = useState<string>("");
  const boardName = useKanbanStore((state) => state.boardName);

  const { errorTodos: todos, setErrorTodos: setTodos } = useKanbanStore();

  useEffect(() => {
    fetchErrorTodos();
  }, [boardId]);

  async function fetchErrorTodos() {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("board_id", boardId)
      .eq("is_error", true)
      .order("id", { ascending: true });

    if (!error && data) {
      setTodos(data as Todo[]);
    }
  }

  async function handleCommentSubmit() {
    if (!selectedTodo || !commentInput) return;

    const { error } = await supabase
      .from("todos")
      .update({ comment: commentInput })
      .eq("id", selectedTodo.id);

    if (error) {
      console.error(error);
    } else {
      setTodos((prevTodos: Todo[]) =>
        prevTodos.map((todo) =>
          todo.id === selectedTodo.id
            ? { ...todo, comment: commentInput }
            : todo
        )
      );
      setSelectedTodo((prev) =>
        prev ? { ...prev, comment: commentInput } : null
      );
      setCommentInput("");
      setSelectedTodo(null);
    }
  }

  async function handleDeleteComment(todoId: number) {
    const { error } = await supabase
      .from("todos")
      .update({ comment: null })
      .eq("id", todoId);

    if (error) {
      console.error("Error deleting comment:", error);
      return;
    }

    setTodos((prevTodos: Todo[]) =>
      prevTodos.map((todo) =>
        todo.id === todoId ? { ...todo, comment: null } : todo
      )
    );

    if (selectedTodo?.id === todoId) {
      setSelectedTodo((prev) => (prev ? { ...prev, comment: null } : null));
    }
  }

  // Todo 클릭 시 코멘트 섹션 토글 함수
  const toggleCommentSection = (todo: Todo) => {
    if (selectedTodo?.id === todo.id) {
      setSelectedTodo(null); // 열려 있으면 닫기 (Cancel)
    } else {
      setSelectedTodo(todo); // 닫혀 있으면 열기
    }
  };

  return (
    <div
      className="w-4/5 min-h-screen bg-cover bg-center text-white"
    >
      <div className="w-full min-h-screen bg-cover bg-center text-white">
        {/* 상단 바 */}
        <div className="flex flex-col items-start ml-[1.1rem] py-2 bg-transparent">
          <h1 className="text-[2.5rem] py-3 font-bold mr-6">
            Error Room - {boardName ? boardName : ""}
          </h1>
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() =>
                router.push(`/board/${boardId}/kanban?user=${userName}`)
              }
              className="text-md font-bold px-14 py-0.5 bg-[#1B1A1D] text-white rounded mr-2 hover:bg-[#28272B] shadow-lg"
            >
              Back
            </button>
          </div>
        </div>

        {/* Error Kanban Column */}
        <div className="flex flex-col px-4 pt-2 py-6 gap-6">
          <div className="overflow-y-auto max-h-[calc(100vh-150px)]">
            {todos
              .filter((todo) => todo.is_error)
              .slice()
              .reverse()
              .map((todo) => (
                <div key={todo.id} className="flex flex-col mb-4">
                  {/* Todo 아이템 */}
                  <div
                    onClick={() => toggleCommentSection(todo)}
                    className={`p-4 bg-[#1B1A1D] rounded-t-lg cursor-pointer ${
                      selectedTodo?.id === todo.id
                        ? "bg-[#3A3A3A]"
                        : todo.comment
                        ? "bg-[#1B1A1D] hover:bg-[#28272D]"
                        : "bg-[#1B1A1D]"
                    }`}
                  >
                    <h3 className="font-bold">{todo.title}</h3>
                    {todo.date && (
                      <p className="text-sm text-gray-400">{todo.date}</p>
                    )}
                    {todo.description && (
                      <p className="text-sm text-gray-300">
                        {todo.description}
                      </p>
                    )}
                  </div>

                  {/* 코멘트 섹션 애니메이션 */}
                  <AnimatePresence>
                    {selectedTodo?.id === todo.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} // 접힌 초기 상태
                        animate={{ height: "auto", opacity: 1 }} // 펼쳐진 상태
                        exit={{ height: 0, opacity: 0 }} // 닫히는 상태
                        transition={{ duration: 0.3 }} // 0.3초 동안 부드럽게 전환
                        className="overflow-hidden"
                      >
                        <div className="w-full p-4 bg-[#1B1A1D] rounded-b-lg">
                          <textarea
                            className="w-full p-2 bg-transparent text-white border border-gray-500 rounded-md"
                            placeholder="Write a comment..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                          />
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => setSelectedTodo(null)}
                              className="px-1 py-0.5 text-xs bg-[#28272B] rounded text-white hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleCommentSubmit}
                              className="px-1 py-0.5 text-xs bg-[#28272B] text-white rounded"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 기존 코멘트 표시 */}
                  {todo.comment && selectedTodo?.id !== todo.id && (
                    <div className="w-full p-4 bg-[#1B1A1D] rounded-b-lg">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-200">
                          [ {userName} ] 💬 <br />
                          {todo.comment}
                        </p>
                        <button
                          onClick={() => handleDeleteComment(todo.id)}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 코멘트가 없는 경우 메시지 */}
                  {!todo.comment && selectedTodo?.id !== todo.id && (
                    <div className="w-full p-4 bg-[#7F1C1D] rounded-b-lg">
                      <p className="text-sm text-white">
                        ⚠️ To-do를 클릭하여 코멘트를 작성해주세요.
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
