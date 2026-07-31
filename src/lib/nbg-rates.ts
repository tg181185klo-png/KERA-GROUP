export interface NbgRate {
  code: string;
  rate: number;
}

export const NBG_CURRENCY_CODES = ["USD", "EUR", "GBP"] as const;

/** Last-known NBG rates — used only when the API is unreachable. */
export const FALLBACK_NBG_RATES: NbgRate[] = [
  { code: "USD", rate: 2.6266 },
  { code: "EUR", rate: 3.0159 },
  { code: "GBP", rate: 3.5202 },
];

const NBG_API_URL =
  "https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json";

export async function fetchNbgRates(): Promise<{
  rates: NbgRate[];
  date: string | null;
  source: "nbg" | "fallback";
}> {
  try {
    const res = await fetch(NBG_API_URL, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return { rates: FALLBACK_NBG_RATES, date: null, source: "fallback" };
    }

    const data = await res.json();
    const currencies = data?.[0]?.currencies ?? [];
    const date =
      typeof data?.[0]?.date === "string" ? data[0].date : null;

    const rates = NBG_CURRENCY_CODES.map((code) => {
      const item = currencies.find(
        (c: { code: string; rate: number }) => c.code === code,
      );
      return item ? { code, rate: Number(item.rate) } : null;
    }).filter(Boolean) as NbgRate[];

    if (rates.length === 0) {
      return { rates: FALLBACK_NBG_RATES, date: null, source: "fallback" };
    }

    return { rates, date, source: "nbg" };
  } catch {
    return { rates: FALLBACK_NBG_RATES, date: null, source: "fallback" };
  }
}
