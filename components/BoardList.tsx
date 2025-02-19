// /app/components/BoardList.tsx

import { FC } from "react";
import BoardCard from "./BoardCard";

interface BoardListProps {
  boards: any[];
}

const BoardList: FC<BoardListProps> = ({ boards }) => {
  return (
    <div className="mt-6">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
};

export default BoardList;
