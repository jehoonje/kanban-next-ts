import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { boardSchema } from "../../../lib/validation";

export async function GET() {
  try {
    const { data, error } = await supabase.from("boards").select("*");
    if (error) {
      console.error("Error fetching boards:", error);
      return NextResponse.json(
        { error: "Error fetching boards" },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // zod 스키마 검증
    const parseResult = boardSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues },
        { status: 400 }
      );
    }
    const { name } = parseResult.data;
    const { data, error } = await supabase
      .from("boards")
      .insert([{ name }])
      .select()
      .single();
    if (error) {
      console.error("Error creating board:", error);
      return NextResponse.json({ error: "Error creating board" }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
