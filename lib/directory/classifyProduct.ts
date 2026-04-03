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

if (
  combinedWords.includes("treat") ||
  combinedWords.includes("treats") ||
  combinedWords.includes("biscuit") ||
  combinedWords.includes("biscuits") ||
  combinedWords.includes("chew") ||
  combinedWords.includes("chews") ||
  combinedWords.includes("snack") ||
  combinedWords.includes("snacks")
) {
    return {
      productCategory: "treats",
      productSubcategory: null,
      confidence: 0.8,
      source: "rule",
    };
  }
if (
  combinedWords.includes("recipe") ||
  combinedWords.includes("formula") ||
  combinedWords.includes("dinner") ||
  combinedWords.includes("food")
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
