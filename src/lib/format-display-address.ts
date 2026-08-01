/**
 * Compact public-facing address for listings (map popup, cards, detail).
 * e.g. "წყალტუბოს მუნიციპალიტეტი, სოფ გუმბრა" → "წყალტუბო, სოფ. გუმბრა"
 */
function normalizeCityPart(part: string): string {
  const trimmed = part.trim();
  if (!trimmed) return trimmed;

  if (/^ქ\.?\s+/iu.test(trimmed)) {
    return trimmed.replace(/^ქ\.?\s+/iu, "ქ. ").trim();
  }

  // Single-word Georgian genitive: წყალტუბოს → წყალტუბო
  if (/^[\p{L}]+ოს$/u.test(trimmed)) {
    return trimmed.replace(/ოს$/u, "ო");
  }

  // თბილისის → თბილისი
  if (/^[\p{L}]+ის$/u.test(trimmed)) {
    return trimmed.replace(/ის$/u, "ი");
  }

  return trimmed;
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
    .replace(/\s*მუნიციპალიტეტი\b/giu, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!s) return address;

  // "წყალტუბოს სოფ გუმბრა" (no comma)
  const villageInline = s.match(/^(.+?)\s+სოფ\.?\s+(.+)$/iu);
  if (villageInline) {
    const city = normalizeCityPart(villageInline[1]!);
    const village = formatVillagePart(`სოფ ${villageInline[2]!}`);
    return [city, village].filter(Boolean).join(", ");
  }

  const parts = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return s;

  const formatted = parts.map((part) => {
    if (/^სოფ\.?\s+/iu.test(part) || /^ს\.?\s+/iu.test(part)) {
      return formatVillagePart(part);
    }
    return normalizeCityPart(part);
  });

  return formatted.filter(Boolean).join(", ");
}
