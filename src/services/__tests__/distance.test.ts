import { describe, it, expect } from "vitest";
import { calculateDistanceKm } from "../distance";

// Real Paris coordinates used as fixtures
const CAFE_DE_FLORE = { lat: 48.854, lng: 2.333 };
const LES_DEUX_MAGOTS = { lat: 48.854, lng: 2.3328 };
const LE_CONSULAT = { lat: 48.8864, lng: 2.3377 }; // Montmartre
const PARIS_CENTER = { lat: 48.8566, lng: 2.3522 };
const VERSAILLES = { lat: 48.8014, lng: 2.1301 };

describe("calculateDistanceKm", () => {
  it("returns 0 for identical points", () => {
    expect(calculateDistanceKm(PARIS_CENTER, PARIS_CENTER)).toBe(0);
  });

  it("is symmetric — distance A→B equals B→A", () => {
    const ab = calculateDistanceKm(CAFE_DE_FLORE, LE_CONSULAT);
    const ba = calculateDistanceKm(LE_CONSULAT, CAFE_DE_FLORE);
    expect(ab).toBeCloseTo(ba, 10);
  });

  it("returns a very small distance for neighboring terraces (~20m)", () => {
    const dist = calculateDistanceKm(CAFE_DE_FLORE, LES_DEUX_MAGOTS);
    expect(dist).toBeLessThan(0.05); // < 50m
    expect(dist).toBeGreaterThan(0);
  });

  it("returns ~3.6 km between Saint-Germain and Montmartre", () => {
    const dist = calculateDistanceKm(CAFE_DE_FLORE, LE_CONSULAT);
    expect(dist).toBeGreaterThan(3);
    expect(dist).toBeLessThan(4.5);
  });

  it("returns ~18 km between Paris center and Versailles", () => {
    const dist = calculateDistanceKm(PARIS_CENTER, VERSAILLES);
    expect(dist).toBeGreaterThan(16);
    expect(dist).toBeLessThan(20);
  });

  it("returns a positive distance for any two distinct points", () => {
    const dist = calculateDistanceKm(PARIS_CENTER, VERSAILLES);
    expect(dist).toBeGreaterThan(0);
  });
});
