import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatBudget } from "@/lib/jobs";
import { formatRateType } from "@/lib/taxonomy";
import type { Job } from "@/db/schema";

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex flex-col gap-3 rounded-card border border-line bg-surface p-5 transition-shadow hover:shadow-card"
    >
      <div className="flex items-center justify-between gap-3">
        <Badge tone="accent">{job.category}</Badge>
        <span className="inline-flex items-center gap-1 text-xs text-faint">
          <MapPin className="size-3.5" aria-hidden />
          {job.locationType === "remote" ? "Remote" : "On-site"}
        </span>
      </div>

      <h3 className="font-medium text-ink group-hover:text-accent-hover">
        {job.title}
      </h3>
      <p className="text-sm text-muted">{job.clientName}</p>

      <div className="mt-auto flex items-baseline gap-1.5 border-t border-line pt-3">
        <span className="text-sm font-medium text-ink">
          {formatBudget(job)}
        </span>
        <span className="text-xs text-muted">{formatRateType(job.rateType)}</span>
      </div>
    </Link>
  );
}
