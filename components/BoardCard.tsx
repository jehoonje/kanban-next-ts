// /app/components/BoardCard.tsx

import { FC } from "react";
import Link from "next/link";

interface BoardCardProps {
  board: { id: number; name: string };
}

const BoardCard: FC<BoardCardProps> = ({ board }) => {
  return (
    <div className="flex items-center justify-between p-4 border mt-2">
      <div>{board.name}</div>
      <Link href={`/board/${board.id}`}>
        <button className="bg-blue-500 text-white p-2">Enter</button>
      </Link>
    </div>
  );
};

export default BoardCard;
