// /app/board/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import TodoList from "../../../components/TodoList";

const BoardPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [board, setBoard] = useState<any>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("id", id)
        .single();
      setBoard(data);
    };

    fetchBoard();
  }, [id]);

  if (!board) return <div>Loading...</div>;

  return (
    <div>
      <h1>{board.name}</h1>
      <TodoList boardId={id} />
    </div>
  );
};

export default BoardPage;
