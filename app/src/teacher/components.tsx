import { useId, type ReactNode } from "react";
import SelectControl from "../SelectControl";
import ProfilePortrait from "../ProfilePortrait";
import { KeyboardInput, KeyboardTextarea, useKeyboard } from "../mobile";
import { students, type Route } from "./model";
import { useWorkspace } from "./context";
export { useWorkspace } from "./context";
export type Navigate = (r: Route, replace?: boolean) => void;
import { Icon } from "./icons";
import { Button as SharedButton } from "./ui/button";
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
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  error?: string;
}) {
  const errorId = useId();
  const { mobile } = useWorkspace();
  const keyboard = useKeyboard();
  const props = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    placeholder,
    "aria-label": label,
    "aria-invalid": !!error,
    "aria-describedby": error ? errorId : undefined,
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
      {error && <span id={errorId} className="tw-error" role="alert">{error}</span>}
    </label>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
  disabled?: boolean;
}) {
  const { mobile } = useWorkspace();
  return (
    <label className="tw-field">
      <span>{label}</span>
      <SelectControl
        aria-label={label}
        value={value}
        onChange={onChange}
        options={options}
        native={mobile}
        disabled={disabled}
      />
    </label>
  );
}
export function Button({
  children,
  onClick,
  kind = "primary",
  disabled = false,
  icon,
  static: isStatic = false,
}: {
  children: ReactNode;
  onClick: () => void;
  kind?: "primary" | "secondary" | "quiet" | "danger";
  disabled?: boolean;
  icon?: string;
  static?: boolean;
}) {
  return (
    <SharedButton
      className={`tw-button tw-${kind}`}
      variant={kind === "secondary" ? "outline" : kind === "quiet" ? "ghost" : kind === "danger" ? "destructive" : "default"}
      static={isStatic}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={18} strokeWidth={2} />}
      <span>{children}</span>
    </SharedButton>
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
      <ProfilePortrait id={`student-${s.id}`} initials={s.initials} />
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
