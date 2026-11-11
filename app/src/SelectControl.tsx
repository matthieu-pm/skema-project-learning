import { useSyncExternalStore, type AriaAttributes } from "react";
import { Select } from "radix-ui";
import { Icon } from "./teacher/icons";
import "./select-control.css";

type Choice = string | { value: string; label: string; disabled?: boolean };
type SelectControlProps = AriaAttributes & {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Choice[];
  native?: boolean;
  disabled?: boolean;
};

const forcedColorsQuery = "(forced-colors: active)";
function subscribeToForcedColors(onChange: () => void) {
  const query = window.matchMedia(forcedColorsQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const hasForcedColors = () => window.matchMedia(forcedColorsQuery).matches;
const noForcedColors = () => false;

/** Styled desktop choices; retain platform pickers inside phones and in high contrast. */
export default function SelectControl({
  value, onChange, options, native = false, disabled, id, ...aria
}: SelectControlProps) {
  const forcedColors = useSyncExternalStore(subscribeToForcedColors, hasForcedColors, noForcedColors);
  const choices = options.map(option => typeof option === "string" ? { value: option, label: option } : option);

  if (native || forcedColors) {
    return (
      <span className="app-select-control">
        <select id={id} value={value} onChange={event => onChange(event.target.value)} disabled={disabled} {...aria}>
          {choices.map(choice => <option key={choice.value} value={choice.value} disabled={choice.disabled}>{choice.label}</option>)}
        </select>
        <Icon name="down" size={16} className="app-select-chevron" />
      </span>
    );
  }

  // Radix reserves an empty value for placeholders. Encoding keeps “Not set” selectable.
  const encode = (choice: string) => `choice:${choice}`;
  return (
    <span className="app-select-control">
      <Select.Root value={encode(value)} onValueChange={next => onChange(next.slice(7))} disabled={disabled}>
        <Select.Trigger id={id} className="app-select-trigger" {...aria}>
          <Select.Value />
          <Select.Icon asChild><Icon name="down" size={16} className="app-select-chevron" /></Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="app-select-menu" position="popper" sideOffset={6} collisionPadding={12} align="start">
            <Select.ScrollUpButton className="app-select-scroll"><Icon name="down" size={16} /></Select.ScrollUpButton>
            <Select.Viewport className="app-select-viewport">
              {choices.map(choice => (
                <Select.Item key={choice.value} value={encode(choice.value)} disabled={choice.disabled} textValue={choice.label} className="app-select-option">
                  <Select.ItemText>{choice.label}</Select.ItemText>
                  <Select.ItemIndicator className="app-select-indicator"><Icon name="check" size={16} /></Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="app-select-scroll"><Icon name="down" size={16} /></Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </span>
  );
}
