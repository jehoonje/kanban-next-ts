"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface TodoModalProps {
  mode: "add" | "edit";
  titleInput: string;
  setTitleInput: (value: string) => void;
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  descriptionInput: string;
  setDescriptionInput: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  overlayVariants?: any;
}

const TodoModal: React.FC<TodoModalProps> = ({
  mode,
  titleInput,
  setTitleInput,
  dateRange,
  setDateRange,
  descriptionInput,
  setDescriptionInput,
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
          className="bg-[#1B1A1D] pointer-events-auto rounded-lg p-6 text-white w-[27.7rem] shadow-lg"
          onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 이벤트 버블링 방지
        >
          <h2 className="text-lg font-semibold mb-4">
            {mode === "add"
              ? "To-do 내용을 작성해주세요."
              : "To-do 내용을 수정합니다."}
          </h2>
          <div className="flex flex-col gap-4">
            {/* 제목 입력 */}
            <div className="flex items-center gap-2">
              <label className="text-sm whitespace-nowrap">제목:</label>
              <input
                type="text"
                className="border border-gray-400 bg-transparent px-2 py-1 rounded flex-1 text-white"
                placeholder="제목을 입력하세요"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
              />
            </div>
            {/* 날짜 선택 (시작 ~ 종료) */}
            <div className="flex items-center gap-2">
              <label className="text-sm whitespace-nowrap">날짜:</label>
              <DatePicker
                selected={dateRange[0]}
                onChange={(update: [Date | null, Date | null]) =>
                  setDateRange(update)
                }
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                
                selectsRange
                dateFormat="yyyy-MM-dd"
                className="border text-lg cursor-pointer border-gray-400 bg-transparent px-20 py-1 rounded text-white"
                placeholderText="YYYY-MM-DD ~ YYYY-MM-DD"
              />
            </div>
            {/* 설명 입력 */}
            <div className="flex items-center gap-2">
              <label className="text-sm whitespace-nowrap">설명:</label>
              <textarea
                className="border border-gray-400 bg-transparent px-2 py-1 rounded flex-1 text-white"
                placeholder="Todo 설명을 입력하세요"
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onCancel}
                className="px-3 py-1 text-xs rounded bg-[#28272B] hover:bg-[#29283C]"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSubmit();
                }}
                className="px-3 py-1 text-xs text-white rounded bg-blue-900 hover:bg-blue-800"
              >
                {mode === "add" ? "Save" : "Save"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default TodoModal;
