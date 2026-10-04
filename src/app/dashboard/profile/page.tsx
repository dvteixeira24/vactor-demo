import { getOrCreateProfile } from "@/app/actions/profile";
import { requireUser } from "@/lib/session";
import { mediaUrl } from "@/lib/media";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ImageUpload } from "@/components/profile/ImageUpload";

export const metadata = { title: "Profile" };

export default async function ProfileSettingsPage() {
  const user = await requireUser("/dashboard/profile");
  const profile = await getOrCreateProfile(user.id, user.name);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="text-muted">
          This is what casting directors and clients will see.
        </p>
      </header>

      <section className="flex flex-col gap-5 rounded-card border border-line bg-surface p-5">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Images
        </h2>
        <ImageUpload
          kind="avatar"
          name={profile.displayName}
          currentUrl={mediaUrl(profile.avatarKey)}
        />
        <ImageUpload
          kind="cover"
          name={profile.displayName}
          currentUrl={mediaUrl(profile.coverKey)}
        />
      </section>

      <ProfileForm profile={profile} />
    </div>
  );
}
