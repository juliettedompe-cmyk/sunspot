import type { TerraceWithSunInfo, SunStatus } from "@/types/terrace";

const STATUS_LABEL: Record<SunStatus, string> = {
  sunny: "☀️ Plein soleil",
  partial: "🌤 Partiellement ensoleillée",
  shady: "🌥 À l'ombre",
};

const STATUS_COLOR: Record<SunStatus, string> = {
  sunny: "text-amber-600",
  partial: "text-orange-500",
  shady: "text-gray-500",
};

/**
 * Builds the HTML string for a terrace map popup.
 * All user-provided strings are escaped to prevent XSS.
 */
export function buildPopupHtml(terrace: TerraceWithSunInfo): string {
  const hoursLine = terrace.openHours
    ? `<p class="text-gray-500">🕐 ${escapeHtml(terrace.openHours)}</p>`
    : "";

  const remainingLine =
    terrace.sunRemainingMinutes !== null
      ? `<p class="text-xs text-gray-400">Encore ~${terrace.sunRemainingMinutes} min de soleil</p>`
      : "";

  return `
    <div class="text-sm space-y-0.5">
      <p class="font-semibold">${escapeHtml(terrace.name)}</p>
      <p class="text-gray-500 text-xs">${escapeHtml(terrace.address)}</p>
      ${hoursLine}
      <p class="font-medium ${STATUS_COLOR[terrace.sunStatus]}">${STATUS_LABEL[terrace.sunStatus]}</p>
      ${remainingLine}
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
