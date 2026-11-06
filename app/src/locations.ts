export type LocationChoice = { label: string };
const endpoint = "https://photon.komoot.io";
export function locationChoices(data: unknown): LocationChoice[] {
  const features = (data as { features?: unknown[] })?.features;
  if (!Array.isArray(features)) throw new Error("Location service returned an unreadable response.");
  const labels = features.flatMap((feature) => {
    const p = (feature as { properties?: Record<string, unknown> })?.properties;
    if (!p) return [];
    const parts = [p.name, p.city, p.state, p.country].filter((s): s is string => typeof s === "string" && !!s.trim());
    return parts.length ? [[...new Set(parts)].join(", ")] : [];
  });
  return [...new Set(labels)].slice(0, 5).map((label) => ({ label }));
}
export function locationUrl(query: string | { latitude: number; longitude: number }): string {
  const url = new URL(typeof query === "string" ? "/api/" : "/reverse/", endpoint);
  url.searchParams.set("lang", "en");
  url.searchParams.set("limit", "5");
  for (const layer of ["city", "district", "locality"]) url.searchParams.append("layer", layer);
  if (typeof query === "string") url.searchParams.set("q", query.trim());
  else {
    if (!Number.isFinite(query.latitude) || !Number.isFinite(query.longitude) || Math.abs(query.latitude) > 90 || Math.abs(query.longitude) > 180) throw new Error("Invalid coordinates");
    // Approximate the position before sending it; never request a home address.
    url.searchParams.set("lat", query.latitude.toFixed(2));
    url.searchParams.set("lon", query.longitude.toFixed(2));
  }
  return url.toString();
}
export async function findLocations(query: Parameters<typeof locationUrl>[0], signal: AbortSignal, request: typeof fetch = fetch): Promise<LocationChoice[]> {
  const response = await request(locationUrl(query), { signal, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!response.ok) throw new Error("Location suggestions are unavailable.");
  return locationChoices(await response.json());
}
export function locationPermissionError(code: number): string {
  if (code === 1) return "Location access was denied. Allow it in your browser settings, or type your city or neighbourhood.";
  if (code === 3) return "Finding your location took too long. Try again, or type your city or neighbourhood.";
  return "Your location could not be found. Try again, or type your city or neighbourhood.";
}
