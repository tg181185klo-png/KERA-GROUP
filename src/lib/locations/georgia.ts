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
} as const;

export type CityWithDistricts = keyof typeof CITIES_WITH_DISTRICTS;

export const OTHER_CITIES = [
  "rustavi",
  "zugdidi",
  "poti",
  "telavi",
  "gori",
  "bakuriani",
  "borjomi",
  "mestia",
  "signagi",
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

export const ALL_SEARCH_CITIES: SearchCityId[] = [
  ...(Object.keys(CITIES_WITH_DISTRICTS) as CityWithDistricts[]),
  ...OTHER_CITIES,
];
