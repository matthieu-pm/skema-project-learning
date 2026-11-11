import type { SelectHTMLAttributes } from "react";
import { Icon } from "./teacher/icons";
import "./select-control.css";

/** Keep native selection behavior with a consistently positioned indicator. */
export default function SelectControl(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="app-select-control">
      <select {...props} />
      <Icon name="down" size={16} className="app-select-chevron" />
    </span>
  );
}
