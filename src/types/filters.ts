export interface Filters {
  /** Which terraces to show based on sun exposure. */
  sunExposure: "all" | "any-sun" | "sunny-only";
  /** Only show terraces with at least this many minutes of sun remaining. null = no filter. */
  minSunRemainingMinutes: number | null;
  /** Only show terraces within 1 km of the user. Requires user position. */
  nearbyOnly: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  sunExposure: "all",
  minSunRemainingMinutes: null,
  nearbyOnly: false,
};
