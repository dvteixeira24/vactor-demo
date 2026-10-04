import Link from "next/link";
import { getDb } from "@/db";
import { getProfileByUserId, listClipsForProfile } from "@/db/queries";
import { requireUser } from "@/lib/session";
import { getOrCreateProfile } from "@/app/actions/profile";
import { ManageClipRow } from "@/components/clips/ManageClipRow";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Clips" };

export default async function ClipsPage() {
  const user = await requireUser("/dashboard/clips");
  const profile = await getOrCreateProfile(user.id, user.name);
  const db = await getDb();
  const clips = await listClipsForProfile(db, profile.id);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Demo clips
          </h1>
          <p className="text-muted">
            Your portfolio — {clips.length}{" "}
            {clips.length === 1 ? "clip" : "clips"}.
          </p>
        </div>
        <Link
          href="/dashboard/clips/new"
          className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
        >
          Upload a clip
        </Link>
      </header>

      {clips.length === 0 ? (
        <EmptyState
          title="No clips yet"
          description="Upload your first demo to start building your portfolio."
          action={
            <Link
              href="/dashboard/clips/new"
              className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
            >
              Upload your first clip
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {clips.map((clip) => (
            <ManageClipRow key={clip.id} clip={clip} />
          ))}
        </ul>
      )}
    </div>
  );
}
