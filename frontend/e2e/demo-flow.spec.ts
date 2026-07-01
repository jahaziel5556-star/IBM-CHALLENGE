import { expect, test } from "@playwright/test";

test("demo flow stays profile-aware and demo-ready", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(
    page.getByRole("heading", { name: /Explain the match without interrupting the match/i }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/System status at a glance/i)).toBeVisible();
  const statusPill = page.locator(".status-pill");
  await expect(statusPill).toContainText("Service Ready");
  await expect(statusPill).toContainText("sqlite");

  await page.getByRole("button", { name: /^new fan$/i }).click();
  await page.getByRole("button", { name: /^Generate Insight$/i }).click();
  const overlay = page.locator(".insight-overlay");
  await expect(overlay.getByText(/AI Insight/i)).toBeVisible({ timeout: 30_000 });
  await expect(overlay.getByRole("heading", { name: /Penalty Awarded/i })).toBeVisible({ timeout: 30_000 });
  const initialExplanation = await overlay.locator("p").nth(1).textContent();
  await expect(overlay).toContainText("Law 12");

  await page.getByRole("button", { name: /^child$/i }).click();
  await expect
    .poll(async () => overlay.locator("p").nth(1).textContent(), { timeout: 30_000 })
    .not.toBe(initialExplanation);
  const childExplanation = await overlay.locator("p").nth(1).textContent();

  await page.getByRole("button", { name: /^analyst$/i }).click();
  await expect
    .poll(async () => overlay.locator("p").nth(1).textContent(), { timeout: 30_000 })
    .not.toBe(childExplanation);

  const largeTextToggle = page.getByLabel(/Large text/i);
  await largeTextToggle.check();
  await expect(largeTextToggle).toBeChecked();

  await page.getByRole("button", { name: /Start Demo Mode/i }).click();
  await expect(page.getByText(/Demo live/i)).toBeVisible();

  await expect(page.getByText(/Insight History/i)).toBeVisible();
  await expect(page.locator(".history-item").first()).toBeVisible({ timeout: 15_000 });
});
