"use client";

import React from "react";
import { motion } from "framer-motion";
import { HexColorPicker } from "react-colorful";

interface ColumnModalProps {
  mode: "add" | "edit";
  titleInput: string;
  setTitleInput: (value: string) => void;
  colorInput: string;
  setColorInput: (value: string) => void;
  setShowColorPicker: (value: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
  overlayVariants?: any;
}

const ColumnModal: React.FC<ColumnModalProps> = ({
  mode,
  titleInput,
  setTitleInput,
  colorInput,
  setColorInput,
  setShowColorPicker,
  onCancel,
  onSubmit,
  overlayVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
}) => {
  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
        onClick={onCancel} // 바깥 영역 클릭 시 닫기
      >
        <motion.div
          className="bg-[#1B1A1D] pointer-events-auto rounded-lg p-6 text-white w-[15.5rem] shadow-lg"
          onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 이벤트 버블링 방지
        >
          <h2 className="text-lg font-semibold mb-4">
            {mode === "add" ? "새 컬럼 추가" : "컬럼 수정"}
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              className="border border-white px-2 py-1 rounded text-white bg-transparent"
              placeholder="컬럼명을 입력하세요"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
            />

            <input
              type="text"
              readOnly
              className="border cursor-pointer border-white px-2 py-1 rounded text-white bg-transparent"
              value={colorInput}
            />
            <div className="flex flex-col gap-2 justify-around">
              <HexColorPicker
                color={colorInput}
                onChange={setColorInput}
                className="mt-2 relative"
              />
              <div
                className="w-full mt-2 h-[3rem]"
                style={{ backgroundColor: colorInput }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="px-3 py-1 text-xs rounded bg-[#28272B] hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSubmit();
                }}
                className="px-3 py-1 text-xs bg-blue-900 text-white rounded hover:bg-blue-800"
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default ColumnModal;
