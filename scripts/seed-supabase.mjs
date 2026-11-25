import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DEFAULT_SITE_SETTINGS } from "../app/data/siteSettings.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const env = {};
for (const line of readFileSync(join(root, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Missing Supabase URL or secret key in .env.local");
  process.exit(1);
}

const products = JSON.parse(
  readFileSync(join(root, "app/data/watches.json"), "utf8")
);

const rows = [
  { id: "watch_catalog", content: { products } },
  { id: "watch_settings", content: DEFAULT_SITE_SETTINGS },
];

for (const row of rows) {
  const res = await fetch(`${url}/rest/v1/site_content?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: row.id,
      content: row.content,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    console.error(`Seed ${row.id} failed:`, res.status, await res.text());
    process.exit(1);
  }
  console.log(`Seeded ${row.id} (${row.id === "watch_catalog" ? products.length + " products" : "site settings"})`);
}
console.log("Shared Supabase database is ready for UM-AREX Watches.");