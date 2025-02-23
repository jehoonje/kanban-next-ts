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
    if (!columnToMove) {
      console.error("이동할 컬럼을 찾을 수 없음:", columnId);
      return;
    }

    const oldIndex = updatedColumns.indexOf(columnToMove);
    updatedColumns.splice(oldIndex, 1);
    updatedColumns.splice(newIndex, 0, columnToMove);

    const columnsWithOrder = updatedColumns.map((col, idx) => ({
      ...col,
      order: idx + 1, // order는 1부터 시작
    }));

    console.log("변경 전:", localColumns.map((col) => ({ id: col.id, order: col.order })));
    console.log("변경 후:", columnsWithOrder.map((col) => ({ id: col.id, order: col.order })));

    // UI 먼저 업데이트
    setLocalColumns(columnsWithOrder);
    setColumns(columnsWithOrder);

    // Supabase 업데이트
    try {
      const updatePromises = columnsWithOrder.map((col) =>
        supabase
          .from("kanban_columns")
          .update({ order: col.order })
          .eq("id", col.id)
          .select()
          .then((response) => {
            console.log(`컬럼 ${col.id} 업데이트 응답:`, response);
            return response;
          })
      );

      const updates = await Promise.all(updatePromises);

      const failedUpdates = updates.filter((update) => update.error);
      if (failedUpdates.length > 0) {
        failedUpdates.forEach((update) => {
          console.error("업데이트 실패:", update.error);
        });
        throw new Error("일부 컬럼 업데이트 실패");
      }

      console.log("모든 컬럼 업데이트 성공:", updates.map((u) => u.data));
    } catch (error) {
      console.error("Supabase 업데이트 오류:", error);
      setLocalColumns(localColumns);
      setColumns(localColumns);
      return;
    }

    // 데이터베이스 상태 확인
    const { data, error } = await supabase
      .from("kanban_columns")
      .select("id, order")
      .order("order");
    if (error) {
      console.error("데이터베이스 확인 오류:", error);
    } else {
      console.log("업데이트 후 데이터베이스 상태:", data);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-wrap justify-center gap-4 px-4 pt-2 py-6">
        {localColumns.map((col, index) => (
          <KanbanColumn
            key={col.id}
            title={col.title}
            column={col}
            index={index}
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
            moveColumn={moveColumn}
            onDropColumn={onDropColumn}
            columnEditMode={columnEditMode}
            onRemoveColumn={() => onRemoveColumn(col.id)}
            onEditColumn={() => onEditColumn(col)}
          />
        ))}
      </div>
    </DndProvider>
  );
}