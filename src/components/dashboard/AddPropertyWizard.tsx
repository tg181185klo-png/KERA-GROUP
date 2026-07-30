"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { MapPicker } from "@/components/dashboard/MapPicker";
import { ImageUpload } from "@/components/submit/ImageUpload";
import {
  isValidCadastralCode,
  formatPrice,
  formatPricePerSqm,
} from "@/lib/cadastral";
import type { PropertyListingFormData, ListingType } from "@/lib/types/property-listing";

const STEPS = ["ძირითადი", "მფლობელი", "მდებარეობა", "ფოტოები", "შეჯამება"];

const EMPTY_FORM: PropertyListingFormData = {
  title: "",
  description: "",
  cadastral_code: "",
  owner_first_name: "",
  owner_last_name: "",
  address: "",
  phone_number: "",
  total_price: 0,
  area_sqm: 0,
  listing_type: "sale",
  latitude: null,
  longitude: null,
  geojson_polygon: null,
  images: [],
};

export function AddPropertyWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PropertyListingFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [cadastralError, setCadastralError] = useState("");
  const [cadastralLoading, setCadastralLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function updateField<K extends keyof PropertyListingFormData>(
    key: K,
    value: PropertyListingFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function lookupCadastral() {
    setCadastralError("");
    if (!isValidCadastralCode(form.cadastral_code)) {
      setCadastralError("ფორმატი: XX.XX.XX.XXX.XXX (მაგ. 01.10.15.001.002)");
      return;
    }

    setCadastralLoading(true);
    try {
      const res = await fetch(
        `/api/cadastral/lookup?code=${encodeURIComponent(form.cadastral_code)}`,
      );
      const data = await res.json();

      if (!res.ok) {
        setCadastralError(data.error ?? "კადასტრის ძებნა ვერ მოხერხდა");
        return;
      }

      setForm((prev) => ({
        ...prev,
        cadastral_code: data.cadastral_code ?? prev.cadastral_code,
        latitude: data.latitude,
        longitude: data.longitude,
        geojson_polygon: data.geojson_polygon,
        address: prev.address || data.address || prev.address,
      }));
    } catch {
      setCadastralError("კადასტრის სერვისი დროებით მიუწვდომელია");
    } finally {
      setCadastralLoading(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setSubmitError("");

    let payload = { ...form };

    if (
      isValidCadastralCode(form.cadastral_code) &&
      (form.latitude == null || form.geojson_polygon == null)
    ) {
      try {
        const lookupRes = await fetch(
          `/api/cadastral/lookup?code=${encodeURIComponent(form.cadastral_code)}`,
        );
        const lookupData = await lookupRes.json();
        if (lookupRes.ok) {
          payload = {
            ...payload,
            cadastral_code: lookupData.cadastral_code ?? payload.cadastral_code,
            latitude: lookupData.latitude,
            longitude: lookupData.longitude,
            geojson_polygon: lookupData.geojson_polygon,
            address: payload.address || lookupData.address || payload.address,
          };
        }
      } catch {
        // POST /api/listings also resolves cadastral server-side
      }
    }

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setSubmitError(data.error ?? "შეცდომა მოხდა");
      setLoading(false);
      return;
    }

    router.push("/dashboard?submitted=pending");
    router.refresh();
  }

  const pricePerSqm =
    form.area_sqm > 0 ? form.total_price / form.area_sqm : 0;

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex flex-1 flex-col items-center gap-1 ${
              i <= step ? "text-kera-blue" : "text-slate-300"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                i < step
                  ? "bg-kera-blue text-white"
                  : i === step
                    ? "border-2 border-kera-blue bg-white text-kera-blue"
                    : "border-2 border-slate-200 bg-white text-slate-300"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="hidden text-xs font-medium sm:block">{label}</span>
          </div>
        ))}
      </div>

      <Card className="p-6">
        {/* Step 0: Basic info */}
        {step === 0 && (
          <div className="space-y-4">
            <Input
              label="სათაური"
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="მაგ. 3-ოთახiani ბინა ვაკეში"
            />
            <Textarea
              label="აღწერა"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
            <Select
              label="ტიპი"
              value={form.listing_type}
              onChange={(e) =>
                updateField("listing_type", e.target.value as ListingType)
              }
              options={[
                { value: "sale", label: "იყიდება" },
                { value: "rent", label: "ქირავდება" },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="საერთო ფასი (USD)"
                type="number"
                required
                min={0}
                value={form.total_price || ""}
                onChange={(e) =>
                  updateField("total_price", Number(e.target.value))
                }
              />
              <Input
                label="ფართობი (მ²)"
                type="number"
                required
                min={1}
                value={form.area_sqm || ""}
                onChange={(e) =>
                  updateField("area_sqm", Number(e.target.value))
                }
              />
            </div>
            {form.area_sqm > 0 && form.total_price > 0 && (
              <p className="text-sm text-slate-500">
                ფასი მ²-ზე: {formatPricePerSqm(pricePerSqm)}
              </p>
            )}
          </div>
        )}

        {/* Step 1: Owner info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="მფლობელის სახელი"
                required
                value={form.owner_first_name}
                onChange={(e) =>
                  updateField("owner_first_name", e.target.value)
                }
              />
              <Input
                label="მფლობელის გვარი"
                required
                value={form.owner_last_name}
                onChange={(e) =>
                  updateField("owner_last_name", e.target.value)
                }
              />
            </div>
            <Input
              label="მისამართი"
              required
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="თბილისი, ვაკე, ..."
            />
            <Input
              label="ტელეფონი"
              required
              value={form.phone_number}
              onChange={(e) => updateField("phone_number", e.target.value)}
              placeholder="+995 5XX XX XX XX"
            />
          </div>
        )}

        {/* Step 2: Location / cadastral */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                label="საკადასტრო კოდი"
                required
                value={form.cadastral_code}
                onChange={(e) => updateField("cadastral_code", e.target.value)}
                placeholder="01.10.15.001.002"
                error={cadastralError}
                className="flex-1"
              />
              <div className="flex items-end">
                <Button type="button" onClick={lookupCadastral} disabled={cadastralLoading}>
                  <Search className="h-4 w-4" />
                  {cadastralLoading ? "ძებნა..." : "ძებნა"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              კადასტრის კოდი იღება საჯარო რეესტრის რუქიდან (NAPR) და ზუსტ პოლიგონზე
              განთავსდება მონიშვნა.
            </p>
            <MapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              polygon={form.geojson_polygon}
              onLocationChange={(lat, lng) => {
                setForm((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }));
              }}
            />
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <ImageUpload
            images={form.images}
            onChange={(images) => updateField("images", images)}
          />
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-3 text-sm">
            <ReviewRow label="სათაური" value={form.title} />
            <ReviewRow label="კად. კოდი" value={form.cadastral_code} />
            <ReviewRow
              label="მფლობელი"
              value={`${form.owner_first_name} ${form.owner_last_name}`}
            />
            <ReviewRow label="მისამართი" value={form.address} />
            <ReviewRow label="ტელეფონი" value={form.phone_number} />
            <ReviewRow label="ფასი" value={formatPrice(form.total_price)} />
            <ReviewRow label="ფართობი" value={`${form.area_sqm} მ²`} />
            <ReviewRow
              label="ფასი/მ²"
              value={formatPricePerSqm(pricePerSqm)}
            />
            <ReviewRow
              label="ტიპი"
              value={form.listing_type === "sale" ? "იყიდება" : "ქირავდება"}
            />
            <ReviewRow label="ფოტოები" value={`${form.images.length} ცალი`} />
            {submitError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-red-600">
                {submitError}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            უკან
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              შემდეგი
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "იგზავნება..." : "განთავსება"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
