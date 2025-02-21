"use client";

import React, { ReactNode }  from "react";
import classNames from "classnames";
import { useDrop } from "react-dnd";
import DraggableTodo from "./DraggableTodo";
import { Todo, Column } from "../store/kanbanStore";

interface KanbanColumnProps {
  title: string;
  status: string;
  color: string;
  todos: Todo[];
  editMode: boolean;
  deleteMode: boolean;
  errorMode: boolean;
  selectedForDelete: number[];
  selectedForError: number[];
  onClickTodo: (todo: Todo) => void;
  onAddTodo: () => void;
  moveTodo: (dragIndex: number, hoverIndex: number, todo: Todo) => void;
  onDropTodo: (todo: Todo, newStatus: string) => void;
  columnEditMode: boolean;
  onRemoveColumn: () => void;
  onEditColumn: () => void;
  children?: ReactNode;  
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  color,
  todos,
  editMode,
  deleteMode,
  errorMode,
  selectedForDelete,
  selectedForError,
  onClickTodo,
  onAddTodo,
  moveTodo,
  onDropTodo,
  columnEditMode,
  onRemoveColumn,
  onEditColumn,
  children,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: "TODO",
    drop: (item: { index: number; todo: Todo }) => {
      if (item.todo.status !== status) {
        onDropTodo(item.todo, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // 필터링하여 is_error가 true인 항목은 렌더링하지 않음
  const filteredTodos = todos.filter((todo) => !todo.is_error);

  return (
    <div
      ref={(node) => { drop(node); }}
      className={classNames(
        "w-4/5 bg-[#1B1A1D] pb-4 rounded p-2 flex flex-col",
        { "filter brightness-110": isOver }
      )}
    >
      <div className="flex items-center mb-2">
        <button
          onClick={onAddTodo}
          className="text-xs px-2 py-1 bg-[#28272B] text-white rounded hover:bg-gray-500"
        >
          Add
        </button>
        <div className="w-1/3 text-left">
          {columnEditMode && (
            <button
              onClick={onEditColumn}
              className="text-xs px-2 py-1 bg-green-900 text-white rounded mr-1"
            >
              Edit
            </button>
          )}
        </div>
        <div className="w-1/3 text-center">
          <h2
            className="font-semibold text-sm mr-4 px-4 py-1 bg-[#28272B] rounded inline-block truncate whitespace-nowrap"
            style={{ color }}
          >
            {title}
          </h2>
        </div>
        <div className="w-1/3 text-right">
          {columnEditMode && (
            <button
              onClick={onRemoveColumn}
              className="text-xs px-2 py-1 bg-red-900 text-white rounded"
            >
              X
            </button>
          )}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto flex flex-col gap-2">
        {filteredTodos.map((todo, index) => (
          <DraggableTodo
            key={todo.id}
            todo={todo}
            index={index}
            moveTodo={moveTodo}
            onClick={onClickTodo}
            deleteMode={deleteMode}
            isSelected={selectedForDelete.includes(todo.id)}
            errorMode={errorMode}
            errorSelected={selectedForError.includes(todo.id)}
            editMode={editMode}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
