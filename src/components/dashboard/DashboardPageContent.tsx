"use client";

import { useState } from "react";
import { Plus, Map as MapIcon, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatPrice, formatPricePerSqm } from "@/lib/cadastral";
import {
  getCadastralCode,
  getListingTitle,
  getTotalPrice,
  getMapDealTypeFromRow,
  getOwnerNames,
  normalizeListingStatus,
  type PropertyRow,
} from "@/lib/property-normalize";
import { computePricePerSqm } from "@/lib/price-display";
import { DEAL_TYPE_LABELS, type ListingStatus } from "@/lib/types/property-listing";

interface DashboardPageContentProps {
  profile: { first_name?: string | null; last_name?: string | null; email?: string | null } | null;
  listings: PropertyRow[];
  submittedPending: boolean;
  editedListing?: boolean;
}

function statusBadgeClass(status: ListingStatus): string {
  if (status === "pending") return "bg-amber-50 text-amber-800 ring-amber-200";
  if (status === "active") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  return "bg-red-50 text-red-800 ring-red-200";
}

function statusPanelClass(status: ListingStatus): string {
  if (status === "pending") return "border-amber-100 bg-amber-50/80 text-amber-900";
  if (status === "active") return "border-emerald-100 bg-emerald-50/80 text-emerald-900";
  return "border-red-100 bg-red-50/80 text-red-900";
}

export function DashboardPageContent({
  profile,
  listings,
  submittedPending,
  editedListing = false,
}: DashboardPageContentProps) {
  const { t, locale } = useLocale();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function statusLabel(status: ListingStatus) {
    const labels: Record<ListingStatus, string> = {
      pending: t.status.pending,
      active: t.status.active,
      blocked: t.status.blocked,
    };
    return labels[status] ?? status;
  }

  function statusMessage(status: ListingStatus) {
    if (status === "pending") return t.dashboard.statusPending;
    if (status === "active") return t.dashboard.statusActive;
    return t.dashboard.statusBlocked;
  }

  const dateLocale = locale === "en" ? "en-US" : "ka-GE";

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div className="kera-container py-10 sm:py-12 lg:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="kera-page-header">{t.dashboard.panelTitle}</h1>
          <p className="text-sm text-slate-500">
            {profile?.first_name} {profile?.last_name} · {profile?.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
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
          {editedListing ? t.dashboard.editedResubmitBanner : t.dashboard.statusPending}
        </div>
      )}

      {!listings.length ? (
        <Card className="px-6 py-12 text-center text-slate-500">
          <p className="mb-4">{t.dashboard.emptyFirst}</p>
          <LinkButton href="/dashboard/add-property">{t.dashboard.addFirst}</LinkButton>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {listings.map((item) => {
            const id = String(item.id);
            const expanded = expandedId === id;
            const totalPrice = getTotalPrice(item);
            const areaSqm =
              typeof item.area_sqm === "number" && item.area_sqm > 0 ? item.area_sqm : 0;
            const pricePerSqm =
              typeof item.price_per_sqm === "number" && item.price_per_sqm > 0
                ? item.price_per_sqm
                : computePricePerSqm(totalPrice, areaSqm);
            const status = normalizeListingStatus(item.status);
            const owners = getOwnerNames(item);
            const dealType = getMapDealTypeFromRow(item);
            const images = Array.isArray(item.images) ? (item.images as string[]) : [];
            const phone = String(item.phone_number ?? item.owner_phone ?? "");
            const description = String(item.description ?? "");
            const address = String(item.address ?? "");
            const latitude = typeof item.latitude === "number" ? item.latitude : null;
            const longitude = typeof item.longitude === "number" ? item.longitude : null;
            const createdAt = item.created_at
              ? new Date(String(item.created_at)).toLocaleDateString(dateLocale)
              : "—";

            return (
              <Card key={id} className="overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {getListingTitle(item)}
                        </h3>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(status)}`}
                        >
                          {statusLabel(status)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{createdAt}</p>
                    </div>
                    <Link
                      href={`/dashboard/edit-property/${id}`}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-kera-blue shadow-sm hover:bg-blue-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t.dashboard.editListing}
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-b border-slate-100 sm:grid-cols-4 sm:divide-y-0">
                  <SummaryCell label={t.wizard.fieldPrice} value={formatPrice(totalPrice)} />
                  <SummaryCell
                    label={t.wizard.fieldArea}
                    value={areaSqm > 0 ? `${areaSqm} ${t.common.sqm}` : "—"}
                  />
                  <SummaryCell label={t.wizard.fieldCadastral} value={getCadastralCode(item)} />
                  <SummaryCell label={t.wizard.fieldDealType} value={DEAL_TYPE_LABELS[dealType]} />
                </div>

                <div className={`mx-5 my-4 rounded-lg border px-3 py-2.5 text-sm sm:mx-6 ${statusPanelClass(status)}`}>
                  {statusMessage(status)}
                </div>

                {pricePerSqm != null && (
                  <p className="px-5 pb-4 text-center text-xs text-slate-500 sm:px-6">
                    {formatPricePerSqm(pricePerSqm, t.common.perSqm)}
                  </p>
                )}

                <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(id)}
                    className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate-600 hover:text-kera-blue"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        {t.dashboard.collapseDetails}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        {t.dashboard.expandDetails}
                      </>
                    )}
                  </button>
                </div>

                {expanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5 sm:px-6">
                    <dl className="grid gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2">
                      <DetailField label={t.wizard.fieldTitle} value={getListingTitle(item)} />
                      <DetailField label={t.wizard.fieldCadastral} value={getCadastralCode(item)} />
                      <DetailField label={t.wizard.fieldDealType} value={DEAL_TYPE_LABELS[dealType]} />
                      <DetailField label={t.wizard.fieldPrice} value={formatPrice(totalPrice)} />
                      <DetailField
                        label={t.wizard.fieldArea}
                        value={areaSqm > 0 ? `${areaSqm} ${t.common.sqm}` : "—"}
                      />
                      <DetailField
                        label={t.wizard.fieldOwnerFirst}
                        value={owners.first || "—"}
                      />
                      <DetailField
                        label={t.wizard.fieldOwnerLast}
                        value={owners.last || "—"}
                      />
                      <DetailField label={t.wizard.fieldPhone} value={phone || "—"} />
                      <DetailField label={t.wizard.fieldAddress} value={address || "—"} />
                      <DetailField label={t.dashboard.tableDate} value={createdAt} />
                      {(latitude != null || longitude != null) && (
                        <DetailField
                          label={t.dashboard.fieldCoordinates}
                          value={`${latitude ?? "—"}, ${longitude ?? "—"}`}
                        />
                      )}
                    </dl>

                    {description && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t.wizard.fieldDescription}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                          {description}
                        </p>
                      </div>
                    )}

                    {images.length > 0 && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t.wizard.fieldPhotos} ({images.length})
                        </p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {images.map((src, index) => (
                            <div
                              key={`${id}-img-${index}`}
                              className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
                            >
                              <Image
                                src={src}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="120px"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-[4.5rem] flex-col justify-center px-4 py-3 text-center sm:min-h-[5rem]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 px-4 py-3 last:border-b-0 sm:odd:border-r">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium leading-snug text-slate-800">{value}</dd>
    </div>
  );
}
