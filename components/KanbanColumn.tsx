"use client";

import React, { useRef } from "react";
import classNames from "classnames";
import { useDrag, useDrop } from "react-dnd";
import { motion, AnimatePresence } from "framer-motion";
import DraggableTodo from "./DraggableTodo";
import { Todo, Column } from "../store/kanbanStore";

interface KanbanColumnProps {
  title: string; // 컬럼 제목
  column: Column; // 컬럼 객체 (id, board_id, title, status, color, order 등 포함)
  index: number; // 컬럼의 현재 인덱스 (드래그 시 위치 계산용)
  status: string; // 컬럼의 상태 (예: "todo", "in-progress", "done")
  color: string; // 컬럼 제목의 텍스트 색상
  todos: Todo[]; // 해당 컬럼에 속한 Todo 항목 목록
  editMode: boolean; // 편집 모드 여부 (Todo 편집 가능)
  deleteMode: boolean; // 삭제 모드 여부 (Todo 선택 후 삭제 가능)
  errorMode: boolean; // 에러 모드 여부 (Todo를 에러 상태로 이동 가능)
  selectedForDelete: number[]; // 삭제 대상으로 선택된 Todo ID 목록
  selectedForError: number[]; // 에러 상태로 선택된 Todo ID 목록
  onClickTodo: (todo: Todo) => void; // Todo 클릭 시 호출되는 핸들러
  onAddTodo: (status: string) => void; // 새 Todo 추가 버튼 클릭 시 호출
  moveTodo: (dragIndex: number, hoverIndex: number, todo: Todo) => void; // Todo 드래그 시 위치 이동
  moveColumn: (dragIndex: number, hoverIndex: number) => void; // 컬럼 드래그 시 위치 이동
  onDropTodo: (todo: Todo, newStatus: string) => void; // Todo를 다른 컬럼으로 드롭 시 호출
  onDropColumn: (columnId: number, newIndex: number) => void; // 컬럼 드롭 시 호출 (order 저장)
  columnEditMode: boolean; // 컬럼 편집 모드 여부 (Edit, X 버튼 표시)
  onRemoveColumn: (colId: number) => void; // 컬럼 삭제 버튼 클릭 시 호출
  onEditColumn: (col: Column) => void; // 컬럼 편집 버튼 클릭 시 호출
}

const buttonVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  column,
  index,
  status,
  color,
  todos,
  editMode,
  deleteMode,
  errorMode,
  selectedForDelete,
  selectedForError,
  onClickTodo,
  onAddTodo,
  moveTodo,
  moveColumn,
  onDropTodo,
  onDropColumn,
  columnEditMode,
  onRemoveColumn,
  onEditColumn,
}) => {
  // ref를 사용해 DOM 요소를 참조 (드래그 앤 드롭을 위해 필요)
  const ref = useRef<HTMLDivElement>(null);

  // useDrag 훅: 컬럼을 드래그 가능하게 설정
  const [{ isDragging }, drag] = useDrag({
    type: "COLUMN", // 드래그 타입을 "COLUMN"으로 지정 (Todo와 구분)
    item: { type: "COLUMN", index, columnId: column.id }, // 드래그 시작 시 전달되는 데이터
    collect: (monitor) => ({
      isDragging: monitor.isDragging(), // 현재 드래그 중인지 상태 수집
    }),
  });

  // useDrop 훅: 컬럼을 드롭 대상으로 설정
  const [{ isOver }, drop] = useDrop({
    accept: ["TODO", "COLUMN"], // 수용 가능한 드래그 타입 (Todo와 Column 모두 허용)
    drop: (item: any) => { // 드롭 이벤트 발생 시 호출
      console.log("Dropped item:", item, "to index:", index); // 디버깅용: 드롭된 항목과 위치 로그
      if (item.type === "TODO" && item.todo.status !== status) { // Todo가 드롭된 경우
        onDropTodo(item.todo, status); // Todo의 status를 변경하고 저장
      } else if (item.type === "COLUMN") { // 컬럼이 드롭된 경우
        onDropColumn(item.columnId, index); // 컬럼의 order를 업데이트
      }
    },
    hover(item: any, monitor) { // 드래그 중 마우스가 컬럼 위에 있을 때 호출
      if (item.type !== "COLUMN" || !ref.current) return; // 컬럼 드래그가 아니거나 ref가 없으면 종료

      const dragIndex = item.index; // 드래그 중인 컬럼의 원래 인덱스
      const hoverIndex = index; // 현재 마우스가 있는 컬럼의 인덱스

      if (dragIndex === hoverIndex) return; // 같은 위치면 이동 불필요

      // 컬럼의 경계와 마우스 위치를 계산해 이동 조건 확인
      const hoverBoundingRect = ref.current.getBoundingClientRect(); // 컬럼의 DOM 위치 정보
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2; // 컬럼의 수평 중간점
      const clientOffset = monitor.getClientOffset(); // 마우스의 현재 좌표
      if (!clientOffset) return; // 좌표가 없으면 종료
      const hoverClientX = clientOffset.x - hoverBoundingRect.left; // 컬럼 내에서의 X 위치

      // 드래그 방향과 마우스 위치를 비교해 이동 여부 결정
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return; // 왼쪽에서 오른쪽인데 중간점 전이면 스킵
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return; // 오른쪽에서 왼쪽인데 중간점 후면 스킵
      
      moveColumn(dragIndex, hoverIndex); // 컬럼 위치를 화면에서 이동
      item.index = hoverIndex; // 드래그 중인 컬럼의 인덱스를 업데이트 (react-dnd 내부 상태 유지)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(), // 현재 드롭 대상 위에 마우스가 있는지 상태 수집
    }),
  });

  // drag와 drop을 ref에 적용 (드래그와 드롭을 동시에 가능하게 함)
  drag(drop(ref));

  // 에러 상태가 아닌 Todo만 필터링
  const filteredTodos = todos.filter((todo) => !todo.is_error);

  // JSX 반환: 컬럼 UI 렌더링
  return (
    <div
      ref={ref} // 드래그와 드롭을 위한 DOM 참조
      className={classNames(
        "w-full md:w-80 bg-[#1B1A1D] pb-4 rounded-md flex flex-col transform transition-all duration-300 mx-2", // 기본 스타일
        {
          "brightness-110 shadow-2xl": isDragging || isOver, // 드래그 중이거나 드롭 대상일 때 밝기와 그림자 효과
          "shadow-[0px_2px_4px_#141416,0px_4px_4px_#222224]": true, // 기본 그림자
          "hover:-translate-y-0.5": !isDragging && !isOver, // 드래그/드롭 중이 아닐 때 호버 효과
        }
      )}
      style={{ opacity: isDragging ? 0.5 : 1, perspective: "1000px" }} // 드래그 중 투명도 조정
    >
      {/* 컬럼 상단: Add 버튼과 제목, 편집 버튼 */}
      <div className="relative flex items-center mb-2 px-3 pt-4">
        <button
          onClick={() => onAddTodo(status)} // Add 버튼 클릭 시 새 Todo 추가 모달 열기
          className="text-xs px-3 py-1 bg-[#28272B] text-white rounded-lg hover:bg-gray-500 transition-all shadow-md"
        >
          Add
        </button>
        <div className="absolute left-1/2 transform -translate-x-1/2"> {/* 제목을 가운데 정렬 */}
          <h2
            className="font-semibold text-sm px-3 py-1 bg-[#28272B] rounded-md inline-block truncate whitespace-nowrap shadow-inner"
            style={{ color }} // 컬럼 색상 적용
          >
            {title}
          </h2>
        </div>
        <div className="ml-auto flex items-center justify-end gap-2 min-w-[100px]"> {/* 편집 버튼 영역 */}
          <AnimatePresence> {/* framer-motion으로 애니메이션 처리 */}
            {columnEditMode && ( // columnEditMode일 때만 버튼 표시
              <motion.div
                initial="hidden" // 초기 상태
                animate="visible" // 보임 상태로 전환
                exit="hidden" // 숨김 상태로 전환
                variants={buttonVariants} // 애니메이션 변형 적용
                transition={{ duration: 0.3 }} // 전환 시간
                className="flex gap-2"
              >
                <button
                  onClick={() => onEditColumn(column)} // Edit 버튼 클릭 시 컬럼 편집 모달 열기
                  className="text-xs z-50 px-3 py-1 bg-green-900 text-white rounded-lg shadow-md hover:bg-green-800 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemoveColumn(column.id)} // X 버튼 클릭 시 컬럼 삭제
                  className="text-xs px-3 py-1 bg-red-900 text-white rounded-lg shadow-md hover:bg-red-800 transition-all"
                >
                  X
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Todo 목록 표시 영역 */}
      <div className="max-h-96 overflow-y-auto flex flex-col gap-2 px-3">
        {filteredTodos.map((todo, index) => ( // 필터링된 Todo를 순회하며 렌더링
          <DraggableTodo
            key={todo.id} // 고유 키로 Todo ID 사용
            todo={todo} // Todo 객체 전달
            index={index} // Todo의 인덱스 (드래그 위치 계산용)
            moveTodo={moveTodo} // Todo 이동 핸들러
            onClick={onClickTodo} // Todo 클릭 핸들러
            deleteMode={deleteMode} // 삭제 모드 상태
            isSelected={selectedForDelete.includes(todo.id)} // 삭제 대상 여부
            errorMode={errorMode} // 에러 모드 상태
            errorSelected={selectedForError.includes(todo.id)} // 에러 대상 여부
            editMode={editMode} // 편집 모드 상태
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
