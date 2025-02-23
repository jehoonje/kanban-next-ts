"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import classNames from "classnames";
import { useKanbanStore, Todo } from "../store/kanbanStore"; // Todo 타입 임포트 추가

interface KanbanHeaderProps {
  boardId: string;
  boardName: string;
  userName: string;
  boardUsers: { id: number; name: string }[];
  showUserList: boolean;
  toggleUserList: () => void;
  switchUser: (name: string) => void;
  handleDeleteTodos: () => void;
  confirmMoveToErrorRoom: () => void;
  setShowNewColumnModal: (value: boolean) => void;
  setEditingTodo: (todo: Todo | null) => void; // Todo 타입 사용
}

const userVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
};

export default function KanbanHeader({
  boardId,
  boardName,
  userName,
  boardUsers,
  showUserList,
  toggleUserList,
  switchUser,
  handleDeleteTodos,
  confirmMoveToErrorRoom,
  setShowNewColumnModal,
  setEditingTodo,
}: KanbanHeaderProps) {
  const router = useRouter();

  const {
    editMode,
    deleteMode,
    errorMode,
    columnEditMode,
    toggleEditMode,
    toggleDeleteMode,
    toggleErrorMode,
    toggleColumnEditMode,
    clearSelectedDelete,
    clearSelectedError,
  } = useKanbanStore();

  const editIconStyle = editMode ? "bg-[#9593a0]" : "bg-[#1B1A1D]";
  const deleteIconStyle = deleteMode ? "bg-[#9593a0]" : "bg-[#1B1A1D]";
  const errorIconStyle = errorMode ? "bg-[#9593a0]" : "bg-[#1B1A1D]";

  return (
    <div className="flex flex-col items-start ml-[1.1rem] py-2 bg-transparent">
      <div className="flex flex-row">
        <h1 className="text-[2.5rem] tracking-tight py-3 font-bold mr-6">
          Board - {boardName ? boardName : ""}
        </h1>
      </div>
      <div className="flex flex-wrap items-center w-full">
        <button
          onClick={() => router.push("/")}
          className="text-sm font-bold px-14 py-1 bg-[#1B1A1D] text-white rounded mr-2 hover:bg-[#28272B] shadow-lg"
        >
          Home
        </button>
        <button
          onClick={() =>
            router.push(`/board/${boardId}/error?user=${userName}`)
          }
          className="text-sm font-bold px-10 py-1 bg-[#1B1A1D] text-white rounded mr-2 hover:bg-[#28272B] shadow-lg"
        >
          Error Room
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleUserList}
            className="text-sm font-bold px-10 py-1 bg-[#1B1A1D] text-white rounded hover:bg-[#28272B] shadow-lg"
          >
            Switch User
          </button>
          {showUserList && (
            <AnimatePresence>
              <motion.div
                className="relative"
                key="icons"
                variants={userVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="absolute text-xs bottom-6 right-2 z-50 bg-black/20 rounded shadow-lg flex gap-2">
                  {boardUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u.name)}
                      className="px-2 bg-gray-200 text-black rounded"
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
          {deleteMode && (
            <div className="rounded text-white text-sm border border-red-900 bg-red-900 hover:bg-red-800">
              <button onClick={handleDeleteTodos} className="px-8 py-0.5">
                Confirm Delete
              </button>
            </div>
          )}
          {errorMode && (
            <div className="rounded text-white text-sm border border-red-900 bg-red-900 hover:bg-red-800">
              <button onClick={confirmMoveToErrorRoom} className="px-8 py-0.5">
                Confirm Error
              </button>
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-2 mb:mt-2 sm:mt-2 ml-auto">
          <button
            onClick={() => {
              if (editMode) setEditingTodo(null);
              toggleEditMode();
            }}
            className={classNames(
              "text-sm px-3 py-1 bg-[#1B1A1D] hover:bg-[#28272B] rounded transition-colors",
              editIconStyle
            )}
          >
            ✏️
          </button>
          <button
            onClick={() => {
              if (deleteMode) clearSelectedDelete();
              toggleDeleteMode();
            }}
            className={classNames(
              "text-sm px-3 py-1 bg-[#1B1A1D] hover:bg-[#28272B] rounded transition-colors",
              deleteIconStyle
            )}
          >
            🗑️
          </button>
          <button
            onClick={() => {
              if (errorMode) clearSelectedError();
              toggleErrorMode();
            }}
            className={classNames(
              "text-sm px-3 py-1 bg-[#1B1A1D] hover:bg-[#28272B] rounded transition-colors",
              errorIconStyle
            )}
          >
            ⚠️
          </button>
          <div className="flex items-center gap-2 ml-auto px-4">
            <button
              onClick={toggleColumnEditMode}
              className="text-sm font-bold px-3 py-1 bg-[#1B1A1D] hover:bg-[#28272B] text-white rounded"
            >
              {columnEditMode ? "Done Columns" : "Edit Columns"}
            </button>
            <button
              onClick={() => setShowNewColumnModal(true)}
              className="relative font-bold text-sm px-3 py-1 bg-[#1B1A1D] hover:bg-[#28272B] text-white rounded"
            >
              New Kanban
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
