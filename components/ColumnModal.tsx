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
  showColorPicker: boolean;
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
  showColorPicker,
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onCancel}
      />
      <motion.div
        className="fixed top-1/3 left-1/3 bg-[#1B1A1D] backdrop-blur-lg pointer-events-auto rounded-lg p-6 text-white w-[90%] max-w-md shadow-lg"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
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
          <div className="flex flex-col">
            <input
              type="text"
              readOnly
              className="border cursor-pointer border-white px-2 py-1 rounded text-white bg-transparent"
              value={colorInput}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <HexColorPicker
                color={colorInput}
                onChange={setColorInput}
                className="mt-2"
              />
            )}
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
    </>
  );
};

export default ColumnModal;
