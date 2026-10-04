import { describe, expect, it } from "vitest";
import {
  extFromMime,
  imageKey,
  validateAudio,
  validateImage,
} from "./storage";

describe("imageKey", () => {
  it("namespaces avatars by user with an extension", () => {
    expect(imageKey("user-1", "avatar", "png")).toMatch(
      /^avatars\/user-1\/[0-9a-f-]+\.png$/,
    );
  });

  it("namespaces covers", () => {
    expect(imageKey("u", "cover", "jpg")).toMatch(/^covers\/u\//);
  });
});

describe("extFromMime", () => {
  it("maps common image types", () => {
    expect(extFromMime("image/png")).toBe("png");
    expect(extFromMime("image/jpeg")).toBe("jpg");
  });

  it("returns null for unsupported types", () => {
    expect(extFromMime("application/pdf")).toBeNull();
  });
});

describe("validateImage", () => {
  it("accepts a small PNG", () => {
    expect(validateImage({ type: "image/png", size: 1000 }).ok).toBe(true);
  });

  it("rejects files over 5 MB", () => {
    expect(validateImage({ type: "image/png", size: 6 * 1024 * 1024 }).ok).toBe(
      false,
    );
  });

  it("rejects unsupported types", () => {
    expect(validateImage({ type: "application/pdf", size: 10 }).ok).toBe(false);
  });
});

describe("validateAudio", () => {
  it("accepts an MP3 under the cap", () => {
    expect(validateAudio({ type: "audio/mpeg", size: 5_000_000 }).ok).toBe(true);
  });

  it("rejects files over 25 MB", () => {
    expect(
      validateAudio({ type: "audio/mpeg", size: 26 * 1024 * 1024 }).ok,
    ).toBe(false);
  });

  it("rejects non-audio types", () => {
    expect(validateAudio({ type: "video/mp4", size: 100 }).ok).toBe(false);
  });
});
