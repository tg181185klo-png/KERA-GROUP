#!/usr/bin/env node
/**
 * Run dashboard migration SQL against Supabase.
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/run-supabase-migration.mjs
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRef = process.env.SUPABASE_PROJECT_REF ?? "rtseufuxngkgwmaipqui";
const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN.");
  console.error("Create one at https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "004_dashboard_listings_rpc.sql");
const query = await readFile(sqlPath, "utf8");

const res = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  },
);

const body = await res.text();
if (!res.ok) {
  console.error(`Failed (${res.status}):`, body);
  process.exit(1);
}

console.log("Migration 004 applied successfully.");
if (body) console.log(body);
