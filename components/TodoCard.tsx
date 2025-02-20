// /app/components/TodoCard.tsx

"use client";

import { FC } from "react";

interface TodoCardProps {
  todo: { id: number; content: string };
}

const TodoCard: FC<TodoCardProps> = ({ todo }) => {
  return (
    <div className="flex justify-between items-center border p-2 mt-2">
      <span>{todo.content}</span>
      <button className="bg-red-500 text-white p-1">Delete</button>
    </div>
  );
};

export default TodoCard;
