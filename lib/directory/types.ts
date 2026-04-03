// =========================
// PRODUCT TYPES
// =========================

export type ProductCategory =
  | "dry_food"
  | "wet_food"
  | "frozen_raw"
  | "freeze_dried_dehydrated_air_dried"
  | "treats"
  | "supplements"
  | "allergy_tests"
  | "dna_tests";

export type Species = "dog" | "cat";

export type BarcodeType = "UPC" | "EAN" | "GTIN" | "UNKNOWN";

export type AffiliateLink = {
  retailer: string;
  url: string;
  label: string;
};

export type ApiLookupProduct = {
  barcode: string;
  name?: string;
  brand?: string;
  imageUrl?: string;
  ingredientsText?: string;
  note?: string;
  source: "go-upc" | "openpetfoodfacts" | "openfoodfacts" | "none";
};

export type Product = {
  barcode: string;
  barcodeType: BarcodeType;
  brand: string;
  name: string;
  speciesTargets: Species[];
  productCategory: ProductCategory | null;
  productSubcategory: string | null;
  sizeValue: number | null;
  sizeUnit:
    | "lb"
    | "oz"
    | "kg"
    | "g"
    | "mg"
    | "L"
    | "mL"
    | "count"
    | "pack"
    | null;
  imageUrl: string;
  ingredientsText: string;
  source: "manual" | "api" | "imported";
  verified: boolean;
  notes: string;
  lastUpdated: string;
  affiliateLinks: AffiliateLink[];
};

// =========================
// PET PROFILE TYPES
// =========================

export type PetProfile = {
  id: string;
  name: string;
  species: Species;
  allergies: string[];
  sensitivities: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

// =========================
// SCAN HISTORY TYPES
// =========================

export type ScanHistoryItem = {
  id: string;
  barcode: string;
  scannedAt: string;
  name: string;
  brand: string;
  verdict: "SAFE" | "AVOID" | "UNKNOWN";
  matchedAllergens: string[];
  petProfileId: string | null;
};
