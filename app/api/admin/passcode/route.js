import { NextResponse } from 'next/server';
import { requestPasscodeReset, setNewPasscode } from '@/lib/adminGuard';

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.action === 'request-reset') {
      const result = await requestPasscodeReset(
        `${request.nextUrl.protocol}//${request.nextUrl.host}/admin`
      );

      return NextResponse.json(
        { success: result.ok, error: result.error },
        { status: result.ok ? 200 : result.status || 502 }
      );
    }

    if (body.action === 'set-new') {
      const result = await setNewPasscode(body.access_token, body.new_passcode);

      return NextResponse.json(
        { success: result.ok, error: result.error },
        { status: result.ok ? 200 : result.status || 502 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin passcode API error:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
