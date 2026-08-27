const codes = ["30.11.32.526", "29.08.35.125", "29.09.50.061", "33.03.40.258"];

async function lookup(code) {
  const search = await fetch("https://maps.gov.ge/map/portal/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ keyword: code, keyword_description: "" }),
  });
  const s = await search.json();
  const link = s.result?.[0]?.details?.geometry_link;
  if (!link) return { code, err: "no link" };
  const g = await fetch(`https://maps.gov.ge${link}&fmt=json&lang=ka`, {
    headers: { Accept: "application/json" },
  });
  const ct = g.headers.get("content-type") ?? "";
  const t = await g.text();
  if (!ct.includes("json")) return { code, err: "not json", head: t.slice(0, 80) };
  const data = JSON.parse(t);
  return { code, ok: true, shapeLen: data.data?.[0]?.shape?.length ?? 0 };
}

for (const code of codes) {
  console.log(await lookup(code));
}
