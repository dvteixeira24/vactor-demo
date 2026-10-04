type BudgetJob = {
  currency: string;
  budgetMin: number | null;
  budgetMax: number | null;
};

/** Human-readable budget line for a job, tolerant of partial data. */
export function formatBudget(job: BudgetJob): string {
  const { currency, budgetMin, budgetMax } = job;
  if (budgetMin != null && budgetMax != null) {
    return `${currency} ${budgetMin}–${budgetMax}`;
  }
  if (budgetMin != null) return `From ${currency} ${budgetMin}`;
  if (budgetMax != null) return `Up to ${currency} ${budgetMax}`;
  return "Budget TBD";
}
