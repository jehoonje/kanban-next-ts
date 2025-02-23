"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { todoSchema } from "../../../../lib/schemas";
import { useKanbanStore, Todo, Column } from "../../../../store/kanbanStore";
import KanbanHeader from "../../../../components/KanbanHeader";
import KanbanBoard from "../../../../components/KanbanBoard";
import TodoModal from "../../../../components/TodoModal";
import ColumnModal from "../../../../components/ColumnModal";

export default function KanbanPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const boardId = params.id;
  const searchParams = useSearchParams();
  const userName = searchParams.get("user") || "";

  const {
    normalTodos: todos,
    boardName,
    editMode,
    deleteMode,
    errorMode,
    selectedForDelete,
    selectedForError,
    setBoardName,
    setNormalTodos: setTodos,
    addNormalTodo: addTodo,
    updateTodo,
    removeTodos,
    toggleEditMode,
    toggleDeleteMode,
    toggleErrorMode,
    toggleSelectDelete,
    toggleSelectError,
    clearSelectedDelete,
    clearSelectedError,
  } = useKanbanStore();

  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [titleInput, setTitleInput] = useState<string>("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [statusInput, setStatusInput] = useState<string>("todo");
  const [columns, setColumns] = useState<Column[]>([]);
  const [showNewColumnModal, setShowNewColumnModal] = useState<boolean>(false);
  const [newColTitle, setNewColTitle] = useState<string>("");
  const [newColColor, setNewColColor] = useState<string>("#FFFFFF");
  const [showColorPickerForNew, setShowColorPickerForNew] =
    useState<boolean>(false);
  const [showEditColumnModal, setShowEditColumnModal] =
    useState<boolean>(false);
  const [editCol, setEditCol] = useState<Column | null>(null);
  const [editColTitle, setEditColTitle] = useState<string>("");
  const [editColColor, setEditColColor] = useState<string>("#FFFFFF");
  const [showColorPickerForEdit, setShowColorPickerForEdit] =
    useState<boolean>(false);
  const [showUserList, setShowUserList] = useState<boolean>(false);
  const [boardUsers, setBoardUsers] = useState<{ id: number; name: string }[]>(
    []
  );

  useEffect(() => {
    const loadData = async () => {
      if (isLoading) {
        await fetchBoardName();
        await fetchTodos();
        await fetchColumns();
        setIsLoading(false);
      }
    };
    loadData();
  }, [boardId]);

  async function fetchBoardName() {
    const { data, error } = await supabase
      .from("boards")
      .select("name")
      .eq("id", boardId)
      .single();
    if (!error && data) {
      setBoardName(data.name);
    }
  }

  async function fetchTodos() {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("board_id", boardId);
    if (!error && data) {
      setTodos(data as Todo[]);
    }
  }

  async function fetchColumns() {
    const { data, error } = await supabase
      .from("kanban_columns")
      .select("*")
      .eq("board_id", boardId)
      .order("order", { ascending: true }); // order 기준으로 정렬

    if (error) {
      console.error("Error fetching columns:", error);
      return;
    }

    if (data && data.length === 0) {
      await createDefaultColumns();
    } else if (data) {
      console.log("Fetched columns:", data); // 디버깅용 로그 추가
      setColumns(data);
    }
  }

  async function createDefaultColumns() {
    const { data: existingColumns, error: checkError } = await supabase
      .from("kanban_columns")
      .select("title")
      .eq("board_id", boardId)
      .eq("status", "todo")
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing columns:", checkError);
      return;
    }

    if (existingColumns) {
      return;
    }

    const defaultColumns = [
      { title: "To-do", status: "todo", color: "#FFFFFF", order: 1 },
      { title: "In-Progress", status: "in-progress", color: "#FFFFFF", order: 2 },
      { title: "Done", status: "done", color: "#FFFFFF", order: 3 },
    ];

    const { data, error } = await supabase
      .from("kanban_columns")
      .insert(
        defaultColumns.map((col) => ({
          board_id: Number(boardId),
          title: col.title,
          status: col.status,
          color: col.color,
          order: col.order,
        }))
      )
      .select();

    if (error) {
      console.error("Error creating default columns:", error);
      return;
    }

    if (data) {
      setColumns(data);
    }
  }

  async function handleAddTodo() {
    try {
      const dateString =
        dateRange[0] && dateRange[1]
          ? format(dateRange[0], "yyyy-MM-dd") +
            " ~ " +
            format(dateRange[1], "yyyy-MM-dd")
          : null;
      const parsed = todoSchema.parse({
        title: titleInput,
        date: dateString || undefined,
        status: statusInput,
        description: descriptionInput,
      });
      const { data, error } = await supabase
        .from("todos")
        .insert([
          {
            board_id: Number(boardId),
            user_name: userName,
            title: parsed.title,
            status: parsed.status,
            date: parsed.date,
            description: parsed.description || "",
          },
        ])
        .select()
        .single();
      if (error) {
        console.error(error);
        return;
      }
      if (data) {
        addTodo(data as Todo);
      }
      setShowAddModal(false);
      setTitleInput("");
      setDateRange([null, null]);
      setDescriptionInput("");
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function handleUpdateTodo() {
    if (!editingTodo) return;
    try {
      const dateString =
        dateRange[0] && dateRange[1]
          ? format(dateRange[0], "yyyy-MM-dd") +
            " ~ " +
            format(dateRange[1], "yyyy-MM-dd")
          : null;
      const parsed = todoSchema.parse({
        title: titleInput,
        date: dateString || undefined,
        status: editingTodo.status,
        description: descriptionInput,
      });
      const { error } = await supabase
        .from("todos")
        .update({
          title: parsed.title,
          date: parsed.date,
          description: parsed.description || "",
        })
        .eq("id", editingTodo.id);
      if (error) {
        console.error(error);
        return;
      }
      updateTodo(editingTodo.id, {
        title: parsed.title,
        date: parsed.date,
        description: parsed.description || "",
      });
      setEditingTodo(null);
      toggleEditMode(false);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function handleDeleteTodos() {
    if (selectedForDelete.length === 0) {
      toggleDeleteMode(false);
      return;
    }
    if (errorMode === true) {
      toggleErrorMode(false);
    }
    const { error } = await supabase
      .from("todos")
      .delete()
      .in("id", selectedForDelete);
    if (error) {
      console.error(error);
      return;
    }
    removeTodos(selectedForDelete);
    clearSelectedDelete();
    toggleDeleteMode(false);
  }

  async function handleErrorTodos() {
    if (selectedForError.length === 0) {
      toggleErrorMode(false);
      return;
    }
    const { error } = await supabase
      .from("todos")
      .update({ is_error: true })
      .in("id", selectedForError);
    if (error) {
      console.error(error);
      return;
    }
    removeTodos(selectedForError);
    clearSelectedError();
    toggleErrorMode(false);
  }

  const confirmMoveToErrorRoom = () => {
    handleErrorTodos();
  };

  async function handleAddColumn() {
    if (!newColTitle) return;
    const status = newColTitle.toLowerCase().replace(/\s+/g, "-");

    try {
      const { data: existingColumns, error: fetchError } = await supabase
        .from("kanban_columns")
        .select("order")
        .eq("board_id", boardId)
        .order("order", { ascending: false })
        .limit(1);
      const newOrder = fetchError || !existingColumns ? 1 : existingColumns[0].order + 1;

      const { data, error } = await supabase
        .from("kanban_columns")
        .insert([
          {
            board_id: Number(boardId),
            title: newColTitle,
            status,
            color: newColColor,
            order: newOrder,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding column:", error.message);
        alert("컬럼 추가에 실패했습니다: " + error.message);
        return;
      }

      if (data) {
        setColumns((prev) => [...prev, data as Column]);
      }

      setShowNewColumnModal(false);
      setNewColTitle("");
      setNewColColor("#FFFFFF");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("컬럼 추가 중 오류가 발생했습니다.");
    }
  }

  async function handleEditColumn() {
    if (!editCol) return;
    const { error } = await supabase
      .from("kanban_columns")
      .update({ title: editColTitle, color: editColColor })
      .eq("id", editCol.id);
    if (error) {
      console.error(error);
    } else {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === editCol.id
            ? { ...col, title: editColTitle, color: editColColor }
            : col
        )
      );
    }
    setEditCol(null);
    setShowEditColumnModal(false);
  }

  async function removeColumn(colId: number) {
    const columnToDelete = columns.find((col) => col.id === colId);
    if (columnToDelete?.status === "todo") {
      alert("To-do 컬럼은 삭제할 수 없습니다.");
      return;
    }

    const isConfirmed = window.confirm("삭제하시겠습니까?");
    if (!isConfirmed) return;

    console.log("Attempting to delete column with ID:", colId);

    const { error } = await supabase
      .from("kanban_columns")
      .delete()
      .eq("id", colId);

    if (error) {
      console.error("Error deleting column:", error.message, error.details);
      alert("컬럼 삭제에 실패했습니다: " + error.message);
    } else {
      console.log("Column deleted successfully, updating state...");
      setColumns(columns.filter((col) => col.id !== colId));
    }
  }

  async function fetchBoardUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("id,name")
      .eq("board_id", boardId);
    if (!error && data) {
      setBoardUsers(data);
    }
  }

  useEffect(() => {
    fetchBoardUsers();
  }, [boardId]);

  const toggleUserList = () => {
    setShowUserList((prev) => !prev);
  };

  const switchUser = (name: string) => {
    router.push(`/board/${boardId}/kanban?user=${name}`);
    setShowUserList(false);
  };

  function moveTodo(dragIndex: number, hoverIndex: number, todo: Todo) {
    const columnTodos = todos.filter((t) => t.status === todo.status);
    const updated = Array.from(columnTodos);
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, removed);
    const otherTodos = todos.filter((t) => t.status !== todo.status);
    setTodos([...otherTodos, ...updated]);
  }

  async function handleDropTodo(todo: Todo, newStatus: string) {
    if (todo.status !== newStatus) {
      updateTodo(todo.id, { status: newStatus });
      const { error } = await supabase
        .from("todos")
        .update({ status: newStatus })
        .eq("id", todo.id);
      if (error) {
        console.error(error);
      }
    }
  }

  const onClickTodo = (todo: Todo) => {
    if (deleteMode) {
      toggleSelectDelete(todo.id);
    } else if (editMode) {
      setEditingTodo(todo);
      setTitleInput(todo.title);
      setDateRange([null, null]);
      setDescriptionInput(todo.description);
      setStatusInput(todo.status);
    } else if (errorMode) {
      toggleSelectError(todo.id);
    }
  };

  const onAddTodo = (status: string) => {
    setStatusInput(status);
    setDateRange([null, null]);
    setDescriptionInput("");
    setShowAddModal(true);
  };

  return (
    <div className="w-full min-h-screen bg-cover bg-center text-white">
      <KanbanHeader
        boardId={boardId}
        boardName={boardName}
        userName={userName}
        boardUsers={boardUsers}
        showUserList={showUserList}
        toggleUserList={toggleUserList}
        switchUser={switchUser}
        handleDeleteTodos={handleDeleteTodos}
        confirmMoveToErrorRoom={confirmMoveToErrorRoom}
        setShowNewColumnModal={setShowNewColumnModal}
        setEditingTodo={setEditingTodo}
      />

      <KanbanBoard
        columns={columns}
        todos={todos}
        editMode={editMode}
        deleteMode={deleteMode}
        errorMode={errorMode}
        selectedForDelete={selectedForDelete}
        selectedForError={selectedForError}
        onClickTodo={onClickTodo}
        onAddTodo={onAddTodo}
        moveTodo={moveTodo}
        onDropTodo={handleDropTodo}
        onRemoveColumn={removeColumn}
        onEditColumn={(col) => {
          setEditCol(col);
          setEditColTitle(col.title);
          setEditColColor(col.color);
          setShowEditColumnModal(true);
        }}
      />

      <AnimatePresence>
        {showAddModal && (
          <TodoModal
            mode="add"
            titleInput={titleInput}
            setTitleInput={setTitleInput}
            dateRange={dateRange}
            setDateRange={setDateRange}
            descriptionInput={descriptionInput}
            setDescriptionInput={setDescriptionInput}
            onCancel={() => setShowAddModal(false)}
            onSubmit={handleAddTodo}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editMode && editingTodo && (
          <TodoModal
            mode="edit"
            titleInput={titleInput}
            setTitleInput={setTitleInput}
            dateRange={dateRange}
            setDateRange={setDateRange}
            descriptionInput={descriptionInput}
            setDescriptionInput={setDescriptionInput}
            onCancel={() => {
              setEditingTodo(null);
              toggleEditMode(false);
            }}
            onSubmit={handleUpdateTodo}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewColumnModal && (
          <ColumnModal
            mode="add"
            titleInput={newColTitle}
            setTitleInput={setNewColTitle}
            colorInput={newColColor}
            setColorInput={setNewColColor}
            setShowColorPicker={setShowColorPickerForNew}
            onCancel={() => setShowNewColumnModal(false)}
            onSubmit={handleAddColumn}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditColumnModal && (
          <ColumnModal
            mode="edit"
            titleInput={editColTitle}
            setTitleInput={setEditColTitle}
            colorInput={editColColor}
            setColorInput={setEditColColor}
            setShowColorPicker={setShowColorPickerForEdit}
            onCancel={() => setShowEditColumnModal(false)}
            onSubmit={handleEditColumn}
          />
        )}
      </AnimatePresence>
    </div>
  );
}