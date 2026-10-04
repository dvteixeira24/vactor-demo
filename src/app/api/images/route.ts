import { getSession } from "@/lib/session";
import { setProfileImage } from "@/app/actions/profile";
import { extFromMime, imageKey, putObject, validateImage } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "You must be signed in." }, { status: 401 });
  }

  const form = await request.formData();
  const kind = form.get("kind");
  const file = form.get("file");

  if (kind !== "avatar" && kind !== "cover") {
    return Response.json({ error: "Invalid image kind." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  const check = validateImage({ type: file.type, size: file.size });
  if (!check.ok) {
    return Response.json({ error: check.error }, { status: 400 });
  }

  const ext = extFromMime(file.type)!;
  const key = imageKey(session.user.id, kind, ext);
  await putObject(key, await file.arrayBuffer(), file.type);

  const result = await setProfileImage(kind, key);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json({ key });
}
