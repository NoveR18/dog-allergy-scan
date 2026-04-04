import { ApiLookupProduct } from "@/lib/directory/types";
import { NextResponse } from "next/server";

function cleanBarcode(code: string) {
  return (code || "").replace(/\D/g, "").trim();
}

const TEST_PRODUCTS: Record<string, ApiLookupProduct> = {
  "111": {
    barcode: "111",
    name: "Chicken Pate Wet Food",
    brand: "TestBrand",
    imageUrl: "",
    ingredientsText: "chicken, broth, vitamins",
    source: "openpetfoodfacts",
  },
  "222": {
    barcode: "222",
    name: "Freeze Dried Raw Beef Recipe",
    brand: "TestBrand",
    imageUrl: "",
    ingredientsText: "beef",
    source: "openpetfoodfacts",
  },
  "333": {
    barcode: "333",
    name: "Dental Chews for Dogs",
    brand: "TestBrand",
    imageUrl: "",
    ingredientsText: "wheat flour, mint, parsley",
    source: "openpetfoodfacts",
  },
  "444": {
    barcode: "444",
    name: "Air Dried Lamb Recipe",
    brand: "TestBrand",
    imageUrl: "",
    ingredientsText: "lamb, vitamins, minerals",
    source: "openpetfoodfacts",
  },
  "555": {
    barcode: "555",
    name: "Chicken Meal Topper",
    brand: "TestBrand",
    imageUrl: "",
    ingredientsText: "chicken, pumpkin",
    source: "openpetfoodfacts",
  },
  "666": {
    barcode: "666",
    name: "Frozen Raw Chicken Dinner",
    brand: "TestBrand",
    imageUrl: "",
    ingredientsText: "chicken, bone, liver",
    source: "openpetfoodfacts",
  },
};

async function fetchGoUPC(barcode: string): Promise<ApiLookupProduct | null> {
  const key = process.env.GO_UPC_API_KEY;
  if (!key) return null;

  const url = `https://go-upc.com/api/v1/code/${encodeURIComponent(barcode)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json();
  const p = data?.product;
  if (!p) return null;

  return {
    barcode,
    name: p.name,
    brand: p.brand,
    imageUrl: p.imageUrl,
    ingredientsText: p.ingredients?.text,
    source: "go-upc",
  };
}

async function fetchOpenPetFoodFacts(barcode: string): Promise<ApiLookupProduct | null> {
  const url = `https://world.openpetfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = await res.json();
  const p = data?.product;
  if (!p) return null;

  return {
    barcode,
    name: p.product_name_en || p.product_name,
    brand: p.brands,
    imageUrl: p.image_url,
    ingredientsText: p.ingredients_text_en || "",
    note: p.ingredients_text_en
      ? undefined
      : "Ingredients not available in English for this barcode.",
    source: "openpetfoodfacts",
  };
}

async function fetchOpenFoodFacts(barcode: string): Promise<ApiLookupProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = await res.json();
  const p = data?.product;
  if (!p) return null;

  return {
    barcode,
    name: p.product_name_en || p.product_name,
    brand: p.brands,
    imageUrl: p.image_url,
    ingredientsText: p.ingredients_text_en || "",
    note: p.ingredients_text_en
      ? undefined
      : "Ingredients not available in English for this barcode.",
    source: "openfoodfacts",
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("barcode") || "";
    const barcode = cleanBarcode(raw);

    if (!barcode) {
      return NextResponse.json({ error: "Missing barcode" }, { status: 400 });
    }

    const testProduct = TEST_PRODUCTS[barcode];
    if (testProduct) {
      return NextResponse.json(testProduct);
    }

    const goUpc = await fetchGoUPC(barcode);
    if (goUpc?.ingredientsText) return NextResponse.json(goUpc);

    const pet = await fetchOpenPetFoodFacts(barcode);
    if (pet?.ingredientsText) return NextResponse.json(pet);

    const off = await fetchOpenFoodFacts(barcode);
    if (off?.ingredientsText) return NextResponse.json(off);

    const best = goUpc || pet || off;
    if (best) return NextResponse.json(best);

    return NextResponse.json({ barcode, source: "none" as const }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
