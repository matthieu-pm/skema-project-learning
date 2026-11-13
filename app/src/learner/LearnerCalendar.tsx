import { useState, type CSSProperties } from "react";
import { Icon } from "../teacher/icons";
import { calendarDates, calendarTitle, moveCalendar, sessionColumns, timeMinutes, type CalendarView } from "../teacher/calendar";
import type { Session } from "../teacher/model";
import { classifyLesson, lessonLanguageFor, parisDay, teachers, type Booking } from "./model";
import { preparationFor } from "./preparation";
import "../teacher/calendar.css";
import "./learner-calendar.css";

export type { CalendarView };
const time = (value: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value));
const dayLabel = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
type Event = { booking: Booking; date: string; time: string; duration: number; tone: "confirmed" | "completed"; name: string; initials: string; title: string };

/**
 * The student's lessons in the same calendar component the teacher workspace uses
 * (same markup, styles, Day/Week/Month controls and event colours), filled from the
 * learner's own booking records.
 */
export default function LearnerCalendar({ bookings, now, initialDay, initialView, onOpen }: {
  bookings: Booking[]; now: Date; initialDay?: string; initialView?: CalendarView; onOpen: (bookingId: string) => void;
}) {
  const today = parisDay(now);
  const [view, setView] = useState<CalendarView>(initialView || "Week");
  const [date, setDate] = useState(initialDay || today);
  const dates = calendarDates(date, view);
  const events: Event[] = bookings.filter(booking => booking.status === "confirmed").map(booking => {
    const name = teachers.find(value => value.id === booking.teacherId)?.name || "Teacher";
    return {
      booking, date: parisDay(new Date(booking.start)), time: time(booking.start), duration: booking.duration,
      tone: classifyLesson(booking, now) === "Past" ? "completed" : "confirmed",
      name, initials: name.split(" ").map(part => part[0]).slice(0, 2).join(""),
      title: preparationFor(booking)?.course.title || `${lessonLanguageFor(booking)} conversation`,
    };
  });
  const visible = events.filter(event => dates.includes(event.date)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const start = Math.min(8, ...visible.map(event => Math.floor(timeMinutes(event.time) / 60)));
  const end = Math.max(20, ...visible.map(event => Math.ceil((timeMinutes(event.time) + event.duration) / 60)));
  const hours = Array.from({ length: end - start }, (_, i) => start + i);
  const label = (event: Event) => `${event.title} with ${event.name}, ${dayLabel(event.date)}, ${event.time}, ${event.duration} minutes, ${event.tone === "completed" ? "Completed" : "Upcoming"}`;
  const openDay = (day: string) => { setDate(day); setView("Day"); };
  return (
    <section className={`teacher-workspace lw-shared-calendar tw-full-calendar tw-calendar-${view.toLowerCase()}`} aria-label={`${view} calendar`}>
      <div className="tw-cal-controls">
        <div className="tw-cal-navigation">
          <button className="tw-cal-today" onClick={() => setDate(today)}>Today</button>
          <button className="lw-icon-button" aria-label={`Previous ${view.toLowerCase()}`} onClick={() => setDate(moveCalendar(date, view, -1))}><Icon name="back" size={18} /></button>
          <button className="lw-icon-button" aria-label={`Next ${view.toLowerCase()}`} onClick={() => setDate(moveCalendar(date, view, 1))}><Icon name="arrow" size={18} /></button>
          <h2 aria-live="polite">{calendarTitle(date, view)}</h2>
        </div>
        <div className="tw-cal-views" role="group" aria-label="Calendar view">
          {(["Day", "Week", "Month"] as CalendarView[]).map(item => <button key={item} aria-pressed={view === item} onClick={() => setView(item)}>{item}</button>)}
        </div>
      </div>
      {view === "Month" ? (
        <>
          <div className="tw-cal-month-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span key={day}>{day}</span>)}</div>
          <div className="tw-cal-month-grid">
            {dates.map(day => (
              <div key={day} className={`tw-cal-month-cell ${day.slice(0, 7) !== date.slice(0, 7) ? "outside" : ""} ${day === today ? "today" : ""}`}>
                <button className="tw-cal-date" aria-label={`Open ${dayLabel(day)}`} onClick={() => openDay(day)}>{Number(day.slice(-2))}</button>
                <div className="tw-cal-month-events">
                  {visible.filter(event => event.date === day).map(event => (
                    <button key={event.booking.id} className={`tw-cal-month-event ${event.tone}`} aria-label={label(event)} onClick={() => onOpen(event.booking.id)}>
                      <span>{event.time}</span><strong>{event.name.split(" ")[0]}</strong><span className="tw-cal-month-initials">{event.initials}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="tw-cal-time-heading" style={{ "--cal-columns": dates.length } as CSSProperties}>
            <span className="tw-cal-time-zone">Paris</span>
            {dates.map(day => (
              <button key={day} className={day === today ? "today" : ""} aria-label={`Open ${dayLabel(day)}`} onClick={() => openDay(day)}>
                <span>{new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short" })}</span><strong>{Number(day.slice(-2))}</strong>
              </button>
            ))}
          </div>
          <div className="tw-cal-time-grid" style={{ "--cal-columns": dates.length, "--cal-hours": hours.length } as CSSProperties}>
            <div className="tw-cal-time-labels">{hours.map(hour => <div key={hour}><span>{String(hour).padStart(2, "0")}:00</span></div>)}</div>
            {dates.map(day => (
              <div key={day} className={`tw-cal-day-column ${day === today ? "today" : ""}`} aria-label={dayLabel(day)}>
                {hours.map(hour => <div className="tw-cal-hour-line" key={hour} />)}
                {sessionColumns(visible.filter(event => event.date === day).map(event => ({ ...event, id: event.booking.id }) as unknown as Session)).map(({ session, column, columns }) => {
                  const event = session as unknown as Event;
                  return (
                    <button key={event.booking.id} className={`tw-cal-timed-event ${event.tone}`} aria-label={label(event)} onClick={() => onOpen(event.booking.id)}
                      style={{ left: `calc(${(column / columns) * 100}% + 2px)`, width: `calc(${100 / columns}% - 4px)`, top: `${((timeMinutes(event.time) - start * 60) / 60) * 72}px`, height: `${Math.max((event.duration / 60) * 72, 32)}px` }}>
                      <strong className="tw-cal-event-name">{event.name.split(" ")[0]}</strong>
                      <strong className="tw-cal-event-initials">{event.initials}</strong>
                      <span className="tw-cal-event-time">{event.time}<span className="tw-cal-event-duration"> · {event.duration} min</span></span>
                      {view === "Day" && <span className="tw-cal-event-detail">{event.title} · {event.booking.format}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
      <div className="tw-cal-footer">
        <div className="tw-cal-legend"><span className="confirmed">Upcoming</span><span className="completed">Completed</span></div>
        <span>{visible.length} {visible.length === 1 ? "lesson" : "lessons"}</span>
      </div>
    </section>
  );
}
