import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const { id, content } = await request.json();

    if (!id || !String(id).trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content id is required.',
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from('site_content')
      .upsert(
        {
          id: String(id).trim(),
          content: content ?? {},
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      );

    if (error) {
      console.error('Supabase site_content UPSERT error:', error);

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin content API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error.',
      },
      { status: 500 }
    );
  }
}
