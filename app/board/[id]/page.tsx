"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { AnimatePresence, motion } from "framer-motion";

// 예: board 테이블에서 가져올 데이터 구조
interface Board {
  id: number;
  name: string;
}

// 예: users 테이블에서 가져올 데이터 구조
interface User {
  id: number;
  board_id: number;
  name: string;
}

export default function BoardPage({ params }: { params: { id: string } }) {
  const boardId = params.id;

  // 보드 및 유저 목록
  const [board, setBoard] = useState<Board | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // 선택된 유저 (Delete 시 어떤 유저를 삭제할지)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Add 모달 제어
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");

  // Delete 오버레이 제어
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);

  // 보드 및 유저 목록 불러오기
  async function fetchBoard() {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();
    if (!error && data) {
      setBoard(data);
    }
  }

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("board_id", boardId);
    if (!error && data) {
      setUsers(data);
    }
  }

  useEffect(() => {
    fetchBoard();
    fetchUsers();
  }, [boardId]);

  // 유저 추가 (체크버튼 클릭)
  async function handleAddUser() {
    if (!newUserName.trim()) return;
    const { data, error } = await supabase
      .from("users")
      .insert([{ board_id: boardId, name: newUserName }])
      .select()
      .single();

    if (!error && data) {
      // 로컬 상태에 추가
      setUsers((prev) => [...prev, data]);
    }
    setNewUserName("");
    setShowAddModal(false);
  }

  // Add 모달 바깥 클릭 → 취소
  function cancelAdd() {
    setShowAddModal(false);
    setNewUserName("");
  }

  // Delete 버튼 클릭 시 → 오버레이 띄우기 (단, 어떤 유저인지 결정되어야 함)
  function handleDelete() {
    if (!selectedUser) {
      alert("삭제할 유저가 선택되지 않았습니다.");
      return;
    }
    setShowDeleteOverlay(true);
  }

  // Delete 오버레이 바깥 클릭 → 취소
  function cancelDelete() {
    setShowDeleteOverlay(false);
  }

  // 실제 삭제 (오버레이 중앙의 체크버튼)
  async function confirmDelete() {
    if (!selectedUser) return;
    const userId = selectedUser.id;

    const { error } = await supabase.from("users").delete().eq("id", userId);
    if (!error) {
      // 로컬 상태에서 제거
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
    setShowDeleteOverlay(false);
    setSelectedUser(null);
  }

  // 모션 설정 (모달/오버레이 페이드 인/아웃)
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center gap-10">
      {/* "Select your name" 문구 */}
      <h2 className="text-lg font-semibold">Select your name</h2>

      {/* 유저 목록: 버튼 형태 (Layout 적용으로 부드럽게 추가/삭제) */}
      <motion.div
        className="flex gap-4"
        layout
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        {users.map((user) => (
          <motion.button
            key={user.id}
            layout
            className={`border px-4 py-2 rounded-md ${
              selectedUser?.id === user.id ? "bg-gray-200" : ""
            }`}
            onClick={() => {
              // 유저 클릭 시: 해당 유저로 todolist(칸반) 링크
              // 실제 작업 대신 간단히 /board/칸반?user=xxx 로 이동
              // selectedUser로도 저장(삭제시 이용)
              setSelectedUser(user);
              window.location.href = `/board/${boardId}/todo?user=${user.name}`;
            }}
          >
            {user.name}
          </motion.button>
        ))}
      </motion.div>

      {/* Add / Delete 버튼 */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="border px-3 py-1 rounded"
        >
          Add
        </button>
        <button
          onClick={handleDelete}
          className="border px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>

      {/* =============== Add Modal =============== */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* 오버레이 (바깥 클릭 시 취소) */}
            <motion.div
              className="fixed top-0 left-0 w-full h-full bg-black/40"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={cancelAdd}
            />

            {/* 모달창 본체 */}
            <motion.div
              className="fixed top-1/2 left-1/2 bg-white rounded-md border p-6 flex flex-col gap-4"
              style={{ transform: "translate(-50%, -50%)" }}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="text-sm font-semibold">
                Add a new user (10 chars max)
              </h3>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  maxLength={10}
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                {/* 체크버튼 (클릭시 생성) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddUser();
                  }}
                  className="border px-3 py-1 rounded"
                >
                  ✓
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =============== Delete Overlay =============== */}
      <AnimatePresence>
        {showDeleteOverlay && selectedUser && (
          <>
            {/* 오버레이 (바깥 클릭 시 취소) */}
            <motion.div
              className="fixed top-0 left-0 w-full h-full bg-black/40"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={cancelDelete}
            />

            {/* 중앙 체크버튼 하나만 두어 클릭 시 삭제 */}
            <motion.div
              className="fixed top-1/2 left-1/2 flex flex-col items-center gap-4"
              style={{ transform: "translate(-50%, -50%)" }}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete();
                }}
                className="border px-4 py-2 bg-white rounded-md"
              >
                Confirm Delete {selectedUser.name}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
