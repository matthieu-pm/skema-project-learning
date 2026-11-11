import { useEffect, useId, useRef, useState } from "react";
import { KeyboardInput, useKeyboard, useKeyboardInsets } from "./mobile";
import { languageChoices, teachingLevelChoices } from "./onboarding";
import { Icon } from "./teacher/icons";
import "./teacher-language-select.css";

export type TeacherLanguageSelectProps = {
  languages: string[];
  levels: Record<string, string[]>;
  onChange: (languages: string[], levels: Record<string, string[]>) => void;
  errors?: Record<string, string>;
  mobile?: boolean;
};

export function focusTeachingLanguageError(root: ParentNode = document) {
  const target = root.querySelector<HTMLElement>('[data-teaching-language][aria-invalid="true"]')
    ?? root.querySelector<HTMLElement>('[data-teaching-language-search]');
  target?.focus();
}

export default function TeacherLanguageSelect({ languages, levels, onChange, errors = {}, mobile = false }: TeacherLanguageSelectProps) {
  const id = useId(), input = useRef<HTMLInputElement>(null), list = useRef<HTMLDivElement>(null), search = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(""), [open, setOpen] = useState(false), [highlighted, setHighlighted] = useState(0);
  const keyboard = useKeyboard(), { isKeyboardVisible, keyboardHeight } = useKeyboardInsets();
  const matches = languageChoices.filter(language => language.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = [...new Set(languages)];
  const activeIndex = Math.min(highlighted, Math.max(0, matches.length - 1));
  const choose = (language: string) => {
    const removing = selected.includes(language);
    const next = removing ? selected.filter(value => value !== language) : [...selected, language];
    const nextLevels = { ...levels };
    if (removing) delete nextLevels[language];
    else nextLevels[language] = [];
    onChange(next, nextLevels);
  };
  const toggleLevel = (language: string, level: string) => {
    const values = levels[language] ?? [];
    onChange(selected, { ...levels, [language]: values.includes(level) ? values.filter(value => value !== level) : [...values, level] });
  };

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (search.current?.contains(event.target as Node)) return;
      setOpen(false);
      if (mobile && document.activeElement === input.current) keyboard.hide();
    };
    window.addEventListener("pointerdown", outside);
    return () => window.removeEventListener("pointerdown", outside);
  }, [open, mobile, keyboard]);
  useEffect(() => {
    if (!open) return;
    const viewport = list.current, option = viewport?.querySelector<HTMLElement>('[data-highlighted="true"]');
    if (!viewport || !option) return;
    if (option.offsetTop < viewport.scrollTop) viewport.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > viewport.scrollTop + viewport.clientHeight)
      viewport.scrollTop = option.offsetTop + option.offsetHeight - viewport.clientHeight;
  }, [open, activeIndex]);
  useEffect(() => {
    if (!mobile || !isKeyboardVisible || document.activeElement !== input.current) return;
    const field = input.current, scroll = field?.closest<HTMLElement>(".mobile-scroll");
    if (!field || !scroll) return;
    const reveal = () => {
      const rect = field.getBoundingClientRect(), viewport = scroll.getBoundingClientRect();
      const footer = scroll.closest(".flow-stack")?.querySelector<HTMLElement>(".flow-fixed-footer")?.getBoundingClientRect();
      const bottom = Math.min(viewport.bottom, footer?.top ?? viewport.bottom) - 12;
      const scale = viewport.height / scroll.clientHeight || 1;
      if (open && rect.bottom + Math.min(180, viewport.height - rect.height - 32) > bottom && rect.top > viewport.top + 12)
        scroll.scrollTop += (rect.top - viewport.top - 12) / scale;
      else if (rect.bottom > bottom) scroll.scrollTop += (rect.bottom - bottom) / scale;
      else if (rect.top < viewport.top + 12) scroll.scrollTop -= (viewport.top + 12 - rect.top) / scale;
      if (list.current) list.current.style.maxHeight = `${Math.max(36, Math.min(240, bottom - field.getBoundingClientRect().bottom - 8))}px`;
    };
    const observer = new ResizeObserver(reveal);
    observer.observe(scroll);
    const frame = requestAnimationFrame(reveal);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [mobile, isKeyboardVisible, keyboardHeight, open]);

  const Input = mobile ? KeyboardInput : "input";
  return <div className="teacher-language-select">
    <div ref={search} className="tls-search" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <label htmlFor={`${id}-search`}>Languages you teach</label>
      <div className="tls-input-wrap">
        <Icon name="search" size={18} />
        <Input ref={input} id={`${id}-search`} type="text" role="combobox" aria-label="Search teaching languages"
          data-teaching-language-search="true" autoComplete="off" placeholder="Search languages"
          value={query} aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`}
          aria-activedescendant={open && matches.length ? `${id}-option-${matches[activeIndex]}` : undefined}
          aria-invalid={!!errors[""]} aria-describedby={errors[""] ? `${id}-required` : `${id}-help`}
          onFocus={() => setOpen(true)}
          onBlur={() => { if (mobile) keyboard.hide(); }}
          onChange={event => { setQuery(event.target.value); setHighlighted(0); setOpen(true); }}
          onKeyDown={event => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setHighlighted(previous => !open ? 0 : (previous + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % Math.max(1, matches.length));
            } else if (event.key === "Enter" && open) {
              event.preventDefault();
              if (matches[activeIndex]) choose(matches[activeIndex]);
            } else if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
            else if (event.key === "Tab") setOpen(false);
          }} />
        <button className="tls-toggle" type="button" aria-label={open ? "Close language choices" : "Open language choices"}
          onMouseDown={event => event.preventDefault()} onClick={() => { input.current?.focus(); setOpen(!open); }}>
          <Icon name="down" size={16} />
        </button>
      </div>
      {open && <div ref={list} className="tls-list" id={`${id}-list`} role="listbox" aria-label="Teaching languages" aria-multiselectable="true">
        {matches.length ? matches.map((language, index) => <div id={`${id}-option-${language}`} key={language} role="option"
          aria-selected={selected.includes(language)} data-highlighted={index === activeIndex ? "true" : undefined}
          onPointerMove={() => setHighlighted(index)} onMouseDown={event => event.preventDefault()}
          onClick={() => choose(language)}>
          <span>{language}</span><span className="tls-check" aria-hidden="true">{selected.includes(language) && <Icon name="check" size={16} />}</span>
        </div>) : <p className="tls-empty" role="status">No languages found. Try another search.</p>}
      </div>}
      <p id={`${id}-help`} className="tls-help">Choose one or more languages, then the levels you teach in each.</p>
      {errors[""] && <p id={`${id}-required`} className="tls-error" role="alert">{errors[""]}</p>}
    </div>
    <div className="tls-selected">
      {selected.map(language => <fieldset key={language} className="tls-language" tabIndex={-1} data-teaching-language={language}
        aria-label={`Levels for ${language}`} aria-invalid={!!errors[language]} aria-describedby={errors[language] ? `${id}-${language}-error` : undefined}>
        <legend>{language}</legend>
        <div className="tls-language-heading"><strong>{language}</strong><button type="button" className="tls-remove" aria-label={`Remove ${language}`} onClick={() => choose(language)}><Icon name="close" size={16} /><span>Remove</span></button></div>
        <div className="tls-levels">{teachingLevelChoices.map(level => <label key={level}>
          <input type="checkbox" checked={(levels[language] ?? []).includes(level)} onChange={() => toggleLevel(language, level)} />
          <span>{level}</span>
        </label>)}</div>
        {errors[language] && <p className="tls-error" id={`${id}-${language}-error`} role="alert">{errors[language]}</p>}
      </fieldset>)}
    </div>
  </div>;
}
