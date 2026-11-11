export const weekdays = [
  { id: "Mon", label: "Monday" },
  { id: "Tue", label: "Tuesday" },
  { id: "Wed", label: "Wednesday" },
  { id: "Thu", label: "Thursday" },
  { id: "Fri", label: "Friday" },
  { id: "Sat", label: "Saturday" },
  { id: "Sun", label: "Sunday" },
] as const;
export type Weekday = (typeof weekdays)[number]["id"];
export type TimeRange = { id: string; start: string; end: string };
export type DayHours = { enabled: boolean; ranges: TimeRange[] };
export type Availability = { zone: string; week: Record<Weekday, DayHours> };

export function initialAvailability(): Availability {
  return {
    zone: "Europe/Paris",
    week: Object.fromEntries(
      weekdays.map(({ id }) => [
        id,
        {
          enabled: ["Mon", "Tue", "Thu", "Fri"].includes(id),
          ranges: [{ id: `hours-${id}`, start: "09:00", end: "17:00" }],
        },
      ]),
    ) as Availability["week"],
  };
}
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export function dayHoursError(day: DayHours): string | undefined {
  if (!day.enabled) return;
  if (!day.ranges.length) return "Add a time range or turn this day off.";
  const ranges = [...day.ranges].sort((a, b) => a.start.localeCompare(b.start));
  for (let index = 0; index < ranges.length; index++) {
    const range = ranges[index];
    if (!timePattern.test(range.start) || !timePattern.test(range.end))
      return "Enter a start and end time for every range.";
    if (range.start >= range.end) return "End time must be after start time.";
    if (index && ranges[index - 1].end > range.start)
      return "Time ranges must not overlap.";
  }
}
export function availabilityErrors(
  availability: Availability,
): Partial<Record<Weekday | "week" | "zone", string>> {
  const errors: ReturnType<typeof availabilityErrors> = {};
  if (availability.zone !== "Europe/Paris")
    errors.zone =
      "This preview supports Europe/Paris. Switch back before saving; no time-zone conversion service is connected.";
  if (!weekdays.some(({ id }) => availability.week[id].enabled))
    errors.week = "Choose at least one teaching day.";
  for (const { id } of weekdays) {
    const error = dayHoursError(availability.week[id]);
    if (error) errors[id] = error;
  }
  return errors;
}
export function nextTimeRange(
  ranges: TimeRange[],
  id: string,
): TimeRange | undefined {
  const lastEnd =
    ranges
      .map((range) => range.end)
      .sort()
      .at(-1) || "09:00";
  if (!timePattern.test(lastEnd) || lastEnd >= "23:59") return;
  const [hours, minutes] = lastEnd.split(":").map(Number);
  const endMinutes = Math.min(hours * 60 + minutes + 60, 23 * 60 + 59);
  return {
    id,
    start: lastEnd,
    end: `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`,
  };
}
export function copyDayHours(
  availability: Availability,
  source: Weekday,
  targets: Weekday[],
  makeId: () => string,
): Availability {
  const next = structuredClone(availability);
  for (const target of new Set(targets)) {
    if (target === source) continue;
    next.week[target] = {
      enabled: true,
      ranges: availability.week[source].ranges.map((range) => ({
        ...range,
        id: makeId(),
      })),
    };
  }
  return next;
}
