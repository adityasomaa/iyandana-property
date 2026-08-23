/** Shape of one listing. See `listings.ts` for the editable data itself. */

export const PROPERTY_TYPES = [
  "rumah",
  "villa",
  "tanah",
  "hotel",
  "komersial",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LISTING_STATUSES = ["dijual", "disewa"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const CERTIFICATES = ["SHM", "HGB", "Hak Pakai", "SHGB", "Girik"] as const;
export type Certificate = (typeof CERTIFICATES)[number];

/** A string written once per language. Both are required. */
export type Bilingual = { id: string; en: string };

export type Listing = {
  /** Listing code. Also seeds the artwork, so changing it changes the tile. */
  code: string;
  type: PropertyType;
  status: ListingStatus;
  title: Bilingual;
  /** Area or kecamatan only. Never a street address. */
  area: string;
  regency: string;
  /** Rupiah. For `disewa` this is the figure for one `pricePeriod`. */
  price: number;
  pricePeriod?: "tahun" | "bulan";
  bedrooms?: number;
  bathrooms?: number;
  /** Square metres. */
  landArea?: number;
  buildingArea?: number;
  certificate?: Certificate;
  description: Bilingual;
  /** How many artwork panels this listing shows in its gallery. */
  views: number;
};
