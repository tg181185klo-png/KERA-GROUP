"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  LISTING_STATUS_LABELS,
  LISTING_TYPE_LABELS,
  type ListingStatus,
} from "@/lib/types/property-listing";
import type { Profile } from "@/lib/types/profile";
import { formatPrice } from "@/lib/cadastral";

interface ListingRow {
  id: string;
  title: string;
  cadastral_code: string;
  owner_first_name: string;
  owner_last_name: string;
  total_price: number;
  listing_type: string;
  status: ListingStatus;
  created_at: string;
  user_id: string;
}

export function AdminListingsPanel({
  initialListings = [],
}: {
  initialListings?: ListingRow[];
}) {
  const [tab, setTab] = useState<"listings" | "users">("listings");
  const [listings, setListings] = useState<ListingRow[]>(initialListings);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(!initialListings.length);

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
      alert("განცხადება დამტკიცდა და რუკაზე გამოჩნდება.");
    }

    await loadData();
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

  if (loading) {
    return <p className="py-12 text-center text-slate-500">იტვირთება...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex gap-2">
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

      {tab === "listings" ? (
        <Card className="overflow-x-auto">
          {listings.length === 0 ? (
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
              {listings.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3">{item.cadastral_code}</td>
                  <td className="px-4 py-3">
                    {item.owner_first_name} {item.owner_last_name}
                  </td>
                  <td className="px-4 py-3">{formatPrice(item.total_price)}</td>
                  <td className="px-4 py-3">
                    {LISTING_TYPE_LABELS[item.listing_type as keyof typeof LISTING_TYPE_LABELS]}
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
                          რუკაზე გამოჩენა
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
              ))}
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
