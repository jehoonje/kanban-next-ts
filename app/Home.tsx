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
    <div className="w-full h-full flex flex-col justify-start items-center pt-20">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-[18px] font-sans font-semibold text-gray-700 pt-4 mb-[120px]"
      >
        Bridge knowledge and action with effective task management.
      </motion.h1>

      <motion.div 
        className="flex items-start gap-10"
        layout
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <BoardList boards={boards} />
        <motion.button
          onClick={goToCreateBoard}
          className="bg-transparent border pb-1 text-black w-16 h-16 rounded flex justify-center items-center text-3xl hover:bg-gray-100 transition duration-300"
          layout
        >
          +
        </motion.button>
      </motion.div>
    </div>
  );
}
