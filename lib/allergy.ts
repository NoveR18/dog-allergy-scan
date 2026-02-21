export function normalizeText(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function dedupeAllergens(allergens: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const a of allergens) {
    const n = normalizeText(a);
    if (!n) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(a.trim());
  }
  return out;
}

/**
 * Basic synonym expansions (Phase 1.1).
 * Keep it small + practical. We can expand later.
 */
const SYNONYMS: Record<string, string[]> = {
  soy: ["soya", "soybean", "soybeans"],
  soya: ["soy", "soybean", "soybeans"],
  wheat: ["gluten"],
  gluten: ["wheat"],
  dairy: ["milk", "lactose", "whey", "casein"],
  milk: ["dairy", "lactose", "whey", "casein"],
  chicken: ["poultry", "chicken meal", "chicken by-product", "chicken byproduct"],
  beef: ["beef meal"],
  egg: ["eggs", "egg product", "egg products"],
  peanut: ["peanuts"],
};

function expandAllergen(raw: string): string[] {
  const base = normalizeText(raw);
  if (!base) return [];

  const expanded = new Set<string>();
  expanded.add(base);

  // If the user typed a multi-word allergen, we keep it as phrase.
  // For single tokens, add synonyms.
  if (!base.includes(" ")) {
    const syns = SYNONYMS[base];
    if (syns) syns.forEach((s) => expanded.add(normalizeText(s)));
  }

  return Array.from(expanded);
}

function tokenize(text: string): string[] {
  // Split on spaces and slashes/hyphens but keep simple.
  return normalizeText(text)
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export type AllergenHit = {
  allergen: string;      // user-entered allergen (original)
  matched: string;       // the actual token/phrase found (normalized)
  kind: "token" | "phrase";
};

export function findAllergenHits(ingredientsText: string, allergens: string[]): AllergenHit[] {
  const normalizedIngredients = normalizeText(ingredientsText);
  const tokens = tokenize(ingredientsText);
  const tokenSet = new Set(tokens);

  const hits: AllergenHit[] = [];
  const seen = new Set<string>(); // de-dupe by matched+allergen

  for (const userAllergen of allergens) {
    const expanded = expandAllergen(userAllergen);
    if (!expanded.length) continue;

    for (const candidate of expanded) {
      // Phrase match if it has spaces (e.g., "pea protein")
      if (candidate.includes(" ")) {
        if (normalizedIngredients.includes(candidate)) {
          const key = `${normalizeText(userAllergen)}::${candidate}`;
          if (!seen.has(key)) {
            seen.add(key);
            hits.push({ allergen: userAllergen, matched: candidate, kind: "phrase" });
          }
        }
        continue;
      }

      // Token match (avoids many false positives)
      if (tokenSet.has(candidate)) {
        const key = `${normalizeText(userAllergen)}::${candidate}`;
        if (!seen.has(key)) {
          seen.add(key);
          hits.push({ allergen: userAllergen, matched: candidate, kind: "token" });
        }
        continue;
      }

      // Safe fallback: allow substring match only for longer candidates (reduces "pea"->random matches)
      if (candidate.length >= 5 && normalizedIngredients.includes(candidate)) {
        const key = `${normalizeText(userAllergen)}::${candidate}`;
        if (!seen.has(key)) {
          seen.add(key);
          hits.push({ allergen: userAllergen, matched: candidate, kind: "phrase" });
        }
      }
    }
  }

  // Sort: phrases first (more precise), then by length desc
  hits.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "phrase" ? -1 : 1;
    return b.matched.length - a.matched.length;
  });

  return hits;
}

/**
 * For UI highlighting: returns unique matched strings (normalized) to highlight.
 */
export function getHighlightTerms(hits: AllergenHit[]): string[] {
  const uniq = new Set<string>();
  for (const h of hits) uniq.add(h.matched);
  // Highlight longer terms first to avoid partial overlaps.
  return Array.from(uniq).sort((a, b) => b.length - a.length);
}
