import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

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
        { onConflict: "id" }
      );
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
