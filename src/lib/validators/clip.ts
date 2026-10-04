import { z } from "zod";
import { CATEGORIES } from "@/lib/taxonomy";

export const clipSchema = z.object({
  title: z.string().trim().min(1, "Give your clip a title").max(100),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string()).max(10).default([]),
  durationSec: z.coerce.number().min(0).max(3600),
  peaks: z.array(z.number().min(0).max(1)).max(2000).default([]),
});

export type ClipInput = z.infer<typeof clipSchema>;
