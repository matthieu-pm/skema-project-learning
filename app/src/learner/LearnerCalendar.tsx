import { useState } from "react";
import { Icon } from "../teacher/icons";
import { addDays, classifyLesson, lessonLanguageFor, parisDay, teachers, type Booking } from "./model";
import { preparationFor } from "./preparation";
import { Tag } from "./components";

export type CalendarView = "Day" | "Week" | "Month";
const views: CalendarView[] = ["Day", "Week", "Month"];
const noon = (day: string) => new Date(`${day}T12:00:00Z`);
const format = (day: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options }).format(noon(day));
const time = (value: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const weekStart = (day: string) => addDays(day, -((noon(day).getUTCDay() + 6) % 7));
const monthStart = (day: string) => `${day.slice(0, 7)}-01`;
function shiftMonth(day: string, delta: number) {
  const date = noon(monthStart(day));
  date.setUTCMonth(date.getUTCMonth() + delta);
  return date.toISOString().slice(0, 10);
}
const status = (booking: Booking, now: Date) => {
  const category = classifyLesson(booking, now);
  return category === "Past" ? { label: "Completed", tone: "done" as const, kind: "past" } : category === "Ongoing" ? { label: "Live now", tone: "live" as const, kind: "booked" } : { label: "Upcoming", tone: "upcoming" as const, kind: "booked" };
};

/** A read-only presentation of the same booking records shown in Lessons. */
export default function LearnerCalendar({ bookings, now, initialDay, initialView, onOpen }: {
  bookings: Booking[]; now: Date; initialDay?: string; initialView?: CalendarView; onOpen: (bookingId: string) => void;
}) {
  const today = parisDay(now);
  const [view, setView] = useState<CalendarView>(initialView || "Week");
  const [day, setDay] = useState(initialDay || today);
  const scheduled = bookings.filter(booking => booking.status === "confirmed").sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const on = (value: string) => scheduled.filter(booking => parisDay(new Date(booking.start)) === value);
  const step = (delta: number) => setDay(view === "Day" ? addDays(day, delta) : view === "Week" ? addDays(day, delta * 7) : shiftMonth(day, delta));
  const title = view === "Day" ? format(day, { weekday: "long", day: "numeric", month: "long" })
    : view === "Week" ? `${format(weekStart(day), { day: "numeric", month: "short" })} – ${format(addDays(weekStart(day), 6), { day: "numeric", month: "short", year: "numeric" })}`
    : format(day, { month: "long", year: "numeric" });
  const entry = (booking: Booking) => {
    const teacher = teachers.find(value => value.id === booking.teacherId);
    const state = status(booking, now);
    return <li key={booking.id}><button className={`lw-calendar-entry is-${state.kind}`} onClick={() => onOpen(booking.id)}>
      <span className="lw-calendar-entry-time"><strong>{time(booking.start)}</strong><span>{time(booking.end)}</span></span>
      <span className="lw-calendar-entry-info"><strong>{preparationFor(booking)?.course.title || `${lessonLanguageFor(booking)} conversation`}</strong><span>{teacher?.name} · {lessonLanguageFor(booking)} · {booking.format}</span></span>
      <Tag tone={state.tone}>{state.label}</Tag>
    </button></li>;
  };
  const dayList = (value: string, showEmpty = true) => {
    const items = on(value);
    if (!items.length && !showEmpty) return null;
    return <section key={value} className="lw-calendar-day" aria-label={format(value, { weekday: "long", day: "numeric", month: "long" })}>
      {view !== "Day" && <h3>{format(value, { weekday: "short", day: "numeric", month: "short" })}{value === today && <Tag>Today</Tag>}</h3>}
      {items.length ? <ul>{items.map(entry)}</ul> : <p className="lw-muted">No lessons.</p>}
    </section>;
  };
  const first = noon(monthStart(day)), offset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return <div className="lw-learner-calendar">
    <div className="lw-calendar-toolbar">
      <div className="lw-chips" role="group" aria-label="Calendar view">{views.map(value => <button key={value} aria-pressed={view === value} onClick={() => setView(value)}>{value}</button>)}</div>
      <div className="lw-calendar-nav">
        <button className="lw-icon-button" aria-label={`Previous ${view.toLowerCase()}`} onClick={() => step(-1)}><Icon name="back" size={16} /></button>
        <h2 aria-live="polite">{title}</h2>
        <button className="lw-icon-button" aria-label={`Next ${view.toLowerCase()}`} onClick={() => step(1)}><Icon name="arrow" size={16} /></button>
        <button className="lw-text-button" onClick={() => setDay(today)} disabled={day === today}>Today</button>
      </div>
    </div>
    {view === "Day" && dayList(day)}
    {view === "Week" && <div className="lw-calendar-week">{Array.from({ length: 7 }, (_, i) => dayList(addDays(weekStart(day), i)))}</div>}
    {view === "Month" && <>
      <div className="lw-calendar-weekdays" aria-hidden="true">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(value => <span key={value}>{value}</span>)}</div>
      <div className="lw-calendar-days lw-calendar-month">
        {Array.from({ length: offset }, (_, i) => <span key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const value = `${day.slice(0, 7)}-${String(i + 1).padStart(2, "0")}`, items = on(value), count = items.length;
          // Green: booked today or later. Brand purple: lessons already done.
          const kind = items.some(booking => status(booking, now).kind === "booked") ? "booked" : "past";
          return <button key={value} aria-pressed={value === day} aria-current={value === today ? "date" : undefined} aria-label={`${format(value, { weekday: "long", day: "numeric", month: "long" })}${count ? `, ${count} ${count === 1 ? "lesson" : "lessons"}` : ""}`} onClick={() => { setDay(value); requestAnimationFrame(() => document.getElementById("lw-calendar-selected")?.scrollIntoView({ block: "nearest", behavior: "smooth" })); }}>{i + 1}{count > 0 && <span className={`lw-day-dot is-${kind}`} />}</button>;
        })}
      </div>
      <p className="lw-calendar-legend"><span><span className="lw-day-dot is-booked" />Upcoming</span><span><span className="lw-day-dot is-past" />Completed</span></p>
      <div id="lw-calendar-selected">{dayList(day)}</div>
    </>}
  </div>;
}
