import type { ReactNode } from "react";
import { KeyboardInput, KeyboardTextarea, useKeyboard } from "../mobile";
import { students, type Route } from "./model";
import { useWorkspace } from "./context";
export { useWorkspace } from "./context";
export type Navigate = (r: Route, replace?: boolean) => void;
import { Icon } from "./icons";
export { Icon } from "./icons";
export function TextField({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
  placeholder,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
}) {
  const { mobile } = useWorkspace();
  const keyboard = useKeyboard();
  const props = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    placeholder,
    "aria-label": label,
    onBlur: () => {
      if (mobile) keyboard.hide();
    },
  };
  return (
    <label className="tw-field">
      <span>{label}</span>
      {multiline ? (
        mobile ? (
          <KeyboardTextarea {...props} rows={4} />
        ) : (
          <textarea {...props} rows={4} />
        )
      ) : mobile ? (
        <KeyboardInput {...props} type={type} min={min} max={max} />
      ) : (
        <input {...props} type={type} min={min} max={max} />
      )}
    </label>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
}) {
  return (
    <label className="tw-field">
      <span>{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
export function Button({
  children,
  onClick,
  kind = "primary",
  disabled = false,
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  kind?: "primary" | "secondary" | "quiet" | "danger";
  disabled?: boolean;
  icon?: string;
}) {
  return (
    <button
      className={`tw-button tw-${kind}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </button>
  );
}
export function Badge({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`tw-badge ${tone}`}>{children}</span>;
}
export function Avatar({ id, size = "" }: { id: string; size?: string }) {
  const s = students.find((s) => s.id === id)!;
  return (
    <span className={`tw-avatar ${s.color} ${size}`} aria-hidden="true">
      {s.initials}
    </span>
  );
}
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`tw-panel ${className}`}>{children}</section>;
}
export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="tw-page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function StudentLine({
  id,
  children,
}: {
  id: string;
  children?: ReactNode;
}) {
  const s = students.find((s) => s.id === id)!;
  return (
    <div className="tw-person-line">
      <Avatar id={id} />
      <div>
        <strong>{s.name}</strong>
        <span>
          {s.language} · {s.level}
        </span>
      </div>
      {children}
    </div>
  );
}
