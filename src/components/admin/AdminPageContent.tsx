"use client";

import type { ComponentProps } from "react";
import { useT } from "@/i18n/LocaleProvider";
import { AdminListingsPanel } from "@/components/admin/AdminListingsPanel";

export function AdminPageContent({
  initialListings,
}: {
  initialListings: NonNullable<
    ComponentProps<typeof AdminListingsPanel>["initialListings"]
  >;
}) {
  const t = useT();

  return (
    <div className="kera-container py-10 sm:py-12 lg:py-14">
      <h1 className="kera-page-header mb-2">{t.admin.title}</h1>
      <p className="mb-8 text-sm leading-relaxed text-slate-500 sm:text-base">
        {t.admin.subtitle}
      </p>
      <AdminListingsPanel initialListings={initialListings} />
    </div>
  );
}
