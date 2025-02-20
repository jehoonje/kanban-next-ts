import Home from "./Home";
import { supabase } from "../lib/supabase";

export default async function Page() {
  const { data: boards, error } = await supabase.from("boards").select("*");
  return <Home initialBoards={boards || []} />;
}
