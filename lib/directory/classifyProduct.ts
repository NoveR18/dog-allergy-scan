import { ApiLookupProduct, ProductCategory } from "./types";

export type ClassificationResult = {
  productCategory: ProductCategory | null;
  productSubcategory: string | null;
  confidence: number;
  source: "rule" | "api" | "unknown";
};

function normalizeClassificationText(value: string | undefined): string {
  return (value || "").trim().toLowerCase();
}

export function classifyApiLookupProduct(
  apiProduct: ApiLookupProduct
): ClassificationResult {
  const name = normalizeClassificationText(apiProduct.name);
  const brand = normalizeClassificationText(apiProduct.brand);
  const ingredientsText = normalizeClassificationText(apiProduct.ingredientsText);

  const combinedText = [name, brand, ingredientsText].filter(Boolean).join(" ");
  const combinedWords = combinedText
  .split(/\s+/)
  .map((w) => w.replace(/[^a-z]/g, ""))
  .filter(Boolean);

const TREAT_KEYWORDS = [
  "treat",
  "treats",
  "biscuit",
  "biscuits",
  "chew",
  "chews",
  "snack",
  "snacks",
];

const FOOD_KEYWORDS = [
  "recipe",
  "formula",
  "dinner",
  "food",
  "kibble",
];
  
if (TREAT_KEYWORDS.some((word) => combinedWords.includes(word))) {
    return {
      productCategory: "treats",
      productSubcategory: null,
      confidence: 0.8,
      source: "rule",
    };
  }
if (FOOD_KEYWORDS.some((word) => combinedWords.includes(word))) {
) {
  return {
    productCategory: "dry_food",
    productSubcategory: null,
    confidence: 0.55,
    source: "rule",
  };
}
  
  return {
    productCategory: null,
    productSubcategory: null,
    confidence: 0,
    source: "unknown",
  };
}
