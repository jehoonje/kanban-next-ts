// /app/components/TodoList.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import TodoCard from "./TodoCard";

const TodoList = ({ boardId }: { boardId: string }) => {
  const [todos, setTodos] = useState<any[]>([]);
  const [todoContent, setTodoContent] = useState("");

  const fetchTodos = async () => {
    const { data } = await supabase
      .from("todos")
      .select()
      .eq("boardId", boardId);
    setTodos(data || []);
  };

  useEffect(() => {
    fetchTodos();
  }, [boardId]);

  const addTodo = async () => {
    if (todoContent.trim() === "") return;
    const { data, error } = await supabase
      .from("todos")
      .insert([{ content: todoContent, boardId }])
      .single();
    if (!error) {
      setTodoContent("");
      fetchTodos();
    }
  };

  return (
    <div className="mt-4">
      <input
        type="text"
        value={todoContent}
        onChange={(e) => setTodoContent(e.target.value)}
        className="border p-2"
      />
      <button onClick={addTodo} className="bg-blue-500 text-white p-2">
        Add Todo
      </button>
      <div className="mt-6">
        {todos.map((todo) => (
          <TodoCard key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
};

export default TodoList;
