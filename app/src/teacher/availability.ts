export const availabilityWeekdays = [
  ["Mon", "Monday"],
  ["Tue", "Tuesday"],
  ["Wed", "Wednesday"],
  ["Thu", "Thursday"],
  ["Fri", "Friday"],
  ["Sat", "Saturday"],
  ["Sun", "Sunday"],
] as const;

export type AvailabilityWeekday = typeof availabilityWeekdays[number][0];
export type WorkingTimeSlot = { id: string; start: string; end: string };
export type WorkingDay = { enabled: boolean; slots: WorkingTimeSlot[] };
export type WeeklyHours = Record<AvailabilityWeekday, WorkingDay>;
export type Availability = { days: WeeklyHours; zone: string };
export type WeeklyHoursValidation = {
  scheduleError?: string;
  dayErrors: Partial<Record<AvailabilityWeekday, string>>;
};

export function createWorkingTimeSlot(start = "", end = ""): WorkingTimeSlot {
  return { id: crypto.randomUUID(), start, end };
}

export function createAvailability(): Availability {
  return {
    days: Object.fromEntries(availabilityWeekdays.map(([day]) => [day, {
      enabled: ["Mon", "Tue", "Thu", "Fri"].includes(day),
      slots: [createWorkingTimeSlot("09:00", "17:00")],
    }])) as WeeklyHours,
    zone: "Europe/Paris",
  };
}

export function updateWorkingDay(availability: Availability, day: AvailabilityWeekday, patch: Partial<WorkingDay>): Availability {
  return {
    ...availability,
    days: { ...availability.days, [day]: { ...availability.days[day], ...patch } },
  };
}

export function updateWorkingTimeSlot(availability: Availability, day: AvailabilityWeekday, slotId: string, patch: Partial<Pick<WorkingTimeSlot, "start" | "end">>): Availability {
  return updateWorkingDay(availability, day, {
    slots: availability.days[day].slots.map((slot) => slot.id === slotId ? { ...slot, ...patch } : slot),
  });
}

export function removeWorkingTimeSlot(availability: Availability, day: AvailabilityWeekday, slotId: string): Availability {
  const slots = availability.days[day].slots;
  if (slots.length <= 1 || !slots.some((slot) => slot.id === slotId)) return availability;
  return updateWorkingDay(availability, day, { slots: slots.filter((slot) => slot.id !== slotId) });
}

export function workingDayError(day: AvailabilityWeekday, hours: WorkingDay): string | undefined {
  const label = availabilityWeekdays.find(([key]) => key === day)![1];
  if (!hours.slots.length) return `Add at least one time slot for ${label}, or turn the day off.`;
  for (const [index, slot] of hours.slots.entries()) {
    const name = `${label} slot ${index + 1}`;
    if (!slot.start || !slot.end) return `Choose a start time and an end time for ${name}.`;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.end)) return `Enter valid times for ${name}.`;
    if (slot.start >= slot.end) return `${name}: the end time must be after the start time.`;
  }
  // Compare a sorted view without reordering the teacher's controls or their IDs.
  const ordered = hours.slots.map((slot, index) => ({ ...slot, index })).sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < ordered.length; i++) {
    if (ordered[i].start < ordered[i - 1].end) return `${label} slots ${ordered[i - 1].index + 1} and ${ordered[i].index + 1} overlap. Adjust their hours.`;
  }
  return undefined;
}

export function copyWorkingHours(availability: Availability, source: AvailabilityWeekday, targets: AvailabilityWeekday[]): Availability {
  const hours = availability.days[source];
  const destinations = [...new Set(targets)].filter((day) => day !== source);
  if (!hours.enabled || workingDayError(source, hours) || !destinations.length) return availability;
  const days = { ...availability.days };
  for (const day of destinations) {
    days[day] = { enabled: true, slots: hours.slots.map(({ start, end }) => createWorkingTimeSlot(start, end)) };
  }
  return { ...availability, days };
}

export function validateWeeklyHours(days: WeeklyHours): WeeklyHoursValidation {
  const dayErrors: WeeklyHoursValidation["dayErrors"] = {};
  let enabled = false;
  for (const [day] of availabilityWeekdays) {
    const hours = days[day];
    if (!hours.enabled) continue;
    enabled = true;
    const error = workingDayError(day, hours);
    if (error) dayErrors[day] = error;
  }
  return { dayErrors, ...(!enabled ? { scheduleError: "Choose at least one available day." } : {}) };
}
