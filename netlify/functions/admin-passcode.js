const MIN_PASSCODE_LENGTH = 8;

function json(status, payload) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

function clientHeaders() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

function adminEmail() {
  return process.env.ADMIN_ACCOUNT_EMAIL;
}

async function requestReset(redirectTo) {
  if (!adminEmail()) {
    return json(500, { success: false, error: 'Reset is not configured on this server.' });
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover`, {
    method: 'POST',
    headers: clientHeaders(),
    body: JSON.stringify(redirectTo ? { email: adminEmail(), redirect_to: redirectTo } : { email: adminEmail() }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return json(response.status, {
      success: false,
      error: body.error_description || body.msg || body.error || 'Could not send the reset email.',
    });
  }

  return json(200, { success: true });
}

async function setNew(accessToken, newPasscode) {
  if (!accessToken) {
    return json(400, { success: false, error: 'Reset link is missing.' });
  }

  if (typeof newPasscode !== 'string' || newPasscode.length < MIN_PASSCODE_LENGTH) {
    return json(400, {
      success: false,
      error: `Passcode must be at least ${MIN_PASSCODE_LENGTH} characters.`,
    });
  }

  const headers = { ...clientHeaders(), Authorization: `Bearer ${accessToken}` };
  const me = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, { headers });

  if (!me.ok) {
    return json(401, { success: false, error: 'That reset link is no longer valid.' });
  }

  const user = await me.json();

  if (user.email !== adminEmail()) {
    return json(403, { success: false, error: 'That reset link belongs to a different account.' });
  }

  const update = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ password: newPasscode }),
  });

  if (!update.ok) {
    const detail = await update.json().catch(() => ({}));
    return json(update.status, {
      success: false,
      error: detail.error_description || detail.msg || 'Could not save the new passcode.',
    });
  }

  return json(200, { success: true });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, error: 'Request body must be JSON.' });
  }

  const host = event.headers['x-forwarded-host'] || event.headers.host;
  const proto = event.headers['x-forwarded-proto'] || 'https';

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return json(500, { success: false, error: 'Supabase is not configured on this server.' });
  }

  try {
    if (body.action === 'request-reset') {
      return await requestReset(host ? `${proto}://${host}/admin` : undefined);
    }

    if (body.action === 'set-new') {
      return await setNew(body.access_token, body.new_passcode);
    }

    return json(400, { success: false, error: 'Unknown action.' });
  } catch (error) {
    console.error('Admin passcode function error:', error);
    return json(500, { success: false, error: error.message || 'Internal server error.' });
  }
};
