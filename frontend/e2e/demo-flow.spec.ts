import { expect, test } from "@playwright/test";

test("demo flow stays profile-aware and demo-ready", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.getByText(/Load a match clip/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Explainable moments/i)).toBeVisible();
  const statusPill = page.locator(".status-pill");
  await expect(statusPill).toContainText("Service Ready");
  await expect(statusPill).toContainText("sqlite");

  const firstMoment = page.locator(".timeline-card").first();
  await expect(firstMoment).toBeVisible();
  await expect(page.getByRole("button", { name: /Open Match Insights/i })).toHaveCount(0);
  await firstMoment.click();
  const drawer = page.locator(".insight-drawer");
  await expect(drawer.locator(".overlay-kicker")).toContainText(/Match Insights/i, { timeout: 30_000 });
  await expect(drawer.locator("h3")).toBeVisible({ timeout: 30_000 });
  await expect(drawer.locator(".insight-drawer-meta span").first()).toBeVisible();

  await page.getByRole("button", { name: /^child$/i }).click();
  await expect(drawer.locator("h3")).toBeVisible();
  await expect(drawer.locator(".insight-drawer-body").first()).toHaveText(/\S+/, { timeout: 30_000 });

  await page.getByRole("button", { name: /^analyst$/i }).click();
  await expect(drawer.locator("h3")).toBeVisible();
  await expect(drawer.locator(".insight-drawer-body").first()).toHaveText(/\S+/, { timeout: 30_000 });

  const largeTextToggle = page.getByLabel(/Large text/i);
  await largeTextToggle.check();
  await expect(largeTextToggle).toBeChecked();
  await expect(page.getByText(/Explainable moments/i)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(drawer).not.toHaveClass(/insight-drawer-open/);
});
