/** Cities with selectable districts in hero search. */
export const CITIES_WITH_DISTRICTS = {
  tbilisi: [
    "old-tbilisi",
    "vake",
    "saburtalo",
    "didube",
    "chughureti",
    "isani",
    "samgori",
    "gldani",
    "nadzaladevi",
    "mtatsminda",
  ],
  batumi: [
    "center",
    "bagrationi",
    "makhinjauri",
    "gonio",
    "khelvachauri",
    "chakvi",
    "bartskhana",
    "airport",
  ],
  kutaisi: [
    "avtokarkhana",
    "gamardzveba",
    "ukimerioni",
    "city-museum",
    "sapichkhia",
    "kakhianouri",
    "dzelkvaiani",
    "nikea",
    "vakissubani",
    "sulkhan-saba",
    "mukhnari",
    "gumati",
  ],
} as const;

export type CityWithDistricts = keyof typeof CITIES_WITH_DISTRICTS;

export const OTHER_CITIES = [
  "rustavi",
  "gori",
  "zugdidi",
  "poti",
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
] as const;

export type SearchCityId = CityWithDistricts | (typeof OTHER_CITIES)[number];

export function cityHasDistricts(city: string): city is CityWithDistricts {
  return city in CITIES_WITH_DISTRICTS;
}

export function getDistrictsForCity(city: string): readonly string[] {
  if (cityHasDistricts(city)) {
    return CITIES_WITH_DISTRICTS[city];
  }
  return [];
}

/** All cities in display order (primary cities first, then alphabetically grouped list). */
export const ALL_SEARCH_CITIES: SearchCityId[] = [
  "tbilisi",
  "batumi",
  "kutaisi",
  ...OTHER_CITIES,
];
