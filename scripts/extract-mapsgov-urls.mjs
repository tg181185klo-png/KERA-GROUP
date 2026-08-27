import fs from "fs";

const text = fs.readFileSync("scripts/mapsgov.js", "utf8");

function contexts(term, count = 10) {
  const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  let m;
  let i = 0;
  while ((m = re.exec(text)) && i < count) {
    console.log(`\n--- ${term} #${i + 1} ---`);
    console.log(text.slice(Math.max(0, m.index - 60), m.index + 400).replace(/\s+/g, " "));
    i++;
  }
}

contexts("resultlink", 5);
contexts("getbylbl", 5);
contexts("search_result_a_el", 3);
contexts("mapInfoPath", 5);
contexts("res=shp", 8);
