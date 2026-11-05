import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { supabaseServer } from '@/lib/supabaseServer';

function hasCorrectPasscode(headerValue) {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected || typeof headerValue !== 'string') return false;

  const provided = Buffer.from(headerValue);
  const actual = Buffer.from(expected);
  return provided.length === actual.length && timingSafeEqual(provided, actual);
}

export async function POST(request) {
  try {
    if (!hasCorrectPasscode(request.headers.get('x-admin-passcode'))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid admin passcode.',
        },
        { status: 401 }
      );
    }

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
