"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  DEAL_TYPE_LABELS,
  LISTING_STATUS_LABELS,
  type ListingStatus,
  type MapDealType,
} from "@/lib/types/property-listing";
import type { Profile } from "@/lib/types/profile";
import { formatPrice, formatPricePerSqm } from "@/lib/cadastral";
import { getPricePerSqm } from "@/lib/price-display";
import { useT } from "@/i18n/LocaleProvider";

interface ListingRow {
  id: string;
  title: string;
  cadastral_code: string;
  owner_first_name: string;
  owner_last_name: string;
  total_price: number;
  area_sqm: number;
  price_per_sqm: number | null;
  listing_type: string;
  deal_type?: MapDealType;
  status: ListingStatus;
  created_at: string;
  user_id: string;
}

export function AdminListingsPanel({
  initialListings = [],
}: {
  initialListings?: ListingRow[];
}) {
  const t = useT();
  const [tab, setTab] = useState<"listings" | "users">("listings");
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "all">("all");
  const [listings, setListings] = useState<ListingRow[]>(initialListings);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(!initialListings.length);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    const [listingsRes, usersRes] = await Promise.all([
      fetch("/api/listings?admin=true"),
      fetch("/api/admin/users"),
    ]);

    if (listingsRes?.ok) {
      const data = await listingsRes.json();
      setListings(data);
    }

    if (usersRes.ok) {
      const data = await usersRes.json();
      setUsers(data);
    }

    setLoading(false);
  }

  async function updateStatus(id: string, status: ListingStatus) {
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "სტატუსის განახლება ვერ მოხერხდა");
      return;
    }

    if (status === "active") {
      alert("განცხადება დამტკიცდა და რუქაზე გამოჩნდება.");
    }

    await loadData();
  }

  async function syncAllCadastral() {
    if (!confirm("ყველა განცხადების კადასტრი განახლდება NAPR-იდან. გავაგრძელოთ?")) {
      return;
    }

    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync-cadastral", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "სინქრონიზაცია ვერ მოხერხდა");
        return;
      }

      alert(
        `განახლდა: ${data.updated}, გამოტოვებული: ${data.skipped}, ვერ მოიძებნა: ${data.failed}`,
      );
      await loadData();
    } finally {
      setSyncing(false);
    }
  }

  async function deleteListing(id: string) {
    if (!confirm("ნამდვილად გსურთ წაშლა?")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    loadData();
  }

  async function toggleUserBlock(id: string, blocked: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, updates: { is_blocked: !blocked } }),
    });
    loadData();
  }

  const pendingCount = listings.filter((item) => item.status === "pending").length;
  const filteredListings = useMemo(
    () =>
      statusFilter === "all"
        ? listings
        : listings.filter((item) => item.status === statusFilter),
    [listings, statusFilter],
  );

  const sortedListings = useMemo(
    () =>
      [...filteredListings].sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [filteredListings],
  );

  if (loading) {
    return <p className="py-12 text-center text-slate-500">იტვირთება...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
        <Button
          variant={tab === "listings" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setTab("listings")}
        >
          განცხადებები ({listings.length})
        </Button>
        <Button
          variant={tab === "users" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setTab("users")}
        >
          მომხმარებლები ({users.length})
        </Button>
        </div>
        {tab === "listings" && (
          <Button
            size="sm"
            variant="ghost"
            disabled={syncing}
            onClick={syncAllCadastral}
          >
            {syncing ? "სინქრონიზაცია..." : "კადასტრის განახლება (NAPR)"}
          </Button>
        )}
      </div>

      {tab === "listings" && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {t.admin.pendingCount.replace("{count}", String(pendingCount))}
            </span>
          )}
          {(["all", "pending", "active", "blocked"] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "primary" : "ghost"}
              onClick={() => setStatusFilter(status)}
            >
              {status === "all"
                ? t.admin.filterAll
                : status === "pending"
                  ? t.admin.filterPending
                  : status === "active"
                    ? t.admin.filterActive
                    : t.admin.filterBlocked}
              {status !== "all" && (
                <span className="ml-1 opacity-70">
                  ({listings.filter((item) => item.status === status).length})
                </span>
              )}
            </Button>
          ))}
        </div>
      )}

      {tab === "listings" ? (
        <Card className="overflow-x-auto">
          {sortedListings.length === 0 ? (
            <p className="px-4 py-8 text-center text-slate-500">
              განცხადებები არ მოიძებნა
            </p>
          ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">სათაური</th>
                <th className="px-4 py-3">კად. კოდი</th>
                <th className="px-4 py-3">მფლობელი</th>
                <th className="px-4 py-3">ფასი</th>
                <th className="px-4 py-3">ტიპი</th>
                <th className="px-4 py-3">სტატუსი</th>
                <th className="px-4 py-3">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedListings.map((item) => {
                const pricePerSqm = getPricePerSqm(item);
                return (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3">{item.cadastral_code}</td>
                  <td className="px-4 py-3">
                    {item.owner_first_name} {item.owner_last_name}
                  </td>
                  <td className="px-4 py-3">
                    <div>{formatPrice(item.total_price)}</div>
                    {pricePerSqm != null && (
                      <div className="text-xs text-slate-500">
                        {formatPricePerSqm(pricePerSqm, t.common.perSqm)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {DEAL_TYPE_LABELS[
                      (item.deal_type ?? item.listing_type) as MapDealType
                    ] ?? item.listing_type}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        item.status === "active"
                          ? "active"
                          : item.status === "pending"
                            ? "pending"
                            : "archived"
                      }
                    >
                      {LISTING_STATUS_LABELS[item.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(item.id, "active")}
                        >
                          რუქაზე გამოჩენა
                        </Button>
                      )}
                      {item.status !== "active" && item.status !== "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatus(item.id, "active")}
                        >
                          დამტკიცება
                        </Button>
                      )}
                      {item.status !== "blocked" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatus(item.id, "blocked")}
                        >
                          ბლოკი
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteListing(item.id)}
                      >
                        წაშლა
                      </Button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">სახელი</th>
                <th className="px-4 py-3">ელ-ფოსტა</th>
                <th className="px-4 py-3">როლი</th>
                <th className="px-4 py-3">სტატუსი</th>
                <th className="px-4 py-3">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "amber" : "blue"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_blocked ? (
                      <Badge variant="archived">დაბლოკილი</Badge>
                    ) : (
                      <Badge variant="active">აქტიური</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleUserBlock(user.id, user.is_blocked)}
                    >
                      {user.is_blocked ? "განბლოკვა" : "ბლოკი"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
