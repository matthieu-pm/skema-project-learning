import { useState, type CSSProperties } from "react";
import {
  Button,
  Icon,
  PageHeading,
  useWorkspace,
  type Navigate,
} from "./components";
import { students, dateLabel, type Session } from "./model";
import {
  calendarDates,
  calendarTitle,
  moveCalendar,
  sampleToday,
  timeMinutes,
  sessionColumns,
  type CalendarView,
} from "./calendar";
import "./calendar.css";

const person = (s: Session) =>
  students.find((student) => student.id === s.studentId)!;
const tone = (s: Session) =>
  s.status === "Requested"
    ? "requested"
    : s.status === "Completed"
      ? "completed"
      : ["Cancelled", "Issue recorded"].includes(s.status)
        ? "inactive"
        : "confirmed";

export function CalendarPage({ navigate }: { navigate: Navigate }) {
  const { sessions, mobile } = useWorkspace();
  const [view, setView] = useState<CalendarView>(mobile ? "Month" : "Week");
  const [date, setDate] = useState(sampleToday);
  const [filter, setFilter] = useState("All sessions");
  const dates = calendarDates(date, view);
  const visible = sessions
    .filter(
      (s) =>
        dates.includes(s.date) &&
        (filter === "All sessions" ||
          (filter === "Requests"
            ? s.status === "Requested"
            : filter === "Completed"
              ? s.status === "Completed"
              : s.status === "Confirmed")),
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const start = Math.min(
    8,
    ...visible.map((s) => Math.floor(timeMinutes(s.time) / 60)),
  );
  const end = Math.max(
    20,
    ...visible.map((s) => Math.ceil((timeMinutes(s.time) + s.duration) / 60)),
  );
  const hours = Array.from({ length: end - start }, (_, i) => start + i);
  const openDay = (next: string) => {
    setDate(next);
    setView("Day");
  };
  const openSession = (s: Session) => navigate({ page: "session", id: s.id });
  const eventName = (s: Session) =>
    `${person(s).name}, ${dateLabel(s.date)}, ${s.time}, ${s.duration} minutes, ${s.status}`;

  return (
    <>
      <PageHeading
        title="Your teaching calendar"
        description="Make room for every one-to-one lesson."
        action={
          <Button
            kind="secondary"
            icon="settings"
            onClick={() => navigate({ page: "availability" })}
          >
            Set availability
          </Button>
        }
      />
      <section
        className={`tw-full-calendar tw-calendar-${view.toLowerCase()}`}
        aria-label={`${view} calendar`}
      >
        <div className="tw-cal-controls">
          <div className="tw-cal-navigation">
            <button
              className="tw-cal-today"
              onClick={() => setDate(sampleToday)}
            >
              Today
            </button>
            <button
              className="tw-icon-button"
              aria-label={`Previous ${view.toLowerCase()}`}
              onClick={() => setDate(moveCalendar(date, view, -1))}
            >
              <Icon name="back" size={18} />
            </button>
            <button
              className="tw-icon-button"
              aria-label={`Next ${view.toLowerCase()}`}
              onClick={() => setDate(moveCalendar(date, view, 1))}
            >
              <Icon name="arrow" size={18} />
            </button>
            <h2 aria-live="polite">{calendarTitle(date, view)}</h2>
          </div>
          <div className="tw-cal-views" role="group" aria-label="Calendar view">
            {(["Day", "Week", "Month"] as CalendarView[]).map((item) => (
              <button
                key={item}
                aria-pressed={view === item}
                onClick={() => setView(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="tw-cal-meta">
          <span>
            <Icon name="clock" size={15} />
            Europe/Paris
          </span>
          <label>
            <span className="tw-cal-filter-label">Show</span>
            <select
              aria-label="Filter calendar sessions"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {["All sessions", "Confirmed", "Requests", "Completed"].map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </label>
        </div>
        {view === "Month" ? (
          <>
            <div className="tw-cal-month-weekdays">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="tw-cal-month-grid">
              {dates.map((day) => {
                const events = visible.filter((s) => s.date === day);
                return (
                  <div
                    key={day}
                    className={`tw-cal-month-cell ${day.slice(0, 7) !== date.slice(0, 7) ? "outside" : ""} ${day === sampleToday ? "today" : ""}`}
                  >
                    <button
                      className="tw-cal-date"
                      aria-label={`Open ${dateLabel(day)}`}
                      onClick={() => openDay(day)}
                    >
                      {Number(day.slice(-2))}
                    </button>
                    <div className="tw-cal-month-events">
                      {events.map((s) => (
                        <button
                          key={s.id}
                          className={`tw-cal-month-event ${tone(s)}`}
                          aria-label={eventName(s)}
                          onClick={() => openSession(s)}
                        >
                          <span>{s.time}</span>
                          <strong>{person(s).name.split(" ")[0]}</strong>
                          <span className="tw-cal-month-initials">
                            {person(s).initials}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div
              className="tw-cal-time-heading"
              style={{ "--cal-columns": dates.length } as CSSProperties}
            >
              <span className="tw-cal-time-zone">
                {
                  new Intl.DateTimeFormat("en-GB", {
                    timeZone: "Europe/Paris",
                    timeZoneName: "shortOffset",
                  })
                    .formatToParts(new Date(`${date}T12:00:00`))
                    .find((part) => part.type === "timeZoneName")?.value
                }
              </span>
              {dates.map((day) => (
                <button
                  key={day}
                  className={day === sampleToday ? "today" : ""}
                  aria-label={`Open ${dateLabel(day)}`}
                  onClick={() => openDay(day)}
                >
                  <span>
                    {new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
                      weekday: "short",
                    })}
                  </span>
                  <strong>{Number(day.slice(-2))}</strong>
                </button>
              ))}
            </div>
            <div
              className="tw-cal-time-grid"
              style={
                {
                  "--cal-columns": dates.length,
                  "--cal-hours": hours.length,
                } as CSSProperties
              }
            >
              <div className="tw-cal-time-labels">
                {hours.map((hour) => (
                  <div key={hour}>
                    <span>{String(hour).padStart(2, "0")}:00</span>
                  </div>
                ))}
              </div>
              {dates.map((day) => (
                <div
                  key={day}
                  className={`tw-cal-day-column ${day === sampleToday ? "today" : ""}`}
                  aria-label={dateLabel(day)}
                >
                  {hours.map((hour) => (
                    <div className="tw-cal-hour-line" key={hour} />
                  ))}
                  {sessionColumns(visible.filter((s) => s.date === day)).map(
                    ({ session: s, column, columns }) => (
                      <button
                        key={s.id}
                        className={`tw-cal-timed-event ${tone(s)}`}
                        aria-label={eventName(s)}
                        style={{
                          left: `calc(${(column / columns) * 100}% + 2px)`,
                          width: `calc(${100 / columns}% - 4px)`,
                          top: `${((timeMinutes(s.time) - start * 60) / 60) * 72}px`,
                          height: `${Math.max((s.duration / 60) * 72, 32)}px`,
                        }}
                        onClick={() => openSession(s)}
                      >
                        <strong className="tw-cal-event-name">
                          {person(s).name.split(" ")[0]}
                        </strong>
                        <strong className="tw-cal-event-initials">
                          {person(s).initials}
                        </strong>
                        <span className="tw-cal-event-time">
                          {s.time}
                          <span className="tw-cal-event-duration">
                            {" "}
                            · {s.duration} min
                          </span>
                        </span>
                        {view === "Day" && (
                          <span className="tw-cal-event-detail">
                            {s.format} · {s.status}
                            {s.pending ? " · Time change pending" : ""}
                          </span>
                        )}
                      </button>
                    ),
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        <div className="tw-cal-footer">
          <div className="tw-cal-legend">
            <span className="confirmed">Confirmed</span>
            <span className="requested">Requested</span>
            <span className="completed">Completed</span>
          </div>
          <span>
            {visible.length} {visible.length === 1 ? "session" : "sessions"}
          </span>
        </div>
      </section>
      <p className="tw-preview-caption">
        Sample calendar · “Today” is 10 October 2026 · No calendar integration
      </p>
    </>
  );
}
