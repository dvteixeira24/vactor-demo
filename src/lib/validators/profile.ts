import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(60),
  tagline: optionalText(120),
  bio: optionalText(2000),
  location: optionalText(80),
  accent: optionalText(60),
  websiteUrl: z.union([z.literal(""), z.url()]).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
  languages: z.array(z.string()).max(10).default([]),
  voiceTags: z.array(z.string()).max(10).default([]),
  socials: z.record(z.string(), z.string()).default({}),
  isPublished: z.coerce.boolean().default(false),
});

export type ProfileInput = z.infer<typeof profileSchema>;
