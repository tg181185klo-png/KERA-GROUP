import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, safeRedirectPath } from "@/lib/site-url";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));
  const siteUrl = getSiteUrl();

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: data.user.email ?? "",
          first_name:
            (data.user.user_metadata?.first_name as string | undefined) ?? "",
          last_name:
            (data.user.user_metadata?.last_name as string | undefined) ?? "",
        },
        { onConflict: "id" },
      );
      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${siteUrl}/login?error=auth`);
}
