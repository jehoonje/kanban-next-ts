"use client";

import Link from "next/link";

interface Board {
  id: number;
  name: string;
}

export default function BoardList({ boards }: { boards: Board[] }) {
  return (
    <div className="flex flex-wrap gap-8">
      {boards.map((board) => (
        <div
          key={board.id}
          className="flex flex-col items-center gap-2"
        >
          {/* 0% 박스 자체를 보드로 이동하는 링크로 */}
          <Link
            href={`/board/${board.id}`}
            className="w-16 h-16 border rounded-md flex justify-center items-center
                       hover:bg-gray-100 transition-colors duration-300
                       text-lg font-semibold"
          >
            0%
          </Link>

          {/* 보드 이름: 0% 박스 아래에 단순 텍스트 */}
          <div className="text-xs text-gray-800 font-medium">{board.name}</div>
        </div>
      ))}
    </div>
  );
}
