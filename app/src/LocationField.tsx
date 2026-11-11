import { useEffect, useId, useRef, useState } from "react";
import { KeyboardInput, useKeyboard } from "./mobile";
import { findLocations, locationPermissionError, type LocationChoice } from "./locations";
import { CountryFlag, CountryText } from "./CountryFlag";
import { countryForLocation } from "./countries";
import "./location-field.css";

export default function LocationField({ value, onChange, mobile = false, label = "City or neighbourhood", allowLocation = true }: {
  value: string; onChange: (value: string) => void; mobile?: boolean; label?: string; allowLocation?: boolean;
}) {
  const id = useId();
  const keyboard = useKeyboard();
  const [focused, setFocused] = useState(false);
  const [choices, setChoices] = useState<LocationChoice[]>([]);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const [retry, setRetry] = useState(0);
  const committed = useRef(value);
  const generation = useRef(0);
  const mounted = useRef(true);
  const geoRequest = useRef<AbortController | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; generation.current++; geoRequest.current?.abort(); };
  }, []);
  useEffect(() => {
    setChoices([]); setActive(-1);
    if (!focused || value.trim().length < 2 || value === committed.current) return;
    const controller = new AbortController();
    let alive = true;
    setStatus("Searching locations…"); setError("");
    const timer = window.setTimeout(async () => {
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      try {
        const results = await findLocations(value, controller.signal);
        if (!alive) return;
        setChoices(results);
        setStatus(results.length ? `${results.length} suggestions. Choose a location, or keep your typed location.` : "No matching locations. Try a nearby city, or keep your typed location.");
      } catch {
        if (alive) { setStatus(""); setError("Location suggestions could not load. Try again, or keep your typed location."); }
      } finally { window.clearTimeout(timeout); }
    }, 400);
    return () => { alive = false; window.clearTimeout(timer); controller.abort(); };
  }, [value, focused, retry]);
  const choose = (choice: LocationChoice) => {
    generation.current++; geoRequest.current?.abort(); setLocating(false);
    committed.current = choice.label;
    onChange(choice.label); setChoices([]); setFocused(false); setError(""); setStatus("Location selected. You can edit it anytime.");
    if (mobile) keyboard.hide();
  };
  const locate = () => {
    if (mobile) keyboard.hide();
    if (!window.isSecureContext || !navigator.geolocation) {
      setError("Location is unavailable in this browser. Type your city or neighbourhood instead."); return;
    }
    const current = ++generation.current;
    setLocating(true); setFocused(false); setChoices([]); setError(""); setStatus("Finding your location…");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      if (!mounted.current || current !== generation.current) return;
      const controller = new AbortController(); geoRequest.current = controller;
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      try {
        const results = await findLocations(coords, controller.signal);
        if (!mounted.current || current !== generation.current) return;
        if (!results.length) throw new Error("No nearby location");
        committed.current = results[0].label; onChange(results[0].label);
        setStatus("Approximate location found. Check the city or neighbourhood before continuing.");
      } catch {
        if (mounted.current && current === generation.current) { setError("We could not identify your city. Try again, or type it instead."); setStatus(""); }
      } finally { window.clearTimeout(timeout); if (mounted.current && current === generation.current) setLocating(false); }
    }, ({ code }) => {
      if (!mounted.current || current !== generation.current) return;
      setError(locationPermissionError(code)); setStatus(""); setLocating(false);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  };
  const Input = mobile ? KeyboardInput : "input";
  const expanded = focused && choices.length > 0;
  const country = countryForLocation(value);
  return (
    <div className="location-field">
      <label htmlFor={id}>{label}</label>
      <div className="location-input">
      <Input id={id} value={value} placeholder="Start typing a city or neighbourhood" autoComplete="off"
        role="combobox" aria-autocomplete="list" aria-expanded={expanded}
        aria-controls={expanded ? `${id}-list` : undefined}
        aria-activedescendant={expanded && active >= 0 ? `${id}-option-${active}` : undefined}
        aria-describedby={`${id}-status ${id}-privacy${error ? ` ${id}-error` : ""}`}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); if (mobile) keyboard.hide(); }}
        onChange={(e) => { generation.current++; geoRequest.current?.abort(); setLocating(false); setFocused(true); setStatus(""); setError(""); onChange(e.target.value); }}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setFocused(false); setActive(-1); }
          if ((e.key === "ArrowDown" || e.key === "ArrowUp") && choices.length) {
            e.preventDefault(); setFocused(true); setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + choices.length) % choices.length);
          }
          if (e.key === "Enter" && expanded && active >= 0) { e.preventDefault(); choose(choices[active]); }
        }} />
      <span className="location-country" aria-hidden="true">{country && <CountryFlag country={country.code} />}</span>
      </div>
      {expanded && <ul id={`${id}-list`} role="listbox" aria-label="Location suggestions">
        {choices.map((choice, index) => <li key={choice.label} id={`${id}-option-${index}`} role="option" aria-selected={active === index}
          onMouseDown={(e) => e.preventDefault()} onClick={() => choose(choice)}><CountryText value={choice.label} /></li>)}
      </ul>}
      <p id={`${id}-status`} role="status">{status || "Type at least 2 characters. You can also enter a location manually."}</p>
      {error && <div id={`${id}-error`} role="alert"><p>{error}</p><button type="button" onClick={() => { committed.current = ""; setFocused(true); setRetry((n) => n + 1); setError(""); }}>Retry suggestions</button></div>}
      {allowLocation && <button type="button" disabled={locating} onClick={locate}>{locating ? "Finding location…" : "Use my location"}</button>}
      <p id={`${id}-privacy`} className="location-credit">
        Suggestions: <a href="https://photon.komoot.io/" target="_blank" rel="noreferrer">Photon</a> / <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>.
        {allowLocation && " Your browser asks before using your location. Only an approximate position is sent to Photon; only the place name is saved."}
      </p>
    </div>
  );
}
