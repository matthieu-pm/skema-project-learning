import { createContext, useContext, useId, type ReactNode } from "react";
import { KeyboardInput, KeyboardTextarea, useKeyboard } from "../mobile";
import { Icon } from "../teacher/icons";
import { ratingSummary, type Teacher } from "./model";

export const LearnerPresentation = createContext(false);
export function Button({ children, onClick, secondary = false, danger = false, disabled = false, icon }: {
  children: ReactNode; onClick: () => void; secondary?: boolean; danger?: boolean; disabled?: boolean; icon?: string;
}) {
  return <button className={`lw-button ${secondary ? "lw-secondary" : "lw-primary"} ${danger ? "lw-danger" : ""}`} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} size={18} />}<span>{children}</span></button>;
}
export function Field({ label, value, onChange, multiline = false, placeholder, maxLength }: {
  label: string; value: string; onChange: (value: string) => void; multiline?: boolean; placeholder?: string; maxLength?: number;
}) {
  const mobile = useContext(LearnerPresentation), keyboard = useKeyboard(), id = useId();
  const props = { id, value, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value), placeholder, maxLength, onBlur: () => { if (mobile) keyboard.hide(); } };
  return <label className="lw-field" htmlFor={id}><span>{label}</span>{multiline ? mobile ? <KeyboardTextarea {...props} rows={4} /> : <textarea {...props} rows={4} /> : mobile ? <KeyboardInput {...props} /> : <input {...props} />}</label>;
}
export function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const id = useId();
  return <label className="lw-field" htmlFor={id}><span>{label}</span><select id={id} aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></label>;
}
export function Rating({ teacher, onClick }: { teacher: Teacher; onClick: () => void }) {
  const { average, count } = ratingSummary(teacher);
  return <button className="lw-rating" onClick={onClick} aria-label={count ? `${teacher.name}: ${average?.toFixed(1)} out of 5, ${count} reviews. Read reviews` : `${teacher.name}: No reviews yet. Read reviews`}><span aria-hidden="true">★</span>{count ? <><strong>{average?.toFixed(1)}</strong> <span>({count} reviews)</span></> : <span>New · No reviews yet</span>}</button>;
}
export function Avatar({ teacher, large = false }: { teacher: Teacher; large?: boolean }) {
  return <span className={`lw-avatar ${large ? "large" : ""}`} style={{ backgroundColor: teacher.color }} aria-hidden="true">{teacher.name.split(" ").map(part => part[0]).slice(0, 2).join("")}</span>;
}
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`lw-panel ${className}`}>{children}</section>;
}
export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className="lw-empty"><Icon name="calendar" size={30} /><h2>{title}</h2>{children && <p>{children}</p>}{action}</div>;
}
export function ErrorMessage({ children }: { children: ReactNode }) {
  return <p className="lw-error" role="alert">{children}</p>;
}
