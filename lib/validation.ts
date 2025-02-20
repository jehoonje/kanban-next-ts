// /lib/validation.ts
import { z } from "zod";

export const boardSchema = z.object({
  name: z.string().min(1, { message: "보드 이름은 필수입니다." }),
});

export const userSchema = z.object({
  name: z.string().min(1, { message: "사용자 이름을 입력하세요." }),
});