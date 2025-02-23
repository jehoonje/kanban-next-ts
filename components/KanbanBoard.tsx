"use client";

import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import KanbanColumn from "./KanbanColumn";
import { Todo, Column } from "../store/kanbanStore";
import { useKanbanStore } from "../store/kanbanStore";
import { supabase } from "../lib/supabase";

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
  columns: initialColumns,
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
  const { columnEditMode, setColumns } = useKanbanStore();
  const [localColumns, setLocalColumns] = useState<Column[]>(initialColumns);

  useEffect(() => {
    setLocalColumns(initialColumns);
  }, [initialColumns]);

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    const updatedColumns = [...localColumns];
    const [removed] = updatedColumns.splice(dragIndex, 1);
    updatedColumns.splice(hoverIndex, 0, removed);
    setLocalColumns(updatedColumns);
  };

  const onDropColumn = async (columnId: number, newIndex: number) => {
    const updatedColumns = [...localColumns];
    const columnToMove = updatedColumns.find((col) => col.id === columnId);
    if (!columnToMove) return;
  
    const oldIndex = updatedColumns.indexOf(columnToMove);
    updatedColumns.splice(oldIndex, 1);
    updatedColumns.splice(newIndex, 0, columnToMove);
  
    const columnsWithOrder = updatedColumns.map((col, idx) => ({
      ...col,
      order: idx,
    }));
  
    setLocalColumns(columnsWithOrder);
    setColumns(columnsWithOrder);
  
    try {
      const updates = await Promise.all(
        columnsWithOrder.map((col) =>
          supabase.from("kanban_columns").update({ order: col.order }).eq("id", col.id)
        )
      );
      updates.forEach((update, idx) => {
        if (update.error) {
          console.error(`Failed to update column ${columnsWithOrder[idx].id}:`, update.error);
        }
      });
      console.log("Order updates successful:", updates);
    } catch (error) {
      console.error("Error updating column order:", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-wrap justify-center gap-4 px-4 pt-2 py-6">
        {localColumns.map((col, index) => (
          <KanbanColumn
            key={col.id}
            title={col.title}
            status={col.status}
            color={col.color}
            column={col}
            index={index}
            todos={todos.filter((t) => t.status === col.status)}
            editMode={editMode}
            deleteMode={deleteMode}
            errorMode={errorMode}
            selectedForDelete={selectedForDelete}
            selectedForError={selectedForError}
            onClickTodo={onClickTodo}
            onAddTodo={onAddTodo}
            moveTodo={moveTodo}
            onDropTodo={onDropTodo}
            moveColumn={moveColumn}
            onDropColumn={onDropColumn}
            columnEditMode={columnEditMode}
            onRemoveColumn={onRemoveColumn}
            onEditColumn={onEditColumn}
          />
        ))}
      </div>
    </DndProvider>
  );
}