import { type PointerEvent as ReactPointerEvent } from "react";
import { Icon } from "./icons";

/** Move one item in a list, keeping every attached field (media, answers) with it. */
export function reorder<T>(list: T[], from: number, to: number): T[] {
  if (from === to || to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Drag handle plus keyboard-friendly Earlier / Later buttons for one repeated item
 * (vocabulary card, sentence part, pair, clip). The parent marks each item with
 * data-seq-list / data-seq-index so a drop can work out its target in any
 * direction, including grid layouts.
 */
export function SequenceControls({ list, index, count, label, onMove }: {
  list: string; index: number; count: number; label: string; onMove: (to: number) => void;
}) {
  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const origin = event.currentTarget.closest<HTMLElement>("[data-seq-index]");
    origin?.classList.add("ce-seq-dragging");
    const up = (e: PointerEvent) => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      origin?.classList.remove("ce-seq-dragging");
      const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>(`[data-seq-list="${list}"]`);
      const to = Number(target?.dataset.seqIndex);
      if (target && Number.isInteger(to) && to !== index) onMove(to);
    };
    const cancel = () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      origin?.classList.remove("ce-seq-dragging");
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  };
  return (
    <div className="ce-seq-controls" role="group" aria-label={`Reorder ${label}`}>
      <button type="button" className="ce-seq-grip" data-scroll-drag="ignore" aria-label={`Drag ${label}`} title="Drag to reorder" onPointerDown={startDrag}>
        <Icon name="grip" size={14} />
      </button>
      <button type="button" className="ce-seq-move" aria-label={`Move ${label} earlier`} disabled={index === 0} onClick={() => onMove(index - 1)}>
        <Icon name="up" size={14} />
      </button>
      <button type="button" className="ce-seq-move" aria-label={`Move ${label} later`} disabled={index === count - 1} onClick={() => onMove(index + 1)}>
        <Icon name="down" size={14} />
      </button>
    </div>
  );
}
