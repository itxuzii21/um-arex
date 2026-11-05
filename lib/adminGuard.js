const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = () => process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const adminEmail = () => process.env.ADMIN_ACCOUNT_EMAIL;

const MIN_PASSCODE_LENGTH = 8;

async function authHeaders() {
  return {
    apikey: publishableKey(),
    Authorization: `Bearer ${publishableKey()}`,
    'Content-Type': 'application/json',
  };
}

export async function isAdminPasscode(candidate) {
  if (!candidate || !adminEmail()) return false;

  const response = await fetch(
    `${supabaseUrl()}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ email: adminEmail(), password: candidate }),
    }
  );

  return response.ok;
}

export async function requestPasscodeReset(redirectTo) {
  if (!adminEmail()) {
    return { ok: false, error: 'Reset is not configured on this server.' };
  }

  const response = await fetch(`${supabaseUrl()}/auth/v1/recover`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(redirectTo ? { email: adminEmail(), redirect_to: redirectTo } : { email: adminEmail() }),
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: body.error_description || body.msg || body.error || 'Could not send the reset email.',
    };
  }

  return { ok: true };
}

export async function setNewPasscode(accessToken, newPasscode) {
  if (!accessToken) return { ok: false, status: 400, error: 'Reset link is missing.' };

  if (typeof newPasscode !== 'string' || newPasscode.length < MIN_PASSCODE_LENGTH) {
    return { ok: false, status: 400, error: `Passcode must be at least ${MIN_PASSCODE_LENGTH} characters.` };
  }

  const headers = {
    apikey: publishableKey(),
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const me = await fetch(`${supabaseUrl()}/auth/v1/user`, { headers });

  if (!me.ok) return { ok: false, status: 401, error: 'That reset link is no longer valid.' };

  const user = await me.json();

  if (user.email !== adminEmail()) {
    return { ok: false, status: 403, error: 'That reset link belongs to a different account.' };
  }

  const update = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ password: newPasscode }),
  });

  if (!update.ok) {
    const detail = await update.json().catch(() => ({}));
    return { ok: false, status: update.status, error: detail.error_description || detail.msg || 'Could not save the new passcode.' };
  }

  return { ok: true };
}
