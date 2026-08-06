import { NextResponse } from "next/server";
import { canManageListings } from "@/lib/admin-access";
import { backfillAllListingUserIds } from "@/lib/backfill-listings";
import { createServiceClient } from "@/lib/supabase/server";

async function runSqlMigrationViaManagementApi(): Promise<{ ok: boolean; message: string }> {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const projectRef =
    process.env.SUPABASE_PROJECT_REF?.trim() ?? "rtseufuxngkgwmaipqui";

  if (!token) {
    return {
      ok: false,
      message: "SUPABASE_ACCESS_TOKEN not set — skipped SQL (RLS/RPC). JS backfill applied.",
    };
  }

  try {
    const { readFile } = await import("fs/promises");
    const path = await import("path");
    const sqlPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      "004_dashboard_listings_rpc.sql",
    );
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
      return { ok: false, message: `SQL API error (${res.status}): ${body}` };
    }

    return { ok: true, message: "SQL migration 004 applied via Supabase Management API." };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message: `SQL migration failed: ${message}` };
  }
}

export async function POST() {
  if (!(await canManageListings())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const service = createServiceClient();
  const backfill = await backfillAllListingUserIds(service);
  const sql = await runSqlMigrationViaManagementApi();

  return NextResponse.json({
    success: true,
    backfill,
    sql,
  });
}
