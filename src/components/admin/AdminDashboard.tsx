"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Archive,
  CheckCircle,
  EyeOff,
  Loader2,
  LogOut,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import type { Property, PropertyStatus } from "@/lib/types/property";
import { formatDealType, formatPrice, formatPropertyType } from "@/lib/format";

const STATUS_LABELS: Record<PropertyStatus, string> = {
  pending: "მოდერაციაში",
  active: "აქტიური",
  archived: "არქივი",
};

const STATUS_COLORS: Record<PropertyStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  archived: "bg-slate-100 text-slate-600",
};

export function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Property | null>(null);
  const [filter, setFilter] = useState<PropertyStatus | "all">("all");

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/properties");
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  async function updateStatus(id: string, status: PropertyStatus) {
    const res = await fetch(`/api/admin/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchProperties();
  }

  async function deleteProperty(id: string) {
    if (!confirm("ნამდვილად გსურთ განცხადების სრული წაშლა?")) return;

    const res = await fetch(`/api/admin/properties/${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchProperties();
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.reload();
  }

  const filtered =
    filter === "all"
      ? properties
      : properties.filter((p) => p.status === filter);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-kera-slate">ადმინ პანელი</h1>
          <p className="mt-1 text-sm text-slate-600">
            განცხადებების მართვა და მოდერაცია
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          გასვლა
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "pending", "active", "archived"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === s
                ? "bg-kera-primary text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-kera-primary"
            }`}
          >
            {s === "all" ? "ყველა" : STATUS_LABELS[s]}
            {s !== "all" && (
              <span className="ml-1.5 opacity-70">
                ({properties.filter((p) => p.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-kera-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="kera-card p-10 text-center text-slate-600">
          განცხადებები არ მოიძებნა
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((property) => (
            <article
              key={property.id}
              className="kera-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-28">
                {property.images?.[0] ? (
                  <Image
                    src={property.images[0]}
                    alt={property.address}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    ფოტო არაა
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[property.status]}`}
                  >
                    {STATUS_LABELS[property.status]}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(property.created_at).toLocaleDateString("ka-GE")}
                  </span>
                </div>
                <p className="mt-1 font-bold text-kera-slate">
                  {formatPrice(property.price, property.currency)} —{" "}
                  {property.address}
                </p>
                <p className="text-sm text-slate-500">
                  {formatPropertyType(property.property_type)} ·{" "}
                  {formatDealType(property.deal_type)} · {property.owner_name} ·{" "}
                  {property.owner_phone}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(property)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-kera-tbc"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  რედაქტირება
                </button>
                {property.status !== "active" && (
                  <button
                    type="button"
                    onClick={() => updateStatus(property.id, "active")}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    გამოქვეყნება
                  </button>
                )}
                {property.status === "active" && (
                  <button
                    type="button"
                    onClick={() => updateStatus(property.id, "archived")}
                    className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    დამალვა
                  </button>
                )}
                {property.status !== "archived" && property.status !== "active" && (
                  <button
                    type="button"
                    onClick={() => updateStatus(property.id, "archived")}
                    className="flex items-center gap-1 rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    არქივი
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteProperty(property.id)}
                  className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  წაშლა
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <EditModal
          property={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            fetchProperties();
          }}
        />
      )}
    </div>
  );
}

function EditModal({
  property,
  onClose,
  onSaved,
}: {
  property: Property;
  onClose: () => void;
  onSaved: () => void;
  }) {
  const [form, setForm] = useState({
    address: property.address,
    price: property.price,
    currency: property.currency,
    description: property.description ?? "",
    status: property.status,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="kera-card w-full max-w-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-kera-slate">რედაქტირება</h2>
          <button type="button" onClick={onClose}>
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium">მისამართი</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="kera-input"
            />
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="mb-1 block text-sm font-medium">ფასი</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className="kera-input"
              />
            </div>
            <div className="min-w-0">
              <label className="mb-1 block text-sm font-medium">ვალუტა</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="kera-input"
              >
                <option value="USD">USD</option>
                <option value="GEL">GEL</option>
              </select>
            </div>
          </div>
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium">სტატუსი</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as PropertyStatus,
                })
              }
              className="kera-input"
            >
              <option value="pending">მოდერაციაში</option>
              <option value="active">აქტიური</option>
              <option value="archived">არქივი</option>
            </select>
          </div>
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium">აღწერა</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="kera-input min-h-24 resize-y"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="kera-btn w-full py-2.5 disabled:opacity-60"
          >
            {saving ? "ინახება..." : "შენახვა"}
          </button>
        </form>
      </div>
    </div>
  );
}
