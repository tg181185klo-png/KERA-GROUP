"use client";

import { Plus, Map as MapIcon, Pencil } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatPrice, formatPricePerSqm } from "@/lib/cadastral";
import {
  getCadastralCode,
  getListingTitle,
  getTotalPrice,
  type PropertyRow,
} from "@/lib/property-normalize";
import { computePricePerSqm } from "@/lib/price-display";

interface DashboardPageContentProps {
  profile: { first_name?: string | null; last_name?: string | null; email?: string | null } | null;
  listings: PropertyRow[];
  submittedPending: boolean;
  editedListing?: boolean;
}

export function DashboardPageContent({
  profile,
  listings,
  submittedPending,
  editedListing = false,
}: DashboardPageContentProps) {
  const { t, locale } = useLocale();

  function statusLabel(status: string) {
    const labels: Record<string, string> = {
      pending: t.status.pending,
      active: t.status.active,
      archived: t.status.archived,
      blocked: t.status.blocked,
    };
    return labels[status] ?? status;
  }

  const dateLocale = locale === "en" ? "en-US" : "ka-GE";

  return (
    <div className="kera-container py-10 sm:py-12 lg:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="kera-page-header">{t.dashboard.panelTitle}</h1>
          <p className="text-sm text-slate-500">
            {profile?.first_name} {profile?.last_name} · {profile?.email}
          </p>
        </div>
        <div className="flex gap-3">
          <LinkButton href="/dashboard/add-property" size="sm">
            <Plus className="h-4 w-4" />
            {t.dashboard.addProperty}
          </LinkButton>
          <LinkButton href="/map" variant="ghost" size="sm">
            <MapIcon className="h-4 w-4" />
            {t.nav.map}
          </LinkButton>
          <LogoutButton />
        </div>
      </div>

      {submittedPending && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {editedListing ? t.dashboard.editedResubmitBanner : t.dashboard.moderationFull}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">{t.dashboard.myListingsTitle}</h2>
        </div>

        {!listings.length ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <p className="mb-4">{t.dashboard.emptyFirst}</p>
            <LinkButton href="/dashboard/add-property">{t.dashboard.addFirst}</LinkButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">{t.dashboard.tableTitle}</th>
                  <th className="px-6 py-3 font-medium">{t.dashboard.tableCadCode}</th>
                  <th className="px-6 py-3 font-medium">{t.dashboard.tablePrice}</th>
                  <th className="px-6 py-3 font-medium">{t.dashboard.tableStatus}</th>
                  <th className="px-6 py-3 font-medium">{t.dashboard.tableDate}</th>
                  <th className="px-6 py-3 font-medium">{t.dashboard.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((item) => {
                  const totalPrice = getTotalPrice(item);
                  const areaSqm =
                    typeof item.area_sqm === "number" && item.area_sqm > 0
                      ? item.area_sqm
                      : 0;
                  const pricePerSqm =
                    typeof item.price_per_sqm === "number" &&
                    item.price_per_sqm > 0
                      ? item.price_per_sqm
                      : computePricePerSqm(totalPrice, areaSqm);

                  return (
                  <tr key={String(item.id)} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {getListingTitle(item)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{getCadastralCode(item)}</td>
                    <td className="px-6 py-4">
                      <div>{formatPrice(totalPrice)}</div>
                      {pricePerSqm != null && (
                        <div className="text-xs text-slate-500">
                          {formatPricePerSqm(pricePerSqm, t.common.perSqm)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                        {statusLabel(String(item.status ?? "pending"))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.created_at
                        ? new Date(String(item.created_at)).toLocaleDateString(dateLocale)
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/edit-property/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-kera-blue hover:bg-blue-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {t.dashboard.editListing}
                      </Link>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
