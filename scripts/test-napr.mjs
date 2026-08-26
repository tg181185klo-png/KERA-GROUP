const codes = ["301132526", "000301132526", "290835125", "290950061", "330340258"];
const layers = [24, 39, 44, 49, 10, 54];

async function tryQuery(layer, code, field = "UNIQ_CODE") {
  const where = `${field}='${code}'`;
  const url =
    "http://gisappsn.reestri.gov.ge/ArcGIS/rest/services/CadRepGeo/MapServer/" +
    layer +
    "/query?where=" +
    encodeURIComponent(where) +
    "&outFields=*&returnGeometry=true&outSR=4326&f=json";
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const t = await r.text();
    if (t.startsWith("{")) {
      const d = JSON.parse(t);
      if (d.features?.length) {
        return `HIT layer=${layer} code=${code} field=${field} verts=${d.features[0].geometry?.rings?.[0]?.length || 0}`;
      }
    }
    return `miss layer=${layer} code=${code} status=${r.status} head=${t.slice(0, 40)}`;
  } catch (e) {
    return `ERR layer=${layer} code=${code} ${e.message}`;
  }
}

for (const code of codes) {
  for (const layer of [24, 49]) {
    const r = await tryQuery(layer, code);
    if (r.startsWith("HIT")) console.log(r);
  }
}
console.log("done");
