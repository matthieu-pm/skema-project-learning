import { createPortal } from "react-dom";
import { Icon } from "./teacher/icons";

/**
 * Review switch between the phone and desktop presentations. It keeps every other
 * URL parameter (teacher/learner, flow, lesson…) so you stay in the same area.
 * Phone view: floats above the device frame. Desktop view: sits inside the top bar.
 */
export default function ViewSwitch({ web, inline = false }: { web: boolean; inline?: boolean }) {
  const go = (view: "mobile" | "web") => {
    if ((view === "web") === web) return;
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    window.location.assign(url.toString());
  };
  const control = (
    <div className={`view-switch ${inline ? "view-switch-inline" : ""}`} role="group" aria-label="Choose presentation">
      <button type="button" aria-pressed={!web} onClick={() => go("mobile")}><Icon name="phone" size={15} /><span>Mobile</span></button>
      <button type="button" aria-pressed={web} onClick={() => go("web")}><Icon name="laptop" size={15} /><span>Web</span></button>
    </div>
  );
  return inline ? control : createPortal(control, document.body);
}
