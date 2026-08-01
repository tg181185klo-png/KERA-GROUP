/**
 * Compact map popup address.
 * e.g. "წყალტუბოს მუნიციპალიტეტი, სოფ გუმბრა" → "წყალტუბო, სოფ. გუმბრა"
 */

/** Convert Georgian place-name suffix to nominative (სახელობითი ბრუნვა). */
export function toNominativePlaceName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  const cityPrefix = trimmed.match(/^(ქ\.?\s*)(.+)$/iu);
  if (cityPrefix) {
    const prefix = cityPrefix[1]!.includes(".") ? "ქ. " : "ქ ";
    return prefix + toNominativePlaceName(cityPrefix[2]!);
  }

  // ნათესაობითი -ის: თბილისის → თბილისი, ბათუმის → ბათუმი
  if (/^[\p{L}]+ის$/u.test(trimmed)) {
    return `${trimmed.slice(0, -2)}ი`;
  }

  // ნათესაობითი -ოს: წყალტუბოს → წყალტუბო
  if (/^[\p{L}]+ოს$/u.test(trimmed)) {
    return `${trimmed.slice(0, -2)}ო`;
  }

  // ნათესაობითი -ას: ზუგდidას? rare — skip unless needed

  // მიცემითი -ს: თბილისს → თბილისი (not -ოს / -ის)
  if (/^[\p{L}]+[^ოი]ს$/u.test(trimmed) || /^[\p{L}]{3,}ს$/u.test(trimmed)) {
    if (!trimmed.endsWith("ოს") && !trimmed.endsWith("ის")) {
      return `${trimmed.slice(0, -1)}ი`;
    }
  }

  return trimmed;
}

function normalizeCityPart(part: string): string {
  return toNominativePlaceName(part);
}

function formatVillagePart(part: string): string {
  const village = part
    .replace(/^სოფ\.?\s+/iu, "")
    .replace(/^ს\.?\s+/iu, "")
    .trim();
  return village ? `სოფ. ${village}` : "";
}

export function formatDisplayAddress(address: string): string {
  if (!address || address === "—") return address;

  let s = address
    .replace(/\s*მუნიციპალიტეტი\s*/giu, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s+/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!s) return address;

  if (s.includes(",")) {
    const parts = s
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const formatted = parts.map((part, index) => {
      if (/^სოფ\.?\s+/iu.test(part) || /^ს\.?\s+/iu.test(part)) {
        return formatVillagePart(part);
      }
      // First segment is usually municipality/city — use nominative
      if (index === 0) {
        return normalizeCityPart(part);
      }
      return part;
    });

    return formatted.filter(Boolean).join(", ");
  }

  const villageInline = s.match(/^(.+?)\s+სოფ\.?\s+(.+)$/iu);
  if (villageInline) {
    const city = normalizeCityPart(villageInline[1]!);
    const village = formatVillagePart(`სოფ ${villageInline[2]!}`);
    return [city, village].filter(Boolean).join(", ");
  }

  return normalizeCityPart(s);
}
