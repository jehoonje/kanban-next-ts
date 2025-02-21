"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import classNames from "classnames";
import { useKanbanStore, Todo } from "../../../../store/kanbanStore"; // Zustand 사용

export default function ErrorRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const boardId = params.id;
  const searchParams = useSearchParams();
  const userName = searchParams.get("user") || "";
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [commentInput, setCommentInput] = useState<string>("");

  const {
    errorTodos: todos,
    boardName,
    setErrorTodos: setTodos,
  } = useKanbanStore();

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
      // Update todos in the store
      setTodos((prevTodos: Todo[]) =>
        prevTodos.map((todo) =>
          todo.id === selectedTodo.id
            ? { ...todo, comment: commentInput }
            : todo
        )
      );

      // Ensure selectedTodo is updated with the comment
      setSelectedTodo((prev) =>
        prev ? { ...prev, comment: commentInput } : null
      );

      // Clear input and close the comment section
      setCommentInput("");
      setSelectedTodo(null);
    }
  }

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/background.webp')" }}
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
          {/* Left 50%: Error Todo List and Comment Section */}
          <div className="overflow-y-auto max-h-[calc(100vh-150px)]"> {/* Max height and scroll */}
            {todos
              .filter((todo) => todo.is_error)
              .slice()
              .reverse()
              .map((todo) => (
                <div key={todo.id} className="flex flex-col mb-4">
                  {/* Error Todo Item */}
                  <div
                    onClick={() => setSelectedTodo(todo)}
                    className={classNames(
                      "p-4 bg-[#1B1A1D] rounded-t-lg cursor-pointer",
                      {
                        "bg-[#3A3A3A]": selectedTodo?.id === todo.id, // 선택된 todo 색상
                        "bg-[#1B1A1D]": todo.comment,
                        "bg-[#28272D]": !todo.comment,
                        "hover:bg-[#28272D]": todo.comment,
                      }
                    )}
                  >
                    <h3 className="font-bold">{todo.title}</h3>
                    {todo.date && (
                      <p className="text-sm text-gray-400">{todo.date}</p>
                    )}
                    {todo.description && (
                      <p className="text-sm text-gray-300">{todo.description}</p>
                    )}
                  </div>

                  {/* Comment Section */}
                  <div className="w-full p-4 bg-[#1B1A1D] rounded-b-lg">
                    {selectedTodo?.id === todo.id ? (
                      <>
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
                      </>
                    ) : (
                      todo.comment && (
                        <p className="text-sm text-gray-200">
                          [ {userName} ] 💬  <br></br>{todo.comment}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
