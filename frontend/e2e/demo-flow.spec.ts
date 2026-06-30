import { expect, test } from "@playwright/test";

test("demo flow stays profile-aware and demo-ready", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(
    page.getByRole("heading", { name: /Explain the match without interrupting the match/i }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/System status at a glance/i)).toBeVisible();
  await expect(page.getByText(/Service Ready/i)).toBeVisible();
  await expect(page.getByText(/mock/i).first()).toBeVisible();
  await expect(page.getByText(/sqlite/i).first()).toBeVisible();

  await page.getByRole("button", { name: /^new fan$/i }).click();
  await page.getByRole("button", { name: /^Generate Insight$/i }).click();
  const overlay = page.locator(".insight-overlay");
  await expect(overlay.getByText(/AI Insight/i)).toBeVisible();
  await expect(overlay.getByRole("heading", { name: /Penalty Awarded/i })).toBeVisible();
  await expect(overlay).toContainText("simple football language");
  const initialExplanation = await overlay.locator("p").nth(1).textContent();
  await expect(overlay).toContainText("Law 12");

  await page.getByRole("button", { name: /^child$/i }).click();
  await expect(overlay).toContainText("friendly wording and one clear football idea");

  await page.getByRole("button", { name: /^analyst$/i }).click();
  await expect(overlay).toContainText("structure, spacing, and cause-effect in the phase of play");
  const analystExplanation = await overlay.locator("p").nth(1).textContent();
  expect(analystExplanation).not.toBe(initialExplanation);

  const largeTextToggle = page.getByLabel(/Large text/i);
  await largeTextToggle.check();
  await expect(largeTextToggle).toBeChecked();

  await page.getByRole("button", { name: /Start Demo Mode/i }).click();
  await expect(page.getByText(/Demo live/i)).toBeVisible();

  await expect(page.getByText(/Insight History/i)).toBeVisible();
  await expect(page.locator(".history-item").first()).toBeVisible({ timeout: 15_000 });
});
