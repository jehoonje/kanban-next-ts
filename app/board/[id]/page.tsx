"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function BoardPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [board, setBoard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userName, setUserName] = useState("");

  // 보드 정보 불러오기
  const fetchBoard = async () => {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) {
      setBoard(data);
    }
  };

  // 보드에 속한 사용자들 조회
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("board_id", id);
    if (!error && data) {
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchBoard();
    fetchUsers();
  }, [id]);

  // 사용자 추가
  const handleAddUser = async () => {
    if (!userName) return;
    const { data, error } = await supabase
      .from("users")
      .insert([{ board_id: id, name: userName }]);
    if (error) {
      console.error("사용자 추가 오류:", error);
    } else {
      setUserName("");
      setShowAddUser(false);
      fetchUsers();
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-4 p-4">
      <h1 className="text-2xl font-bold">{board?.name}</h1>

      <div>
        <h2 className="text-lg font-semibold">Users:</h2>
        <ul className="list-disc pl-5">
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </div>

      {/* 사용자 이름 선택 버튼 + 작은 + 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAddUser((prev) => !prev)}
          className="bg-gray-200 p-2 rounded-md"
        >
          사용자 추가
        </button>
        <button
          onClick={() => setShowAddUser(true)}
          className="border border-gray-400 rounded-md w-10 h-10 flex justify-center items-center text-xl hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* 사용자 추가 입력창 팝업 */}
      {showAddUser && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="사용자 이름"
            className="border p-2 rounded-md"
          />
          <button
            onClick={handleAddUser}
            className="bg-blue-500 text-white p-2 rounded-md"
          >
            Add User
          </button>
        </div>
      )}
    </div>
  );
}
