// Remove async keyword and supabase import/call
// import { supabase } from "../lib/supabase";
import OpenButtonPage from "./OpenButtonPage"; // 새로 만들 컴포넌트 import

export default function Page() {
  // Remove board fetching logic
  // const { data: boards, error } = await supabase.from("boards").select("*");

  // Render the new simple component
  return <OpenButtonPage />;
}