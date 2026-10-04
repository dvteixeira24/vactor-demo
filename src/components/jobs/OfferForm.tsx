"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { submitOffer } from "@/app/actions/offers";
import { CURRENCIES } from "@/lib/validators/offer";
import { RATE_TYPES } from "@/lib/taxonomy";
import type { Offer } from "@/db/schema";

export function OfferForm({
  jobId,
  initial,
}: {
  jobId: string;
  initial: Offer | null;
}) {
  const router = useRouter();
  const [rateAmount, setRateAmount] = useState(
    initial ? String(initial.rateAmount) : "",
  );
  const [rateType, setRateType] = useState<string>(
    initial?.rateType ?? "fixed",
  );
  const [currency, setCurrency] = useState<string>(initial?.currency ?? "USD");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    startTransition(async () => {
      const result = await submitOffer({
        jobId,
        rateAmount,
        rateType,
        currency,
        message,
      });
      setStatus(
        result.ok ? { ok: true, msg: result.message } : { ok: false, msg: result.error },
      );
      if (result.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <label className="flex flex-[2] flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-soft">Your rate</span>
          <input
            type="number"
            min={1}
            value={rateAmount}
            onChange={(e) => setRateAmount(e.target.value)}
            placeholder="450"
            required
            className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-soft">Currency</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-accent"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink-soft">Basis</span>
        <select
          value={rateType}
          onChange={(e) => setRateType(e.target.value)}
          className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-accent"
        >
          {RATE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "fixed" ? "Fixed" : t === "hourly" ? "Per hour" : "Per word"}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink-soft">Message</span>
        <textarea
          rows={4}
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell them why you're a fit and link a relevant clip."
          className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
        />
      </label>

      {status && (
        <p
          role="status"
          className={
            status.ok
              ? "rounded-lg bg-success-soft px-3 py-2 text-sm text-success"
              : "rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
          }
        >
          {status.msg}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Check className="size-4" aria-hidden />
        )}
        {initial ? "Update offer" : "Submit offer"}
      </button>
    </form>
  );
}
