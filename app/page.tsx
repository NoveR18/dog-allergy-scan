"use client";

import { classifyApiLookupProduct } from "@/lib/directory/classifyProduct";
import {
  getAllProducts,
  getProductByBarcode,
  saveProduct,
} from "@/lib/directory/directoryService";
import type { ApiLookupProduct, Product } from "@/lib/directory/types";
import {
  dedupeAllergens,
  findAllergenHits,
  getHighlightTerms,
} from "@/lib/allergy";
import { loadProfile, saveProfile, type StoredProfile } from "@/lib/storage";
import { clsx } from "@/lib/ui";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useEffect, useMemo, useRef, useState } from "react";

/* --- everything above unchanged --- */

function getSafeButtonText(
  product: Product | null,
  petName: string
): string {
  if (!product) return "";

  const name = petName || "your pet";

  // freeze-dried FOOD category
  if (product.productCategory === "freeze_dried_dehydrated_air_dried") {
    return `See allergy-safe freeze dried/dehydrated/air dried food for ${name}`;
  }

  // freeze-dried TREATS
  if (
    product.productCategory === "treats" &&
    product.productSubcategory === "freeze_dried"
  ) {
    return `See allergy-safe freeze dried treats for ${name}`;
  }

  // generic treats
  if (product.productCategory === "treats") {
    return `See allergy-safe treats for ${name}`;
  }

  // generic food fallback
  if (
    product.productCategory === "dry_food" ||
    product.productCategory === "wet_food" ||
    product.productCategory === "frozen_raw"
  ) {
    return `See allergy-safe food for ${name}`;
  }

  // final fallback
  return `See allergy-safe products for ${name}`;
}

export default function Home() {
  /* --- EVERYTHING ABOVE REMAINS IDENTICAL --- */

  /* locate THIS section inside your JSX and replace ONLY the button */

              <button
                type="button"
                onClick={() => {
                  console.log("See safe alternatives clicked");
                }}
                style={{
                  marginTop: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "#f8f8f8",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {getSafeButtonText(product, profile.petName)}
              </button>

  /* --- EVERYTHING BELOW REMAINS IDENTICAL --- */
}
