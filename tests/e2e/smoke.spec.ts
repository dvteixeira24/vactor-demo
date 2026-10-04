import { expect, test } from "@playwright/test";

test("home shows demo clips and the global player starts", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /latest demos|demos|results/i }).first(),
  ).toBeVisible();

  const play = page.getByRole("button", { name: /^Play / }).first();
  await expect(play).toBeVisible();
  await play.click();

  await expect(
    page.getByRole("region", { name: "Audio player" }),
  ).toBeVisible();
});

test("actor directory links to a public profile with clips", async ({
  page,
}) => {
  await page.goto("/actors");
  await expect(page.getByRole("heading", { name: "Actors" })).toBeVisible();

  await page.getByRole("link", { name: /Mara Ellison/ }).first().click();
  await expect(
    page.getByRole("heading", { name: "Demo clips" }),
  ).toBeVisible();
});

test("job board opens a job and prompts signed-out users to sign in", async ({
  page,
}) => {
  await page.goto("/jobs");
  await page
    .getByRole("link", { name: /Warm commercial VO for a coffee brand/ })
    .first()
    .click();

  await expect(page.getByText(/Sign in to submit an offer/)).toBeVisible();
  await expect(page.getByText(/Budget/)).toBeVisible();
});
