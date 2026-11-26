function json(status, payload) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

async function isAdmin(accessToken) {
  const email = "uzairmirza7863@gmail.com";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!accessToken || !url || !key) return false;

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) return false;

  const user = await response.json();
  return user.email?.toLowerCase() === email.toLowerCase();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { success: false, error: "Method not allowed." });
  }

  const authorization = event.headers.authorization || event.headers.Authorization || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!(await isAdmin(accessToken))) {
    return json(401, { success: false, error: "Your admin session is invalid or has expired. Please sign in again." });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return json(500, { success: false, error: "Supabase is not configured on this server." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { success: false, error: "Request body must be JSON." });
  }

  const id = String(body.id ?? "").trim();
  const allowed = ["leather_catalog", "leather_settings", "watch_catalog", "watch_settings"];
  if (!allowed.includes(id)) {
    return json(400, { success: false, error: "Unknown content id." });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/site_content?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal,resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id,
        content: body.content ?? {},
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Supabase site_content UPSERT error:", response.status, detail);
      return json(500, { success: false, error: `Save failed (${response.status}).` });
    }

    return json(200, { success: true });
  } catch (error) {
    console.error("Admin content function error:", error);
    return json(500, { success: false, error: error.message || "Internal server error." });
  }
};