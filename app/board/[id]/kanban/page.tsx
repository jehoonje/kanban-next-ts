"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { create } from "zustand";
import { z } from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import classNames from "classnames";
import { HexColorPicker } from "react-colorful";

// ====================== zod 스키마 ======================
// date를 string으로 받고, description을 추가 (모달에서 선택한 날짜 범위를 문자열로 저장)
const todoSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요").max(100, "최대 100자"),
  date: z.string().optional(),
  status: z.string(), // 칼럼 상태(추후 자동 지정)
  description: z.string().optional(),
});

// ====================== 타입 정의 ======================
interface Board {
  id: number;
  name: string;
}

interface Todo {
  id: number;
  board_id: number;
  user_name: string;
  title: string;
  status: string;
  date?: string | null;
  description: string;
}

// 컬럼 타입 (DB에 저장)
export interface Column {
  id: number;
  board_id: number;
  title: string;
  status: string;
  color: string;
}

interface KanbanState {
  todos: Todo[];
  boardName: string;
  editMode: boolean;
  deleteMode: boolean;
  selectedForDelete: number[];

  setBoardName: (name: string) => void;
  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (id: number, data: Partial<Todo>) => void;
  removeTodos: (ids: number[]) => void;
  toggleEditMode: (value?: boolean) => void;
  toggleDeleteMode: (value?: boolean) => void;
  toggleSelectDelete: (id: number) => void;
  clearSelectedDelete: () => void;
}

const useKanbanStore = create<KanbanState>((set) => ({
  todos: [],
  boardName: "",
  editMode: false,
  deleteMode: false,
  selectedForDelete: [],
  setBoardName: (name) => set({ boardName: name }),
  setTodos: (todos) => set({ todos }),
  addTodo: (todo) =>
    set((state) => ({
      todos: [...state.todos, todo],
    })),
  updateTodo: (id, data) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  removeTodos: (ids) =>
    set((state) => ({
      todos: state.todos.filter((t) => !ids.includes(t.id)),
    })),
  toggleEditMode: (value) =>
    set((state) => ({ editMode: value !== undefined ? value : !state.editMode })),
  toggleDeleteMode: (value) =>
    set((state) => ({ deleteMode: value !== undefined ? value : !state.deleteMode })),
  toggleSelectDelete: (id) =>
    set((state) => {
      const isSelected = state.selectedForDelete.includes(id);
      return {
        selectedForDelete: isSelected
          ? state.selectedForDelete.filter((item) => item !== id)
          : [...state.selectedForDelete, id],
      };
    }),
  clearSelectedDelete: () => set({ selectedForDelete: [] }),
}));

// ====================== KanbanPage 컴포넌트 ======================
export default function KanbanPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const boardId = params.id;
  const searchParams = useSearchParams();
  const userName = searchParams.get("user") || "";

  const {
    todos,
    boardName,
    editMode,
    deleteMode,
    selectedForDelete,
    setBoardName,
    setTodos,
    addTodo,
    updateTodo,
    removeTodos,
    toggleEditMode,
    toggleDeleteMode,
    toggleSelectDelete,
    clearSelectedDelete,
  } = useKanbanStore();

  // Todo 관련 상태
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [titleInput, setTitleInput] = useState<string>("");
  // dateRange: [startDate, endDate]
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  // description state 추가
  const [descriptionInput, setDescriptionInput] = useState<string>("");

  // 기존 statusInput는 칼럼에서 자동 지정하므로 그대로 유지
  const [statusInput, setStatusInput] = useState<string>("todo");

  // 컬럼 관련 상태 (DB에서 불러옴)
  const [columns, setColumns] = useState<Column[]>([]);
  const [columnEditMode, setColumnEditMode] = useState<boolean>(false);

  // 새 컬럼 추가 모달
  const [showNewColumnModal, setShowNewColumnModal] = useState<boolean>(false);
  const [newColTitle, setNewColTitle] = useState<string>("");
  const [newColColor, setNewColColor] = useState<string>("#FFFFFF");
  const [showColorPickerForNew, setShowColorPickerForNew] = useState<boolean>(false);

  // 컬럼 수정 모달
  const [showEditColumnModal, setShowEditColumnModal] = useState<boolean>(false);
  const [editCol, setEditCol] = useState<Column | null>(null);
  const [editColTitle, setEditColTitle] = useState<string>("");
  const [editColColor, setEditColColor] = useState<string>("#FFFFFF");
  const [showColorPickerForEdit, setShowColorPickerForEdit] = useState<boolean>(false);

  useEffect(() => {
    fetchBoardName();
    fetchTodos();
    fetchColumns();
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

  // Add Todo: 날짜 범위를 문자열로 변환 (예: "2024-12-23 ~ 2025-01-01")
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

  // Edit Todo: 업데이트 시 날짜 범위를 문자열로 변환하고 description 수정
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
        status: editingTodo.status, // 상태는 그대로 유지
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

  const goHome = () => {
    router.push("/");
  };

  const goErrorRoom = () => {
    alert("Error room은 아직 구현되지 않았습니다.");
  };

  const [showUserList, setShowUserList] = useState<boolean>(false);
  const [boardUsers, setBoardUsers] = useState<{ id: number; name: string }[]>([]);
  const toggleUserList = () => {
    setShowUserList((prev) => !prev);
  };

  useEffect(() => {
    fetchBoardUsers();
  }, [boardId]);

  async function fetchBoardUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("id,name")
      .eq("board_id", boardId);
    if (!error && data) {
      setBoardUsers(data);
    }
  }

  const switchUser = (name: string) => {
    router.push(`/board/${boardId}/kanban?user=${name}`);
    setShowUserList(false);
  };

  const editIconStyle = editMode ? "bg-[#28272B]" : "bg-[#1B1A1D]";
  const deleteIconStyle = deleteMode ? "bg-[#28272B]" : "bg-[#1B1A1D]";

  // ── 컬럼 추가/수정 모달 관련 ──

  // 새 컬럼 추가 (모달에서 처리, optimistic update)
  async function handleAddColumn() {
    if (!newColTitle) return;
    const status = newColTitle.toLowerCase().replace(/\s+/g, "-");
    // optimistic update: 임시 ID 생성
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
      // 실패 시 rollback
      setColumns((prev) => prev.filter((col) => col.id !== tempColumn.id));
    } else if (data) {
      // DB에서 반환한 ID로 업데이트
      setColumns((prev) =>
        prev.map((col) => (col.id === tempColumn.id ? (data as Column) : col))
      );
    }
  }

  // 컬럼 수정 (모달에서 처리)
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
          col.id === editCol.id ? { ...col, title: editColTitle, color: editColColor } : col
        )
      );
    }
    setEditCol(null);
    setShowEditColumnModal(false);
  }

  // 컬럼 삭제 (DB DELETE)
  async function removeColumn(colId: number) {
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

  const userVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/background.webp')" }}
    >
      {/* 상단 바 */}
      <div className="flex flex-col items-start ml-[1.1rem] py-2 bg-transparent">
        <h1 className="text-[2.5rem] py-3 font-bold mr-6">
          test {boardName ? boardName : ""}
        </h1>
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={goHome}
            className="text-md font-bold px-14 py-0.5 bg-[#1B1A1D] text-white rounded mr-2 hover:bg-[#28272B] shadow-lg"
          >
            Home
          </button>
          <button
            onClick={goErrorRoom}
            className="text-md font-bold px-10 py-0.5 bg-[#1B1A1D] text-white rounded mr-2 hover:bg-[#28272B] shadow-lg"
          >
            Error room
          </button>
          <button
            onClick={toggleUserList}
            className="text-md font-bold px-10 py-0.5 bg-[#1B1A1D] text-white rounded mr-2 hover:bg-[#28272B] shadow-lg"
          >
            Switch User
          </button>
          {showUserList && (
            <motion.div
              className="absolute bottom-full left-1/3 bg-black/20 rounded shadow-lg flex gap-2"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={userVariants}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {boardUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u.name)}
                  className="px-2 py-1 bg-gray-200 text-black rounded"
                >
                  {u.name}
                </button>
              ))}
            </motion.div>
          )}
          <div className="flex items-center gap-2 ml-auto">
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
                if (deleteMode) {
                  clearSelectedDelete();
                }
                toggleDeleteMode();
              }}
              className={classNames(
                "text-sm px-3 py-1 bg-[#1B1A1D] hover:bg-[#28272B] rounded transition-colors",
                deleteIconStyle
              )}
            >
              🗑️
            </button>
            <button className="text-sm px-3 py-1 bg-[#1B1A1D] hover:bg-[#28272B] rounded">
              ⚠️
            </button>
            <button
              onClick={() => setColumnEditMode(!columnEditMode)}
              className="text-sm px-3 py-1 mr-[1.1rem] bg-[#1B1A1D] hover:bg-[#28272B] text-white rounded"
            >
              {columnEditMode ? "Done Columns" : "Edit Columns"}
            </button>
            {columnEditMode && (
              <button
                onClick={() => setShowNewColumnModal(true)}
                className="absolute bottom-full right-0 mr-[1.1rem] text-sm px-3 py-1 bg-[#1B1A1D] hover:bg-[#28272B] text-white rounded"
              >
                New Kanban
              </button>
            )}
          </div>
        </div>
      </div>

      {deleteMode && (
        <div className="absolute right-0 bottom-full rounded text-white px-8 bg-[#1B1A1D]">
          <button onClick={handleDeleteTodos} className="text-lg">
            Confirm Delete
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
            selectedForDelete={selectedForDelete}
            onClickTodo={(todo) => {
              if (deleteMode) {
                toggleSelectDelete(todo.id);
              } else if (editMode) {
                setEditingTodo(todo);
                setTitleInput(todo.title);
                // Todo 수정 시 기존 날짜 문자열은 파싱이 어려우므로 초기화
                setDateRange([null, null]);
                setDescriptionInput(todo.description);
                setStatusInput(todo.status);
              }
            }}
            onAddTodo={() => {
              setStatusInput(col.status);
              // 모달 오픈 시, 날짜 범위 및 설명 초기화
              setDateRange([null, null]);
              setDescriptionInput("");
              setShowAddModal(true);
            }}
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
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 bg-[#1B1A1D] backdrop-blur-lg rounded-lg p-6 text-white w-[90%] max-w-md"
              style={{ transform: "translate(-50%, -50%)" }}
              variants={overlayVariants}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="text-lg font-semibold mb-4">새 Todo 추가</h2>
              <div className="flex flex-col gap-4">
                {/* 제목 입력 */}
                <div className="flex items-center gap-2">
                  <label className="text-sm whitespace-nowrap w-16">제목:</label>
                  <input
                    type="text"
                    className="border border-gray-400 bg-transparent px-2 py-1 rounded flex-1 text-white"
                    placeholder="제목을 입력하세요"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                  />
                </div>
                {/* 날짜 선택 (시작 ~ 종료) */}
                <div className="flex items-center gap-2">
                  <label className="text-sm whitespace-nowrap w-16">날짜:</label>
                  <DatePicker
                    selected={dateRange[0]}
                    onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
                    startDate={dateRange[0]}
                    endDate={dateRange[1]}
                    selectsRange
                    dateFormat="yyyy-MM-dd"
                    className="border border-gray-400 bg-transparent px-2 py-1 rounded flex-1 text-white"
                    placeholderText="YYYY-MM-DD ~ YYYY-MM-DD"
                  />
                </div>
                {/* 설명 입력 */}
                <div className="flex items-center gap-2">
                  <label className="text-sm whitespace-nowrap w-16">설명:</label>
                  <textarea
                    className="border border-gray-400 bg-transparent px-2 py-1 rounded flex-1 text-white"
                    placeholder="Todo 설명을 입력하세요"
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1 border rounded hover:bg-gray-600"
                  >
                    취소
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddTodo();
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-400"
                  >
                    저장
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Edit Todo Modal ── */}
      <AnimatePresence>
        {editMode && editingTodo && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => {
                setEditingTodo(null);
                toggleEditMode(false);
              }}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 bg-[#1B1A1D] backdrop-blur-lg rounded-lg p-6 text-white w-[90%] max-w-md"
              style={{ transform: "translate(-50%, -50%)" }}
              variants={overlayVariants}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2 className="text-lg font-semibold mb-4">To-do 수정</h2>
              <div className="flex flex-col gap-4">
                {/* 제목 입력 */}
                <div className="flex items-center gap-2">
                  <label className="text-sm whitespace-nowrap w-16">제목:</label>
                  <input
                    type="text"
                    className="border border-gray-400 bg-transparent px-2 py-1 rounded flex-1 text-white"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                  />
                </div>
                {/* 날짜 선택 (시작 ~ 종료) */}
                <div className="flex items-center gap-2">
                  <label className="text-sm whitespace-nowrap w-16">날짜:</label>
                  <DatePicker
                    selected={dateRange[0]}
                    onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
                    startDate={dateRange[0]}
                    endDate={dateRange[1]}
                    selectsRange
                    dateFormat="yyyy-MM-dd"
                    className="border border-gray-400 bg-transparent w-full px-2 py-1 rounded flex-1 text-white"
                    placeholderText="YYYY-MM-DD ~ YYYY-MM-DD"
                  />
                </div>
                {/* 설명 입력 */}
                <div className="flex items-center gap-2">
                  <label className="text-sm whitespace-nowrap w-16">설명:</label>
                  <textarea
                    className="border border-gray-400 bg-transparent px-2 py-1 rounded flex-1 text-white"
                    placeholder="Todo 설명을 입력하세요"
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingTodo(null);
                      toggleEditMode(false);
                    }}
                    className="px-3 py-1 border rounded hover:bg-gray-600"
                  >
                    취소
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateTodo();
                    }}
                    className="px-3 py-1 bg-[#28272B] text-white rounded hover:bg-gray-500"
                  >
                    수정
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── New Column Modal ── */}
      <AnimatePresence>
        {showNewColumnModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowNewColumnModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 bg-transparent rounded p-6 text-white"
              style={{ transform: "translate(-50%, -50%)" }}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-lg font-semibold mb-4">새 컬럼 추가</h2>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  className="border border-white px-2 py-1 rounded text-white bg-transparent"
                  placeholder="컬럼명을 입력하세요"
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                />
                <div className="flex flex-col">
                  <input
                    type="text"
                    readOnly
                    className="border border-white px-2 py-1 rounded text-white bg-transparent"
                    value={newColColor}
                    onClick={() =>
                      setShowColorPickerForNew(!showColorPickerForNew)
                    }
                  />
                  {showColorPickerForNew && (
                    <HexColorPicker
                      color={newColColor}
                      onChange={setNewColColor}
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowNewColumnModal(false)}
                    className="px-3 py-1 border rounded"
                  >
                    취소
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddColumn();
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    저장
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Edit Column Modal ── */}
      <AnimatePresence>
        {showEditColumnModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowEditColumnModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 bg-transparent rounded p-6 text-white"
              style={{ transform: "translate(-50%, -50%)" }}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-lg font-semibold mb-4">컬럼 수정</h2>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  className="border border-white px-2 py-1 rounded text-white bg-transparent"
                  placeholder="컬럼명을 입력하세요"
                  value={editColTitle}
                  onChange={(e) => setEditColTitle(e.target.value)}
                />
                <div className="flex flex-col">
                  <input
                    type="text"
                    readOnly
                    className="border border-white px-2 py-1 rounded text-white bg-transparent"
                    value={editColColor}
                    onClick={() =>
                      setShowColorPickerForEdit(!showColorPickerForEdit)
                    }
                  />
                  {showColorPickerForEdit && (
                    <HexColorPicker
                      color={editColColor}
                      onChange={setEditColColor}
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowEditColumnModal(false)}
                    className="px-3 py-1 border rounded"
                  >
                    취소
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditColumn();
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    저장
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ====================== KanbanColumn 컴포넌트 ======================
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
  // 컬럼 편집 모드일 때 수정/삭제 버튼 노출
  columnEditMode: boolean;
  onRemoveColumn: () => void;
  onEditColumn: () => void;
}

function KanbanColumn({
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
}: KanbanColumnProps) {
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
            style={{ color: color }}
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
}
