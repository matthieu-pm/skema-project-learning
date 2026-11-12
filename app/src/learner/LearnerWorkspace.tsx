import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { initialAnswers, languageChoices, learnerFormatChoices, learningFormatsFor, levelChoices, type Answers, type LearningFormat } from "../onboarding";
import { FlowStack, KeyboardInput, MobileScroll, useFlow, useKeyboard, useKeyboardInsets, useScreenPortal, type FlowScreen } from "../mobile";
import { Icon } from "../teacher/icons";
import { Avatar, LearnerAvatar, Button, Empty, ErrorMessage, Field, LearnerPresentation, Panel, Rating, Select, Tag } from "./components";
import { conversation, inbox, markRead, readStore, sendMessage, subscribeMessages, unreadCount } from "./messages";
import { availableSlots, classifyLesson, createSlots, defaultLessonLanguage, filterTeachers, fixtureBookings, lessonLanguageFor, parisDay, priceCaps, teachers, type Booking, type LessonFormat, type SearchFilters, type Slot, type SortOption, type Teacher } from "./model";
import { cancelBooking, completeSession, instantBook, readBookings, saveReview, subscribeBookings } from "./storage";
import LearnerCalendar, { type CalendarView } from "./LearnerCalendar";
import LessonRecap from "./LessonRecap";
import BookingCalendar from "./BookingCalendar";
import LessonCurriculum, { TeacherLessons, type LessonSection } from "./LessonCurriculum";
import { publicLessonFor } from "./curriculum";
import SessionPreparation, { PreparationSummary } from "./SessionPreparation";
import { preparationFor } from "./preparation";
import "./learner.css";
import "./curriculum.css";
import "./preparation.css";
import WorkspaceDesign from "../WorkspaceDesign";

type LessonsTab = "lessons" | "calendar";
type Page = "home" | "search" | "teacher" | "curriculum" | "reviews" | "book" | "checkout" | "success" | "lessons" | "lesson" | "preparation" | "recap" | "cancel" | "review" | "messages" | "profile" | "calendar" | "edit-profile" | "support";
type Route = { page: Page; teacherId?: string; slotId?: string; format?: LessonFormat; language?: string; bookingId?: string; tab?: LessonsTab; section?: LessonSection; replaceBookingId?: string; rescheduled?: boolean; day?: string; view?: CalendarView; notice?: string; join?: boolean };
type Navigate = (route: Route, replace?: boolean) => void;
type State = {
  mobile: boolean; answers?: Answers; profile: Answers; saveProfile: (value: Answers) => void; now: Date; slots: Slot[]; bookings: Booking[]; catalog: Teacher[];
  filters: SearchFilters; setFilters: (value: SearchFilters) => void; sort: SortOption; setSort: (value: SortOption) => void;
  refresh: () => void; storageError: string; setRoot: Navigate; chat: ReturnType<typeof readStore>;
};
const Learner = createContext<State>(null!);
const useLearner = () => useContext(Learner);
const titles: Record<Page, string> = { home: "Home", search: "Find a teacher", teacher: "Teacher profile", curriculum: "Lesson details", reviews: "Teacher reviews", book: "Book a lesson", checkout: "Payment", success: "Booking confirmed", lessons: "Lessons", lesson: "Your lesson", preparation: "Your preparation", recap: "Lesson recap", cancel: "Cancel lesson", review: "Leave a review", messages: "Messages", profile: "Your profile", calendar: "Lessons", "edit-profile": "Edit profile", support: "Help & support" };
const mainNav = [ ["home", "Home", "book"], ["lessons", "Lessons", "calendar"], ["search", "Search", "search"], ["messages", "Messages", "chat"] ] as const;
const titleFor = (route: Route) => route.page === "success" && route.rescheduled ? "Lesson rescheduled" : route.replaceBookingId && route.page === "book" ? "Reschedule" : route.replaceBookingId && route.page === "checkout" ? "Review new time" : titles[route.page];
function activeTab(route: Route) {
  if (["book", "checkout"].includes(route.page) && route.replaceBookingId) return "lessons";
  if (route.page === "success" && !route.rescheduled) return "search";
  if (["teacher", "curriculum", "reviews", "book", "checkout"].includes(route.page)) return "search";
  if (["success", "lesson", "preparation", "recap", "cancel", "review", "calendar"].includes(route.page)) return "lessons";
  if (["profile", "edit-profile", "support"].includes(route.page)) return "profile";
  return route.page;
}
/** "Online and in person": sentence case when formats are joined mid-sentence. */
const formatList = (formats: string[]) => formats.map((format, index) => index ? format.toLowerCase() : format).join(" and ");
const currency = (value: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
const dateText = (value: string, includeTime = true) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", weekday: "short", day: "numeric", month: "short", ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(new Date(value));
const timeText = (value: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
function dayText(value: string, now: Date) {
  const day = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  if (day(new Date(value)) === day(now)) return "Today";
  if (day(new Date(value)) === day(new Date(now.getTime() + 86400000))) return "Tomorrow";
  return dateText(value, false);
}
function useTeacher(id?: string) { return useLearner().catalog.find(teacher => teacher.id === id); }
const lessonTitle = (booking: Booking) => preparationFor(booking)?.course.title || `${lessonLanguageFor(booking)} conversation`;
/** The lesson language a booking flow should start with for this teacher, if it can be resolved without asking. */
function useDefaultLanguage(teacher: Teacher) {
  const { filters, profile } = useLearner();
  return defaultLessonLanguage(teacher, filters.language, profile.learningLanguages);
}
// Sessions joined during this visit show Resume rather than Join.
const joinedSessions = new Set<string>();
/** Phone-only action bar portalled above the tab bar and safe area, visible only on its own FlowStack screen. */
function PhoneActionBar({ children, label, offset = 70, className = "lw-phone-actions" }: { children: ReactNode; label: string; offset?: number; className?: string }) {
  const flow = useFlow(), screenId = useRef(flow.current.id), { screenRef } = useScreenPortal(), { bottomInset } = useKeyboardInsets();
  if (flow.current.id !== screenId.current || !screenRef.current) return null;
  return createPortal(<div className={`learner-workspace ${className}`} role="region" aria-label={label} style={{ bottom: bottomInset + offset }}>{children}</div>, screenRef.current);
}
function Navigation({ route, navigate }: { route: Route; navigate: Navigate }) {
  const unread = unreadCount(useLearner().chat);
  return <nav className="lw-navigation" aria-label="Learning workspace">{mainNav.map(([page, label, icon]) => <button key={page} aria-label={page === "messages" && unread > 0 ? `Messages, ${unread} unread` : undefined} aria-current={activeTab(route) === page ? "page" : undefined} onClick={() => navigate({ page }, true)}><span className="lw-nav-icon"><Icon name={icon} />{page === "messages" && unread > 0 && <span className="lw-nav-badge" aria-hidden="true">{unread}</span>}</span><span>{label}</span></button>)}</nav>;
}
function Toolbar({ route, navigate, back, canGoBack }: { route: Route; navigate: Navigate; back: () => void; canGoBack: boolean }) {
  const { mobile } = useLearner();
  return <header className="lw-toolbar"><div>{canGoBack && <button className="lw-icon-button" onClick={back} aria-label="Go back"><Icon name="back" /></button>}<span>{mobile ? titleFor(route) : <>Mimo <span className="lw-breadcrumb">/ {titleFor(route)}</span></>}</span></div><div><button className="lw-icon-button lw-profile-button" aria-label="Your profile" aria-current={activeTab(route) === "profile" ? "page" : undefined} onClick={() => navigate({ page: "profile" })}><Icon name="person" /></button></div></header>;
}
/** WhatsApp-style chat header: back, teacher, and a tap target to their profile. */
function ChatHeader({ teacher, back, navigate }: { teacher: Teacher; back: () => void; navigate: Navigate }) {
  return <header className="lw-toolbar lw-chat-header"><button className="lw-icon-button" onClick={back} aria-label="Go back"><Icon name="back" /></button><button className="lw-chat-person" onClick={() => navigate({ page: "teacher", teacherId: teacher.id })}><Avatar teacher={teacher} /><span><strong>{teacher.name}</strong><small>Teaches {teacher.languages.join(" · ")}</small></span></button></header>;
}
function Heading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="lw-page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}
function TeacherIdentity({ teacher, navigate, large = false }: { teacher: Teacher; navigate: Navigate; large?: boolean }) {
  return <div className="lw-teacher-identity"><Avatar teacher={teacher} large={large} /><div><button className="lw-name-link" onClick={() => navigate({ page: "teacher", teacherId: teacher.id })}><h2>{teacher.name}</h2></button><p>{teacher.languages.join(" · ")} teacher</p><Rating teacher={teacher} onClick={() => navigate({ page: "reviews", teacherId: teacher.id })} /></div></div>;
}
function TeacherCard({ teacher, navigate }: { teacher: Teacher; navigate: Navigate }) {
  const { slots, bookings, now, filters } = useLearner();
  const available = availableSlots(teacher.id, slots, bookings, now, filters).slice(0, 4);
  const language = useDefaultLanguage(teacher);
  return <Panel className="lw-teacher-card"><div className="lw-teacher-card-info"><TeacherIdentity teacher={teacher} navigate={navigate} /><p className="lw-teacher-bio">{teacher.bio}</p><p className="lw-meta"><Icon name="pin" size={16} />{teacher.city} · {teacher.formats.join(" & ")}</p><div className="lw-tags"><Tag>Conversation</Tag><Tag>Personal goals</Tag></div><div className="lw-card-bottom"><strong>{currency(teacher.rate)} <span>/ {teacher.duration} min</span></strong><Button secondary icon="person" onClick={() => navigate({ page: "teacher", teacherId: teacher.id })}>View profile</Button></div></div><div className="lw-card-availability"><h3><span className="lw-availability-dot" />Next available</h3>{available.length ? <div className="lw-slot-grid">{available.map(slot => <button className="lw-slot" key={slot.id} onClick={() => navigate({ page: "book", teacherId: teacher.id, slotId: slot.id, format: slot.format, language })}><span>{dayText(slot.start, now)}</span><strong>{timeText(slot.start)}</strong><small>{slot.format}</small></button>)}</div> : <p>No open times for these filters.</p>}</div></Panel>;
}
function SearchPage({ navigate }: { navigate: Navigate }) {
  const { filters, setFilters, sort, setSort, slots, bookings, now, catalog } = useLearner();
  const matching = filterTeachers(catalog, slots, bookings, now, filters, sort);
  const languages = ["All languages", ...new Set(catalog.flatMap(teacher => teacher.languages))];
  const toggleFormat = (format: LessonFormat) => setFilters({ ...filters, formats: filters.formats?.includes(format) ? filters.formats.filter(item => item !== format) : [...(filters.formats || []), format] });
  const priceOptions = ["Any price", ...priceCaps.map(cap => `Up to ${currency(cap)}`)];
  const applied: [string, () => void][] = [
    ...(filters.language ? [[filters.language, () => setFilters({ ...filters, language: undefined })] as [string, () => void]] : []),
    ...(filters.formats || []).map(format => [format, () => toggleFormat(format)] as [string, () => void]),
    ...(filters.day && filters.day !== "Any day" ? [[filters.day, () => setFilters({ ...filters, day: "Any day" })] as [string, () => void]] : []),
    ...(filters.maxPrice !== undefined ? [[`Up to ${currency(filters.maxPrice)}`, () => setFilters({ ...filters, maxPrice: undefined })] as [string, () => void]] : []),
    ...(filters.query?.trim() ? [[`“${filters.query.trim()}”`, () => setFilters({ ...filters, query: "" })] as [string, () => void]] : []),
  ];
  return <><Heading title="Find a teacher" description="Compare teachers, then book a time that suits you." /><Panel className="lw-search-controls"><div className="lw-search-fields"><Field label="Search teachers" icon="search" placeholder="Name, language or learning goal" value={filters.query || ""} onChange={query => setFilters({ ...filters, query })} /><Select label="Language" value={filters.language || "All languages"} options={languages} onChange={language => setFilters({ ...filters, language: language === "All languages" ? undefined : language })} /><Select label="Maximum price" value={filters.maxPrice === undefined ? "Any price" : `Up to ${currency(filters.maxPrice)}`} options={priceOptions} onChange={value => setFilters({ ...filters, maxPrice: value === "Any price" ? undefined : priceCaps[priceOptions.indexOf(value) - 1] })} /></div><div className="lw-filter-row"><fieldset><legend>Lesson format</legend><div className="lw-chips">{(["Online", "In person"] as LessonFormat[]).map(format => <button key={format} aria-pressed={filters.formats?.includes(format) || false} onClick={() => toggleFormat(format)}>{format}{filters.formats?.includes(format) && <Icon name="check" size={14} />}</button>)}</div></fieldset><fieldset><legend>Availability</legend><div className="lw-chips">{(["Any day", "Today", "Tomorrow"] as const).map(day => <button key={day} aria-pressed={(filters.day || "Any day") === day} onClick={() => setFilters({ ...filters, day })}>{day}</button>)}</div></fieldset></div>{applied.length > 0 && <div className="lw-applied-filters" aria-label="Applied filters"><span>Applied:</span>{applied.map(([label, remove]) => <button key={label} onClick={remove} aria-label={`Remove filter: ${label}`}>{label}<Icon name="close" size={13} /></button>)}<button className="lw-text-button" onClick={() => setFilters({ day: "Any day", formats: [] })}>Clear all</button></div>}</Panel><div className="lw-results-toolbar"><p role="status"><strong>{matching.length}</strong> {matching.length === 1 ? "teacher" : "teachers"}</p><Select label="Sort by" value={sort} options={["Soonest available", "Rating (highest first)", "Price (lowest to highest)"]} onChange={value => setSort(value as SortOption)} /></div><div className="lw-teacher-results">{matching.length ? matching.map(teacher => <TeacherCard teacher={teacher} navigate={navigate} key={teacher.id} />) : <Empty title="No teachers at these times">Try another day or change your filters.<Button secondary icon="close" onClick={() => setFilters({ day: "Any day" })}>Clear filters</Button></Empty>}</div></>;
}
function TeacherProfile({ teacher, navigate }: { teacher: Teacher; navigate: Navigate }) {
  const { slots, bookings, now } = useLearner(), language = useDefaultLanguage(teacher);
  const nextSlots = availableSlots(teacher.id, slots, bookings, now).slice(0, 6);
  return <><Panel className="lw-profile-hero"><TeacherIdentity teacher={teacher} navigate={navigate} large /><div className="lw-profile-actions"><strong>{currency(teacher.rate)} <span>/ {teacher.duration} min</span></strong><Button icon="calendar" onClick={() => navigate({ page: "book", teacherId: teacher.id, language })}>Book a lesson</Button><Button secondary icon="chat" onClick={() => navigate({ page: "messages", teacherId: teacher.id })}>Send a message</Button></div></Panel><div className="lw-two-columns"><div className="lw-stack"><Panel className="lw-stack"><h2>Meet {teacher.name.split(" ")[0]}</h2><p>{teacher.bio}</p><dl className="lw-facts lw-icon-facts"><div><dt><Icon name="language" size={16} />Languages</dt><dd>{teacher.languages.join(", ")}</dd></div><div><dt><Icon name="video" size={16} />Lesson format</dt><dd>{formatList(teacher.formats)}</dd></div><div><dt><Icon name="pin" size={16} />Location</dt><dd>{teacher.city}</dd></div></dl></Panel><TeacherLessons teacher={teacher} onOpen={section => navigate({ page: "curriculum", teacherId: teacher.id, section })} onMessage={() => navigate({ page: "messages", teacherId: teacher.id })} /><Panel><h2>What learners say</h2><Rating teacher={teacher} onClick={() => navigate({ page: "reviews", teacherId: teacher.id })} />{teacher.reviews.length ? <blockquote>“{teacher.reviews[0].text}”<footer><span className="lw-review-author"><LearnerAvatar name={teacher.reviews[0].author} /><span>{teacher.reviews[0].author}</span></span></footer></blockquote> : <p>Be the first to leave a review after your lesson.</p>}<Button secondary icon="star" onClick={() => navigate({ page: "reviews", teacherId: teacher.id })}>Read all reviews</Button></Panel></div><Panel><h2>Choose a lesson time</h2>{nextSlots.length ? <div className="lw-slot-grid">{nextSlots.map(slot => <button key={slot.id} className="lw-slot" onClick={() => navigate({ page: "book", teacherId: teacher.id, slotId: slot.id, format: slot.format, language })}><span>{dayText(slot.start, now)}</span><strong>{timeText(slot.start)}</strong><small>{slot.format}</small></button>)}</div> : <p>No open times at the moment.</p>}</Panel></div></>;
}
function ReviewsPage({ teacher, navigate }: { teacher: Teacher; navigate: Navigate }) {
  return <><Heading title={`Reviews for ${teacher.name}`} description="Feedback from learners after their lessons." /><Panel><TeacherIdentity teacher={teacher} navigate={navigate} /></Panel><div className="lw-stack">{teacher.reviews.length ? teacher.reviews.map(review => <Panel key={review.id} className="lw-review-card"><div><span className="lw-review-author"><LearnerAvatar name={review.author} /><strong>{review.author}</strong></span><span className="lw-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div><p>{review.text}</p><small>{review.date}</small></Panel>) : <Empty title="No reviews yet">This teacher is new to Mimo. Reviews will appear here after completed lessons.</Empty>}</div></>;
}
function BookPage({ teacher, route, navigate }: { teacher: Teacher; route: Route; navigate: Navigate }) {
  const { slots, bookings, now, profile, mobile } = useLearner();
  const preferences = learningFormatsFor(profile);
  const replacing = bookings.find(booking => booking.id === route.replaceBookingId);
  const fallbackLanguage = useDefaultLanguage(teacher);
  const [format, setFormat] = useState<LessonFormat>(route.format || (preferences.find(value => teacher.formats.includes(value as LessonFormat)) as LessonFormat) || teacher.formats[0]);
  const [slotId, setSlotId] = useState(route.slotId || "");
  // A reschedule keeps the booked language; otherwise carry the language chosen in search or on the profile.
  const [language, setLanguage] = useState<string | undefined>(() => replacing ? lessonLanguageFor(replacing) : [route.language, fallbackLanguage].find(value => value && teacher.languages.includes(value)));
  const open = availableSlots(teacher.id, slots, bookings, now, { formats: [format] });
  const selected = open.find(slot => slot.id === slotId);
  const status = !language ? "Choose a lesson language to continue" : selected ? `${language} · ${dateText(selected.start)} · ${format}` : "Select a time to continue";
  return <><Heading title={route.replaceBookingId ? "Choose a new time" : "Choose your lesson"} description={route.replaceBookingId ? undefined : "A little time. A real conversation."} />
    <div className="lw-booking-layout">
      <section className="lw-booking-person">
        <TeacherIdentity teacher={teacher} navigate={navigate} large />
        <h2>{language ? `${language} conversation` : "Choose your lesson language"}</h2>
        {replacing ? <p className="lw-muted">Lesson language: <strong>{language}</strong> (kept from your booking)</p> : teacher.languages.length > 1 && <fieldset><legend>Lesson language</legend><div className="lw-chips">{teacher.languages.map(value => <button key={value} aria-pressed={value === language} onClick={() => setLanguage(value)}>{value}{value === language && <Icon name="check" size={14} />}</button>)}</div></fieldset>}
        <details className="lw-booking-about" open={!mobile}><summary>About this lesson</summary><p>{teacher.bio}</p></details>
        <div className="lw-booking-meta"><span><Icon name="clock" size={17} />{teacher.duration} minutes</span><span><Icon name="wallet" size={17} />{currency(teacher.rate)} per lesson</span><span><Icon name="globe" size={17} />Times in Paris time</span></div>
        <fieldset><legend>Lesson format</legend><div className="lw-chips">{teacher.formats.map(value => <button key={value} aria-pressed={value === format} onClick={() => { setFormat(value); setSlotId(""); }}>{value}{value === format && <Icon name="check" size={14} />}</button>)}</div></fieldset>
      </section>
      <BookingCalendar key={format} slots={open} slotId={slotId} onSelect={setSlotId} now={now}>
        <div className="lw-booking-summary">
          <div className="lw-total"><span>{teacher.duration} minutes</span><strong>{currency(teacher.rate)}</strong></div>
          <p className="lw-selection-status" role="status">{status}</p>
          <Button icon={route.replaceBookingId ? "calendar" : "card"} disabled={!selected || !language} onClick={() => navigate({ page: "checkout", teacherId: teacher.id, slotId, format, language, replaceBookingId: route.replaceBookingId })}>{route.replaceBookingId ? "Review new time" : "Continue to payment"}</Button>
        </div>
      </BookingCalendar>
    </div>
  </>;

}
function CheckoutPage({ teacher, route, navigate }: { teacher: Teacher; route: Route; navigate: Navigate }) {
  const { slots, now, refresh, mobile, bookings, setRoot } = useLearner();
  const slot = slots.find(item => item.id === route.slotId);
  const previous = bookings.find(item => item.id === route.replaceBookingId);
  const language = previous ? lessonLanguageFor(previous) : route.language;
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [requestId] = useState(() => crypto.randomUUID());
  const confirm = async () => {
    if (!slot || busy) return;
    setError(""); setBusy(true);
    try {
      const booking = await instantBook({ teacherId: teacher.id, slotId: slot.id, format: route.format || slot.format, language, replaceBookingId: route.replaceBookingId, requestId }, slots, { now: new Date(), seed: fixtureBookings(now) });
      refresh();
      const done: Route = { page: "success", bookingId: booking.id, rescheduled: !!route.replaceBookingId };
      if (mobile) setRoot(done); else navigate(done, true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We couldn’t book this time. Please choose another slot. You haven’t been charged."); }
    finally { setBusy(false); }
  };
  if (!slot) return <Empty title="Choose another time" action={<Button onClick={() => navigate({ page: "book", teacherId: teacher.id, language }, true)}>View available times</Button>}>This time is no longer available.</Empty>;
  if (!language || !teacher.languages.includes(language)) return <Empty title="Choose a lesson language" action={<Button onClick={() => navigate({ page: "book", teacherId: teacher.id, slotId: slot.id, format: route.format }, true)}>Choose language</Button>}>{teacher.name} teaches {teacher.languages.join(" and ")}. Pick one before paying.</Empty>;
  const payLabel = busy ? "Securing your time…" : route.replaceBookingId ? "Confirm new time" : `Pay ${currency(teacher.rate)} and book`;
  return <><Heading title={route.replaceBookingId ? "Review your new time" : "Review and pay"} /><div className="lw-two-columns"><Panel className="lw-stack"><TeacherIdentity teacher={teacher} navigate={navigate} /><dl className="lw-facts lw-icon-facts lw-checkout-facts"><div><dt><Icon name="language" size={16} />Lesson</dt><dd>{language} conversation</dd></div><div><dt><Icon name="person" size={16} />Teacher</dt><dd>{teacher.name}</dd></div><div><dt><Icon name="calendar" size={16} />Date and time</dt><dd>{dateText(slot.start)} – {timeText(slot.end)}</dd></div><div><dt><Icon name="globe" size={16} />Time zone</dt><dd>Paris time</dd></div><div><dt><Icon name="clock" size={16} />Duration</dt><dd>{teacher.duration} minutes</dd></div><div><dt><Icon name={(route.format || slot.format) === "Online" ? "video" : "pin"} size={16} />Format</dt><dd>{route.format || slot.format}</dd></div>{previous && <div><dt><Icon name="repeat" size={16} />Current booking</dt><dd>{dateText(previous.start)}</dd></div>}</dl>{!route.replaceBookingId && <div><h2>Payment method</h2><div className="lw-payment-method"><Icon name="card" /><div><strong>Visa ending in 4242</strong><p>Expires 12/29</p></div><Icon name="check" /></div></div>}{!previous && <p className="lw-muted">Your lesson is confirmed as soon as you pay.</p>}</Panel><Panel className="lw-booking-summary"><h2>{route.replaceBookingId ? "Change your lesson" : "Payment summary"}</h2><p>{language} · {teacher.name} · {teacher.duration} minutes</p>{route.replaceBookingId ? <p className="lw-total"><span>No extra charge</span></p> : <div className="lw-total"><span>Total</span><strong>{currency(teacher.rate)}</strong></div>}{error && <ErrorMessage>{error}</ErrorMessage>}{!mobile && <Button icon={route.replaceBookingId ? "check" : "card"} disabled={busy} onClick={confirm}>{payLabel}</Button>}{error && <Button secondary onClick={() => navigate({ page: "book", teacherId: teacher.id, language, format: route.format, replaceBookingId: route.replaceBookingId }, true)}>Choose another time</Button>}<Button secondary icon="calendar" disabled={busy} onClick={() => navigate({ page: "book", teacherId: teacher.id, slotId: slot.id, format: route.format, language, replaceBookingId: route.replaceBookingId }, true)}>Change time</Button></Panel></div>{mobile && <PhoneActionBar label="Payment">{route.replaceBookingId ? <div className="lw-phone-total"><span>No extra charge</span></div> : <div className="lw-phone-total"><span>Total</span><strong>{currency(teacher.rate)}</strong></div>}<Button icon={route.replaceBookingId ? "check" : "card"} disabled={busy} onClick={confirm}>{payLabel}</Button></PhoneActionBar>}</>;
}
function SuccessPage({ route, navigate }: { route: Route; navigate: Navigate }) {
  const { bookings } = useLearner();
  const booking = bookings.find(item => item.id === route.bookingId), teacher = useTeacher(booking?.teacherId);
  if (route.rescheduled) return <Panel className="lw-success"><span className="lw-success-mark"><Icon name="calendar" size={34} /></span><h1>Lesson rescheduled</h1><p>Your lesson has moved. Your previous time has been released.</p>{teacher && booking && <div className="lw-success-booking"><TeacherIdentity teacher={teacher} navigate={navigate} /><p>New time: <strong>{dateText(booking.start)}</strong></p><p>{lessonLanguageFor(booking)} · {booking.format} · {booking.duration} minutes</p></div>}{booking && <Button icon="back" onClick={() => navigate({ page: "lesson", bookingId: booking.id }, true)}>Back to lesson details</Button>}<Button secondary icon="calendar" onClick={() => navigate({ page: "lessons" }, true)}>View your lessons</Button></Panel>;
  return <Panel className="lw-success"><span className="lw-success-mark"><Icon name="check" size={36} /></span><h1>You’re booked!</h1><p>Your lesson is confirmed and ready in Your lessons.</p>{teacher && booking && <div className="lw-success-booking"><TeacherIdentity teacher={teacher} navigate={navigate} /><p><strong>{lessonTitle(booking)}</strong></p><p><strong>{dateText(booking.start)}</strong></p><p>{lessonLanguageFor(booking)} · {booking.format} · {booking.duration} minutes</p></div>}<Button icon="calendar" onClick={() => navigate({ page: "lessons" }, true)}>View your lessons</Button>{booking && preparationFor(booking) && <Button secondary icon="book" onClick={() => navigate({ page: "preparation", bookingId: booking.id })}>Prepare for your lesson</Button>}<Button secondary icon="search" onClick={() => navigate({ page: "search" }, true)}>Find another teacher</Button></Panel>;
}
const statusText = { Ongoing: "Live now", Upcoming: "Upcoming", Past: "Completed" } as const;
const statusTone = { Ongoing: "live", Upcoming: "upcoming", Past: "done" } as const;
function LessonCard({ booking, navigate }: { booking: Booking; navigate: Navigate }) {
  const { now } = useLearner(), teacher = useTeacher(booking.teacherId), category = classifyLesson(booking, now);
  if (!teacher || !category) return null;
  const preparation = preparationFor(booking);
  return <Panel className={`lw-lesson-card lw-lesson-${category.toLowerCase()}`}>
    <div className="lw-lesson-card-head"><Tag tone={statusTone[category]}>{statusText[category]}</Tag><span className="lw-muted">{dayText(booking.start, now)} · {timeText(booking.start)}–{timeText(booking.end)}</span></div>
    <div className="lw-lesson-card-body">
      <h3>{lessonTitle(booking)}</h3>
      <p className="lw-lesson-meta"><Avatar teacher={teacher} /><span>With <button className="lw-name-link" onClick={() => navigate({ page: "teacher", teacherId: teacher.id })}>{teacher.name}</button> · {lessonLanguageFor(booking)} · {booking.duration} min · {booking.format}</span></p>
      {category !== "Past" && (preparation ? <PreparationSummary booking={booking} onOpen={() => navigate({ page: "preparation", bookingId: booking.id })} /> : <p className="lw-muted lw-no-material">No lesson material from your teacher yet.</p>)}
    </div>
    <div className="lw-lesson-actions">
      {category === "Ongoing" ? <Button icon={booking.format === "Online" ? "video" : "pin"} onClick={() => { joinedSessions.add(booking.id); navigate({ page: "lesson", bookingId: booking.id, join: true }); }}>{joinedSessions.has(booking.id) ? "Resume lesson" : "Join lesson"}</Button>
        : category === "Upcoming" ? <><Button secondary icon="calendar" onClick={() => navigate({ page: "book", teacherId: teacher.id, replaceBookingId: booking.id, format: booking.format })}>Reschedule</Button><Button secondary icon="close" onClick={() => navigate({ page: "cancel", bookingId: booking.id })}>Cancel</Button></>
        : <><Button icon="document" onClick={() => navigate({ page: "recap", bookingId: booking.id })}>View recap</Button><Button secondary icon="repeat" onClick={() => navigate({ page: "book", teacherId: teacher.id, format: booking.format, language: lessonLanguageFor(booking) })}>Book again</Button></>}
      <button className="lw-text-button" onClick={() => navigate({ page: "lesson", bookingId: booking.id })}>Lesson details <Icon name="arrow" size={16} /></button>
    </div>
  </Panel>;
}
const order = { Ongoing: 0, Upcoming: 1, Past: 2 } as const;
function LessonsPage({ route, navigate }: { route: Route; navigate: Navigate }) {
  const { bookings, now, mobile } = useLearner();
  const [tab, setTab] = useState<LessonsTab>(route.page === "calendar" || route.tab === "calendar" ? "calendar" : "lessons");
  // One list: what's live, then what's next, then what's done (most recent first).
  const lessons = bookings.flatMap(booking => { const category = classifyLesson(booking, now); return category ? [{ booking, category }] : []; })
    .sort((a, b) => order[a.category] - order[b.category] || (a.category === "Past" ? Date.parse(b.booking.start) - Date.parse(a.booking.start) : Date.parse(a.booking.start) - Date.parse(b.booking.start)));
  const tabs: [LessonsTab, string][] = [["lessons", "Your lessons"], ["calendar", "Your calendar"]];
  return <><Heading title="Lessons" description="Your lessons, your progress and your schedule." action={!mobile && <Button icon="search" onClick={() => navigate({ page: "search" })}>Find a teacher</Button>} />
    {route.notice && <p role="status" className="lw-notice"><Icon name="check-circle" size={18} />{route.notice}</p>}
    <div className="lw-lesson-tabs" role="tablist" aria-label="Lessons view" onKeyDown={event => { if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return; const next = tab === "lessons" ? "calendar" : "lessons"; setTab(next); document.getElementById(`lw-tab-${next}`)?.focus(); }}>{tabs.map(([value, label]) => <button key={value} role="tab" id={`lw-tab-${value}`} tabIndex={tab === value ? 0 : -1} aria-selected={tab === value} aria-controls={`lw-panel-${value}`} onClick={() => setTab(value)}>{label}{value === "lessons" && <span>{lessons.length}</span>}</button>)}</div>
    {tab === "lessons" ? <div id="lw-panel-lessons" role="tabpanel" aria-labelledby="lw-tab-lessons" className="lw-stack">{lessons.length ? lessons.map(({ booking }) => <LessonCard key={booking.id} booking={booking} navigate={navigate} />) : <Empty title="No lessons yet" action={<Button icon="search" onClick={() => navigate({ page: "search" })}>Find a teacher</Button>}>Book a time that works for you. Your lessons and progress will appear here.</Empty>}</div>
      : <div id="lw-panel-calendar" role="tabpanel" aria-labelledby="lw-tab-calendar"><Panel><LearnerCalendar bookings={bookings} now={now} initialDay={route.day} initialView={route.view || (mobile ? "Day" : "Week")} onOpen={bookingId => navigate({ page: "lesson", bookingId })} /></Panel></div>}</>;
}
function MeetingDetails({ booking, teacher, live = false }: { booking: Booking; teacher: Teacher; live?: boolean }) {
  return booking.format === "Online"
    ? <div className="lw-meeting-details"><Icon name="video" size={20} /><div><strong>Online lesson room</strong><p>{live ? "Your lesson room is open." : "Your lesson room opens here when the lesson starts."}</p></div></div>
    : <div className="lw-meeting-details"><Icon name="pin" size={20} /><div><strong>In person · {teacher.city}</strong><p>{teacher.name.split(" ")[0]} shares the exact meeting place by message before the lesson. Check Messages if you haven’t received it.</p></div></div>;
}
function LessonPage({ booking, navigate, joinNow = false }: { booking: Booking; navigate: Navigate; joinNow?: boolean }) {
  const { now, refresh } = useLearner(), teacher = useTeacher(booking.teacherId)!;
  const category = classifyLesson(booking, now);
  const [joined, setJoined] = useState(joinNow && category === "Ongoing"), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const join = () => { joinedSessions.add(booking.id); setJoined(true); };
  const finish = async () => {
    setBusy(true); setError("");
    try { await completeSession(booking.id); refresh(); navigate({ page: "recap", bookingId: booking.id }, true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The lesson couldn’t be completed. Please try again."); }
    finally { setBusy(false); }
  };
  return <><Heading title={category === "Ongoing" ? "Your lesson is happening now" : "Lesson details"} /><Panel className="lw-stack"><TeacherIdentity teacher={teacher} navigate={navigate} /><h2>{lessonTitle(booking)}</h2><Tag tone={category ? statusTone[category] : "danger"}>{category ? statusText[category] : "Cancelled"}</Tag><dl className="lw-facts lw-icon-facts"><div><dt><Icon name="calendar" size={16} />When</dt><dd>{dateText(booking.start)} – {timeText(booking.end)}</dd></div><div><dt><Icon name="language" size={16} />Language</dt><dd>{lessonLanguageFor(booking)}</dd></div><div><dt><Icon name="clock" size={16} />Length</dt><dd>{booking.duration} minutes</dd></div><div><dt><Icon name={booking.format === "Online" ? "video" : "pin"} size={16} />Format</dt><dd>{booking.format}</dd></div></dl>
    {(category === "Ongoing" || category === "Upcoming") && <MeetingDetails booking={booking} teacher={teacher} live={category === "Ongoing"} />}
    {category === "Ongoing" && (joined ? <div className="lw-live-room"><Icon name={booking.format === "Online" ? "video" : "pin"} size={40} /><h2>{booking.format === "Online" ? "You’re in the lesson room" : "Your lesson is in progress"}</h2><p>When you and your teacher are done, finish the lesson to see your recap.</p>{error && <ErrorMessage>{error}</ErrorMessage>}<div className="lw-inline-actions"><Button disabled={busy} icon="check" onClick={finish}>{busy ? "Finishing…" : "Finish lesson and view recap"}</Button><Button secondary icon="back" disabled={busy} onClick={() => setJoined(false)}>Leave room</Button></div><p className="lw-muted">Leaving the room doesn’t mark the lesson as completed.</p></div> : <div className="lw-inline-actions"><Button onClick={join} icon={booking.format === "Online" ? "video" : "pin"}>{joinedSessions.has(booking.id) ? "Resume lesson" : "Join lesson"}</Button></div>)}
    {category === "Upcoming" && <div className="lw-inline-actions"><Button secondary icon="calendar" onClick={() => navigate({ page: "book", teacherId: teacher.id, replaceBookingId: booking.id, format: booking.format })}>Reschedule</Button><Button secondary icon="close" onClick={() => navigate({ page: "cancel", bookingId: booking.id })}>Cancel lesson</Button></div>}
    {category === "Past" && <div className="lw-inline-actions"><Button icon="document" onClick={() => navigate({ page: "recap", bookingId: booking.id })}>View recap</Button><Button secondary icon="star" onClick={() => navigate({ page: "review", bookingId: booking.id })}>{booking.review ? "Edit your review" : "Leave a review"}</Button><Button secondary icon="repeat" onClick={() => navigate({ page: "book", teacherId: teacher.id, format: booking.format, language: lessonLanguageFor(booking) })}>Book again</Button></div>}
    <div className="lw-inline-actions"><Button secondary icon="chat" onClick={() => navigate({ page: "messages", teacherId: teacher.id })}>Message {teacher.name.split(" ")[0]}</Button>{booking.status === "confirmed" && <Button secondary icon="calendar" onClick={() => navigate({ page: "calendar", day: parisDay(new Date(booking.start)), view: "Day" })}>Show in calendar</Button>}</div></Panel>
    {category !== "Past" && <PreparationSummary booking={booking} detailed onOpen={() => navigate({ page: "preparation", bookingId: booking.id })} onMessage={() => navigate({ page: "messages", teacherId: teacher.id })} />}</>;
}
function RecapPage({ booking, navigate }: { booking: Booking; navigate: Navigate }) {
  const { now } = useLearner(), teacher = useTeacher(booking.teacherId)!;
  if (classifyLesson(booking, now) !== "Past") return <Empty title="Recap not ready yet" action={<Button onClick={() => navigate({ page: "lesson", bookingId: booking.id }, true)}>Lesson details</Button>}>A recap appears after the lesson is completed.</Empty>;
  return <><Heading title="Lesson recap" description={`${lessonLanguageFor(booking)} with ${teacher.name} · ${dateText(booking.start)}`} />
    <LessonRecap booking={booking} onContinue={() => navigate({ page: "preparation", bookingId: booking.id })} onMessage={() => navigate({ page: "messages", teacherId: teacher.id })} />
    <Panel className="lw-stack"><h2>How did it go?</h2><p>{booking.review ? "Thanks for your review. You can edit it at any time." : `Your review helps other learners choose ${teacher.name.split(" ")[0]}.`}</p><div className="lw-inline-actions"><Button secondary icon="star" onClick={() => navigate({ page: "review", bookingId: booking.id })}>{booking.review ? "Edit your review" : "Leave a review"}</Button><Button icon="calendar" onClick={() => navigate({ page: "book", teacherId: teacher.id, format: booking.format, language: lessonLanguageFor(booking) })}>Book again</Button></div></Panel></>;
}
function CancelPage({ booking, navigate }: { booking: Booking; navigate: Navigate }) {
  const { refresh } = useLearner(), teacher = useTeacher(booking.teacherId)!;
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  return <><Heading title="Cancel this lesson?" description={`You’ll get a full refund of ${currency(booking.rate)} to your Visa ending in 4242.`} /><Panel className="lw-stack"><TeacherIdentity teacher={teacher} navigate={navigate} /><p>{dateText(booking.start)} · {booking.format}</p>{error && <ErrorMessage>{error}</ErrorMessage>}<div className="lw-inline-actions"><Button secondary icon="check" onClick={() => navigate({ page: "lessons" }, true)}>Keep lesson</Button><Button danger icon="close" disabled={busy} onClick={async () => { setBusy(true); try { await cancelBooking(booking.id); refresh(); navigate({ page: "lessons", notice: `Lesson cancelled. ${currency(booking.rate)} refunded to your Visa ending in 4242.` }, true); } catch (reason) { setError(reason instanceof Error ? reason.message : "The lesson couldn’t be cancelled. Please try again."); } finally { setBusy(false); } }}> {busy ? "Cancelling…" : "Cancel lesson"}</Button></div></Panel></>;
}
function ReviewPage({ booking, navigate }: { booking: Booking; navigate: Navigate }) {
  const { refresh } = useLearner(), teacher = useTeacher(booking.teacherId)!;
  const [rating, setRating] = useState(booking.review?.rating || 0), [text, setText] = useState(booking.review?.text || ""), [error, setError] = useState(""), [saved, setSaved] = useState(false), [busy, setBusy] = useState(false);
  return <><Heading title="How was your lesson?" description={`Share your experience with ${teacher.name}.`} /><Panel className="lw-stack"><TeacherIdentity teacher={teacher} navigate={navigate} /><fieldset><legend>Your rating</legend><div className="lw-review-stars">{[1, 2, 3, 4, 5].map(value => <button aria-label={`${value} ${value === 1 ? "star" : "stars"}`} aria-pressed={rating === value} key={value} onClick={() => { setRating(value); setSaved(false); }}>{value <= rating ? "★" : "☆"}</button>)}</div></fieldset><Field label="Your review" multiline maxLength={1000} value={text} onChange={value => { setText(value); setSaved(false); }} placeholder="What helped you learn?" />{error && <ErrorMessage>{error}</ErrorMessage>}{saved && <p role="status" className="lw-notice"><Icon name="check-circle" size={18} />Review saved. Thanks for sharing.</p>}<div className="lw-inline-actions"><Button disabled={!rating || !text.trim() || busy} onClick={async () => { setBusy(true); setError(""); try { await saveReview(booking.id, { rating, text }); refresh(); setSaved(true); } catch (reason) { setError(reason instanceof Error ? reason.message : "Your review couldn’t be saved. Please try again."); } finally { setBusy(false); } }}>{busy ? "Saving…" : "Save review"}</Button><Button secondary icon="back" onClick={() => navigate({ page: "lessons" }, true)}>Back to lessons</Button></div></Panel></>;
}
const clock = (value: string) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
function dayLabel(value: string, now: Date) {
  const key = (date: Date) => date.toDateString(), date = new Date(value);
  if (key(date) === key(now)) return "Today";
  if (key(date) === key(new Date(now.getTime() - 86400000))) return "Yesterday";
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(date);
}
function InboxPage({ navigate }: { navigate: Navigate }) {
  const { chat, catalog } = useLearner(), rows = inbox(chat), now = new Date();
  return <><Heading title="Messages" description="Your conversations with teachers." />
    {rows.length ? <ul className="lw-inbox" aria-label="Conversations">{rows.map(({ teacherId, last, unread }) => {
      const teacher = catalog.find(value => value.id === teacherId)!;
      return <li key={teacherId}><button className="lw-inbox-row" onClick={() => navigate({ page: "messages", teacherId })}><Avatar teacher={teacher} /><span className="lw-inbox-text"><span><strong>{teacher.name}</strong><small>{dayLabel(last.at, now) === "Today" ? clock(last.at) : dayLabel(last.at, now)}</small></span><span><span className="lw-inbox-preview">{last.from === "learner" && "You: "}{last.text}</span>{unread > 0 && <span className="lw-unread" aria-label={`${unread} unread`}>{unread}</span>}</span></span></button></li>;
    })}</ul> : <Empty title="No messages yet" action={<Button icon="search" onClick={() => navigate({ page: "search" })}>Find a teacher</Button>}>Message a teacher from their profile to ask about lessons.</Empty>}</>;
}
/** Thread view shared by web and phone; the phone composer is portalled above the keyboard. */
function ChatPage({ teacher, navigate }: { teacher: Teacher; navigate: Navigate }) {
  const { chat, mobile } = useLearner(), thread = conversation(chat, teacher.id), now = new Date();
  const end = useRef<HTMLDivElement>(null);
  const waiting = thread.at(-1)?.from === "learner" && now.getTime() - Date.parse(thread.at(-1)!.at) < 8000;
  useEffect(() => { markRead(teacher.id); }, [thread.length, teacher.id]);
  useEffect(() => {
    const node = end.current, scroller = node?.closest(".mobile-scroll, .lw-chat-scroll") as HTMLElement | null;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [thread.length, waiting]);
  const body = <div className="lw-chat-thread" role="log" aria-label={`Conversation with ${teacher.name}`} aria-live="polite">
    {!thread.length && <div className="lw-chat-empty"><Avatar teacher={teacher} large /><strong>Say hello to {teacher.name.split(" ")[0]}</strong><p>Ask about lessons, share your goals or plan what to practice.</p></div>}
    {thread.map((message, index) => {
      const label = dayLabel(message.at, now), newDay = index === 0 || dayLabel(thread[index - 1].at, now) !== label;
      return <div key={message.id} className="lw-chat-row-wrap">{newDay && <p className="lw-chat-day"><span>{label}</span></p>}<div className={`lw-chat-row ${message.from === "learner" ? "is-mine" : ""}`}><p className="lw-bubble">{message.text}<small>{clock(message.at)}{message.from === "learner" && <Icon name="check" size={13} />}</small></p></div></div>;
    })}
    {waiting && <div className="lw-chat-row"><p className="lw-bubble lw-typing" aria-label={`${teacher.name} is typing`}><span /><span /><span /></p></div>}
    <div ref={end} />
  </div>;
  if (mobile) return <>{body}<PhoneActionBar label="Write a message" offset={0} className="lw-chat-composer-bar"><Composer teacher={teacher} /></PhoneActionBar></>;
  return <Panel className="lw-chat"><div className="lw-chat-top"><Avatar teacher={teacher} /><div><strong>{teacher.name}</strong><small>Teaches {teacher.languages.join(" · ")}</small></div><Button secondary icon="person" onClick={() => navigate({ page: "teacher", teacherId: teacher.id })}>View profile</Button></div><div className="lw-chat-scroll">{body}</div><Composer teacher={teacher} /></Panel>;
}
function Composer({ teacher }: { teacher: Teacher }) {
  const { mobile } = useLearner(), keyboard = useKeyboard();
  const [text, setText] = useState(""), [error, setError] = useState("");
  const send = () => { if (!text.trim()) return; try { sendMessage(teacher.id, text); setText(""); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Your message couldn’t be sent. Try again."); } };
  const props = { value: text, placeholder: `Message ${teacher.name.split(" ")[0]}`, "aria-label": `Message ${teacher.name}`, maxLength: 2000, onChange: (event: React.ChangeEvent<HTMLInputElement>) => setText(event.target.value), onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }, onBlur: () => { if (mobile) keyboard.hide(); } };
  return <form className="lw-composer" onSubmit={event => { event.preventDefault(); send(); }}>{error && <ErrorMessage>{error}</ErrorMessage>}<div>{mobile ? <KeyboardInput {...props} /> : <input {...props} />}<button type="submit" className="lw-send" aria-label="Send message" disabled={!text.trim()} onPointerDown={event => event.preventDefault()}><Icon name="send" size={20} /></button></div></form>;
}
function HomePage({ navigate }: { navigate: Navigate }) {
  const { profile, bookings, now } = useLearner();
  // A lesson that is live now comes first, so Join is one tap from Home.
  const next = bookings.filter(booking => ["Ongoing", "Upcoming"].includes(classifyLesson(booking, now) || "")).sort((a, b) => Date.parse(a.start) - Date.parse(b.start))[0];
  return <><Heading title="A little conversation goes a long way" description="Make space for your next useful, human conversation." /><Panel className="lw-home-welcome"><div><h2>Your teacher, your pace</h2><p>Choose someone who understands your goals and book a time that works for you.</p><Button icon="search" onClick={() => navigate({ page: "search" })}>Find a teacher</Button></div><img src="/assets/onboarding/luma.png" alt="Luma, your learning companion" draggable={false} /></Panel><div className="lw-section-heading"><h2>Your next lesson</h2><button className="lw-text-button" onClick={() => navigate({ page: "lessons" })}>All lessons <Icon name="arrow" size={16} /></button></div>{next ? <LessonCard booking={next} navigate={navigate} /> : <Empty title="No lesson booked yet" action={<Button icon="search" onClick={() => navigate({ page: "search" })}>Find a teacher</Button>}>Choose a teacher and a time to get started.</Empty>}<Panel><h2 className="lw-icon-heading"><Icon name="target" size={20} />Your learning goal</h2><p>{profile.personalGoal || profile.learningGoals.join(" · ") || "Feel more confident in everyday conversations."}</p><p className="lw-muted">{profile.learningLanguages.join(" · ") || "English · Everyday life"}</p></Panel></>;
}
const goalChoices = ["Everyday life", "Travel", "Work", "Friends & family", "For my studies"];
const confidenceChoices = ["I feel comfortable", "I’m finding my confidence"];
const challengeChoices = ["Fear of mistakes", "Finding the right words", "Understanding replies", "Pronunciation"];
const scheduleText = (p: Answers) => p.scheduleFlexible || (!p.days.length && !p.time) ? "Flexible schedule" : [p.days.join(" and "), p.time].filter(Boolean).join(" · ");
function ProfilePage({ navigate }: { navigate: Navigate }) {
  const { profile } = useLearner();
  return <><Heading title="Your learning profile" description="A starting point for lessons that feel like you." />
    <div className="lw-profile-shortcuts">
      <button className="lw-panel lw-shortcut" onClick={() => navigate({ page: "edit-profile" })}><Icon name="edit" /><span><strong>Edit profile</strong><small>Name, contact and learning preferences</small></span><Icon name="arrow" size={16} /></button>
      <button className="lw-panel lw-shortcut" onClick={() => navigate({ page: "support" })}><Icon name="help" /><span><strong>Help & support</strong><small>Questions about lessons or bookings</small></span><Icon name="arrow" size={16} /></button>
    </div>
    <Panel className="lw-stack"><div className="lw-learner-profile"><LearnerAvatar large name={profile.name || "Alex"} /><div><h2>{profile.name || "Alex"}</h2><p className="lw-muted">{profile.email || "Learner profile"}</p></div></div><dl className="lw-facts lw-icon-facts"><div><dt><Icon name="language" size={16} />Languages</dt><dd>{profile.learningLanguages.map(language => profile.learningLevels[language] ? `${language} (${profile.learningLevels[language]})` : language).join(", ") || "Not set"}</dd></div><div><dt><Icon name="target" size={16} />Your goals</dt><dd>{[profile.learningGoals.join(" · "), profile.personalGoal].filter(Boolean).join(" — ") || "Not set"}</dd></div><div><dt><Icon name="audio" size={16} />Speaking confidence</dt><dd>{profile.speakingConfidence || "Not set"}</dd></div><div><dt><Icon name="note" size={16} />Speaking challenges</dt><dd>{[...profile.speakingChallenges, profile.challengeDetails].filter(Boolean).join(" · ") || "Not set"}</dd></div><div><dt><Icon name="video" size={16} />Lesson formats</dt><dd>{formatList(learningFormatsFor(profile)) || "Online or in person"}</dd></div><div><dt><Icon name="clock" size={16} />Availability</dt><dd>{scheduleText(profile)}</dd></div></dl></Panel></>;
}
function EditProfilePage({ navigate }: { navigate: Navigate }) {
  const { profile, saveProfile } = useLearner();
  const [draft, setDraft] = useState<Answers>(() => structuredClone(profile)), [error, setError] = useState(""), [saved, setSaved] = useState(false);
  const update = (patch: Partial<Answers>) => { setDraft(current => ({ ...current, ...patch })); setSaved(false); setError(""); };
  const toggle = <T,>(list: T[], value: T) => list.includes(value) ? list.filter(item => item !== value) : [...list, value];
  const toggleLanguage = (language: string) => {
    const learningLanguages = toggle(draft.learningLanguages, language), learningLevels = { ...draft.learningLevels };
    if (!learningLanguages.includes(language)) delete learningLevels[language];
    update({ learningLanguages, learningLevels });
  };
  const save = () => {
    const email = draft.email.trim(), missing = draft.learningLanguages.filter(language => !draft.learningLevels[language] || draft.learningLevels[language] === "Choose a level");
    // Show every problem at once so the learner can fix them in one pass.
    const problems = [
      !draft.name.trim() && "Add your name so teachers know what to call you.",
      email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && "Enter a valid email address, such as you@example.com.",
      !draft.learningLanguages.length && "Choose at least one language to learn.",
      missing.length > 0 && `Choose your level for ${missing.join(" and ")}.`,
      !draft.learningGoals.length && "Choose at least one goal.",
    ].filter(Boolean) as string[];
    if (problems.length) return setError(problems.join("\n"));
    try { saveProfile({ ...draft, name: draft.name.trim(), email, topic: draft.learningGoals[0] }); setSaved(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Your changes couldn’t be saved. Try again."); }
  };
  const chips = (label: string, options: readonly string[], selected: string[], onToggle: (value: string) => void, single = false) => <fieldset><legend>{label}</legend><div className="lw-chips" role={single ? "radiogroup" : "group"} aria-label={label}>{options.map(option => <button key={option} role={single ? "radio" : undefined} aria-checked={single ? selected.includes(option) : undefined} aria-pressed={single ? undefined : selected.includes(option)} onClick={() => onToggle(option)}>{option}{selected.includes(option) && <Icon name="check" size={14} />}</button>)}</div></fieldset>;
  return <><Heading title="Edit your profile" description="Update your details and what you’d like to learn." />
    <Panel className="lw-stack"><h2>Name and contact</h2><Field label="Name" autoComplete="name" value={draft.name} maxLength={80} onChange={name => update({ name })} /><Field label="Email" type="email" autoComplete="email" value={draft.email} maxLength={120} placeholder="you@example.com" onChange={email => update({ email })} /></Panel>
    <Panel className="lw-stack"><h2>Languages and levels</h2>{chips("Languages you’re learning", languageChoices, draft.learningLanguages, toggleLanguage)}{draft.learningLanguages.map(language => <Select key={language} label={`${language} level`} value={draft.learningLevels[language] || "Choose a level"} options={[...(draft.learningLevels[language] ? [] : ["Choose a level"]), ...levelChoices.map(([level]) => level), "Not sure"]} onChange={level => update({ learningLevels: { ...draft.learningLevels, [language]: level } })} />)}</Panel>
    <Panel className="lw-stack"><h2>Learning preferences</h2>{chips("Your goals", goalChoices, draft.learningGoals, goal => update({ learningGoals: toggle(draft.learningGoals, goal) }))}<Field label="Personal goal (optional)" multiline maxLength={500} value={draft.personalGoal} onChange={personalGoal => update({ personalGoal })} />{chips("Speaking confidence", confidenceChoices, draft.speakingConfidence ? [draft.speakingConfidence] : [], speakingConfidence => update({ speakingConfidence }), true)}{chips("Speaking challenges", challengeChoices, draft.speakingChallenges, challenge => update({ speakingChallenges: toggle(draft.speakingChallenges, challenge) }))}</Panel>
    <Panel className="lw-stack"><h2>Lessons and availability</h2>{chips("Lesson formats", learnerFormatChoices, learningFormatsFor(draft), format => update({ learningFormats: toggle(learningFormatsFor(draft), format as LearningFormat), format: "" }))}{chips("Days that usually work", ["Weekdays", "Weekends"], draft.days, day => update({ days: toggle(draft.days, day), scheduleFlexible: false }))}{chips("Preferred time", ["Morning", "Afternoon", "Evening"], draft.time ? [draft.time] : [], time => update({ time: draft.time === time ? "" : time, scheduleFlexible: false }), true)}{chips("Or", ["Keep my schedule flexible"], draft.scheduleFlexible ? ["Keep my schedule flexible"] : [], () => update(draft.scheduleFlexible ? { scheduleFlexible: false } : { scheduleFlexible: true, days: [], time: "" }))}</Panel>
    {error && <ErrorMessage>{error.split("\n").map(line => <span key={line} className="lw-error-line">{line}</span>)}</ErrorMessage>}{saved && <p role="status" className="lw-notice"><Icon name="check-circle" size={18} />Profile saved.</p>}
    <div className="lw-inline-actions"><Button icon="check" onClick={save}>Save changes</Button><Button secondary onClick={() => navigate({ page: "profile" }, true)}>{saved ? "Back to profile" : "Cancel"}</Button></div></>;
}
function SupportPage() {
  const { profile } = useLearner();
  const [text, setText] = useState(""), [sent, setSent] = useState(false);
  return <><Heading title="Help & support" description="Get help with lessons, bookings and payments." />
    <Panel className="lw-stack"><h2 className="lw-icon-heading"><Icon name="help" size={20} />Common questions</h2><details className="lw-faq"><summary>How do I reschedule or cancel a lesson?<Icon name="down" size={16} /></summary><p>Go to Lessons, find the lesson and choose Reschedule or Cancel. Your original time is kept until the new one is confirmed.</p></details><details className="lw-faq"><summary>Where can I see what we covered?<Icon name="down" size={16} /></summary><p>Go to Lessons and choose View recap on a completed lesson.</p></details><details className="lw-faq"><summary>How do I contact my teacher?<Icon name="down" size={16} /></summary><p>Open Messages, or choose Send a message on your teacher’s profile.</p></details></Panel>
    <Panel className="lw-stack"><h2 className="lw-icon-heading"><Icon name="chat" size={20} />Contact support</h2>{sent ? <p role="status" className="lw-notice"><Icon name="check-circle" size={18} />{profile.email ? <>Message sent. We’ll reply to {profile.email} within one working day.</> : "Message sent. We’ll reply in Messages within one working day."}</p> : <><Field label="How can we help?" multiline maxLength={2000} value={text} onChange={setText} placeholder="Tell us what happened" /><Button icon="send" disabled={!text.trim()} onClick={() => setSent(true)}>Send message</Button></>}</Panel></>;
}
function PageContent({ route, navigate, active = true }: { route: Route; navigate: Navigate; active?: boolean }) {
  const { bookings, mobile } = useLearner(), teacher = useTeacher(route.teacherId), booking = bookings.find(item => item.id === route.bookingId);
  if (["teacher", "curriculum", "reviews", "book", "checkout"].includes(route.page) && !teacher) return <Empty title="Choose a teacher" action={<Button onClick={() => navigate({ page: "search" }, true)}>Find a teacher</Button>} />;
  if (["lesson", "preparation", "recap", "cancel", "review"].includes(route.page) && !booking) return <Empty title="Lesson not found" action={<Button onClick={() => navigate({ page: "lessons" }, true)}>View lessons</Button>} />;
  switch (route.page) {
    case "search": return <SearchPage navigate={navigate} />;
    case "teacher": return <TeacherProfile teacher={teacher!} navigate={navigate} />;
    case "curriculum": return publicLessonFor(teacher!.id) ? <LessonCurriculum teacher={teacher!} initialSection={route.section} onBook={() => navigate({ page: "book", teacherId: teacher!.id })} onMessage={() => navigate({ page: "messages", teacherId: teacher!.id })} /> : <Empty title="No lesson outline published yet" action={<Button secondary onClick={() => navigate({ page: "teacher", teacherId: teacher!.id }, true)}>View teacher profile</Button>} />;
    case "reviews": return <ReviewsPage teacher={teacher!} navigate={navigate} />;
    case "book": return <BookPage teacher={teacher!} route={route} navigate={navigate} />;
    case "checkout": return <CheckoutPage teacher={teacher!} route={route} navigate={navigate} />;
    case "success": return <SuccessPage route={route} navigate={navigate} />;
    case "lessons": return <LessonsPage key="lessons" route={route} navigate={navigate} />;
    case "lesson": return <LessonPage booking={booking!} navigate={navigate} joinNow={route.join} />;
    case "preparation": return <SessionPreparation booking={booking!} mobile={mobile} active={active} onSession={() => navigate({ page: "lesson", bookingId: booking!.id })} onMessage={() => navigate({ page: "messages", teacherId: booking!.teacherId })} />;
    case "recap": return <RecapPage booking={booking!} navigate={navigate} />;
    case "cancel": return <CancelPage booking={booking!} navigate={navigate} />;
    case "review": return <ReviewPage booking={booking!} navigate={navigate} />;
    case "messages": return teacher ? <ChatPage teacher={teacher} navigate={navigate} /> : <InboxPage navigate={navigate} />;
    case "profile": return <ProfilePage navigate={navigate} />;
    case "edit-profile": return <EditProfilePage navigate={navigate} />;
    case "support": return <SupportPage />;
    case "calendar": return <LessonsPage key="calendar" route={route} navigate={navigate} />;
    default: return <HomePage navigate={navigate} />;
  }
}
function ChatHeaderFor({ route, back, navigate }: { route: Route; back: () => void; navigate: Navigate }) {
  const teacher = useTeacher(route.teacherId);
  return teacher ? <ChatHeader teacher={teacher} back={back} navigate={navigate} /> : null;
}
function screenFor(route: Route): FlowScreen {
  const id = `learner-${route.page}-${crypto.randomUUID()}`;
  if (route.page === "messages" && route.teacherId) return { id, headerHeight: 64, footerHeight: 0,
    header: flow => <ChatHeaderFor route={route} back={flow.pop} navigate={next => flow.push(screenFor(next))} />,
    render: flow => <MobileScroll className="lw-mobile-scroll lw-chat-scroll-mobile"><main className="lw-content lw-chat-screen" inert={flow.current.id !== id} aria-hidden={flow.current.id !== id}><PageContent route={route} navigate={(next, replace) => replace ? flow.replace(screenFor(next)) : flow.push(screenFor(next))} /></main></MobileScroll>,
  };
  return { id, headerHeight: 60, footerHeight: 70,
    header: flow => <Toolbar route={route} navigate={(next, replace) => replace ? flow.replace(screenFor(next)) : flow.push(screenFor(next))} back={flow.pop} canGoBack={flow.canGoBack} />,
    footer: () => <MobileNavigation route={route} />,
    render: flow => route.page === "preparation" ? <main className="lw-preparation-route" inert={flow.current.id !== id} aria-hidden={flow.current.id !== id}><PageContent route={route} active={flow.current.id === id} navigate={(next, replace) => replace ? flow.replace(screenFor(next)) : flow.push(screenFor(next))} /></main> : <MobileScroll className="lw-mobile-scroll"><main className="lw-content" inert={flow.current.id !== id} aria-hidden={flow.current.id !== id}><PageContent route={route} navigate={(next, replace) => replace ? flow.replace(screenFor(next)) : flow.push(screenFor(next))} /></main></MobileScroll>,
  };
}
function MobileNavigation({ route }: { route: Route }) { return <Navigation route={route} navigate={useLearner().setRoot} />; }
function initialRoute(fromOnboarding = false): Route {
  const params = new URLSearchParams(window.location.search), flow = params.get("flow"), teacherId = params.get("teacherId");
  // Finishing learner setup goes straight to teacher results with the setup filters applied.
  if (fromOnboarding && !flow) return { page: "search" };
  if (flow === "preparation" && params.get("bookingId")) return { page: "preparation", bookingId: params.get("bookingId")! };
  if (["teacher", "curriculum"].includes(flow || "") && teachers.some(teacher => teacher.id === teacherId)) return { page: flow as Page, teacherId: teacherId!, section: params.get("section") === "curriculum" ? "curriculum" : "overview" };
  if (flow === "messages" && teachers.some(teacher => teacher.id === teacherId)) return { page: "messages", teacherId: teacherId! };
  return { page: (["search", "lessons", "profile", "calendar", "messages"].includes(flow || "") ? flow : "home") as Page };
}
const profileStorageKey = "mimo.learner-profile.v1";
const sampleProfile: Answers = { ...initialAnswers, role: "learner", name: "Alex", learningLanguages: ["English"], learningLevels: { English: "B1" }, learningGoals: ["Everyday life"], topic: "Everyday life", learningFormats: ["Online", "In person"] };
function readProfile(): Answers | null {
  try { const raw = window.localStorage.getItem(profileStorageKey); if (!raw) return null; const value = JSON.parse(raw); return value?.version === 1 && value.profile && typeof value.profile.name === "string" && Array.isArray(value.profile.learningLanguages) ? { ...initialAnswers, ...value.profile } : null; }
  catch { return null; }
}
function writeProfile(profile: Answers) {
  try { window.localStorage.setItem(profileStorageKey, JSON.stringify({ version: 1, profile })); }
  catch { throw new Error("Your profile couldn’t be saved. Your changes are still here, so try again."); }
}
export default function LearnerWorkspace({ mobile = false, answers }: { mobile?: boolean; answers?: Answers }) {
  const [clock] = useState(() => new Date()), [now, setNow] = useState(clock), slots = useMemo(() => createSlots(clock), [clock]);
  const [bookings, setBookings] = useState<Booking[]>([]), [storageError, setStorageError] = useState("");
  const catalog = useMemo(() => teachers.map(teacher => ({ ...teacher, reviews: [...teacher.reviews, ...bookings.filter(booking => booking.teacherId === teacher.id && booking.review).map(booking => ({ id: `own-${booking.id}`, author: "You", rating: booking.review!.rating, text: booking.review!.text, date: booking.review!.date.slice(0, 10) }))] })), [bookings]);
  const [filters, setFilters] = useState<SearchFilters>(() => ({ language: answers?.learningLanguages[0], formats: answers ? learningFormatsFor(answers) as LessonFormat[] : [], day: "Any day" }));
  const [sort, setSort] = useState<SortOption>("Soonest available"), [route, setRoute] = useState<Route>(() => initialRoute(!!answers)), [history, setHistory] = useState<Route[]>([]);
  const [mobileRoot, setMobileRoot] = useState({ route: initialRoute(!!answers), key: 0 });
  const [profile, setProfile] = useState<Answers>(() => answers ? structuredClone(answers) : readProfile() ?? sampleProfile);
  const saveProfile = (value: Answers) => { writeProfile(value); setProfile(value); };
  const [chat, setChat] = useState(() => readStore());
  useEffect(() => subscribeMessages(() => setChat(readStore())), []);
  const keyboard = useKeyboard();
  const refresh = () => { try { setBookings(readBookings(fixtureBookings(clock))); setStorageError(""); } catch (reason) { setStorageError(reason instanceof Error ? reason.message : "Bookings couldn’t be loaded. Please reload to try again."); } };
  useEffect(() => { refresh(); return subscribeBookings(refresh); }, [clock]);
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 15000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { document.title = mobile ? "Mimo · Learner mobile" : "Mimo · Learning workspace"; }, [mobile]);
  const navigate: Navigate = (next, replace = false) => { keyboard.hide(); if (replace) setHistory([]); else setHistory(current => [...current, route]); setRoute(next); };
  const setRoot: Navigate = next => { keyboard.hide(); setMobileRoot(current => ({ route: next, key: current.key + 1 })); };
  const back = () => { keyboard.hide(); setRoute(history.at(-1) || { page: "home" }); setHistory(current => current.slice(0, -1)); };
  return <Learner.Provider value={{ mobile, answers, profile, saveProfile, now, slots, bookings, catalog, filters, setFilters, sort, setSort, refresh, storageError, setRoot, chat }}><LearnerPresentation.Provider value={mobile}><div className={`learner-workspace ${mobile ? "learner-mobile" : "learner-web"}`}><WorkspaceDesign />{mobile ? <FlowStack key={mobileRoot.key} initial={screenFor(mobileRoot.route)} /> : <><aside className="lw-sidebar lw-cal-sidebar">
      <button className="lw-account-button" aria-label="Your profile" onClick={() => navigate({ page: "profile" })}>
        <LearnerAvatar name={profile.name || "Alex"} />
        <span><strong>{profile.name || "Alex"}</strong></span><Icon name="down" size={15} />
      </button>
      <Navigation route={route} navigate={navigate} />
          </aside><div className="lw-web-main"><Toolbar route={route} navigate={navigate} back={back} canGoBack={history.length > 0} /><main className="lw-content" key={JSON.stringify(route)}>{storageError && <ErrorMessage>{storageError}</ErrorMessage>}<PageContent route={route} navigate={navigate} /></main></div></>}{mobile && storageError && <div className="lw-storage-error" role="alert">{storageError}</div>}</div></LearnerPresentation.Provider></Learner.Provider>;
}
