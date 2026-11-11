import { useLayoutEffect, useRef, type ComponentProps } from "react";
import { TextField } from "./components";

/** A real, keyboard-aware field that keeps the typography of the lesson canvas. */
export function InlineField({
  className = "",
  ...props
}: ComponentProps<typeof TextField> & { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const textarea = root.current?.querySelector("textarea");
    if (!textarea) return;
    const fit = () => {
      // Hidden phone panels have no measurable width; refit when visible again.
      if (!textarea.clientWidth) return;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight + 2}px`;
    };
    fit();
    let lastWidth = 0;
    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      // Only width changes affect wrapping. Ignore the height changes from fit().
      if (entry.contentRect.width === lastWidth) return;
      lastWidth = entry.contentRect.width;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    observer.observe(root.current!);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [props.value]);
  return (
    <div ref={root} className={`ce-inline-field ${className}`}>
      <TextField {...props} rows={1} />
    </div>
  );
}
