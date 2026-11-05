const crypto = require('crypto');

function json(status, payload) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

function hasCorrectPasscode(headerValue) {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected || typeof headerValue !== 'string') return false;

  const provided = Buffer.from(headerValue);
  const actual = Buffer.from(expected);
  return provided.length === actual.length && crypto.timingSafeEqual(provided, actual);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed.' });
  }

  if (!hasCorrectPasscode(event.headers['x-admin-passcode'])) {
    return json(401, { success: false, error: 'Invalid admin passcode.' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return json(500, { success: false, error: 'Supabase is not configured on this server.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, error: 'Request body must be JSON.' });
  }

  const id = String(body.id ?? '').trim();
  if (!id) {
    return json(400, { success: false, error: 'Content id is required.' });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/site_content`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal,resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id,
        content: body.content ?? {},
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Supabase site_content UPSERT error:', response.status, detail);
      return json(500, { success: false, error: `Save failed (${response.status}).` });
    }

    return json(200, { success: true });
  } catch (error) {
    console.error('Admin content function error:', error);
    return json(500, { success: false, error: error.message || 'Internal server error.' });
  }
};
