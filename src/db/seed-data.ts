/**
 * Static seed content for local development. Text only — `scripts/seed.ts`
 * pairs these with generated tones so every seeded clip is playable.
 */

export type SeedActor = {
  name: string;
  tagline: string;
  bio: string;
  location: string;
  accent: string;
  languages: string[];
  voiceTags: string[];
  years: number;
};

export const actors: SeedActor[] = [
  {
    name: "Mara Ellison",
    tagline: "Warm, grounded, and endlessly listenable",
    bio: "Twenty years behind the mic for commercials, documentaries, and audiobooks. I bring a calm, trustworthy read to every script.",
    location: "London, UK",
    accent: "Neutral British",
    languages: ["English (UK)"],
    voiceTags: ["Warm", "Calm", "Conversational"],
    years: 20,
  },
  {
    name: "Devon Pryce",
    tagline: "Big, cinematic trailer voice",
    bio: "Deep, authoritative reads for trailers, promos, and brand films. If it needs gravitas, I'm your guy.",
    location: "Los Angeles, US",
    accent: "American",
    languages: ["English (US)"],
    voiceTags: ["Deep", "Authoritative", "Energetic"],
    years: 13,
  },
  {
    name: "Sofia Nakamura",
    tagline: "Bright, youthful, and character-driven",
    bio: "Animation and video game specialist. I build distinct, memorable characters from scratch.",
    location: "Vancouver, CA",
    accent: "North American",
    languages: ["English (US)", "Japanese"],
    voiceTags: ["Youthful", "Character-y", "Energetic"],
    years: 8,
  },
  {
    name: "Tomás Reyes",
    tagline: "Bilingual commercial and e-learning",
    bio: "Fluent in English and Spanish, with a friendly, corporate-friendly tone and impeccable diction.",
    location: "Madrid, ES",
    accent: "Castilian / Neutral",
    languages: ["English (US)", "Spanish"],
    voiceTags: ["Corporate", "Conversational", "Warm"],
    years: 11,
  },
  {
    name: "Priya Anand",
    tagline: "Crisp narration and technical reads",
    bio: "Documentary narration, explainer videos, and IVR. Clear, precise, and easy to direct.",
    location: "Mumbai, IN",
    accent: "Indian English",
    languages: ["English (UK)", "English (US)"],
    voiceTags: ["Calm", "Corporate", "Authoritative"],
    years: 9,
  },
  {
    name: "Greta Lindqvist",
    tagline: "Cool, understated, Scandinavian",
    bio: "Audiobooks and meditation apps are my home. Soft, steady, and unhurried.",
    location: "Stockholm, SE",
    accent: "Nordic",
    languages: ["English (UK)", "German"],
    voiceTags: ["Calm", "Warm", "Deep"],
    years: 7,
  },
  {
    name: "Marcus Bell",
    tagline: "Gritty characters and game NPCs",
    bio: "Video game and audio drama performer. I specialise in rough, textured, larger-than-life characters.",
    location: "Atlanta, US",
    accent: "Southern American",
    languages: ["English (US)"],
    voiceTags: ["Gritty", "Character-y", "Deep"],
    years: 12,
  },
  {
    name: "Yuki Tanaka",
    tagline: "Playful, quick, and versatile",
    bio: "From bubbly mascots to snarky sidekicks, I bring energy and precision to animation and toy commercials.",
    location: "Tokyo, JP",
    accent: "Neutral",
    languages: ["English (US)", "Japanese"],
    voiceTags: ["Youthful", "Energetic", "Character-y"],
    years: 6,
  },
  {
    name: "Elena Moreau",
    tagline: "Elegant audiobook and prestige narration",
    bio: "Literary fiction, memoir, and history. I read with warmth, pace, and an ear for authorial voice.",
    location: "Paris, FR",
    accent: "French-inflected English",
    languages: ["English (UK)", "French"],
    voiceTags: ["Calm", "Warm", "Authoritative"],
    years: 15,
  },
  {
    name: "Ben Carter",
    tagline: "Corporate explainers and friendly IVR",
    bio: "The reassuring voice your onboarding video needs. Fast turnaround, easy revisions.",
    location: "Austin, US",
    accent: "American",
    languages: ["English (US)"],
    voiceTags: ["Corporate", "Conversational", "Calm"],
    years: 5,
  },
];

export type SeedJob = {
  title: string;
  clientName: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  rateType: "fixed" | "hourly" | "per_word";
  currency: string;
  locationType: "remote" | "onsite";
  deadline: string;
  tags: string[];
};

export const jobs: SeedJob[] = [
  {
    title: "Warm commercial VO for a coffee brand",
    clientName: "Northwind Coffee",
    description:
      "We need a warm, conversational read for a 30-second radio and podcast spot. Two revisions expected. Deliver a raw WAV plus a cleaned mix.",
    category: "Commercial",
    budgetMin: 500,
    budgetMax: 900,
    rateType: "fixed",
    currency: "USD",
    locationType: "remote",
    deadline: "2026-11-15",
    tags: ["warm", "conversational"],
  },
  {
    title: "Documentary narrator — ocean series",
    clientName: "Blue Horizon Films",
    description:
      "Eight-episode natural history series. Calm, authoritative narration, roughly 2,500 words per episode. Full series booking preferred.",
    category: "Narration",
    budgetMin: 3500,
    budgetMax: 6000,
    rateType: "fixed",
    currency: "USD",
    locationType: "remote",
    deadline: "2026-12-01",
    tags: ["authoritative", "documentary"],
  },
  {
    title: "Video game NPC pack — fantasy RPG",
    clientName: "Emberforge Studios",
    description:
      "Voicing 12 distinct NPCs: merchants, guards, and one grumpy dragon. Character range essential. Directed sessions over Zoom.",
    category: "Video Games",
    budgetMin: 1000,
    budgetMax: 2000,
    rateType: "fixed",
    currency: "USD",
    locationType: "remote",
    deadline: "2026-11-30",
    tags: ["character", "gritty"],
  },
  {
    title: "Audiobook: literary fiction novel",
    clientName: "Halcyon Audio",
    description:
      "A 90,000-word literary novel, roughly 10 finished hours. Warm, intelligent narration with a light character range.",
    category: "Audiobooks",
    budgetMin: 300,
    budgetMax: 400,
    rateType: "per_word",
    currency: "USD",
    locationType: "remote",
    deadline: "2026-11-20",
    tags: ["warm", "calm"],
  },
  {
    title: "E-learning modules — security training",
    clientName: "Vaultline Systems",
    description:
      "Series of six corporate explainer modules. Neutral, friendly American English. Scripts are final and proofed.",
    category: "E-Learning",
    budgetMin: 120,
    budgetMax: 180,
    rateType: "hourly",
    currency: "USD",
    locationType: "remote",
    deadline: "2026-11-10",
    tags: ["corporate", "conversational"],
  },
  {
    title: "Animated series — recurring sidekick",
    clientName: "Paper Lantern Animation",
    description:
      "Recurring role across season one. Bright, energetic, comedic timing a must. Potential for long-term booking.",
    category: "Animation",
    budgetMin: 2500,
    budgetMax: 4000,
    rateType: "fixed",
    currency: "USD",
    locationType: "onsite",
    deadline: "2026-12-15",
    tags: ["youthful", "energetic", "character"],
  },
  {
    title: "Phone system IVR re-record",
    clientName: "Meridian Bank",
    description:
      "Replace the phone tree prompts — around 80 short lines. Need a clear, reassuring, professional voice.",
    category: "IVR",
    budgetMin: 400,
    budgetMax: 700,
    rateType: "fixed",
    currency: "USD",
    locationType: "remote",
    deadline: "2026-11-05",
    tags: ["corporate", "calm"],
  },
  {
    title: "Trailer voice for indie action film",
    clientName: "Ridgeline Pictures",
    description:
      "90-second trailer. Deep, cinematic, high stakes. Think classic movie-trailer gravitas with a modern edge.",
    category: "Promo/Trailer",
    budgetMin: 800,
    budgetMax: 1200,
    rateType: "fixed",
    currency: "USD",
    locationType: "remote",
    deadline: "2026-11-25",
    tags: ["deep", "authoritative"],
  },
  {
    title: "Toy commercial — playful and loud",
    clientName: "Brightbox Toys",
    description:
      "High-energy 20-second spot for a kids' toy line. Two voices (announcer + character). Big smiles in the booth.",
    category: "Commercial",
    budgetMin: 600,
    budgetMax: 1000,
    rateType: "fixed",
    currency: "USD",
    locationType: "onsite",
    deadline: "2026-11-18",
    tags: ["energetic", "youthful"],
  },
  {
    title: "Corporate brand film narrator",
    clientName: "Cedar & Co.",
    description:
      "Three-minute brand film for a launch event. Confident, human, not salesy. One revision round.",
    category: "Corporate",
    budgetMin: 700,
    budgetMax: 1100,
    rateType: "fixed",
    currency: "USD",
    locationType: "remote",
    deadline: "2026-12-05",
    tags: ["corporate", "warm"],
  },
];

export type ClipIdea = { title: string; category: string; tags: string[] };

export const clipIdeas: ClipIdea[] = [
  { title: "Coffee shop commercial read", category: "Commercial", tags: ["warm", "conversational"] },
  { title: "Nature documentary open", category: "Narration", tags: ["calm", "authoritative"] },
  { title: "Fantasy tavern keeper", category: "Character", tags: ["character", "gritty"] },
  { title: "Audiobook sample — chapter one", category: "Audiobooks", tags: ["warm", "calm"] },
  { title: "Security training module", category: "E-Learning", tags: ["corporate", "conversational"] },
  { title: "Animated sidekick audition", category: "Animation", tags: ["youthful", "energetic"] },
  { title: "Bank phone greeting", category: "IVR", tags: ["corporate", "calm"] },
  { title: "Action film trailer", category: "Promo/Trailer", tags: ["deep", "authoritative"] },
  { title: "Toy launch spot", category: "Commercial", tags: ["energetic", "youthful"] },
  { title: "Startup brand film", category: "Corporate", tags: ["corporate", "warm"] },
];
