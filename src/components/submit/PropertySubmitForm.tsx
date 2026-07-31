"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import {
  CURRENCIES,
  DEAL_TYPES,
  PROPERTY_FEATURES,
  PROPERTY_TYPES,
} from "@/lib/constants";
import type { ListingType, PropertyType } from "@/lib/types/property";
import { ImageUpload } from "./ImageUpload";

export function PropertySubmitForm() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>("seller");
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleFeature(value: string) {
    setFeatures((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const payload = {
      owner_name: String(form.get("owner_name")),
      owner_phone: String(form.get("owner_phone")),
      owner_email: String(form.get("owner_email") || ""),
      address: String(form.get("address")),
      property_type: String(form.get("property_type")) as PropertyType,
      deal_type: String(form.get("deal_type")),
      price: Number(form.get("price")),
      currency: String(form.get("currency")),
      description: String(form.get("description") || ""),
      bedrooms: form.get("bedrooms")
        ? Number(form.get("bedrooms"))
        : undefined,
      area_sqm: form.get("area_sqm")
        ? Number(form.get("area_sqm"))
        : undefined,
      features,
      listing_type: listingType,
      images,
    };

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "განცხადების გაგზავნა ვერ მოხერხდა");
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "შეცდომა მოხდა");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="kera-card mx-auto max-w-xl p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Send className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-kera-slate">
          განცხადება გაგზავნილია!
        </h2>
        <p className="mt-2 text-slate-600">
          თქვენი განცხადება მოდერაციაშია. დამტკიცების შემდეგ გამოჩნდება საიტზე.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { value: "seller", label: "გამყიდველი" },
            { value: "developer", label: "დეველოპერი" },
          ] as const
        ).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setListingType(value)}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-colors ${
              listingType === value
                ? "kera-btn"
                : "border border-slate-200 text-slate-600 hover:border-kera-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="მფლობელის სახელი" name="owner_name" required />
        <Field label="ტელეფონი" name="owner_phone" type="tel" required />
        <Field
          label="ელ-ფოსტა"
          name="owner_email"
          type="email"
          className="sm:col-span-2"
        />

        <SelectField
          label="ობიექტის ტიპი"
          name="property_type"
          options={PROPERTY_TYPES.filter((t) => t.value)}
          required
        />
        <SelectField
          label="გარიგების ტიპი"
          name="deal_type"
          options={DEAL_TYPES}
          required
        />

        <Field label="მისამართი" name="address" required className="sm:col-span-2" />

        <Field label="ფასი" name="price" type="number" min={0} required />
        <SelectField
          label="ვალუტა"
          name="currency"
          options={CURRENCIES}
          required
        />

        <Field label="ოთახების რაოდენობა" name="bedrooms" type="number" min={0} />
        <Field label="ფართობი (მ²)" name="area_sqm" type="number" min={0} />

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            აღწერა
          </label>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-kera-primary focus:ring-2 focus:ring-kera-primary/20"
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">მახასიათებლები</p>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_FEATURES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleFeature(value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                features.includes(value)
                  ? "bg-kera-primary text-white"
                  : "border border-slate-200 text-slate-600 hover:border-kera-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">ფოტოები</p>
        <ImageUpload images={images} onChange={setImages} />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="kera-btn flex w-full items-center justify-center gap-2 py-3.5 disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            იგზავნება...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            განცხადების გაგზავნა
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  min,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: number;
  className?: string;
}) {
  const id = `field-${name}`;
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        min={min}
        className="kera-input"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  className,
}: {
  label: string;
  name: string;
  options: readonly { value: string; label: string }[];
  required?: boolean;
  className?: string;
}) {
  const id = `field-${name}`;
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        className="kera-input"
      >
        {options.map(({ value, label: optLabel }) => (
          <option key={value} value={value}>
            {optLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
