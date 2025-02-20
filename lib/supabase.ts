import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// 예시로 정상 동작 확인용
(async function testSupabase() {
  const { data, error } = await supabase.from("boards").select("*");
  if (error) {
    console.error("Supabase API 연결 오류:", error.message);
  } else {
    console.log("데이터 조회 성공:", data);
  }
})();
