export type StoredProfile = {
  petName: string;
  allergens: string[];
};

const KEY = "pet_allergy_profile_v1";

const DEFAULT_PROFILE: StoredProfile = {
  petName: "My Pet",
  allergens: [],
};

export function loadProfile(): StoredProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;

    const parsed = JSON.parse(raw) as StoredProfile;

    return {
      petName:
        typeof parsed.petName === "string" ? parsed.petName : DEFAULT_PROFILE.petName,
      allergens: Array.isArray(parsed.allergens)
        ? parsed.allergens.filter(Boolean)
        : [],
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: StoredProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(profile));
}
