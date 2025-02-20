"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { boardSchema, userSchema } from "../../lib/validation";
import { useStore } from "../../store/useStore";

export default function CreateBoardPage() {
  const router = useRouter();
  const { addBoard } = useStore();

  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState<number | null>(null); // 초기 상태: null (카운트다운 없음)
  const [isTyping, setIsTyping] = useState(false);
  const [inputTimeout, setInputTimeout] = useState<NodeJS.Timeout | null>(null);

  const [boardName, setBoardName] = useState("");
  const [userName, setUserName] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    // 사용자가 입력하지 않은 상태에서는 카운트다운 X
    if (!isTyping && countdown !== null) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev !== null && prev > 0 ? +(prev - 0.1).toFixed(1) : 0));
      }, 100);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTyping, countdown]);

  useEffect(() => {
    if (countdown === 0) {
      if (step === 1) {
        proceedToStep2();
      } else if (step === 2) {
        createBoardAndUser();
      }
    }
  }, [countdown]);

  const handleInputChange = (setter: (value: string) => void, value: string) => {
    setter(value);

    if (value.trim().length > 0) {
      setCountdown(4.0); // 입력 시작하면 3초로 초기화
    } else {
      setCountdown(null); // 입력이 없으면 카운트다운 멈춤
    }

    if (inputTimeout) clearTimeout(inputTimeout);

    setIsTyping(true);
    const timeout = setTimeout(() => {
      if (value.trim().length > 0) {
        setIsTyping(false);
      }
    }, 1000); // 입력 멈추고 500ms 지나야 카운트다운 진행

    setInputTimeout(timeout);
  };

  const proceedToStep2 = () => {
    const parseResult = boardSchema.safeParse({ name: boardName });
    if (!parseResult.success) {
      alert(parseResult.error.issues[0].message);
      return;
    }
    setStep(2);
    setCountdown(null); // Step 변경 시 카운트다운 리셋
  };

  const createBoardAndUser = async () => {
    const parseResult = userSchema.safeParse({ name: userName });
    if (!parseResult.success) {
      alert(parseResult.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      const { data: boardData, error: boardError } = await supabase
        .from("boards")
        .insert([{ name: boardName }])
        .select()
        .single();

      if (boardError || !boardData) {
        console.error("Board 생성 오류:", boardError);
        return;
      }

      addBoard(boardData);

      const { error: userError } = await supabase
        .from("users")
        .insert([{ board_id: boardData.id, name: userName }]);

      if (userError) {
        console.error("User 생성 오류:", userError);
      }

      router.push("/");
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      proceedToStep2();
    } else {
      createBoardAndUser();
    }
  };

  const handleGoBack = () => {
    if (step === 1) {
      router.push("/");
    } else {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-8">
      <button
          onClick={handleGoBack}
          className="absolute top-2 left-2 bg-transparent text-gray-500 px-2 py-1 text-sm rounded hover:text-gray-900"
        >
          Back
        </button>
      {step === 1 && (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xs text-gray-700 font-semibold">
            사용하실 보드의 제목을 입력하세요.
          </h2>
          <form onSubmit={handleSubmit} className="flex">
            <input
              className="border px-10 p-2 rounded-md shadow-md"
              placeholder="Title"
              type="text"
              value={boardName}
              onChange={(e) => handleInputChange(setBoardName, e.target.value)}
            />
          </form>
          <div className="text-gray-500">
            {countdown !== null ? countdown.toFixed(1) + " sec" : ""}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xs text-gray-700 font-semibold">사용자 이름을 입력하세요.</h2>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              className="border px-10 p-2 rounded-md shadow-md"
              placeholder="Your name"
              type="text"
              value={userName}
              onChange={(e) => handleInputChange(setUserName, e.target.value)}
            />
          </form>
          <div className="text-gray-500">
            {countdown !== null ? countdown.toFixed(1) + " sec" : ""}
          </div>
        </div>
      )}

      {isPending && <div className="text-sm text-gray-400">Processing...</div>}
    </div>
  );
}
