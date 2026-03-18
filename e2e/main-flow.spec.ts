import { test, expect } from "@playwright/test";

test.describe("parcours utilisateur principal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("affiche la carte au chargement", async ({ page }) => {
    const map = page.locator(".maplibregl-canvas");
    await expect(map).toBeVisible({ timeout: 10_000 });
  });

  test("affiche le sélecteur de date/heure", async ({ page }) => {
    const input = page.getByRole("textbox").or(page.locator('input[type="datetime-local"]'));
    await expect(input).toBeVisible();
  });

  test("affiche le toggle de filtre ensoleillé", async ({ page }) => {
    const toggle = page.getByRole("switch");
    await expect(toggle).toBeVisible();
  });

  test("affiche le compteur de terrasses après chargement", async ({ page }) => {
    // Wait for the status bar to appear (terraces loaded)
    const status = page.locator("text=/terrasses/");
    await expect(status).toBeVisible({ timeout: 15_000 });
  });

  test("le filtre ensoleillé réduit ou maintient le nombre de markers visibles", async ({ page }) => {
    // Wait for markers to appear
    await page.waitForSelector(".maplibregl-canvas", { timeout: 10_000 });
    await page.waitForTimeout(2_000); // let terraces load

    const toggle = page.getByRole("switch");

    // Count markers before filter
    const markersBefore = await page.locator(".maplibregl-marker").count();

    // Enable filter
    await toggle.click();
    await page.waitForTimeout(500);

    const markersAfter = await page.locator(".maplibregl-marker").count();

    // After filtering, we should have fewer or equal markers
    expect(markersAfter).toBeLessThanOrEqual(markersBefore);
  });

  test("un clic sur un marker ouvre un popup avec le nom de la terrasse", async ({ page }) => {
    await page.waitForSelector(".maplibregl-canvas", { timeout: 10_000 });
    await page.waitForTimeout(2_000);

    const firstMarker = page.locator(".maplibregl-marker").first();
    await firstMarker.click();

    // Popup should appear
    const popup = page.locator(".maplibregl-popup");
    await expect(popup).toBeVisible({ timeout: 3_000 });

    // Popup should contain sun info
    await expect(popup).toContainText("Soleil");
  });
});
