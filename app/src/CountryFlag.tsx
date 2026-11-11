import { countryForLocation, countryForName } from "./countries";
import "./country-flags.css";

/** Decorative beside a written country name; the name remains the accessible label. */
export function CountryFlag({ country }: { country: string }) {
  const match = countryForName(country);
  if (!match) return null;
  return <img className="country-flag" src={`/assets/flags/${match.code.toLowerCase()}.svg`} width={16} height={12} alt="" aria-hidden="true" draggable={false} />;
}

/** Decorates an explicit country mention while preserving the original visible text. */
export function CountryText({ value }: { value: string }) {
  const country = countryForLocation(value);
  return country
    ? <span className="country-text"><CountryFlag country={country.code} />{value}</span>
    : <>{value}</>;
}

export default CountryFlag;
