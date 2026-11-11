export type LessonFormat = "Online" | "In person";
export type Review = { id: string; author: string; rating: number; text: string; date: string };
export type Teacher = {
  id: string; name: string; languages: string[]; formats: LessonFormat[];
  city: string; rate: number; duration: number; bio: string; color: string; reviews: Review[];
};
export type Slot = { id: string; teacherId: string; start: string; end: string; format: LessonFormat };
export type Booking = {
  id: string; teacherId: string; slotId: string; start: string; end: string;
  format: LessonFormat; status: "confirmed" | "cancelled"; paymentStatus: "paid";
  rate: number; duration: number; review?: { rating: number; text: string; date: string };
  requestId?: string; preparationId?: string;
};
export type SearchFilters = {
  language?: string; formats?: LessonFormat[]; day?: "Any day" | "Today" | "Tomorrow"; query?: string;
};
export type SortOption = "Soonest available" | "Rating (highest first)" | "Price (lowest to highest)";
export type LessonCategory = "Ongoing" | "Upcoming" | "Past";

// Fictional teachers and reviews for the local, one-to-one learner prototype.
const review = (id: string, author: string, rating: number, text: string): Review => ({ id, author, rating, text, date: "2026-10-28" });
const additionalProfiles: [string, string, string[], LessonFormat[], string, number, string][] = [
  ["amina", "Amina Diallo", ["French", "English"], ["Online", "In person"], "Paris", 24, "Find your words through friendly everyday conversation."],
  ["lucas-t", "Lucas Bernard", ["English", "French"], ["Online"], "Lille", 18, "Travel, conversation and practical English for your next step."],
  ["ines", "Inès Laurent", ["French", "Spanish"], ["Online", "In person"], "Paris", 32, "A calm space to practice pronunciation and conversation."],
  ["hugo", "Hugo Moreau", ["French", "German"], ["In person"], "Paris", 26, "Clear explanations and useful language for everyday situations."],
  ["ana", "Ana López", ["Spanish", "French"], ["Online", "In person"], "Paris", 23, "Build confidence with small conversations and patient feedback."],
  ["oliver", "Oliver Brown", ["English"], ["Online"], "London", 34, "Practical English for work, interviews and daily life."],
  ["mei", "Mei Sato", ["Japanese", "English"], ["Online"], "Tokyo", 29, "Natural Japanese with friendly, structured speaking practice."],
  ["leonie", "Leonie Weber", ["German", "English"], ["Online", "In person"], "Paris", 27, "Make German conversation feel more manageable, one step at a time."],
  ["marco", "Marco Bianchi", ["Italian", "English"], ["Online"], "Rome", 21, "Speak Italian through travel, food and everyday stories."],
  ["julie", "Julie Petit", ["French", "English"], ["Online", "In person"], "Lyon", 25, "Personal lessons shaped around the conversations you want to have."],
  ["nora", "Nora Schmidt", ["German", "French"], ["Online"], "Berlin", 30, "Patient support for speaking, listening and finding the right words."],
  ["elena", "Elena Martín", ["Spanish", "English"], ["Online", "In person"], "Paris", 28, "Practical conversation and clear feedback for your personal goals."],
  ["louis", "Louis Dubois", ["French"], ["In person"], "Paris", 19, "Relaxed French conversation for everyday life in the city."],
  ["sara", "Sara Conti", ["Italian", "French"], ["Online", "In person"], "Paris", 31, "Build a useful vocabulary and put it into conversation."],
  ["james", "James Taylor", ["English", "German"], ["Online"], "Manchester", 36, "Speaking practice for work and the everyday situations that matter."],
  ["aiko", "Aiko Mori", ["Japanese", "French"], ["Online"], "Osaka", 24, "Friendly Japanese lessons with real-life phrases and patient feedback."],
  ["camille", "Camille Roux", ["French", "Spanish"], ["Online", "In person"], "Paris", 22, "Turn everyday situations into simple, useful speaking practice."],
  ["felix", "Felix Fischer", ["German", "English"], ["Online"], "Munich", 33, "Understand natural speech and practice responding with confidence."],
  ["valentina", "Valentina Romano", ["Italian", "English"], ["Online", "In person"], "Paris", 26, "Warm, practical lessons with time to try, pause and ask questions."],
  ["tom", "Tom Evans", ["English", "French"], ["Online"], "Bristol", 20, "Make room for conversation with lessons built around your interests."],
];
export const teachers: Teacher[] = [
  { id: "gilbert", name: "Gilbert", languages: ["French", "English"], formats: ["Online", "In person"], city: "Paris", rate: 30, duration: 30, color: "#eee4ff", bio: "Patient, practical conversation for everyday life. We work on the situations that matter to you, at your pace.", reviews: [review("c1", "Léa", 5, "Gilbert made it easy to speak without worrying about every mistake."), review("c2", "Alex", 5, "Helpful corrections and useful phrases for my week."), review("c3", "Sam", 4, "A clear lesson with plenty of conversation.")] },
  { id: "diego", name: "Diego García", languages: ["Spanish", "English"], formats: ["Online"], city: "Madrid", rate: 22, duration: 45, color: "#fff0d8", bio: "Build confidence through relaxed conversation, travel situations and pronunciation practice.", reviews: [review("d1", "Lucas", 5, "We practiced exactly what I needed for my trip."), review("d2", "Lou", 5, "Encouraging, clear and easy to talk to.")] },
  { id: "emma", name: "Emma Wilson", languages: ["English", "German"], formats: ["Online", "In person"], city: "Paris", rate: 35, duration: 45, color: "#e0f2ff", bio: "Feel more comfortable at work, in interviews and in everyday conversations. Personal feedback after each lesson.", reviews: [review("e1", "Maya", 5, "Useful practice for presenting my ideas at work."), review("e2", "Noah", 4, "Emma helped me find words and keep the conversation going.")] },
  { id: "yuki", name: "Yuki Tanaka", languages: ["Japanese", "English"], formats: ["Online"], city: "Lyon", rate: 25, duration: 45, color: "#ffe7ee", bio: "Learn natural Japanese with small, manageable steps and real-life conversation.", reviews: [] },
  { id: "sofia", name: "Sofia Rossi", languages: ["Italian", "French"], formats: ["Online", "In person"], city: "Paris", rate: 20, duration: 45, color: "#e6f3df", bio: "Friendly lessons built around food, culture, travel and the conversations you want to have.", reviews: [review("s1", "Camille", 4, "A friendly teacher with lots of practical examples."), review("s2", "Robin", 5, "I felt comfortable trying new words.")] },
  ...additionalProfiles.map(([id, name, languages, formats, city, rate, bio], index): Teacher => ({
    id, name, languages, formats, city, rate, duration: index % 3 === 0 ? 30 : 45, bio,
    color: ["#eee4ff", "#fff0d8", "#e0f2ff", "#ffe7ee", "#e6f3df"][index % 5],
    reviews: index === 8 ? [] : [
      review(`${id}-1`, "Alex", index % 4 === 0 ? 4 : 5, "I had time to practice and ask questions at my own pace."),
      review(`${id}-2`, "Sam", index % 3 === 0 ? 4 : 5, "Clear explanations and useful feedback for my next conversation."),
      review(`${id}-3`, "Charlie", index % 2 === 0 ? 5 : 4, "A thoughtful lesson built around what I wanted to learn."),
    ],
  })),
];

export function ratingSummary(teacher: Teacher) {
  return { average: teacher.reviews.length ? teacher.reviews.reduce((sum, r) => sum + r.rating, 0) / teacher.reviews.length : null, count: teacher.reviews.length };
}
const dayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" });
const timeFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
export function parisDay(date: Date): string {
  const parts = dayFormatter.formatToParts(date);
  return ["year", "month", "day"].map((type) => parts.find((p) => p.type === type)!.value).join("-");
}
export function addDays(day: string, count: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}
export function parisTime(day: string, hour: number, minute = 0): Date {
  const desired = Date.parse(`${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`);
  let candidate = desired;
  for (let i = 0; i < 2; i++) {
    const parts = timeFormatter.formatToParts(new Date(candidate));
    const p = (name: string) => parts.find((part) => part.type === name)!.value;
    const represented = Date.parse(`${p("year")}-${p("month")}-${p("day")}T${p("hour")}:${p("minute")}:${p("second")}Z`);
    candidate += desired - represented;
  }
  return new Date(candidate);
}
export function createSlots(now: Date): Slot[] {
  const day = parisDay(now);
  return teachers.flatMap((teacher, teacherIndex) =>
    [0, 1, 2, 3, 5, 7].flatMap((offset) =>
      // Stagger teachers' availability so day filters and soonest sorting are useful.
      (offset === 0 && teacherIndex === 3 ? [] : [9 + (teacherIndex % 6), 16 + (teacherIndex % 2), 20]).flatMap((hour) =>
        teacher.formats.map((format) => {
          const start = parisTime(addDays(day, offset), hour, teacherIndex % 2 ? 30 : 0);
          return { id: `${teacher.id}-${addDays(day, offset)}-${hour}-${format}`, teacherId: teacher.id, start: start.toISOString(), end: new Date(start.getTime() + teacher.duration * 60_000).toISOString(), format };
        }),
      ),
    ),
  );
}
export function overlaps(a: Pick<Slot, "start" | "end">, b: Pick<Slot, "start" | "end">): boolean {
  return Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);
}
export function availableSlots(teacherId: string, slots: Slot[], bookings: Booking[], now: Date, filters: SearchFilters = {}): Slot[] {
  const day = filters.day === "Today" ? parisDay(now) : filters.day === "Tomorrow" ? addDays(parisDay(now), 1) : null;
  return slots.filter((slot) => slot.teacherId === teacherId && Date.parse(slot.start) > now.getTime()
    && (!day || parisDay(new Date(slot.start)) === day)
    && (!filters.formats?.length || filters.formats.includes(slot.format))
    && !bookings.some((booking) => booking.status === "confirmed" && booking.teacherId === teacherId && overlaps(slot, booking)))
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || a.format.localeCompare(b.format));
}
export function filterTeachers(source: Teacher[], slots: Slot[], bookings: Booking[], now: Date, filters: SearchFilters = {}, sort: SortOption = "Soonest available"): Teacher[] {
  const query = filters.query?.trim().toLocaleLowerCase() || "";
  const nextSlots = new Map(source.map((teacher) => [teacher.id, availableSlots(teacher.id, slots, bookings, now, filters)]));
  return source.filter((teacher) => (!filters.language || teacher.languages.includes(filters.language))
    && (!filters.formats?.length || teacher.formats.some((format) => filters.formats!.includes(format)))
    && (!query || `${teacher.name} ${teacher.languages.join(" ")} ${teacher.city} ${teacher.bio}`.toLocaleLowerCase().includes(query))
    && (!(filters.day && filters.day !== "Any day") || nextSlots.get(teacher.id)!.length > 0))
    .sort((a, b) => {
      if (sort === "Price (lowest to highest)") return a.rate - b.rate || a.name.localeCompare(b.name);
      if (sort === "Rating (highest first)") return (ratingSummary(b).average ?? -1) - (ratingSummary(a).average ?? -1) || ratingSummary(b).count - ratingSummary(a).count || a.name.localeCompare(b.name);
      const next = (teacher: Teacher) => Date.parse(nextSlots.get(teacher.id)![0]?.start || "") || Infinity;
      return next(a) - next(b) || a.name.localeCompare(b.name);
    });
}
export function classifyLesson(booking: Booking, now: Date): LessonCategory | null {
  if (booking.status === "cancelled") return null;
  if (now.getTime() < Date.parse(booking.start)) return "Upcoming";
  return now.getTime() < Date.parse(booking.end) ? "Ongoing" : "Past";
}
export function fixtureBookings(now: Date): Booking[] {
  const day = parisDay(now);
  const make = (id: string, teacher: Teacher, start: Date): Booking => ({ id, teacherId: teacher.id, slotId: `sample-${id}`, start: start.toISOString(), end: new Date(start.getTime() + teacher.duration * 60_000).toISOString(), format: "Online", status: "confirmed", paymentStatus: "paid", rate: teacher.rate, duration: teacher.duration });
  return [make("sample-ongoing", teachers[0], new Date(now.getTime() - 15 * 60_000)), make("sample-upcoming", teachers[0], parisTime(addDays(day, 1), 13)), make("sample-past", teachers[2], parisTime(addDays(day, -2), 14))];
}
