import { useState, type ReactNode } from "react";
import { Icon } from "../teacher/icons";
import { parisDay, type Slot } from "./model";

const dateFor = (day: string) => new Date(`${day}T12:00:00Z`);
const monthOf = (day: string) => day.slice(0, 7);
const time = (value: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

/** Date selection is a presentation of the existing available slots, never new availability. */
export default function BookingCalendar({ slots, slotId, onSelect, now, children }: {
  slots: Slot[]; slotId: string; onSelect: (id: string) => void; now: Date; children: ReactNode;
}) {
  const selected = slots.find(slot => slot.id === slotId);
  const firstDay = selected ? parisDay(new Date(selected.start)) : slots[0] ? parisDay(new Date(slots[0].start)) : parisDay(now);
  const [month, setMonth] = useState(() => monthOf(firstDay));
  const [chosenDay, setChosenDay] = useState(firstDay);
  const availableDays = new Set(slots.map(slot => parisDay(new Date(slot.start))));
  const first = dateFor(`${month}-01`);
  const offset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const lastMonth = monthOf(slots.at(-1) ? parisDay(new Date(slots.at(-1)!.start)) : firstDay);
  const firstMonth = monthOf(slots[0] ? parisDay(new Date(slots[0].start)) : firstDay);
  const shift = (delta: number) => {
    const next = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + delta, 1));
    const nextMonth = next.toISOString().slice(0, 7);
    setMonth(nextMonth);
    const nextDay = [...availableDays].find(day => monthOf(day) === nextMonth);
    if (nextDay) setChosenDay(nextDay);
    onSelect("");
  };
  const daySlots = slots.filter(slot => parisDay(new Date(slot.start)) === chosenDay);
  return <>
    <section className="lw-booking-calendar" aria-label="Choose a lesson date">
      <div className="lw-calendar-heading">
        <h2 aria-live="polite">{new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(first)}</h2>
        <div><button className="lw-icon-button" aria-label="Previous month" disabled={month <= firstMonth} onClick={() => shift(-1)}><Icon name="back" size={16} /></button><button className="lw-icon-button" aria-label="Next month" disabled={month >= lastMonth} onClick={() => shift(1)}><Icon name="arrow" size={16} /></button></div>
      </div>
      <div className="lw-calendar-weekdays" aria-hidden="true">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span key={day}>{day}</span>)}</div>
      <div className="lw-calendar-days">
        {Array.from({ length: offset }, (_, i) => <span key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = `${month}-${String(i + 1).padStart(2, "0")}`;
          return <button key={day} disabled={!availableDays.has(day)} aria-pressed={chosenDay === day} aria-current={day === parisDay(now) ? "date" : undefined} aria-label={new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(dateFor(day))} onClick={() => { setChosenDay(day); onSelect(""); }}>{i + 1}<span /></button>;
        })}
      </div>
      <p className="lw-calendar-note"><span />Dates with available lessons</p>
    </section>
    <section className="lw-booking-times" aria-label="Available times">
      <h2>{new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(dateFor(chosenDay))}</h2>
      <p className="lw-muted">Available times · 24-hour</p>
      <div className="lw-booking-time-list">{daySlots.length ? daySlots.map(slot => <button className="lw-slot" aria-pressed={slot.id === slotId} key={slot.id} onClick={() => onSelect(slot.id)}><strong>{time(slot.start)}</strong>{slot.id === slotId && <Icon name="check" size={16} />}</button>) : <p className="lw-muted">No times left on this date. Choose another available date.</p>}</div>
      {children}
    </section>
  </>;
}
