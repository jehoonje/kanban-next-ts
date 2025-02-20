"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useStore } from "../store/useStore";
import BoardList from "../components/BoardList";
import { motion } from "framer-motion"; // Framer Motion 추가

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { boards, setBoards } = useStore();

  // 보드 목록 가져오기
  const fetchBoards = async () => {
    const { data, error } = await supabase.from("boards").select("*");
    if (!error && data) {
      setBoards(data);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const goToCreateBoard = () => {
    startTransition(() => {
      router.push("/create");
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-center pt-20">
      {/* Heading (애니메이션 적용) */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-[18px] font-sans font-semibold text-gray-700 pt-4 mb-[120px]"
      >
        Bridge knowledge and action with effective task management.
      </motion.h1>

      {/* 보드 목록 + 버튼 (부드럽게 정렬) */}
      <motion.div 
        className="flex items-start gap-4"
        layout // 레이아웃 변경 시 부드럽게 애니메이션 적용
        transition={{ type: "spring", stiffness: 100, damping: 15 }} // 스무스한 움직임
      >
        {/* 보드 목록 */}
        <BoardList boards={boards} />

        <motion.button
          onClick={goToCreateBoard}
          className="bg-transparent border ml-3 pb-1 text-black w-16 h-16 rounded flex justify-center items-center text-3xl hover:bg-gray-100 transition duration-300"
          layout // 이 버튼도 자연스럽게 이동
        >
          +
        </motion.button>
      </motion.div>

      {isPending && (
        <div className="absolute bottom-4 right-4 text-gray-500">
          Loading...
        </div>
      )}
    </div>
  );
}
