import { ApiLookupProduct, ProductCategory } from "./types";

export type ClassificationResult = {
  productCategory: ProductCategory | null;
  productSubcategory: string | null;
  confidence: number;
  source: "rule" | "api" | "unknown";
};

function normalizeClassificationText(value: string | undefined): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ===== KEYWORDS =====

const TREAT_KEYWORDS = [
  "treat",
  "treats",
  "biscuit",
  "biscuits",
  "chew",
  "chews",
  "snack",
  "snacks",
  "jerky",
  "jerkies",
  "cookie",
  "cookies",
  "bone",
  "bones",
  "reward",
  "rewards",
  "trainer",
  "trainers",
  "training",
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
  "complete",
  "balanced",
  "diet",
];

const TOPPER_KEYWORDS = [
  "topper",
  "toppers",
];

const DENTAL_KEYWORDS = [
  "dental",
  "oral",
  "teeth",
  "gums",
  "breath",
];

const FROZEN_RAW_KEYWORDS = [
  "frozen",
  "raw",
];

const FREEZE_DRY_DEHYDRATE_AIR_DRY_KEYWORDS = [
  "freezedried",
  "freeze-dried",
  "dehydrated",
  "airdried",
  "air-dried",
];

const WET_FOOD_KEYWORDS = [
  "pate",
  "stew",
  "gravy",
  "morsel",
  "morsels",
  "canned",
  "shreds",
  "bisque",
  "mousse",
  "loaf",
  "broth",
  "sauce",
];

const DRY_FOOD_SUBCATEGORY_KEYWORDS = [
  "kibble",
];

const TREAT_SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  dental: DENTAL_KEYWORDS,
};

// ===== CLASSIFIER =====

export function classifyApiLookupProduct(
  apiProduct: ApiLookupProduct
): ClassificationResult {
  const name = normalizeClassificationText(apiProduct.name);
  const brand = normalizeClassificationText(apiProduct.brand);
  const ingredientsText = normalizeClassificationText(apiProduct.ingredientsText);

  const combinedText = [name, brand, ingredientsText].filter(Boolean).join(" ");
  const combinedWords = combinedText
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z-]/g, ""))
    .filter(Boolean);

  const hasFreezeDried =
    combinedText.includes("freeze dried") ||
    combinedWords.includes("freeze-dried") ||
    combinedWords.includes("freezedried");

  const hasAirDried =
    combinedText.includes("air dried") ||
    combinedWords.includes("air-dried") ||
    combinedWords.includes("airdried");

  const hasDehydrated = combinedWords.includes("dehydrated");
  const hasTopperKeyword = TOPPER_KEYWORDS.some((word) =>
    combinedWords.includes(word)
  );

  // ===== TREATS =====
  if (TREAT_KEYWORDS.some((word) => combinedWords.includes(word))) {
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

  // ===== FROZEN RAW =====
  if (FROZEN_RAW_KEYWORDS.every((word) => combinedWords.includes(word))) {
    return {
      productCategory: "frozen_raw",
      productSubcategory: null,
      confidence: 0.75,
      source: "rule",
    };
  }

  // ===== FREEZE-DRIED / DEHYDRATED / AIR-DRIED =====
  if (
    hasFreezeDried ||
    hasAirDried ||
    hasDehydrated ||
    FREEZE_DRY_DEHYDRATE_AIR_DRY_KEYWORDS.some((word) =>
      combinedWords.includes(word)
    )
  ) {
    let productSubcategory: string | null = null;

    if (hasFreezeDried) {
      productSubcategory = "freeze_dried";
    } else if (hasAirDried) {
      productSubcategory = "air_dried";
    } else if (hasDehydrated) {
      productSubcategory = "dehydrated";
    }

    return {
      productCategory: "freeze_dried_dehydrated_air_dried",
      productSubcategory,
      confidence: 0.72,
      source: "rule",
    };
  }

  // ===== WET FOOD =====
  if (WET_FOOD_KEYWORDS.some((word) => combinedWords.includes(word))) {
    const wetFoodSubcategory = WET_FOOD_KEYWORDS.find((word) =>
      combinedWords.includes(word)
    );

    return {
      productCategory: "wet_food",
      productSubcategory: wetFoodSubcategory || null,
      confidence: 0.7,
      source: "rule",
    };
  }

  // ===== DRY FOOD =====
  if (
    FOOD_KEYWORDS.some((word) => combinedWords.includes(word)) &&
    !hasTopperKeyword
  ) {
    const dryFoodSubcategory = DRY_FOOD_SUBCATEGORY_KEYWORDS.find((word) =>
      combinedWords.includes(word)
    );

    return {
      productCategory: "dry_food",
      productSubcategory: dryFoodSubcategory || null,
      confidence: 0.55,
      source: "rule",
    };
  }

  // ===== UNKNOWN =====
  return {
    productCategory: null,
    productSubcategory: null,
    confidence: 0,
    source: "unknown",
  };
}
