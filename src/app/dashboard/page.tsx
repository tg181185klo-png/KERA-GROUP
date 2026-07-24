import Link from "next/link";
import { Plus, Map as MapIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { LISTING_STATUS_LABELS } from "@/lib/types/property-listing";
import { formatPrice } from "@/lib/cadastral";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import {
  getCadastralCode,
  getListingTitle,
  getTotalPrice,
  type PropertyRow,
} from "@/lib/property-normalize";

function statusLabel(status: string) {
  return (
    LISTING_STATUS_LABELS[status as keyof typeof LISTING_STATUS_LABELS] ??
    (status === "archived" ? "არქივი" : status)
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  const service = createServiceClient();

  const email = user.email ?? "";
  const { data: byUserId } = await service
    .from("properties")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: byEmail } = email
    ? await service
        .from("properties")
        .select("*")
        .eq("owner_email", email)
        .order("created_at", { ascending: false })
    : { data: [] };

  const merged = new Map<string, PropertyRow>();
  for (const row of [...(byUserId ?? []), ...(byEmail ?? [])]) {
    merged.set(String(row.id), row as PropertyRow);
  }
  const listings = Array.from(merged.values());

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ჩემი პანელი</h1>
          <p className="text-sm text-slate-500">
            {profile?.first_name} {profile?.last_name} · {profile?.email}
          </p>
        </div>
        <div className="flex gap-3">
          <LinkButton href="/dashboard/add-property" size="sm">
            <Plus className="h-4 w-4" />
            ახალი განცხადება
          </LinkButton>
          <LinkButton href="/map" variant="ghost" size="sm">
            <MapIcon className="h-4 w-4" />
            რუკა
          </LinkButton>
          <LogoutButton />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">ჩემი განცხადებები</h2>
        </div>

        {!listings?.length ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <p className="mb-4">ჯერ არ გაქვთ განცხადებები.</p>
            <LinkButton href="/dashboard/add-property">
              დაამატეთ პირველი ქონება
            </LinkButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">სათაური</th>
                  <th className="px-6 py-3 font-medium">კად. კოდი</th>
                  <th className="px-6 py-3 font-medium">ფასი</th>
                  <th className="px-6 py-3 font-medium">სტატუსი</th>
                  <th className="px-6 py-3 font-medium">თარიღი</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((item) => (
                  <tr key={String(item.id)} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {getListingTitle(item)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {getCadastralCode(item)}
                    </td>
                    <td className="px-6 py-4">{formatPrice(getTotalPrice(item))}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                        {statusLabel(String(item.status ?? "pending"))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.created_at
                        ? new Date(String(item.created_at)).toLocaleDateString("ka-GE")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
