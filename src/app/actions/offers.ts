"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { jobs, offers } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { offerSchema } from "@/lib/validators/offer";

export type OfferResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/**
 * Submits or updates the signed-in user's offer for a job. One offer per
 * actor per job — a second submission updates the existing row.
 */
export async function submitOffer(input: unknown): Promise<OfferResult> {
  const user = await requireUser();
  const parsed = offerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid offer.",
    };
  }

  const db = await getDb();
  const job = (
    await db.select().from(jobs).where(eq(jobs.id, parsed.data.jobId)).limit(1)
  )[0];
  if (!job || !job.isActive) {
    return { ok: false, error: "This job is no longer accepting offers." };
  }

  const data = parsed.data;
  const existing = (
    await db
      .select()
      .from(offers)
      .where(and(eq(offers.jobId, job.id), eq(offers.userId, user.id)))
      .limit(1)
  )[0];

  const values = {
    rateAmount: data.rateAmount,
    rateType: data.rateType,
    currency: data.currency,
    message: data.message || null,
  };

  if (existing) {
    await db.update(offers).set(values).where(eq(offers.id, existing.id));
  } else {
    await db
      .insert(offers)
      .values({ id: crypto.randomUUID(), jobId: job.id, userId: user.id, ...values });
  }

  revalidatePath(`/jobs/${job.id}`);
  revalidatePath("/dashboard/offers");
  revalidatePath("/dashboard");
  return { ok: true, message: existing ? "Your offer was updated." : "Offer submitted." };
}
