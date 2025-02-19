// /app/page.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import BoardList from "../components/BoardList";

const Home = () => {
  const [boardName, setBoardName] = useState("");
  const [boards, setBoards] = useState<any[]>([]);

  const fetchBoards = async () => {
    const { data } = await supabase.from("boards").select();
    setBoards(data || []);
  };

  const createBoard = async () => {
    if (boardName.trim() === "") return;

    const { data, error } = await supabase
      .from("boards")
      .insert([{ name: boardName }])
      .single();

    if (error) console.log(error);
    else {
      fetchBoards();
      setBoardName("");
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          className="border p-2"
        />
        <button onClick={createBoard} className="bg-blue-500 text-white p-2">
          + Create Board
        </button>
      </div>
      <BoardList boards={boards} />
    </div>
  );
};

export default Home;
