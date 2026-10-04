import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, Mic2, MapPin } from "lucide-react";
import { getDb } from "@/db";
import { getActorByHandle, listClipsForProfile } from "@/db/queries";
import { getSession } from "@/lib/session";
import { mediaUrl } from "@/lib/media";
import { Avatar } from "@/components/profile/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipList } from "@/components/clips/ClipList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const db = await getDb();
  const actor = await getActorByHandle(db, handle);
  return { title: actor ? actor.displayName : "Actor" };
}

export default async function ActorProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const db = await getDb();
  const actor = await getActorByHandle(db, handle);
  if (!actor) notFound();

  const session = await getSession();
  const isOwner = session?.user.id === actor.userId;

  if (!actor.isPublished && !isOwner) notFound();

  const clips = await listClipsForProfile(db, actor.id);
  const cover = mediaUrl(actor.coverKey);

  return (
    <div>
      <div
        className="h-40 w-full border-b border-line bg-accent-soft bg-cover bg-center sm:h-56"
        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      />

      <div className="container-page">
        <div className="-mt-12 flex flex-col gap-6 pb-10 sm:-mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Avatar
              name={actor.displayName}
              src={mediaUrl(actor.avatarKey)}
              size={96}
              className="border-4 border-paper"
            />
            {!actor.isPublished && (
              <Badge tone="warn">Draft — not public yet</Badge>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {actor.displayName}
              </h1>
              {actor.accent && <Badge tone="accent">{actor.accent}</Badge>}
            </div>
            {actor.tagline && (
              <p className="max-w-2xl text-lg text-ink-soft">{actor.tagline}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              {actor.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden />
                  {actor.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Mic2 className="size-4" aria-hidden />
                {clips.length} {clips.length === 1 ? "clip" : "clips"}
              </span>
              {actor.yearsExperience != null && (
                <span>{actor.yearsExperience} yrs experience</span>
              )}
              {actor.websiteUrl && (
                <a
                  href={actor.websiteUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-accent hover:text-accent-hover"
                >
                  <Globe className="size-4" aria-hidden />
                  Website
                </a>
              )}
            </div>

            {(actor.voiceTags.length > 0 || actor.languages.length > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                {actor.voiceTags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
                {actor.languages.map((language) => (
                  <Badge key={language} tone="accent">
                    {language}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {actor.bio && (
            <p className="max-w-3xl whitespace-pre-line text-ink-soft">
              {actor.bio}
            </p>
          )}

          <section className="mt-4">
            <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">
              Demo clips
            </h2>
            {clips.length === 0 ? (
              <EmptyState
                title="No demo clips yet"
                description={
                  isOwner
                    ? "Upload your first clip to start your portfolio."
                    : "This actor hasn't added any clips yet."
                }
                action={
                  isOwner ? (
                    <Link
                      href="/dashboard/clips/new"
                      className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
                    >
                      Upload a clip
                    </Link>
                  ) : undefined
                }
              />
            ) : (
              <ClipList
                clips={clips}
                actor={{ displayName: actor.displayName, handle: actor.handle }}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
