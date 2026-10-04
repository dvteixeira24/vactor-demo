import { getOrCreateProfile } from "@/app/actions/profile";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "@/components/profile/ProfileForm";

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

      <ProfileForm profile={profile} />
    </div>
  );
}
