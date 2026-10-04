import { requireUser } from "@/lib/session";
import { UploadForm } from "@/components/clips/UploadForm";

export const metadata = { title: "Upload a clip" };

export default async function NewClipPage() {
  await requireUser("/dashboard/clips/new");

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Upload a clip
        </h1>
        <p className="text-muted">
          We read the waveform in your browser — nothing is transcoded, so your
          original audio is kept.
        </p>
      </header>
      <UploadForm />
    </div>
  );
}
