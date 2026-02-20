import { NextResponse } from "next/server";

type NormalizedProduct = {
  barcode: string;
  name?: string;
  brand?: string;
  imageUrl?: string;
  ingredientsText?: string;
  source: "go-upc" | "openpetfoodfacts" | "openfoodfacts" | "none";
};

function cleanBarcode(code: string) {
  return (code || "").replace(/\D/g, "").trim();
}

async function fetchGoUPC(barcode: string): Promise<NormalizedProduct | null> {
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

async function fetchOpenPetFoodFacts(barcode: string): Promise<NormalizedProduct | null> {
  const url = `https://world.openpetfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = await res.json();
  const p = data?.product;
  if (!p) return null;

  return {
    barcode,
    name: p.product_name,
    brand: p.brands,
    imageUrl: p.image_url,
    ingredientsText: p.ingredients_text || p.ingredients_text_en,
    source: "openpetfoodfacts",
  };
}

async function fetchOpenFoodFacts(barcode: string): Promise<NormalizedProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = await res.json();
  const p = data?.product;
  if (!p) return null;

  return {
    barcode,
    name: p.product_name,
    brand: p.brands,
    imageUrl: p.image_url,
    ingredientsText: p.ingredients_text || p.ingredients_text_en,
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

