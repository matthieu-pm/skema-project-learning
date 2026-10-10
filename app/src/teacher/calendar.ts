import type { Session } from "./model";

export type CalendarView = "Day" | "Week" | "Month";
// The workspace uses a fixed sample date, consistent with its fictional bookings.
export const sampleToday = "2026-10-10";
const parse = (date: string) => new Date(`${date}T12:00:00`);
const key = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function shiftDate(date: string, days: number) {
  const next = parse(date);
  next.setDate(next.getDate() + days);
  return key(next);
}
export function moveCalendar(
  date: string,
  view: CalendarView,
  direction: number,
) {
  if (view !== "Month")
    return shiftDate(date, direction * (view === "Week" ? 7 : 1));
  const next = parse(date),
    day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + direction);
  const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, last));
  return key(next);
}
export function calendarDates(date: string, view: CalendarView) {
  if (view === "Day") return [date];
  const first = parse(date);
  if (view === "Month") first.setDate(1);
  first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  let count = 7;
  if (view === "Month") {
    const month = parse(date);
    month.setDate(1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0, 12);
    count =
      Math.ceil(
        (((month.getDay() + 6) % 7) + last.getDate() - month.getDate() + 1) / 7,
      ) * 7;
  }
  return Array.from({ length: count }, (_, i) => shiftDate(key(first), i));
}
export function calendarTitle(date: string, view: CalendarView) {
  const format = (value: string, options: Intl.DateTimeFormatOptions) =>
    parse(value).toLocaleDateString("en-GB", options);
  if (view === "Month") return format(date, { month: "long", year: "numeric" });
  if (view === "Day")
    return format(date, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const days = calendarDates(date, view);
  return `${format(days[0], { day: "numeric", month: "short" })} – ${format(days[6], { day: "numeric", month: "short", year: "numeric" })}`;
}
export const timeMinutes = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3));

export function sessionColumns(sessions: Session[]) {
  const result: { session: Session; column: number; columns: number }[] = [];
  let group: typeof result = [],
    ends: number[] = [];
  const flush = () => {
    for (const entry of group) entry.columns = ends.length;
    result.push(...group);
    group = [];
    ends = [];
  };
  for (const session of [...sessions].sort(
    (a, b) => timeMinutes(a.time) - timeMinutes(b.time),
  )) {
    const start = timeMinutes(session.time);
    if (ends.length && ends.every((end) => end <= start)) flush();
    let column = ends.findIndex((end) => end <= start);
    if (column === -1) column = ends.length;
    ends[column] = start + session.duration;
    group.push({ session, column, columns: 1 });
  }
  flush();
  return result;
}
