// /app/components/BoardCard.tsx
import { FC } from "react";
import Link from "next/link";

interface BoardCardProps {
  board: { id: number; name: string };
}

const BoardCard: FC<BoardCardProps> = ({ board }) => {
  return (
    <div className="flex justify-between items-center p-4 border mt-4 rounded-md transition-fade bg-gray-50 hover:bg-gray-100">
      <div className="text-lg font-semibold">{board.name}</div>
      <Link href={`/board/${board.id}`}>
        <button className="bg-blue-500 text-white p-2 rounded-md">
          Enter
        </button>
      </Link>
    </div>
  );
};

export default BoardCard;
