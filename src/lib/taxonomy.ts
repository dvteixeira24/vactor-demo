/**
 * Shared taxonomy for demo clips and jobs. Single source of truth so filters,
 * forms, and seeding all agree.
 */

export const CATEGORIES = [
  "Commercial",
  "Narration",
  "Animation",
  "Video Games",
  "Audiobooks",
  "E-Learning",
  "Promo/Trailer",
  "Character",
  "Corporate",
  "IVR",
] as const;

export const VOICE_TAGS = [
  "Warm",
  "Authoritative",
  "Youthful",
  "Gritty",
  "Conversational",
  "Energetic",
  "Calm",
  "Character-y",
  "Corporate",
  "Deep",
] as const;

export const LANGUAGES = [
  "English (US)",
  "English (UK)",
  "English (AU)",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
  "Mandarin",
] as const;

export const RATE_TYPES = ["fixed", "hourly", "per_word"] as const;
export const LOCATION_TYPES = ["remote", "onsite"] as const;
export const OFFER_STATUSES = ["submitted"] as const;

export type Category = (typeof CATEGORIES)[number];
export type VoiceTag = (typeof VOICE_TAGS)[number];
export type Language = (typeof LANGUAGES)[number];
export type RateType = (typeof RATE_TYPES)[number];
export type LocationType = (typeof LOCATION_TYPES)[number];
export type OfferStatus = (typeof OFFER_STATUSES)[number];

/** A representative emoji/glyph per category, used sparingly in the UI. */
export const CATEGORY_GLYPH: Record<Category, string> = {
  Commercial: "◆",
  Narration: "❖",
  Animation: "✦",
  "Video Games": "◈",
  Audiobooks: "▤",
  "E-Learning": "▣",
  "Promo/Trailer": "▶",
  Character: "✺",
  Corporate: "▥",
  IVR: "☏",
};

export function formatRateType(rateType: RateType): string {
  switch (rateType) {
    case "fixed":
      return "fixed";
    case "hourly":
      return "/hr";
    case "per_word":
      return "/word";
  }
}
