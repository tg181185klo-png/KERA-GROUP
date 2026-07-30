# -*- coding: utf-8 -*-
"""Generate src/lib/locations/municipality-villages.ts from authoritative data file."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = Path(__file__).resolve().parent / "municipality-villages-data.txt"
OUT = ROOT / "src/lib/locations/municipality-villages.ts"

# Matches georgia.ts OTHER_CITIES minus self-governing rustavi/poti (see location-area.ts).
MUNICIPALITY_ORDER = [
    "gori",
    "zugdidi",
    "abasha",
    "adigeni",
    "ambrolauri",
    "aspindza",
    "akhalgori",
    "akhalkalaki",
    "akhaltsikhe",
    "akhmeta",
    "baghdati",
    "bolnisi",
    "borjomi",
    "gardabani",
    "gurjaani",
    "dedoplistskaro",
    "dmanisi",
    "dusheti",
    "vani",
    "zestaponi",
    "tetritskaro",
    "telavi",
    "terjola",
    "tianeti",
    "kaspi",
    "lagodekhi",
    "lanchkhuti",
    "lentekhi",
    "marneuli",
    "martvili",
    "mestia",
    "mtskheta",
    "ninotsminda",
    "ozurgeti",
    "sachkhere",
    "sagarejo",
    "samtredia",
    "senaki",
    "signagi",
    "tkibuli",
    "keda",
    "kobuleti",
    "shuakhevi",
    "chokhatauri",
    "chokhorotsku",
    "tsageri",
    "tsalenjikha",
    "tsalka",
    "tskaltubo",
    "chiatura",
    "kharagauli",
    "khashuri",
    "khelvachauri-city",
    "khobi",
    "khoni",
    "khulo",
]

GE_TO_LAT = str.maketrans(
    {
        "ა": "a",
        "ბ": "b",
        "გ": "g",
        "დ": "d",
        "ე": "e",
        "ვ": "v",
        "ზ": "z",
        "თ": "t",
        "ი": "i",
        "კ": "k",
        "ლ": "l",
        "მ": "m",
        "ნ": "n",
        "ო": "o",
        "პ": "p",
        "ჟ": "zh",
        "რ": "r",
        "ს": "s",
        "ტ": "t",
        "უ": "u",
        "ფ": "p",
        "ქ": "k",
        "ღ": "gh",
        "ყ": "q",
        "შ": "sh",
        "ჩ": "ch",
        "ც": "ts",
        "ძ": "dz",
        "წ": "ts",
        "ჭ": "ch",
        "ხ": "kh",
        "ჯ": "j",
        "ჰ": "h",
    }
)


def parse_villages(raw: str) -> list[str]:
    return [part.strip() for part in raw.split(",") if part.strip()]


def transliterate(ka: str) -> str:
    return ka.translate(GE_TO_LAT)


def slugify(text: str) -> str:
    s = transliterate(text).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "village"


def title_case_en(text: str) -> str:
    return " ".join(word.capitalize() for word in text.split())


def village_ids(municipality_id: str, villages: list[str]) -> list[tuple[str, str, str]]:
    seen: dict[str, int] = {}
    out: list[tuple[str, str, str]] = []
    for ka in villages:
        base = slugify(ka)
        count = seen.get(base, 0)
        seen[base] = count + 1
        vid = base if count == 0 else f"{municipality_id}-{base}"
        if count > 0:
            # Extra collision after prefix — append counter.
            candidate = vid
            n = 2
            while candidate in {x[0] for x in out}:
                candidate = f"{vid}-{n}"
                n += 1
            vid = candidate
        en = title_case_en(transliterate(ka))
        out.append((vid, ka, en))
    return out


def load_data() -> dict[str, list[str]]:
    data: dict[str, list[str]] = {}
    for line in DATA.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        municipality_id, _, villages_raw = line.partition("|")
        municipality_id = municipality_id.strip()
        data[municipality_id] = parse_villages(villages_raw)
    return data


def ts_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def format_key(municipality_id: str) -> str:
    if re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", municipality_id):
        return municipality_id
    return f'"{municipality_id}"'


def generate_ts(data: dict[str, list[str]]) -> str:
    lines: list[str] = [
        'import type { MunicipalityId } from "./location-area";',
        "",
        "export type Village = { id: string; ka: string; en: string };",
        "",
        "const V = (id: string, ka: string, en: string): Village => ({ id, ka, en });",
        "",
        "export const MUNICIPALITY_VILLAGES: Record<MunicipalityId, readonly Village[]> = {",
    ]

    for municipality_id in MUNICIPALITY_ORDER:
        villages = data.get(municipality_id)
        if villages is None:
            raise KeyError(f"Missing municipality data for {municipality_id}")
        lines.append(f"  {format_key(municipality_id)}: [")
        for vid, ka, en in village_ids(municipality_id, villages):
            lines.append(
                f'    V("{ts_escape(vid)}", "{ts_escape(ka)}", "{ts_escape(en)}"),'
            )
        lines.append("  ],")

    lines.extend(
        [
            "};",
            "",
            "export function getVillagesForMunicipality(",
            "  municipality: string,",
            "): readonly Village[] {",
            "  if (municipality in MUNICIPALITY_VILLAGES) {",
            "    return MUNICIPALITY_VILLAGES[municipality as MunicipalityId];",
            "  }",
            "  return [];",
            "}",
            "",
            "export function getVillageLabel(",
            "  villages: readonly Village[],",
            "  id: string,",
            '  locale: "ka" | "en",',
            "): string {",
            "  const village = villages.find((v) => v.id === id);",
            "  if (!village) return id;",
            '  return locale === "ka" ? village.ka : village.en;',
            "}",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    data = load_data()
    missing = [m for m in MUNICIPALITY_ORDER if m not in data]
    if missing:
        raise SystemExit(f"Missing municipalities in data file: {', '.join(missing)}")
    extra = set(data) - set(MUNICIPALITY_ORDER)
    if extra:
        raise SystemExit(f"Unexpected municipalities in data file: {', '.join(sorted(extra))}")

    content = generate_ts(data)
    OUT.write_text(content, encoding="utf-8")

    total = sum(len(data[m]) for m in MUNICIPALITY_ORDER)
    print(f"Wrote {OUT.relative_to(ROOT)}")
    print(f"Municipalities: {len(MUNICIPALITY_ORDER)}")
    print(f"Villages: {total}")


if __name__ == "__main__":
    main()
