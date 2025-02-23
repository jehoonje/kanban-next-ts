"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  board_id: number;
  name: string;
}

export default function BoardPage({ params }: { params: { id: string } }) {
  const boardId = params.id;
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);
  const [newUserName, setNewUserName] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [boardId]);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("board_id", boardId);

    if (!error && data) {
      setUsers(data);
    }
  }

  async function handleAddUser() {
    if (!newUserName.trim()) return;
    const { data, error } = await supabase
      .from("users")
      .insert([{ board_id: boardId, name: newUserName }])
      .select()
      .single();

    if (!error && data) {
      setUsers((prev) => [...prev, data]);
    }
    setNewUserName("");
    setShowAddModal(false);
  }

  function toggleDeleteOverlay() {
    setShowDeleteOverlay((prev) => !prev);
    setSelectedUserId(null);
  }

  async function confirmDelete() {
    if (!selectedUserId) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", selectedUserId);

    if (!error) {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUserId));
    }
    setShowDeleteOverlay(false);
  }

  const handleGoBack = () => {
    router.push("/");
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="relative text-white w-full h-full flex flex-col justify-center items-center gap-10">
      <button
        onClick={handleGoBack}
        className="absolute z-50 top-2 left-2 bg-transparent text-gray-300 px-2 py-1 text-sm rounded hover:text-gray-100"
      >
        Back
      </button>

      <h2 className="text-lg font-semibold">Select your name</h2>

      <motion.div
        className="flex gap-4"
        layout
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        {users.map((user) => (
          <motion.button
            key={user.id}
            layout
            className={`border-2 px-4 py-2 hover:bg-gray-100 hover:text-black rounded-md ${
              showDeleteOverlay && selectedUserId === user.id
                ? "bg-red-300 hover:bg-red-300"
                : ""
            }`}
            onClick={() => {
              if (showDeleteOverlay) {
                setSelectedUserId(user.id);
              } else {
                // 여기서 Kanban 페이지로 이동
                // user.name을 쿼리로 넘겨서 해당 유저 정보 활용
                window.location.href = `/board/${boardId}/kanban?user=${user.name}`;
              }
            }}
          >
            {user.name}
          </motion.button>
        ))}
      </motion.div>

      <div className="flex text-xs gap-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1 rounded bg-gray-300 text-black hover:bg-gray-200"
        >
          Add
        </button>
        <button
          onClick={toggleDeleteOverlay}
          className="px-3 py-1 rounded bg-gray-300 text-black hover:bg-gray-200"
        >
          Delete
        </button>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              className="fixed top-0 left-0 w-full h-full bg-black/40"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 px-20 py-20 bg-transparent backdrop-blur-lg rounded-md flex flex-col gap-4"
              style={{ transform: "translate(-50%, -50%)" }}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="text-sm text-white font-semibold">
                추가하실 이름을 작성해주세요. ( 10글자 내 )
              </h3>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  maxLength={10}
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="bg-[#29282D] px-2 py-1 rounded"
                />
                <button
                  onClick={handleAddUser}
                  className="bg-[#29282D] px-3 py-1 rounded"
                >
                  ✓
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Overlay */}
      <AnimatePresence>
        {showDeleteOverlay && (
          <>
            <motion.div
              className="fixed top-0 left-0 w-full h-full bg-black/40"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={toggleDeleteOverlay}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 flex flex-col items-center gap-4 bg-transparent backdrop-blur-lg p-6 rounded-md"
              style={{ transform: "translate(-50%, -50%)" }}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="text-sm text-white font-semibold">
                삭제 할 이름을 선택해주세요.
              </h3>
              <motion.div className="flex mt-4 gap-4">
                {users.map((user) => (
                  <motion.button
                    key={user.id}
                    layout
                    className={`border-2 bg-white text-black px-4 py-2 rounded-md ${
                      selectedUserId === user.id ? "bg-gray-200" : ""
                    }`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    {user.name}
                  </motion.button>
                ))}
              </motion.div>

              <button onClick={confirmDelete} className="text-2xl">
                ✅
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
