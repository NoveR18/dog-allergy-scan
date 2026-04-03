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
  "nutrition",
  "meal",
  "entree",
];

const DENTAL_KEYWORDS = [
  "dental",
  "oral",
  "teeth",
  "gums",
  "breath",
];

  const WET_FOOD_KEYWORDS = [
  "pate",
  "stew",
  "gravy",
  "morsels",
  "canned",
  "shreds",
];

const DRY_FOOD_SUBCATEGORY_KEYWORDS = [
  "kibble",
];

const WET_FOOD_SUBCATEGORY_KEYWORDS = [
  "pate",
  "stew",
  "gravy",
  "morsels",
  "shreds",
  "bisque",
  "mousse",
];
  
if (TREAT_KEYWORDS.some((word) => combinedWords.includes(word))) {

const TREAT_SUBCATEGORY_KEYWORDS = {
  dental: DENTAL_KEYWORDS,
};

const treatSubcategory = Object.entries(TREAT_SUBCATEGORY_KEYWORDS).find(
  ([, keywords]) =>
    combinedWords.some((word) =>
      keywords.some((keyword) => word.startsWith(keyword))
    )
);

return {
  productCategory: "treats",
  productSubcategory: treatSubcategory ? treatSubcategory[0] : null,
  confidence: 0.8,
  source: "rule",
};
  }

if (WET_FOOD_KEYWORDS.some((word) => combinedWords.includes(word))) {
  const isPate = WET_FOOD_SUBCATEGORY_KEYWORDS.some((word) =>
    combinedWords.includes(word)
  );

  return {
    productCategory: "wet_food",
    productSubcategory: isPate ? "pate" : null,
    confidence: 0.7,
    source: "rule",
  };
}

if (FOOD_KEYWORDS.some((word) => combinedWords.includes(word))) {
  const isDryFood = DRY_FOOD_SUBCATEGORY_KEYWORDS.some((word) =>
    combinedWords.includes(word)
  );

  return {
    productCategory: "dry_food",
    productSubcategory: isDryFood ? "kibble" : null,
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
