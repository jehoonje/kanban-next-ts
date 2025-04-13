"use client";

import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import classNames from "classnames";
import { Todo } from "../store/kanbanStore";

interface DraggableTodoProps {
  todo: Todo;
  index: number;
  moveTodo: (dragIndex: number, hoverIndex: number, todo: Todo) => void;
  onClick: (todo: Todo) => void;
  deleteMode: boolean;
  isSelected: boolean;
  errorMode: boolean;
  errorSelected: boolean;
  editMode: boolean;
}

const DraggableTodo: React.FC<DraggableTodoProps> = ({
  todo,
  index,
  moveTodo,
  onClick,
  deleteMode,
  isSelected,
  errorMode,
  editMode,
  errorSelected,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: "TODO",
    item: { index, todo },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [, drop] = useDrop({
    accept: "TODO",
    hover(item: { index: number; todo: Todo }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveTodo(dragIndex, hoverIndex, todo);
      item.index = hoverIndex;
    },
  });
  drag(drop(ref));
  return (
    <div
      ref={ref}
      onClick={() => onClick(todo)}
      className={classNames(
        "bg-[#28272B] rounded p-2 text-sm cursor-pointer transition-colors",
        {
          "bg-red-300 text-black": deleteMode && isSelected || errorMode && errorSelected,
          "hover:bg-red-300": deleteMode && !isSelected || errorMode && !errorSelected,
          "bg-[#4d4a54]": deleteMode && !isSelected || errorMode && !errorSelected || editMode,
          "hover:bg-gray-600": !deleteMode && !errorMode, // 원래 색으로 돌아가는 조건 수정
        },
      )}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <p className="font-bold">{todo.title}</p>
      {todo.date && <p className="text-xs mt-1 text-gray-200">{todo.date}</p>}
      {todo.description && (
        <p className="text-xs mt-1 text-gray-300">{todo.description}</p>
      )}
      <p className="text-xs text-gray-400 pt-1">{todo.user_name}</p>
    </div>
  );
};

export default DraggableTodo;
