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

export function findAllergenHits(ingredientsText: string, allergens: string[]) {
  const text = normalizeText(ingredientsText);
  const hits: { allergen: string; index: number }[] = [];

  for (const raw of allergens) {
    const a = normalizeText(raw);
    if (!a) continue;
    const idx = text.indexOf(a);
    if (idx !== -1) hits.push({ allergen: raw, index: idx });
  }

  const uniq = new Set<string>();
  return hits
    .sort((x, y) => x.index - y.index)
    .filter((h) =>
      uniq.has(normalizeText(h.allergen)) ? false : (uniq.add(normalizeText(h.allergen)), true)
    );
}
