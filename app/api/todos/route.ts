// /app/api/todos/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('boards')  // 'boards' 테이블을 참조
      .select('*');  // 모든 데이터를 조회

    if (error) {
      console.error('Error fetching boards:', error);
      return NextResponse.json({ error: 'Error fetching boards' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
