import { z } from "zod";
import { RATE_TYPES } from "@/lib/taxonomy";

export const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD"] as const;

export const offerSchema = z.object({
  jobId: z.string().min(1),
  rateAmount: z.coerce
    .number()
    .int("Enter a whole number")
    .min(1, "Enter your rate")
    .max(1_000_000),
  rateType: z.enum(RATE_TYPES),
  currency: z.enum(CURRENCIES).default("USD"),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type OfferInput = z.infer<typeof offerSchema>;
