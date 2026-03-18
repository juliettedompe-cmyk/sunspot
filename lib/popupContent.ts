import type { TerraceWithSunInfo } from "@/domain/terrace";

/**
 * Builds the HTML string for a terrace map popup.
 * All user-provided strings are escaped to prevent XSS.
 */
export function buildPopupHtml(terrace: TerraceWithSunInfo): string {
  const hoursLine = terrace.openHours
    ? `<p class="mt-1 text-gray-600">🕐 ${escapeHtml(terrace.openHours)}</p>`
    : "";

  const sunLabel = terrace.isSunny ? "☀️ Ensoleillée" : "🌥 À l'ombre";
  const sunColor = terrace.isSunny ? "text-amber-600" : "text-gray-500";

  return `
    <div class="text-sm">
      <p class="font-semibold">${escapeHtml(terrace.name)}</p>
      <p class="text-gray-500">${escapeHtml(terrace.address)}</p>
      ${hoursLine}
      <p class="mt-1 font-medium ${sunColor}">${sunLabel}</p>
      <p class="text-xs text-gray-400 mt-1">
        Soleil : ${terrace.sunAltitudeDeg.toFixed(1)}° · Az. ${terrace.sunAzimuthDeg.toFixed(0)}°
      </p>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
