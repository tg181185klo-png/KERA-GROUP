import {
  Building2,
  Camera,
  ChartLine,
  Home,
  KeyRound,
} from "lucide-react";

export const SITE_NAME = "კერა ჯგუფი";
export const SITE_NAME_GE = "კერა ჯგუფი";
export const SITE_TAGLINE = "KERA GROUP";

export const CONTACT_EMAIL = "info@keragroup.ge";
export const CONTACT_PHONE = "+995 551 70 55 11";
export const CONTACT_PHONE_HREF = "tel:+995551705511";
export const CONTACT_ADDRESS = "თბილისი, საქართველო";

export const NAV_LINKS = [
  { href: "/services", label: "სერვისები" },
  { href: "/map", label: "რუკა" },
  { href: "/properties", label: "ქონება" },
  { href: "/#calculator", label: "კალკულატორი" },
  { href: "/dashboard/add-property", label: "განთავსება" },
] as const;

export const PROPERTY_TYPES = [
  { value: "apartment", label: "ბინა" },
  { value: "house", label: "სახლი" },
  { value: "commercial", label: "კომერციული" },
  { value: "land", label: "მიწის ნაკვეთი" },
] as const;

export const DEAL_TYPES = [
  { value: "buy", label: "ყიდვა" },
  { value: "rent", label: "ქირავდება" },
] as const;

export const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "GEL", label: "GEL (₾)" },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: "მოდერაციაში",
  active: "აქტიური",
  archived: "არქივი",
};

export const FALLBACK_RATES = {
  USD: 2.65,
  EUR: 2.88,
  GBP: 3.35,
};

export const KERA_SERVICES = [
  {
    title: "KERA Realty",
    description: "პრემიუმ უძრავი ქონების შერჩევა, ყიდვა და გაყიდვა საქართველოს ყველა რეგიონში.",
    icon: Home,
    accent: "blue" as const,
  },
  {
    title: "KERA Developments",
    description: "საინვესტიციო და საცხოვრებელი პროექტების განვითარება საერთაშორისო სტანდარტით.",
    icon: Building2,
    accent: "amber" as const,
  },
  {
    title: "KERA Invest",
    description: "საინვესტიციო კონსულტაცია, ROI ანალიზი და პორტფელის მართვა.",
    icon: ChartLine,
    accent: "blue" as const,
  },
  {
    title: "KERA Property Management",
    description: "ქონების სრული მართვა — ქირა, მოვლა, საკონტროლო და ფინანსური ანგარიშგება.",
    icon: KeyRound,
    accent: "amber" as const,
  },
  {
    title: "KERA Media",
    description: "პროფესიული ფოტო/ვიდეო გადაღება, 3D ტურები და მარკეტინგული მასალები.",
    icon: Camera,
    accent: "blue" as const,
  },
];

export const ADMIN_COOKIE = "kera_admin_session";
export const ADMIN_USERNAME = "admin";
export const ADMIN_DEFAULT_PASSWORD = "LashaTornike123456!";
export const ADMIN_SESSION_SECRET_DEFAULT = "kera-admin-session-secret-2026";

/** NAPR public cadastral ArcGIS MapServer (maps.gov.ge data source) */
export const CADASTRAL_API_BASE =
  process.env.CADASTRAL_API_URL ??
  "http://gisappsn.reestri.gov.ge/ArcGIS/rest/services/CadRepGeo/MapServer";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.keragroup.ge";

export const PROPERTY_FEATURES = [
  { value: "balcony", label: "აივანი" },
  { value: "parking", label: "პარკინგი" },
  { value: "renovation", label: "რემონტი" },
] as const;

export const SERVICES = [
  {
    title: "KERA Realty",
    description:
      "პრემიუმ უძრავი ქონების შერჩევა, ყიდვა და გაყიდვა საქართველოს ყველა რეგიონში.",
    icon: "building" as const,
  },
  {
    title: "KERA Developments",
    description:
      "საინვესტიციო და საცხოვრებელი პროექტების განვითარება საერთაშორისო სტანდარტით.",
    icon: "crane" as const,
  },
  {
    title: "KERA Invest",
    description: "საინვესტიციო კონსულტაცია, ROI ანალიზი და პორტფელის მართვა.",
    icon: "chart" as const,
  },
  {
    title: "KERA Property Management",
    description:
      "ქონების სრული მართვა — ქირა, მოვლა, საკონტროლო და ფინანსური ანგარიშგება.",
    icon: "key" as const,
  },
  {
    title: "KERA Media",
    description:
      "პროფესიული ფოტო/ვიდეო გადაღება, 3D ტურები და მარკეტინგული მასალები.",
    icon: "camera" as const,
  },
];
