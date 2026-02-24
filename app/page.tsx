"use client";

import { useEffect, useMemo, useState } from "react";
import { dedupeAllergens, findAllergenHits, getHighlightTerms } from "@/lib/allergy";
import { loadProfile, saveProfile, type StoredProfile } from "@/lib/storage";
import { clsx } from "@/lib/ui";

type Product = {
  barcode: string;
  name?: string;
  brand?: string;
  imageUrl?: string;
  ingredientsText?: string;
  note?: string;
  source: string;
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        border: "1px solid #e7e7e7",
        background: "white",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </section>
  );
}

function Pill({ text, onRemove }: { text: string; onRemove: () => void }) {
  return (
    <span
      style={{
        border: "1px solid #ddd",
        background: "#fff",
        borderRadius: 999,
        padding: "6px 10px",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span>{text}</span>
      <button
        onClick={onRemove}
        aria-label={`Remove ${text}`}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          padding: 0,
          opacity: 0.7,
        }}
      >
        ×
      </button>
    </span>
  );
}
function highlightText(original: string, highlightTerms: string[]) {
  if (!original || !highlightTerms.length) return original;

  let parts: Array<string | JSX.Element> = [original];

  for (const term of highlightTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${escaped})`, "ig");

    parts = parts.flatMap((p, idx) => {
      if (typeof p !== "string") return [p];
      const split = p.split(re);
      return split.map((chunk, i) => {
        if (i % 2 === 1) {
          return (
            <mark
              key={`${idx}-${i}-${chunk}`}
              style={{
                background: "#fff2a8",
                padding: "0 2px",
                borderRadius: 4,
              }}
            >
              {chunk}
            </mark>
          );
        }
        return chunk;
      });
    });
  }

  return parts;
}

export default function Home() {
  const [profile, setProfile] = useState<StoredProfile>({ dogName: "My Dog", allergens: [] });
  const [draftAllergen, setDraftAllergen] = useState("");
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const p = loadProfile();
    if (!p.allergens.length) p.allergens = ["chicken", "wheat"];
    setProfile(p);
  }, []);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const hits = useMemo(() => {
    if (!product?.ingredientsText) return [];
    return findAllergenHits(product.ingredientsText, profile.allergens);
  }, [product, profile.allergens]);
const highlightTerms = useMemo(() => getHighlightTerms(hits), [hits]);

const looksEnglish =
  !!product?.ingredientsText &&
  /^[\x00-\x7F\s.,()%\-:;'"\/]+$/.test(product.ingredientsText);

const verdict =
  !product ? null :
  !product.ingredientsText || !looksEnglish ? "unknown" :
  hits.length ? "avoid" :
  "safe";

  async function lookup() {
    const cleaned = barcode.replace(/\D/g, "").trim();
    if (!cleaned) {
      setError("Enter a barcode/UPC/EAN (numbers only).");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");
    setProduct(null);

    try {
      const res = await fetch(`//lookup?barcode=${encodeURIComponent(cleaned)}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Lookup failed (${res.status})`);
      }
      const j = (await res.json()) as Product;
      setProduct(j);
      setStatus("idle");
    } catch (e: any) {
      setError("Product found, but ingredient text isn’t available in English yet.");
      setStatus("error");
    }
  }

  function addAllergen() {
    const a = draftAllergen.trim();
    if (!a) return;

    const next = dedupeAllergens([...profile.allergens, a]);
    setProfile({ ...profile, allergens: next });
    setDraftAllergen("");
  }

  function removeAllergen(a: string) {
    setProfile({ ...profile, allergens: profile.allergens.filter((x) => x !== a) });
  }

  function clearResults() {
    setProduct(null);
    setError("");
    setStatus("idle");
  }

  return (
    <main style={{ maxWidth: 900, margin: "28px auto", padding: 16, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Dog Food Allergy Scanner</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.75 }}>
            Add your dog’s allergens, then look up foods by UPC to see what’s safe.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 600, opacity: 0.85 }}>Dog name</label>
          <input
            value={profile.dogName}
            onChange={(e) => setProfile({ ...profile, dogName: e.target.value })}
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
              minWidth: 180,
            }}
          />
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 16 }}>
        <Card>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Allergens to avoid</h2>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              value={draftAllergen}
              onChange={(e) => setDraftAllergen(e.target.value)}
              placeholder="e.g., beef, pea protein, brewer’s yeast"
              style={{ flex: 1, minWidth: 240, padding: 10, borderRadius: 12, border: "1px solid #ddd" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") addAllergen();
              }}
            />
            <button
              onClick={addAllergen}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "#111",
                color: "white",
                cursor: "pointer",
              }}
            >
              Add
            </button>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {profile.allergens.length ? (
              profile.allergens.map((a) => <Pill key={a} text={a} onRemove={() => removeAllergen(a)} />)
            ) : (
              <span style={{ opacity: 0.6 }}>No allergens added yet.</span>
            )}
          </div>
        </Card>

        <Card>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Lookup by barcode (UPC/EAN)</h2>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Numbers only (example: 012345678905)"
              style={{ flex: 1, minWidth: 240, padding: 10, borderRadius: 12, border: "1px solid #ddd" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") lookup();
              }}
            />
            <button
              onClick={lookup}
              disabled={status === "loading"}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: status === "loading" ? "#eee" : "#0b5",
                color: status === "loading" ? "#333" : "white",
                cursor: status === "loading" ? "not-allowed" : "pointer",
              }}
            >
              {status === "loading" ? "Searching..." : "Search"}
            </button>

            <button
              onClick={clearResults}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>

          {status === "error" && (
            <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>
          )}

          {product && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt=""
                    style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 14, border: "1px solid #eee" }}
                  />
                ) : (
                  <div style={{ width: 84, height: 84, borderRadius: 14, border: "1px solid #eee", background: "#f3f3f3" }} />
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{product.name || "Unknown product name"}</div>
                  <div style={{ opacity: 0.7 }}>{product.brand || "Unknown brand"}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>
                    Barcode: {product.barcode} • Source: {product.source}
                  </div>
                </div>

                <div
                  className={clsx()}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    background:
                      verdict === "safe" ? "#eafff3" :
                      verdict === "avoid" ? "#ffecec" :
                      "#fff7e6",
                    fontWeight: 800,
                  }}
                >
                  {verdict === "safe" && "✅ SAFE"}
                  {verdict === "avoid" && "❌ AVOID"}
                  {verdict === "unknown" && "⚠️ UNKNOWN"}
                </div>
              </div>
              
              <div style={{ marginTop: 14, borderTop: "1px solid #eee", paddingTop: 14 }}>
                {verdict === "avoid" && (
                  <>
                    <div style={{ fontWeight: 800 }}>Matched allergens for {profile.dogName}:</div>
                    <ul style={{ marginTop: 8 }}>
                      {hits.map((h) => (
  <li key={h.allergen}>
    {h.allergen} ({h.matched})
  </li>
))}
                    </ul>
                  </>
                )}

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 800 }}>Ingredients</div>
                  <p style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>
                    {product.ingredientsText
  ? highlightText(product.ingredientsText, highlightTerms)
  : "No ingredient text returned from sources."}
                  </p>
                </div>

                {verdict === "unknown" && (
                  <p style={{ opacity: 0.75 }}>
                    Ingredient information unavailable. Please check the package label.
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>

        <footer style={{ opacity: 0.6, fontSize: 12, padding: "6px 2px" }}>
          Phase 1 MVP • Data sources: Go-UPC → Open Pet Food Facts → Open Food Facts.
        </footer>
      </div>
    </main>
  );
}












