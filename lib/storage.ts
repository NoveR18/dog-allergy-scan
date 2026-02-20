export type StoredProfile = {
  dogName: string;
  allergens: string[];
};

const KEY = "dog_allergy_profile_v1";

export function loadProfile(): StoredProfile {
  if (typeof window === "undefined") return { dogName: "My Dog", allergens: [] };

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { dogName: "My Dog", allergens: [] };
    const parsed = JSON.parse(raw) as StoredProfile;

    return {
      dogName: typeof parsed.dogName === "string" ? parsed.dogName : "My Dog",
      allergens: Array.isArray(parsed.allergens) ? parsed.allergens.filter(Boolean) : [],
    };
  } catch {
    return { dogName: "My Dog", allergens: [] };
  }
}

export function saveProfile(profile: StoredProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(profile));
}
