"use client";

import React, { useRef } from "react";
import classNames from "classnames";
import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { motion, AnimatePresence } from "framer-motion";
import DraggableTodo from "./DraggableTodo";
import { Todo, Column } from "../store/kanbanStore";

interface KanbanColumnProps {
  title: string;
  column: Column;
  index: number;
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
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  onDropColumn: (columnId: number, newIndex: number) => void;
  columnEditMode: boolean;
  onRemoveColumn: () => void;
  onEditColumn: () => void;
}

const buttonVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  column,
  index,
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
  moveColumn,
  onDropColumn,
  columnEditMode,
  onRemoveColumn,
  onEditColumn,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // 컬럼 드래그 설정
  const [{ isDragging }, drag] = useDrag({
    type: "COLUMN",
    item: { type: "COLUMN", index, columnId: column.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 컬럼 드롭 설정
  const [{ isOverColumn }, dropColumn] = useDrop<
    { type: string; index: number; columnId: number },
    void,
    { isOverColumn: boolean }
  >({
    accept: "COLUMN",
    hover(item: { type: string; index: number; columnId: number }, monitor: DropTargetMonitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    drop: (item: { columnId: number }) => {
      onDropColumn(item.columnId, index);
    },
    collect: (monitor) => ({
      isOverColumn: monitor.isOver(),
    }),
  });

  // Todo 드롭 설정
  const [{ isOverTodo }, dropTodo] = useDrop<
    { index: number; todo: Todo },
    void,
    { isOverTodo: boolean }
  >({
    accept: "TODO",
    drop: (item: { index: number; todo: Todo }) => {
      if (item.todo.status !== status) {
        onDropTodo(item.todo, status);
      }
    },
    collect: (monitor) => ({
      isOverTodo: monitor.isOver(),
    }),
  });

  // 드래그와 드롭을 결합
  drag(dropColumn(dropTodo(ref)));

  const filteredTodos = todos.filter((todo) => !todo.is_error);

  return (
    <div
      ref={ref}
      className={classNames(
        "w-full md:w-80 bg-[#1B1A1D] pb-4 rounded-md flex flex-col transform transition-all duration-300 mx-2",
        {
          "brightness-150 shadow-2xl": isOverTodo || isOverColumn || isDragging,
          "shadow-[0px_2px_4px_#141416,0px_4px_4px_#222224]": true,
          "hover:-translate-y-0.5": !isOverTodo && !isOverColumn && !isDragging,
        }
      )}
      style={{ opacity: isDragging ? 0.5 : 1, perspective: "1000px" }}
    >
      <div className="relative flex items-center mb-2 px-3 pt-4">
        <button
          onClick={onAddTodo}
          className="text-xs px-3 py-1 bg-[#28272B] text-white rounded-lg hover:bg-gray-500 transition-all shadow-md"
        >
          Add
        </button>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h2
            className="font-semibold text-sm px-3 py-1 bg-[#28272B] rounded-md inline-block truncate whitespace-nowrap shadow-inner"
            style={{ color }}
          >
            {title}
          </h2>
        </div>
        <div className="ml-auto flex items-center justify-end gap-2 min-w-[100px]">
          <AnimatePresence>
            {columnEditMode && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={buttonVariants}
                transition={{ duration: 0.3 }}
                className="flex gap-2"
              >
                <button
                  onClick={onEditColumn}
                  className="text-xs z-50 px-3 py-1 bg-green-900 text-white rounded-lg shadow-md hover:bg-green-800 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={onRemoveColumn}
                  className="text-xs px-3 py-1 bg-red-900 text-white rounded-lg shadow-md hover:bg-red-800 transition-all"
                >
                  X
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto flex flex-col gap-2 px-3">
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