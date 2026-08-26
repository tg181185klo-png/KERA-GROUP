#!/usr/bin/env node
/** Probe production Supabase via public bundles and REST. */
const pages = [
  "https://www.keragroup.ge",
  "https://www.keragroup.ge/dashboard",
  "https://www.keragroup.ge/_next/static/chunks/app/dashboard/page.js",
];

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.text();
}

async function main() {
  let supabaseUrl = null;
  let anonKey = null;

  for (const page of pages) {
    const text = await fetchText(page);
    if (!text) continue;
    const urlMatch = text.match(/https:\/\/[a-z0-9-]+\.supabase\.co/);
    const keyMatch = text.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
    if (urlMatch) supabaseUrl = urlMatch[0];
    if (keyMatch) anonKey = keyMatch[0];
  }

  if (!supabaseUrl) {
    const buildIdRes = await fetch("https://www.keragroup.ge");
    const html = await buildIdRes.text();
    const chunks = [...html.matchAll(/\/_next\/static\/chunks\/[^"]+\.js/g)].map((m) => m[0]);
    for (const chunk of chunks.slice(0, 30)) {
      const js = await fetchText(`https://www.keragroup.ge${chunk}`);
      if (!js) continue;
      const urlMatch = js.match(/https:\/\/[a-z0-9-]+\.supabase\.co/);
      const keyMatch = js.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
      if (urlMatch) supabaseUrl = urlMatch[0];
      if (keyMatch) anonKey = keyMatch[0];
      if (supabaseUrl && anonKey) break;
    }
  }

  console.log("Supabase URL:", supabaseUrl ?? "not found");
  console.log("Anon key:", anonKey ? `${anonKey.slice(0, 20)}...` : "not found");

  if (!supabaseUrl || !anonKey) return;

  for (const table of ["properties", "profiles", "properties_legacy"]) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id&limit=1`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    const body = await res.text();
    console.log(`\n${table}: ${res.status} ${body.slice(0, 200)}`);
  }

  const rpc = await fetch(`${supabaseUrl}/rest/v1/rpc/get_dashboard_listings`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_user_id: "00000000-0000-0000-0000-000000000001" }),
  });
  console.log("\nRPC get_dashboard_listings:", rpc.status, (await rpc.text()).slice(0, 300));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
