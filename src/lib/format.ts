import type { DealType, PropertyType } from "@/lib/types/property";

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "ბინა",
  house: "სახლი",
  commercial: "კომერციული",
  land: "მიწის ნაკვეთი",
};

const DEAL_TYPE_LABELS: Record<DealType, string> = {
  sale: "იყიდება",
  rent: "ქირავდება",
};

export function formatPropertyType(type: PropertyType): string {
  return PROPERTY_TYPE_LABELS[type] ?? type;
}

export function formatDealType(type: DealType): string {
  return DEAL_TYPE_LABELS[type] ?? type;
}

export function formatPrice(price: number, currency: string): string {
  const symbol = currency === "GEL" ? "₾" : "$";
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(price);
  return currency === "GEL" ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

export function calculateMortgage(
  principal: number,
  months: number,
  annualRate: number
) {
  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) {
    const monthly = principal / months;
    return {
      monthlyPayment: Math.round(monthly),
      totalPayment: Math.round(monthly * months),
      totalInterest: 0,
    };
  }

  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalPayment = monthlyPayment * months;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalPayment - principal),
  };
}
