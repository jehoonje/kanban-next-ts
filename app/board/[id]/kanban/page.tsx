"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import classNames from "classnames";
import { todoSchema } from "../../../../lib/schemas";
import { useKanbanStore, Todo, Column } from "../../../../store/kanbanStore";
import KanbanColumn from "../../../../components/KanbanColumn";
import TodoModal from "../../../../components/TodoModal";
import ColumnModal from "../../../../components/ColumnModal";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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

  // Todo 관련 상태
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [titleInput, setTitleInput] = useState<string>("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [statusInput, setStatusInput] = useState<string>("todo");

  // Column 관련 상태
  const [columns, setColumns] = useState<Column[]>([]);
  const [columnEditMode, setColumnEditMode] = useState<boolean>(false);

  // Column 모달 상태
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

  useEffect(() => {
    fetchBoardName();
    fetchTodos();
    fetchColumns();
  }, [boardId]);

  // Error Mode: Todo를 에러룸으로 보내기 위한 모드
  const [errorModeActive, setErrorModeActive] = useState<boolean>(false);

  // User list
  const [showUserList, setShowUserList] = useState<boolean>(false);
  const [boardUsers, setBoardUsers] = useState<{ id: number; name: string }[]>(
    []
  );

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
      .order("id", { ascending: true });
    if (!error && data) {
      if ((data as Column[]).length === 0) {
        await createDefaultColumns();
      } else {
        setColumns(data as Column[]);
      }
    }
  }

  async function createDefaultColumns() {
    const defaultColumns = [
      { title: "To-do", status: "todo", color: "#FFFFFF" },
      { title: "In-Progress", status: "in-progress", color: "#FFFFFF" },
      { title: "Done", status: "done", color: "#FFFFFF" },
    ];
    for (const col of defaultColumns) {
      const { data, error } = await supabase
        .from("kanban_columns")
        .insert([
          {
            board_id: Number(boardId),
            title: col.title,
            status: col.status,
            color: col.color,
          },
        ])
        .single();
      if (error) {
        console.error(error);
      } else if (data) {
        setColumns((prev) => [...prev, data as Column]);
      }
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

  // Error mode: 선택된 Todo를 error room으로 보냄 (is_error = true)
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
    // 로컬 상태에서도 제거
    removeTodos(selectedForError);
    clearSelectedError();
    toggleErrorMode(false);
  }

  // Confirm Delete 로직: 선택된 Todo들 삭제 후, error room으로 이동
  const confirmMoveToErrorRoom = () => {
    handleErrorTodos();
  };

  async function handleAddColumn() {
    if (!newColTitle) return;
    const status = newColTitle.toLowerCase().replace(/\s+/g, "-");
    const tempColumn: Column = {
      id: Date.now(),
      board_id: Number(boardId),
      title: newColTitle,
      status,
      color: newColColor,
    };
    setColumns([...columns, tempColumn]);
    setShowNewColumnModal(false);
    setNewColTitle("");
    setNewColColor("#FFFFFF");

    const { data, error } = await supabase
      .from("kanban_columns")
      .insert([
        {
          board_id: Number(boardId),
          title: tempColumn.title,
          status,
          color: tempColumn.color,
        },
      ])
      .single();
    if (error) {
      console.error(error);
      setColumns((prev) => prev.filter((col) => col.id !== tempColumn.id));
    } else if (data) {
      setColumns((prev) =>
        prev.map((col) => (col.id === tempColumn.id ? (data as Column) : col))
      );
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
    const isConfirmed = window.confirm("삭제하시겠습니까?");
    if (!isConfirmed) return;
    const { error } = await supabase
      .from("kanban_columns")
      .delete()
      .eq("id", colId);
    if (error) {
      console.error(error);
    } else {
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

  // 아이콘(입장, 수정, 삭제) 모션 설정
  const userVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  };

  const editIconStyle = editMode ? "bg-[#9593a0]" : "bg-[#1B1A1D]";
  const deleteIconStyle = deleteMode ? "bg-[#9593a0]" : "bg-[#1B1A1D]";

  // react-dnd: 컬럼 내 순서 이동
  function moveTodo(dragIndex: number, hoverIndex: number, todo: Todo) {
    const columnTodos = todos.filter((t) => t.status === todo.status);
    const updated = Array.from(columnTodos);
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, removed);
    const otherTodos = todos.filter((t) => t.status !== todo.status);
    setTodos([...otherTodos, ...updated]);
    // DB 업데이트 추가 가능 (order 필드 등)
  }

  // react-dnd : 컬럼간 이동
  async function handleDropTodo(todo: Todo, newStatus: string) {
    if (todo.status !== newStatus) {
      updateTodo(todo.id, { status: newStatus });
      // DB 업데이트: Todo의 status 업데이트
      const { error } = await supabase
        .from("todos")
        .update({ status: newStatus })
        .eq("id", todo.id);
      if (error) {
        console.error(error);
      }
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full min-h-screen bg-cover bg-center text-white">
        {/* 상단 바 */}
        <div className="flex flex-col items-start ml-[1.1rem] py-2 bg-transparent">
          <h1 className="text-[2.5rem] py-3 font-bold mr-6">
            test {boardName ? boardName : ""}
          </h1>
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => router.push("/")}
              className="text-md font-bold px-14 py-0.5 bg-[#1B1A1D] text-white rounded mr-2 hover:bg-[#28272B] shadow-lg"
            >
              Home
            </button>
            <button
              onClick={() =>
                router.push(`/board/${boardId}/error?user=${userName}`)
              }
              className="text-md font-bold px-10 py-0.5 bg-[#1B1A1D] text-white rounded mr-2 hover:bg-[#28272B] shadow-lg"
            >
              Error Room
            </button>
            <button
              onClick={toggleUserList}
              className="text-md font-bold px-10 py-0.5 bg-[#1B1A1D] text-white rounded mr-2 hover:bg-[#28272B] shadow-lg"
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
                  <div className="relative bg-black/20 rounded shadow-lg flex gap-2">
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
            <div className="relative flex items-center gap-2 ml-auto">
              <button
                onClick={() => {
                  if (!editMode) {
                    toggleDeleteMode(false);
                    toggleErrorMode(false);
                  }
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
                  if (deleteMode) {
                    clearSelectedDelete();
                  }
                  toggleDeleteMode();
                  if (errorMode || editMode) {
                    toggleErrorMode(false); 
                    toggleEditMode(false);
                  }
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
                  if (errorMode) {
                    clearSelectedError(); // 삭제 모드가 활성화된 경우 비활성화
                  }
                  toggleErrorMode(); 
                  if (deleteMode || editMode) {
                    toggleDeleteMode(false);
                    toggleEditMode(false);
                  }
                }}
                className={classNames(
                  "text-sm px-3 py-1 bg-[#1B1A1D] hover:bg-[#28272B] rounded transition-colors",
                  errorMode ? "bg-[#9593a0]" : "bg-[#1B1A1D]"
                )}
              >
                ⚠️
              </button>
              <button
                onClick={() => setColumnEditMode(!columnEditMode)}
                className="text-sm px-3 py-1 bg-[#1B1A1D] hover:bg-[#28272B] text-white rounded"
              >
                {columnEditMode ? "Done Columns" : "Edit Columns"}
              </button>
              <button
                onClick={() => setShowNewColumnModal(true)}
                className="relative mr-[1.1rem] text-sm px-3 py-1 bg-[#1B1A1D] hover:bg-[#28272B] text-white rounded"
              >
                New Kanban
              </button>
            </div>
          </div>
        </div>

        {/* 삭제모드 설정 */}
        {deleteMode && (
          <div className="absolute right-0 mr-[1.1rem] bottom-full rounded text-white px-8 bg-[#1B1A1D]">
            <button onClick={handleDeleteTodos} className="text-lg">
              Confirm Delete
            </button>
          </div>
        )}

        {/* 에러모드 설정 */}
        {errorMode && (
          <div className="absolute right-0 mr-[1.1rem] bottom-full rounded text-white px-8 bg-[#1B1A1D]">
            <button onClick={confirmMoveToErrorRoom} className="text-lg">
              Confirm Error
            </button>
          </div>
        )}

        {/* 메인 칼럼 영역 */}
        <div className="flex justify-center gap-4 px-4 pt-2 py-6">
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
              onClickTodo={(todo) => {
                if (deleteMode) {
                  toggleSelectDelete(todo.id);
                } else if (editMode) {
                  setEditingTodo(todo);
                  setTitleInput(todo.title);
                  setDateRange([null, null]);
                  setDescriptionInput(todo.description);
                  setStatusInput(todo.status);
                } else if (errorMode) {
                  toggleSelectError(todo.id); // 클릭 시 todo 선택
                }
              }}
              onAddTodo={() => {
                setStatusInput(col.status);
                setDateRange([null, null]);
                setDescriptionInput("");
                setShowAddModal(true);
              }}
              moveTodo={moveTodo}
              onDropTodo={handleDropTodo}
              columnEditMode={columnEditMode}
              onRemoveColumn={() => removeColumn(col.id)}
              onEditColumn={() => {
                setEditCol(col);
                setEditColTitle(col.title);
                setEditColColor(col.color);
                setShowEditColumnModal(true);
              }}
            />
          ))}
        </div>

        {/* ── Add Todo Modal ── */}
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

        {/* ── Edit Todo Modal ── */}
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

        {/* ── New Column Modal ── */}
        <AnimatePresence>
          {showNewColumnModal && (
            <ColumnModal
              mode="add"
              titleInput={newColTitle}
              setTitleInput={setNewColTitle}
              colorInput={newColColor}
              setColorInput={setNewColColor}
              showColorPicker={showColorPickerForNew}
              setShowColorPicker={setShowColorPickerForNew}
              onCancel={() => setShowNewColumnModal(false)}
              onSubmit={handleAddColumn}
            />
          )}
        </AnimatePresence>

        {/* ── Edit Column Modal ── */}
        <AnimatePresence>
          {showEditColumnModal && (
            <ColumnModal
              mode="edit"
              titleInput={editColTitle}
              setTitleInput={setEditColTitle}
              colorInput={editColColor}
              setColorInput={setEditColColor}
              showColorPicker={showColorPickerForEdit}
              setShowColorPicker={setShowColorPickerForEdit}
              onCancel={() => setShowEditColumnModal(false)}
              onSubmit={handleEditColumn}
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}
