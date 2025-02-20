import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { userSchema } from "../../../lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // { board_id: number, name: string }
    const parseResult = userSchema.safeParse({ name: body.name });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("users")
      .insert([{ board_id: body.board_id, name: body.name }])
      .select()
      .single();

    if (error) {
      console.error("Error adding user:", error);
      return NextResponse.json(
        { error: "Error adding user" },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
