import countryData from "./country-data.json" with { type: "json" };

export type Country = { code: string; name: string };

const normalize = (value: string) => value.trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en").replace(/[.’']/g, "").replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ");
const names = new Map<string, Country>();
const codes = new Map<string, Country>();

for (const country of countryData) {
  names.set(normalize(country.name), country);
  codes.set(country.code, country);
}

// Match labels people commonly type without changing the stored country name.
const aliases: Record<string, string[]> = {
  GB: ["United Kingdom", "UK", "U.K.", "Great Britain", "Britain", "Royaume-Uni"],
  US: ["United States", "USA", "U.S.A.", "United States of America", "États-Unis"],
  FR: ["France", "République française"],
  DE: ["Germany", "Deutschland", "Allemagne"],
  ES: ["Spain", "España", "Espagne"],
  IT: ["Italy", "Italia", "Italie"],
  JP: ["Japan", "Japon", "日本"],
  BR: ["Brazil", "Brasil", "Brésil"],
  PT: ["Portugal"],
  CH: ["Switzerland", "Suisse", "Schweiz", "Svizzera"],
  BE: ["Belgium", "Belgique", "België"],
  NL: ["Netherlands", "The Netherlands", "Nederland", "Pays-Bas"],
  CZ: ["Czechia", "Czech Republic"],
  KR: ["South Korea", "Republic of Korea"],
  KP: ["North Korea"],
  TR: ["Turkey", "Türkiye"],
  CI: ["Ivory Coast", "Côte d’Ivoire", "Cote d'Ivoire"],
  VA: ["Vatican City", "Holy See"],
};
for (const [code, labels] of Object.entries(aliases)) {
  const country = codes.get(code);
  if (country) for (const label of labels) names.set(normalize(label), country);
}

/** An exact country name or ISO code; partial input and language names remain unmarked. */
export function countryForName(value: string): Country | undefined {
  return names.get(normalize(value)) || codes.get(value.trim().toUpperCase());
}

/** Country names in location labels are explicit final comma-separated parts, never inferred from a city. */
export function countryForLocation(value: string): Country | undefined {
  const parts = value.split(",");
  for (let index = 0; index < parts.length; index++) {
    const match = names.get(normalize(parts.slice(index).join(",")));
    if (match) return match;
  }
  return undefined;
}
