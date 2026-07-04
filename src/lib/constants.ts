export const SITE_NAME = "KERA GROUP";
export const SITE_NAME_GE = "კერა ჯგუფი";

export const CONTACT_EMAIL = "info@keragroup.ge";
export const CONTACT_PHONE = "+995 595 157 158";
export const CONTACT_PHONE_HREF = "tel:+995595157158";
export const CONTACT_ADDRESS = "თბილისი, საქართველო";

export const NAV_LINKS = [
  { href: "/", label: "მთავარი" },
  { href: "/#services", label: "სერვისები" },
  { href: "/#featured", label: "ქონება" },
  { href: "/#calculator", label: "კალკულატორი" },
] as const;

export const PROPERTY_TYPES = [
  { value: "", label: "ყველა ტიპი" },
  { value: "apartment", label: "ბინა" },
  { value: "house", label: "სახლი" },
  { value: "commercial", label: "კომერციული" },
  { value: "land", label: "მიწის ნაკვეთი" },
] as const;

export const DEAL_TYPES = [
  { value: "sale", label: "ყიდვა" },
  { value: "rent", label: "ქირავდება" },
] as const;

export const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "GEL", label: "GEL (₾)" },
] as const;

export const PROPERTY_FEATURES = [
  { value: "balcony", label: "აივანი" },
  { value: "parking", label: "პარკინგი" },
  { value: "renovated", label: "რემონტი" },
] as const;

export const SERVICES = [
  {
    title: "KERA Realty",
    description:
      "პრემიუმ უძრავი ქონების შერჩევა, ყიდვა და გაყიდვა საქართველოს ყველა რეგიონში.",
    icon: "building",
  },
  {
    title: "KERA Developments",
    description:
      "საინვესტიციო და საცხოვრებელი პროექტების განვითარება საერთაშორისო სტანდარტით.",
    icon: "crane",
  },
  {
    title: "KERA Invest",
    description: "საინვესტიციო კონსულტაცია, ROI ანალიზი და პორტფელის მართვა.",
    icon: "chart",
  },
  {
    title: "KERA Property Management",
    description:
      "ქონების სრული მართვა — ქირა, მოვლა, საკონტროლო და ფინანსური ანგარიშგება.",
    icon: "key",
  },
  {
    title: "KERA Media",
    description:
      "პროფესიული ფოტო/ვიდეო გადაღება, 3D ტურები და მარკეტინგული მასალები.",
    icon: "camera",
  },
] as const;
