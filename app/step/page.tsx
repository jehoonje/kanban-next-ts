// /app/step/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { boardSchema, userSchema } from "../../lib/validation";

const StepPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardId = searchParams.get("boardId") as string | null;
  const step = Number(searchParams.get("step")) || 1;
  const [value, setValue] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (step === 2) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (countdown <= 0 && step === 2) {
      router.push("/");
    }
  }, [countdown, router, step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1) {
      const result = boardSchema.safeParse(value);
      if (!result.success) {
        setErrorMessage(result.error.format()._errors[0]);
        return;
      }
      const { data, error } = await supabase
        .from("boards")
        .insert([{ name: value }])
        .select()
        .single();
      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push(`/step?boardId=${data.id}&step=2`);
      }
    } else if (step === 2) {
      const result = userSchema.safeParse(value);
      if (!result.success) {
        setErrorMessage(result.error.format()._errors[0]);
        return;
      }
      const { error } = await supabase
        .from("users")
        .insert([{ board_id: boardId, name: value }]);
      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className="border p-2 rounded-md shadow-md w-full"
          placeholder={
            step === 1 ? "보드 이름을 입력하세요" : "사용자 이름을 입력하세요"
          }
        />
        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
        )}
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white p-3 rounded-full text-lg w-20 h-20 flex justify-center items-center shadow-md hover:bg-blue-400 transition duration-300"
        >
          <span className="text-3xl">+</span>
        </button>
      </form>
      {step === 2 && (
        <div className="mt-4">
          <p className="text-gray-500">남은 시간: {countdown}.0초</p>
        </div>
      )}
    </div>
  );
};

export default StepPage;