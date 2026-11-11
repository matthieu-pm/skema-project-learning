import { useId, useRef, useState } from "react";
import { KeyboardInput, useKeyboard } from "./mobile";
import { languageChoices, levelChoices } from "./onboarding";
import { Icon } from "./teacher/icons";
import "./teacher-language-picker.css";

export default function TeacherLanguagePicker({ mobile, selected, levels, onToggle, onLevels, showErrors = false }: {
  mobile: boolean; selected: string[]; levels: Record<string, string[]>;
  onToggle: (language: string) => void; onLevels: (language: string, levels: string[]) => void; showErrors?: boolean;
}) {
  const id = useId(), root = useRef<HTMLDivElement>(null), keyboard = useKeyboard();
  const [query, setQuery] = useState(""), [open, setOpen] = useState(false), [highlight, setHighlight] = useState(0);
  const matching = languageChoices.filter(language => language.toLowerCase().includes(query.trim().toLowerCase()));
  const Input = mobile ? KeyboardInput : "input";
  return <div className="teacher-language-picker" ref={root}>
    <label htmlFor={`${id}-search`}>Languages you teach</label>
    <div className="tlp-search"><Icon name="search" size={18} /><Input id={`${id}-search`} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={open && matching[highlight] ? `${id}-option-${highlight}` : undefined} value={query} placeholder="Search languages" onFocus={() => setOpen(true)} onBlur={event => { if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false); if (mobile) keyboard.hide(); }} onChange={event => { setQuery(event.target.value); setOpen(true); setHighlight(0); }} onKeyDown={event => {
      if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setOpen(true); setHighlight(value => matching.length ? (value + (event.key === "ArrowDown" ? 1 : -1) + matching.length) % matching.length : 0); }
      if (event.key === "Enter" && open && matching[highlight]) { event.preventDefault(); onToggle(matching[highlight]); }
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); keyboard.hide(); }
    }} /><button type="button" aria-label={open ? "Close language choices" : "Open language choices"} onClick={() => { keyboard.hide(); setOpen(value => !value); }}><Icon name="down" size={18} /></button></div>
    {open && <div className="tlp-options" id={`${id}-list`} role="listbox" aria-label="Languages" aria-multiselectable="true">{matching.length ? matching.map((language, index) => <button type="button" key={language} id={`${id}-option-${index}`} role="option" aria-selected={selected.includes(language)} tabIndex={-1} className={index === highlight ? "highlighted" : ""} onMouseDown={event => event.preventDefault()} onClick={() => onToggle(language)}><span>{language}</span>{selected.includes(language) && <Icon name="check" size={18} />}</button>) : <p role="status">No languages found. Try another search.</p>}</div>}
    {!selected.length && showErrors && <p className="tlp-error" role="alert">Choose at least one language.</p>}
    <div className="tlp-selected">{selected.map(language => {
      const values = levels[language] || [], errorId = `${id}-${language}-error`;
      return <fieldset key={language} tabIndex={-1} data-teaching-language={language} aria-invalid={!values.length && showErrors} aria-describedby={!values.length && showErrors ? errorId : undefined}><legend>{language}</legend><button type="button" className="tlp-remove" aria-label={`Remove ${language}`} onClick={() => onToggle(language)}><Icon name="close" size={16} /></button><p>Levels you teach</p><div className="tlp-levels">{levelChoices.map(([level]) => <button type="button" key={level} aria-label={`${language} ${level}`} aria-pressed={values.includes(level)} onClick={() => onLevels(language, values.includes(level) ? values.filter(value => value !== level) : [...values, level])}>{level}{values.includes(level) && <Icon name="check" size={13} />}</button>)}</div>{!values.length && showErrors && <p id={errorId} className="tlp-error" role="alert">Choose at least one level for {language}.</p>}</fieldset>;
    })}</div>
  </div>;
}
