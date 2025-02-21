import { z } from "zod";

export const todoSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요").max(100, "최대 100자"),
  // 날짜는 "YYYY-MM-DD ~ YYYY-MM-DD" 문자열로 저장됨
  date: z.string().optional(),
  status: z.string(),
  description: z.string().optional(),
});
