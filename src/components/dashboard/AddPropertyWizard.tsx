"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, Check } from "lucide-react";
import {
  LocationFields,
} from "@/components/shared/LocationFields";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { MapPicker } from "@/components/dashboard/MapPicker";
import { ImageUpload } from "@/components/submit/ImageUpload";
import { useLocale } from "@/i18n/LocaleProvider";
import { getMapDealTypeOptions } from "@/i18n/nav";
import {
  isValidCadastralCode,
  formatCadastralCode,
  formatPrice,
  formatPricePerSqm,
} from "@/lib/cadastral";
import type { PropertyListingFormData, MapDealType } from "@/lib/types/property-listing";
import { EMPTY_LISTING_FORM, rowToFormData } from "@/lib/listing-form";

const STEPS = ["ძირითადი", "მფლობელი", "მდებარეობა", "ფოტოები", "შეჯამება"];

interface AddPropertyWizardProps {
  mode?: "create" | "edit";
  listingId?: string;
  initialForm?: PropertyListingFormData;
  wasActive?: boolean;
}

export function AddPropertyWizard({
  mode = "create",
  listingId,
  initialForm,
  wasActive: _wasActive = false,
}: AddPropertyWizardProps) {
  const router = useRouter();
  const { t } = useLocale();
  const dealTypeOptions = getMapDealTypeOptions(t);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PropertyListingFormData>(
    initialForm ?? EMPTY_LISTING_FORM,
  );
  const [locationCity, setLocationCity] = useState("");
  const [locationArea, setLocationArea] = useState("");
  const [locationBase, setLocationBase] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
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

  function syncAddress(base: string, detail: string) {
    const composed = detail
      ? `${base}${base ? ", " : ""}${detail}`
      : base;
    updateField("address", composed);
  }

  async function lookupCadastral() {
    setCadastralError("");
    if (!isValidCadastralCode(form.cadastral_code)) {
      setCadastralError(t.wizard.cadastralFormatError);
      return;
    }

    setCadastralLoading(true);
    try {
      const res = await fetch(
        `/api/cadastral/lookup?code=${encodeURIComponent(form.cadastral_code)}`,
      );
      const data = await res.json();

      if (!res.ok) {
        setCadastralError(data.error ?? t.wizard.cadastralLookupFailed);
        return;
      }

      setForm((prev) => ({
        ...prev,
        cadastral_code: formatCadastralCode(data.cadastral_code ?? prev.cadastral_code),
        latitude: data.latitude,
        longitude: data.longitude,
        geojson_polygon: data.geojson_polygon,
        address: prev.address || data.address || prev.address,
      }));
    } catch {
      setCadastralError(t.wizard.cadastralUnavailable);
    } finally {
      setCadastralLoading(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setSubmitError("");

    let payload = {
      ...form,
      cadastral_code: formatCadastralCode(form.cadastral_code),
    };

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
            cadastral_code: formatCadastralCode(
              lookupData.cadastral_code ?? payload.cadastral_code,
            ),
            latitude: lookupData.latitude,
            longitude: lookupData.longitude,
            geojson_polygon: lookupData.geojson_polygon,
            address: payload.address || lookupData.address || payload.address,
          };
        }
      } catch {
        // POST/PATCH also resolves cadastral server-side
      }
    }

    const url =
      mode === "edit" && listingId ? `/api/listings/${listingId}` : "/api/listings";
    const method = mode === "edit" ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setSubmitError(data.error ?? t.common.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard?submitted=pending&edited=1");
    router.refresh();
  }

  const pricePerSqm =
    form.area_sqm > 0 ? form.total_price / form.area_sqm : 0;

  const dealTypeLabel =
    dealTypeOptions.find((o) => o.value === form.deal_type)?.label ?? form.deal_type;

  return (
    <div>
      {mode === "edit" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t.dashboard.editResubmitNotice}
        </div>
      )}

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
        {step === 0 && (
          <div className="space-y-4">
            <Input
              label={t.wizard.fieldTitle}
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder={t.wizard.titlePlaceholder}
            />
            <Textarea
              label={t.wizard.fieldDescription}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
            <Select
              label={t.wizard.fieldDealType}
              required
              value={form.deal_type}
              onChange={(e) =>
                updateField("deal_type", e.target.value as MapDealType)
              }
              options={[...dealTypeOptions]}
            />
            <div className="grid min-w-0 grid-cols-2 gap-4">
              <Input
                label={t.wizard.fieldPrice}
                type="number"
                required
                min={0}
                value={form.total_price || ""}
                onChange={(e) =>
                  updateField("total_price", Number(e.target.value))
                }
              />
              <Input
                label={t.wizard.fieldArea}
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
                {t.wizard.pricePerSqm}: {formatPricePerSqm(pricePerSqm)}
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid min-w-0 grid-cols-2 gap-4">
              <Input
                label={t.wizard.fieldOwnerFirst}
                required
                value={form.owner_first_name}
                onChange={(e) =>
                  updateField("owner_first_name", e.target.value)
                }
              />
              <Input
                label={t.wizard.fieldOwnerLast}
                required
                value={form.owner_last_name}
                onChange={(e) =>
                  updateField("owner_last_name", e.target.value)
                }
              />
            </div>
            <LocationFields
              city={locationCity}
              areaValue={locationArea}
              onCityChange={setLocationCity}
              onAreaChange={setLocationArea}
              onAddressChange={(base) => {
                setLocationBase(base);
                syncAddress(base, addressDetail);
              }}
            />
            <Input
              label={t.wizard.fieldStreet}
              value={addressDetail}
              onChange={(e) => {
                const detail = e.target.value;
                setAddressDetail(detail);
                syncAddress(locationBase, detail);
              }}
              placeholder={t.wizard.streetPlaceholder}
            />
            <Input
              label={t.wizard.fieldPhone}
              required
              value={form.phone_number}
              onChange={(e) => updateField("phone_number", e.target.value)}
              placeholder="+995 5XX XX XX XX"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                label={t.wizard.fieldCadastral}
                required
                value={form.cadastral_code}
                onChange={(e) => updateField("cadastral_code", e.target.value)}
                onBlur={(e) => {
                  const formatted = formatCadastralCode(e.target.value);
                  if (formatted !== e.target.value) {
                    updateField("cadastral_code", formatted);
                  }
                }}
                placeholder="01.10.15.001.002"
                error={cadastralError}
                className="flex-1"
              />
              <div className="flex items-end">
                <Button type="button" onClick={lookupCadastral} disabled={cadastralLoading}>
                  <Search className="h-4 w-4" />
                  {cadastralLoading ? t.wizard.searching : t.wizard.search}
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-400">{t.wizard.cadastralHint}</p>
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

        {step === 3 && (
          <ImageUpload
            images={form.images}
            onChange={(images) => updateField("images", images)}
          />
        )}

        {step === 4 && (
          <div className="space-y-3 text-sm">
            <ReviewRow label={t.wizard.fieldTitle} value={form.title} />
            <ReviewRow
              label={t.wizard.fieldCadastral}
              value={formatCadastralCode(form.cadastral_code)}
            />
            <ReviewRow
              label={t.wizard.fieldOwnerFirst}
              value={`${form.owner_first_name} ${form.owner_last_name}`}
            />
            <ReviewRow label={t.wizard.fieldAddress} value={form.address} />
            <ReviewRow label={t.wizard.fieldPhone} value={form.phone_number} />
            <ReviewRow label={t.wizard.fieldPrice} value={formatPrice(form.total_price)} />
            <ReviewRow label={t.wizard.fieldArea} value={`${form.area_sqm} ${t.common.sqm}`} />
            <ReviewRow
              label={t.wizard.pricePerSqm}
              value={formatPricePerSqm(pricePerSqm)}
            />
            <ReviewRow label={t.wizard.fieldDealType} value={dealTypeLabel} />
            <ReviewRow label={t.wizard.fieldPhotos} value={`${form.images.length}`} />
            {submitError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-red-600">
                {submitError}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            {t.wizard.back}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              {t.wizard.next}
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading
                ? t.wizard.saving
                : mode === "edit"
                  ? t.wizard.saveChanges
                  : t.wizard.publish}
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
