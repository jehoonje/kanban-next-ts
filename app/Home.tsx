"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BoardList from "../components/BoardList";
import { motion } from "framer-motion";

export default function Home({ initialBoards }: { initialBoards: any[] }) {
  const router = useRouter();
  const [boards, setBoards] = useState(initialBoards);

  // 이후 필요시 추가 갱신 로직 작성 가능

  const goToCreateBoard = () => {
    router.push("/create");
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-center">
      {/* 상단 h1 (고정된 위치) */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute text-[18px] pt-24 font-sans font-semibold text-gray-200"
      >
        Bridge knowledge and action with effective task management.
      </motion.h1>

      {/* 보드 목록과 + 버튼을 감싸는 컨테이너 (가운데 정렬) */}
      <motion.div
        className="flex items-center justify-center gap-10 flex-grow"
        layout
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <BoardList boards={boards} />
        <motion.button
          onClick={goToCreateBoard}
          className="border-2 rounded-lg text-white w-16 h-16 pb-1 flex justify-center items-center text-3xl hover:bg-gray-100 hover:text-black transition duration-300"
          layout
        >
          +
        </motion.button>
      </motion.div>
    </div>
  );
}
