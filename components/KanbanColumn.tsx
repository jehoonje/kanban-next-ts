"use client";

import React from "react";
import classNames from "classnames";
import { Todo, Column } from "../store/kanbanStore";

interface KanbanColumnProps {
  title: string;
  status: string;
  color: string;
  todos: Todo[];
  editMode: boolean;
  deleteMode: boolean;
  selectedForDelete: number[];
  onClickTodo: (todo: Todo) => void;
  onAddTodo: () => void;
  columnEditMode: boolean;
  onRemoveColumn: () => void;
  onEditColumn: () => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  color,
  todos,
  editMode,
  deleteMode,
  selectedForDelete,
  onClickTodo,
  onAddTodo,
  columnEditMode,
  onRemoveColumn,
  onEditColumn,
}) => {
  return (
    <div className="w-4/5 bg-[#1B1A1D] pb-4 rounded p-2 flex flex-col">
      <div className="flex items-center mb-2">
        <button
          onClick={onAddTodo}
          className="text-xs px-2 py-1 bg-[#28272B] text-white rounded hover:bg-gray-500"
        >
          Add
        </button>
        {/* 왼쪽: 수정 버튼 (컬럼 편집 모드 시) */}
        <div className="w-1/3 text-left">
          {columnEditMode && (
            <button
              onClick={onEditColumn}
              className="text-xs px-2 py-1 bg-green-500 text-white rounded mr-1"
            >
              Edit
            </button>
          )}
        </div>
        {/* 중앙: 칼럼 타이틀 */}
        <div className="w-1/3 text-center">
          <h2
            className="font-semibold text-sm px-4 py-1 bg-[#28272B] rounded inline-block truncate whitespace-nowrap"
            style={{ color }}
          >
            {title}
          </h2>
        </div>
        {/* 오른쪽: 삭제 버튼 */}
        <div className="w-1/3 text-right">
          {columnEditMode && (
            <button
              onClick={onRemoveColumn}
              className="text-xs px-2 py-1 bg-red-500 text-white rounded"
            >
              X
            </button>
          )}
        </div>
      </div>
      {/* Todo 리스트 */}
      <div className="max-h-96 overflow-y-auto flex flex-col gap-2">
        {todos.map((todo) => {
          const isSelected = selectedForDelete.includes(todo.id);
          return (
            <div
              key={todo.id}
              onClick={() => onClickTodo(todo)}
              className={classNames(
                "bg-[#28272B] rounded p-2 text-sm cursor-pointer transition-colors",
                {
                  "bg-gray-200 text-black": deleteMode && isSelected,
                  "hover:bg-gray-600": !deleteMode,
                }
              )}
            >
              <p className="font-bold">{todo.title}</p>
              {todo.date && (
                <p className="text-xs mt-1 text-gray-200">{todo.date}</p>
              )}
              {todo.description && (
                <p className="text-xs mt-1 text-gray-300">{todo.description}</p>
              )}
              <p className="text-xs text-gray-400">{todo.user_name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanColumn;
