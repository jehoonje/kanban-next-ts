"use client";

import "../styles/global.css";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [fade, setFade] = useState(true);
  const pathname = usePathname();

  // pathname이 바뀔 때마다 페이드 아웃 → 인 처리
  useEffect(() => {
    // 일단 페이드 아웃
    setFade(false);

    // 약간의 지연 후 페이드 인
    const timeout = setTimeout(() => {
      setFade(true);
    }, 0);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <html lang="en">
      <head />
      {/* fade가 true일 때 opacity-100, false일 때 opacity-0 으로 트랜지션 */}
      <body
        className={`transition-opacity duration-500 ${
          fade ? "opacity-100" : "opacity-0"
        } w-screen h-screen flex justify-center items-center bg-gray-50 bg-cover bg-center bg-no-repeat`}
        style={{ backgroundImage: "url('/images/background.webp')" }}
      >
        {/* 4/5 레이아웃, 테두리+둥근모서리+가운데정렬 */}
        <motion.div
          key={pathname} // 페이지 변경마다 새로운 key를 적용하여 새로 고침
          className="w-4/5 h-4/5 rounded-md flex justify-center items-center relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </body>
    </html>
  );
}
