import { downloadCsv } from "@/lib/export-csv";
import {
  DEAL_TYPE_LABELS,
  LISTING_STATUS_LABELS,
  type ListingStatus,
  type MapDealType,
} from "@/lib/types/property-listing";

export interface ListingExportRow {
  id: string;
  title: string;
  description: string;
  cadastral_code: string;
  owner_first_name: string;
  owner_last_name: string;
  address: string;
  phone_number: string;
  total_price: number;
  area_sqm: number;
  deal_type?: MapDealType;
  listing_type: string;
  status: ListingStatus;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  user_id: string;
  user_email?: string;
  created_at: string;
  updated_at?: string;
}

export function exportListingsToExcel(listings: ListingExportRow[]): void {
  if (listings.length === 0) return;

  downloadCsv(
    `kera-listings-${new Date().toISOString().slice(0, 10)}.csv`,
    [
      "ID",
      "სათაური",
      "აღწერა",
      "კად. კოდი",
      "მფლობელი (სახელი)",
      "მფლობელი (გვარი)",
      "მისამართი",
      "ტელეფონი",
      "ფასი (USD)",
      "ფართობი (მ²)",
      "გარიგების ტიპი",
      "განცხადების ტიპი",
      "სტატუსი",
      "გრძედი",
      "განედი",
      "ფოტოები",
      "user_id",
      "ელ-ფოსტა",
      "შექმნა",
      "განახლება",
    ],
    listings.map((item) => [
      item.id,
      item.title,
      item.description,
      item.cadastral_code,
      item.owner_first_name,
      item.owner_last_name,
      item.address,
      item.phone_number,
      item.total_price,
      item.area_sqm,
      item.deal_type
        ? (DEAL_TYPE_LABELS[item.deal_type] ?? item.deal_type)
        : "",
      item.listing_type,
      LISTING_STATUS_LABELS[item.status] ?? item.status,
      item.latitude ?? "",
      item.longitude ?? "",
      item.images.join("; "),
      item.user_id,
      item.user_email ?? "",
      item.created_at
        ? new Date(item.created_at).toLocaleString("ka-GE")
        : "",
      item.updated_at
        ? new Date(item.updated_at).toLocaleString("ka-GE")
        : "",
    ]),
  );
}
