function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export default async function handler(request, context) {
  if (request.method !== "GET") {
    return json(405, { success: false, countryCode: "" });
  }

  const countryCode = String(context?.geo?.country?.code || "").toUpperCase();

  return json(200, {
    success: true,
    countryCode: /^[A-Z]{2}$/.test(countryCode) ? countryCode : "",
  });
}
