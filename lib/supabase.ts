// /lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// 환경변수에서 Supabase URL과 API 키를 불러옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchBoards() {
  const { data, error } = await supabase.from("boards").select("*");
  if (error) {
    console.error("Supabase API 연결 오류:", error.message);
  } else {
    console.log("데이터 조회 성공:", data);
  }
}

fetchBoards();