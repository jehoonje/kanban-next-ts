"use client";

import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import KanbanColumn from "./KanbanColumn";
import { Todo, Column } from "../store/kanbanStore";
import { useKanbanStore } from "../store/kanbanStore";

interface KanbanBoardProps {
  columns: Column[];
  todos: Todo[];
  editMode: boolean;
  deleteMode: boolean;
  errorMode: boolean;
  selectedForDelete: number[];
  selectedForError: number[];
  onClickTodo: (todo: Todo) => void;
  onAddTodo: (status: string) => void;
  moveTodo: (dragIndex: number, hoverIndex: number, todo: Todo) => void;
  onDropTodo: (todo: Todo, newStatus: string) => void;
  onRemoveColumn: (colId: number) => void;
  onEditColumn: (col: Column) => void;
}

export default function KanbanBoard({
  columns,
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
  onRemoveColumn,
  onEditColumn,
}: KanbanBoardProps) {
  const { columnEditMode } = useKanbanStore();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-wrap justify-center gap-4 px-4 pt-2 py-6">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            title={col.title}
            status={col.status}
            color={col.color}
            todos={todos.filter((t) => t.status === col.status)}
            editMode={editMode}
            deleteMode={deleteMode}
            errorMode={errorMode}
            selectedForDelete={selectedForDelete}
            selectedForError={selectedForError}
            onClickTodo={onClickTodo}
            onAddTodo={() => onAddTodo(col.status)}
            moveTodo={moveTodo}
            onDropTodo={onDropTodo}
            columnEditMode={columnEditMode}
            onRemoveColumn={() => onRemoveColumn(col.id)}
            onEditColumn={() => onEditColumn(col)}
          />
        ))}
      </div>
    </DndProvider>
  );
}