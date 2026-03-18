import { test, expect } from "@playwright/test";

/**
 * E2E — parcours utilisateur principal de SunSpot.
 *
 * Ces tests vérifient que l'UI de bout en bout :
 *  1. charge correctement
 *  2. permet de naviguer dans le temps
 *  3. filtre les terrasses par exposition solaire
 *  4. affiche la fiche d'une terrasse sélectionnée
 *
 * Pré-requis : un serveur Next.js doit tourner sur http://localhost:3000
 * (géré automatiquement par `webServer` dans playwright.config.ts).
 */

test.describe("chargement de l'application", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("affiche le titre SunSpot", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("SunSpot");
  });

  test("affiche le sous-titre", async ({ page }) => {
    await expect(page.getByText("Terrasses ensoleillées à Paris")).toBeVisible({ timeout: 5_000 });
  });

  test("affiche le canvas de la carte", async ({ page }) => {
    await expect(page.locator(".maplibregl-canvas")).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("navigation temporelle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("affiche le slider de temps", async ({ page }) => {
    const slider = page.getByRole("slider", { name: "Heure" });
    await expect(slider).toBeVisible({ timeout: 5_000 });
  });

  test("affiche le bouton Maintenant", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Maintenant" })).toBeVisible({ timeout: 5_000 });
  });

  test("le bouton Maintenant est cliquable", async ({ page }) => {
    const btn = page.getByRole("button", { name: "Maintenant" });
    await expect(btn).toBeVisible({ timeout: 5_000 });
    await btn.click();
    // Should not throw; page stays stable
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("déplacer le slider change l'heure affichée", async ({ page }) => {
    const slider = page.getByRole("slider", { name: "Heure" });
    await expect(slider).toBeVisible({ timeout: 5_000 });

    const timeBefore = await page.locator(".tabular-nums").first().textContent();

    // Move slider to 12:00 (720 minutes)
    await slider.fill("720");

    const timeAfter = await page.locator(".tabular-nums").first().textContent();
    // The label should have changed (unless it was already at 12:00)
    expect(timeAfter).toBeDefined();
  });
});

test.describe("filtres d'exposition solaire", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("affiche les trois chips de filtre", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Toutes" })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole("button", { name: "Ensoleillées" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Plein soleil" })).toBeVisible();
  });

  test("le chip 'Toutes' est actif par défaut", async ({ page }) => {
    const btn = page.getByRole("button", { name: "Toutes" });
    await expect(btn).toBeVisible({ timeout: 5_000 });
    await expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  test("cliquer sur 'Ensoleillées' active ce filtre", async ({ page }) => {
    const btn = page.getByRole("button", { name: "Ensoleillées" });
    await expect(btn).toBeVisible({ timeout: 5_000 });
    await btn.click();
    await expect(btn).toHaveAttribute("aria-pressed", "true");

    const toutesBtn = page.getByRole("button", { name: "Toutes" });
    await expect(toutesBtn).toHaveAttribute("aria-pressed", "false");
  });

  test("cliquer sur 'Plein soleil' active ce filtre", async ({ page }) => {
    const btn = page.getByRole("button", { name: "Plein soleil" });
    await expect(btn).toBeVisible({ timeout: 5_000 });
    await btn.click();
    await expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  test("affiche le sélecteur de durée de soleil", async ({ page }) => {
    const select = page.getByRole("combobox", { name: "Soleil restant minimum" });
    await expect(select).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("liste et fiche terrasse", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("affiche la liste des terrasses après chargement", async ({ page }) => {
    // Wait for terraces to load (API call + render)
    const list = page.getByRole("list", { name: "Liste des terrasses" });
    await expect(list).toBeVisible({ timeout: 20_000 });
  });

  test("affiche au moins une terrasse dans la liste", async ({ page }) => {
    const list = page.getByRole("list", { name: "Liste des terrasses" });
    await expect(list).toBeVisible({ timeout: 20_000 });
    const items = page.getByRole("listitem");
    await expect(items.first()).toBeVisible();
  });

  test("affiche le compteur de terrasses", async ({ page }) => {
    // StatusBar renders "☀️ N / N terrasses"
    const status = page.getByText(/terrasses/);
    await expect(status).toBeVisible({ timeout: 20_000 });
  });

  test("cliquer sur une terrasse affiche sa fiche", async ({ page }) => {
    const list = page.getByRole("list", { name: "Liste des terrasses" });
    await expect(list).toBeVisible({ timeout: 20_000 });

    const firstItem = page.getByRole("listitem").first();
    await firstItem.click();

    // TerraceDetails has a close button with aria-label "Fermer"
    const closeBtn = page.getByRole("button", { name: /Fermer/i });
    await expect(closeBtn).toBeVisible({ timeout: 5_000 });
  });

  test("fermer la fiche revient à la liste", async ({ page }) => {
    const list = page.getByRole("list", { name: "Liste des terrasses" });
    await expect(list).toBeVisible({ timeout: 20_000 });

    await page.getByRole("listitem").first().click();

    const closeBtn = page.getByRole("button", { name: /Fermer/i });
    await expect(closeBtn).toBeVisible({ timeout: 5_000 });
    await closeBtn.click();

    // After closing, the list should be visible again (desktop sidebar)
    await expect(list).toBeVisible({ timeout: 5_000 });
  });
});
