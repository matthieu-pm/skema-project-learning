import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Answers } from "../onboarding";
import { learningFormatsFor } from "../onboarding";
import { FlowStack, MobileScroll, useKeyboard, type FlowScreen } from "../mobile";
import { Icon } from "../teacher/icons";
import { Avatar, LearnerAvatar, Button, Empty, ErrorMessage, Field, LearnerPresentation, Panel, Rating, Select } from "./components";
import { availableSlots, classifyLesson, createSlots, filterTeachers, fixtureBookings, teachers, type Booking, type LessonFormat, type SearchFilters, type Slot, type SortOption, type Teacher } from "./model";
import { cancelBooking, instantBook, readBookings, saveReview, subscribeBookings } from "./storage";
import BookingCalendar from "./BookingCalendar";
import LessonCurriculum, { TeacherLessons, type LessonSection } from "./LessonCurriculum";
import { publicLessonFor } from "./curriculum";
import "./learner.css";
import "./curriculum.css";
import WorkspaceDesign from "../WorkspaceDesign";

type Category = "Ongoing" | "Upcoming" | "Past";
type Page = "home" | "search" | "teacher" | "curriculum" | "reviews" | "book" | "checkout" | "success" | "lessons" | "lesson" | "cancel" | "review" | "messages" | "profile";
type Route = { page: Page; teacherId?: string; slotId?: string; format?: LessonFormat; bookingId?: string; category?: Category; section?: LessonSection; replaceBookingId?: string };
type Navigate = (route: Route, replace?: boolean) => void;
type State = {
  mobile: boolean; answers?: Answers; now: Date; slots: Slot[]; bookings: Booking[]; catalog: Teacher[];
  filters: SearchFilters; setFilters: (value: SearchFilters) => void; sort: SortOption; setSort: (value: SortOption) => void;
  refresh: () => void; storageError: string; setRoot: Navigate;
};
const Learner = createContext<State>(null!);
const useLearner = () => useContext(Learner);
const categories: Category[] = ["Ongoing", "Upcoming", "Past"];
const titles: Record<Page, string> = { home: "Home", search: "Find a teacher", teacher: "Teacher profile", curriculum: "Lesson details", reviews: "Teacher reviews", book: "Book a lesson", checkout: "Payment", success: "Booking confirmed", lessons: "Lessons", lesson: "Your lesson", cancel: "Cancel lesson", review: "Leave a review", messages: "Messages", profile: "Profile" };
const mainNav = [ ["home", "Home", "book"], ["lessons", "Lessons", "calendar"], ["search", "Search", "search"], ["profile", "Profile", "person"] ] as const;
function activeTab(route: Route) {
  if (["teacher", "curriculum", "reviews", "book", "checkout"].includes(route.page)) return "search";
  if (["success", "lesson", "cancel", "review"].includes(route.page)) return "lessons";
  return route.page === "messages" ? "home" : route.page;
}
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
function Navigation({ route, navigate }: { route: Route; navigate: Navigate }) {
  return <nav className="lw-navigation" aria-label="Learning workspace">{mainNav.map(([page, label, icon]) => <button key={page} aria-current={activeTab(route) === page ? "page" : undefined} onClick={() => navigate({ page }, true)}><Icon name={icon} /><span>{label}</span></button>)}</nav>;
}
function Toolbar({ route, navigate, back, canGoBack }: { route: Route; navigate: Navigate; back: () => void; canGoBack: boolean }) {
  const { mobile } = useLearner();
  return <header className="lw-toolbar"><div>{canGoBack && <button className="lw-icon-button" onClick={back} aria-label="Go back"><Icon name="back" /></button>}<span>{mobile ? titles[route.page] : <>Learning workspace <span className="lw-breadcrumb">/ {titles[route.page]}</span></>}</span></div><div>{!mobile && <a className="lw-preview-link" href="/?learner=1&view=mobile">Mobile app <Icon name="arrow" size={16} /></a>}<button className="lw-icon-button" aria-label="Open messages" onClick={() => navigate({ page: "messages" })}><Icon name="message" /></button></div></header>;
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
  return <Panel className="lw-teacher-card"><div className="lw-teacher-card-info"><TeacherIdentity teacher={teacher} navigate={navigate} /><p className="lw-teacher-bio">{teacher.bio}</p><p className="lw-meta"><Icon name="pin" size={16} />{teacher.city} · {teacher.formats.join(" & ")}</p><div className="lw-specialties"><span>Conversation</span><span>Personal goals</span></div><div className="lw-card-bottom"><strong>{currency(teacher.rate)} <span>/ {teacher.duration} min</span></strong><Button secondary onClick={() => navigate({ page: "teacher", teacherId: teacher.id })}>View profile</Button></div></div><div className="lw-card-availability"><h3><span className="lw-availability-dot" />Next available</h3>{available.length ? <div className="lw-slot-grid">{available.map(slot => <button className="lw-slot" key={slot.id} onClick={() => navigate({ page: "book", teacherId: teacher.id, slotId: slot.id, format: slot.format })}><span>{dayText(slot.start, now)}</span><strong>{timeText(slot.start)}</strong><small>{slot.format}</small></button>)}</div> : <p>No open times for these filters.</p>}</div></Panel>;
}
function SearchPage({ navigate }: { navigate: Navigate }) {
  const { filters, setFilters, sort, setSort, slots, bookings, now, catalog } = useLearner();
  const matching = filterTeachers(catalog, slots, bookings, now, filters, sort);
  const languages = ["All languages", ...new Set(catalog.flatMap(teacher => teacher.languages))];
  const toggleFormat = (format: LessonFormat) => setFilters({ ...filters, formats: filters.formats?.includes(format) ? filters.formats.filter(item => item !== format) : [...(filters.formats || []), format] });
  return <><Heading title="A teacher for your next step." description="Different voices. A shared love of conversation." /><Panel className="lw-search-controls"><div className="lw-search-fields"><Field label="Search teachers" icon="search" placeholder="Name, language or learning goal" value={filters.query || ""} onChange={query => setFilters({ ...filters, query })} /><Select label="Language" value={filters.language || "All languages"} options={languages} onChange={language => setFilters({ ...filters, language: language === "All languages" ? undefined : language })} /></div><div className="lw-filter-row"><fieldset><legend>Lesson format</legend><div className="lw-chips">{(["Online", "In person"] as LessonFormat[]).map(format => <button key={format} aria-pressed={filters.formats?.includes(format) || false} onClick={() => toggleFormat(format)}>{format}{filters.formats?.includes(format) && <Icon name="check" size={14} />}</button>)}</div></fieldset><fieldset><legend>Availability</legend><div className="lw-chips">{(["Any day", "Today", "Tomorrow"] as const).map(day => <button key={day} aria-pressed={(filters.day || "Any day") === day} onClick={() => setFilters({ ...filters, day })}>{day}</button>)}</div></fieldset></div></Panel><div className="lw-results-toolbar"><p role="status"><strong>{matching.length}</strong> {matching.length === 1 ? "teacher" : "teachers"}</p><Select label="Sort by" value={sort} options={["Soonest available", "Rating (highest first)", "Price (lowest to highest)"]} onChange={value => setSort(value as SortOption)} /></div><div className="lw-teacher-results">{matching.length ? matching.map(teacher => <TeacherCard teacher={teacher} navigate={navigate} key={teacher.id} />) : <Empty title="No teachers at these times">Try another day or change your filters.<Button secondary onClick={() => setFilters({ day: "Any day" })}>Clear filters</Button></Empty>}</div><p className="lw-timezone"><Icon name="clock" size={14} />All times are shown in Europe/Paris.</p></>;
}
function TeacherProfile({ teacher, navigate }: { teacher: Teacher; navigate: Navigate }) {
  const { slots, bookings, now } = useLearner();
  const nextSlots = availableSlots(teacher.id, slots, bookings, now).slice(0, 6);
  return <><Panel className="lw-profile-hero"><TeacherIdentity teacher={teacher} navigate={navigate} large /><div className="lw-profile-actions"><strong>{currency(teacher.rate)} <span>/ {teacher.duration} min</span></strong><Button onClick={() => navigate({ page: "book", teacherId: teacher.id })}>Book a lesson</Button><Button secondary icon="message" onClick={() => navigate({ page: "messages", teacherId: teacher.id })}>Send a message</Button></div></Panel><div className="lw-two-columns"><div className="lw-stack"><Panel><h2>Meet {teacher.name.split(" ")[0]}</h2><p>{teacher.bio}</p><dl className="lw-facts"><div><dt>Languages</dt><dd>{teacher.languages.join(", ")}</dd></div><div><dt>Lesson format</dt><dd>{teacher.formats.join(" and ")}</dd></div><div><dt>Location</dt><dd>{teacher.city}</dd></div></dl></Panel><TeacherLessons teacher={teacher} onOpen={section => navigate({ page: "curriculum", teacherId: teacher.id, section })} onMessage={() => navigate({ page: "messages", teacherId: teacher.id })} /><Panel><h2>What learners say</h2><Rating teacher={teacher} onClick={() => navigate({ page: "reviews", teacherId: teacher.id })} />{teacher.reviews.length ? <blockquote>“{teacher.reviews[0].text}”<footer><span className="lw-review-author"><LearnerAvatar name={teacher.reviews[0].author} /><span>{teacher.reviews[0].author}</span></span></footer></blockquote> : <p>Be the first to leave a review after your lesson.</p>}<Button secondary onClick={() => navigate({ page: "reviews", teacherId: teacher.id })}>Read all reviews</Button></Panel></div><Panel><h2>Choose a lesson time</h2><p className="lw-muted">Europe/Paris</p>{nextSlots.length ? <div className="lw-slot-grid">{nextSlots.map(slot => <button key={slot.id} className="lw-slot" onClick={() => navigate({ page: "book", teacherId: teacher.id, slotId: slot.id, format: slot.format })}><span>{dayText(slot.start, now)}</span><strong>{timeText(slot.start)}</strong><small>{slot.format}</small></button>)}</div> : <p>No open times at the moment.</p>}</Panel></div></>;
}
function ReviewsPage({ teacher, navigate }: { teacher: Teacher; navigate: Navigate }) {
  return <><Heading title={`Reviews for ${teacher.name}`} description="Feedback from learners after their lessons." /><Panel><TeacherIdentity teacher={teacher} navigate={navigate} /></Panel><div className="lw-stack">{teacher.reviews.length ? teacher.reviews.map(review => <Panel key={review.id} className="lw-review-card"><div><span className="lw-review-author"><LearnerAvatar name={review.author} /><strong>{review.author}</strong></span><span className="lw-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div><p>{review.text}</p><small>{review.date}</small></Panel>) : <Empty title="No reviews yet">This teacher is new to Mimo. Reviews will appear here after completed lessons.</Empty>}</div></>;
}
function BookPage({ teacher, route, navigate }: { teacher: Teacher; route: Route; navigate: Navigate }) {
  const { slots, bookings, now, answers, mobile } = useLearner();
  const preferences = answers ? learningFormatsFor(answers) : [];
  const [format, setFormat] = useState<LessonFormat>(route.format || (preferences.find(value => teacher.formats.includes(value as LessonFormat)) as LessonFormat) || teacher.formats[0]);
  const [slotId, setSlotId] = useState(route.slotId || "");
  const open = availableSlots(teacher.id, slots, bookings, now, { formats: [format] });
  const selected = open.find(slot => slot.id === slotId);
  return <><Heading title={route.replaceBookingId ? "Choose a new lesson time" : "Choose your lesson"} description="A little time. A real conversation." />
    <div className="lw-booking-layout">
      <section className="lw-booking-person">
        <TeacherIdentity teacher={teacher} navigate={navigate} large />
        <h2>{teacher.languages[0]} conversation</h2>
        <details className="lw-booking-about" open={!mobile}><summary>About this lesson</summary><p>{teacher.bio}</p></details>
        <div className="lw-booking-meta"><span><Icon name="clock" size={17} />{teacher.duration} minutes</span><span><Icon name="wallet" size={17} />{currency(teacher.rate)} per lesson</span><span><Icon name="pin" size={17} />Europe/Paris</span></div>
        <fieldset><legend>Lesson format</legend><div className="lw-chips">{teacher.formats.map(value => <button key={value} aria-pressed={value === format} onClick={() => { setFormat(value); setSlotId(""); }}>{value}</button>)}</div></fieldset>
      </section>
      <BookingCalendar key={format} slots={open} slotId={slotId} onSelect={setSlotId} now={now}>
        <div className="lw-booking-summary">
          <div className="lw-total"><span>{teacher.duration} minutes</span><strong>{currency(teacher.rate)}</strong></div>
          <p className="lw-selection-status" role="status">{selected ? `${dateText(selected.start)} · ${format}` : "Select a time to continue"}</p>
          <Button disabled={!selected} onClick={() => navigate({ page: "checkout", teacherId: teacher.id, slotId, format, replaceBookingId: route.replaceBookingId })}>{route.replaceBookingId ? "Review new time" : "Continue to payment"}</Button>
        </div>
      </BookingCalendar>
    </div>
  </>;

}
function CheckoutPage({ teacher, route, navigate }: { teacher: Teacher; route: Route; navigate: Navigate }) {
  const { slots, now, refresh } = useLearner();
  const slot = slots.find(item => item.id === route.slotId);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [requestId] = useState(() => crypto.randomUUID());
  const confirm = async () => {
    if (!slot || busy) return;
    setError(""); setBusy(true);
    try {
      const booking = await instantBook({ teacherId: teacher.id, slotId: slot.id, format: route.format || slot.format, replaceBookingId: route.replaceBookingId, requestId }, slots, { now: new Date(), seed: fixtureBookings(now) });
      refresh();
      navigate({ page: "success", bookingId: booking.id }, true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We couldn’t book this time. Please choose another slot. You haven’t been charged."); }
    finally { setBusy(false); }
  };
  if (!slot) return <Empty title="Choose another time" action={<Button onClick={() => navigate({ page: "book", teacherId: teacher.id }, true)}>View available times</Button>}>This time is no longer available.</Empty>;
  return <><Heading title={route.replaceBookingId ? "Review your new time" : "Review and pay"} /><div className="lw-two-columns"><Panel className="lw-stack"><TeacherIdentity teacher={teacher} navigate={navigate} /><div className="lw-checkout-detail"><Icon name="calendar" /><div><strong>{dateText(slot.start)}</strong><p>{teacher.duration} minutes · {route.format || slot.format}</p></div></div>{!route.replaceBookingId && <div><h2>Payment method</h2><div className="lw-payment-method"><Icon name="wallet" /><div><strong>Visa ending in 4242</strong><p>Expires 12/29</p></div><Icon name="check" /></div></div>}<p className="lw-muted">Your booking is confirmed as soon as this time is secured.</p></Panel><Panel className="lw-booking-summary"><h2>{route.replaceBookingId ? "Change your lesson" : "Payment summary"}</h2><p>{teacher.name} · {teacher.duration} minutes</p><div className="lw-total"><span>{route.replaceBookingId ? "Additional amount" : "Total"}</span><strong>{currency(route.replaceBookingId ? 0 : teacher.rate)}</strong></div>{error && <ErrorMessage>{error}</ErrorMessage>}<Button disabled={busy} onClick={confirm}>{busy ? "Securing your time…" : route.replaceBookingId ? "Confirm new time" : `Pay ${currency(teacher.rate)} and book`}</Button>{error && <Button secondary onClick={() => navigate({ page: "book", teacherId: teacher.id, replaceBookingId: route.replaceBookingId }, true)}>Choose another time</Button>}<Button secondary disabled={busy} onClick={() => navigate({ page: "book", teacherId: teacher.id, slotId: slot.id, format: route.format, replaceBookingId: route.replaceBookingId }, true)}>Change time</Button></Panel></div></>;
}
function SuccessPage({ route, navigate }: { route: Route; navigate: Navigate }) {
  const { bookings } = useLearner();
  const booking = bookings.find(item => item.id === route.bookingId), teacher = useTeacher(booking?.teacherId);
  return <Panel className="lw-success"><span className="lw-success-mark"><Icon name="check" size={36} /></span><h1>You’re booked!</h1><p>Your lesson is confirmed and ready in Upcoming lessons.</p>{teacher && booking && <div className="lw-success-booking"><TeacherIdentity teacher={teacher} navigate={navigate} /><p><strong>{dateText(booking.start)}</strong></p><p>{booking.format} · {booking.duration} minutes</p></div>}<Button onClick={() => navigate({ page: "lessons", category: "Upcoming" }, true)}>View upcoming lessons</Button><Button secondary onClick={() => navigate({ page: "search" }, true)}>Find another teacher</Button></Panel>;
}
function LessonCard({ booking, navigate }: { booking: Booking; navigate: Navigate }) {
  const { now } = useLearner(), teacher = useTeacher(booking.teacherId), category = classifyLesson(booking, now);
  if (!teacher || !category) return null;
  return <Panel className="lw-lesson-card"><div className="lw-lesson-time"><span>{dayText(booking.start, now)}</span><strong>{timeText(booking.start)}</strong><span>{booking.duration} min · {booking.format}</span></div><div className="lw-lesson-info"><TeacherIdentity teacher={teacher} navigate={navigate} /><p>{teacher.languages[0]} conversation</p><p className="lw-muted">{dateText(booking.start)}</p></div><div className="lw-lesson-actions">{category === "Ongoing" ? <Button icon={booking.format === "Online" ? "video" : "pin"} onClick={() => navigate({ page: "lesson", bookingId: booking.id })}>Join lesson</Button> : category === "Upcoming" ? <><Button secondary onClick={() => navigate({ page: "book", teacherId: teacher.id, replaceBookingId: booking.id, format: booking.format })}>Reschedule</Button><Button secondary onClick={() => navigate({ page: "cancel", bookingId: booking.id })}>Cancel</Button></> : <><Button secondary onClick={() => navigate({ page: "review", bookingId: booking.id })}>{booking.review ? "Edit your review" : "Leave a review"}</Button><Button onClick={() => navigate({ page: "book", teacherId: teacher.id, format: booking.format })}>Rebook</Button></>}<button className="lw-text-button" onClick={() => navigate({ page: "lesson", bookingId: booking.id })}>Lesson details <Icon name="arrow" size={16} /></button></div></Panel>;
}
function LessonsPage({ route, navigate }: { route: Route; navigate: Navigate }) {
  const { bookings, now } = useLearner();
  const [category, setCategory] = useState<Category>(route.category || "Upcoming");
  const matching = bookings.filter(booking => classifyLesson(booking, now) === category).sort((a, b) => category === "Past" ? Date.parse(b.start) - Date.parse(a.start) : Date.parse(a.start) - Date.parse(b.start));
  return <><Heading title="Your lessons" description="Your next conversation, and everything you’ve learned so far." action={<Button onClick={() => navigate({ page: "search" })}>Find a teacher</Button>} /><div className="lw-lesson-tabs" role="tablist" aria-label="Lesson status">{categories.map(value => <button key={value} role="tab" aria-selected={category === value} aria-controls="lw-lesson-list" id={`lw-tab-${value}`} onClick={() => setCategory(value)}>{value}<span>{bookings.filter(booking => classifyLesson(booking, now) === value).length}</span></button>)}</div><div id="lw-lesson-list" role="tabpanel" aria-labelledby={`lw-tab-${category}`} className="lw-stack">{matching.length ? matching.map(booking => <LessonCard key={booking.id} booking={booking} navigate={navigate} />) : <Empty title={`No ${category.toLowerCase()} lessons`} action={category !== "Ongoing" ? <Button onClick={() => navigate({ page: "search" })}>Find a teacher</Button> : <Button secondary onClick={() => setCategory("Upcoming")}>See upcoming lessons</Button>}>{category === "Ongoing" ? "Your lesson will appear here when it starts." : category === "Upcoming" ? "Book a time that works for you." : "Completed lessons will appear here."}</Empty>}</div><p className="lw-timezone"><Icon name="clock" size={14} />Times are shown in Europe/Paris. Lessons move between sections as time passes.</p></>;
}
function LessonPage({ booking, navigate }: { booking: Booking; navigate: Navigate }) {
  const { now } = useLearner(), teacher = useTeacher(booking.teacherId)!;
  const category = classifyLesson(booking, now);
  const [joined, setJoined] = useState(false);
  return <><Heading title={category === "Ongoing" ? "Your lesson is happening now" : "Lesson details"} /><Panel className="lw-stack"><TeacherIdentity teacher={teacher} navigate={navigate} /><h2>{teacher.languages[0]} conversation</h2><p>{dateText(booking.start)} – {timeText(booking.end)}</p><p>{booking.duration} minutes · {booking.format}</p><span className="lw-status">{category || "Cancelled"}</span>{category === "Ongoing" && (joined ? <div className="lw-live-room"><Icon name="video" size={40} /><h2>You’re in the lesson room</h2><p>Your teacher’s conversation space is ready.</p><Button secondary onClick={() => setJoined(false)}>Leave room</Button></div> : <Button onClick={() => setJoined(true)} icon="video">Join lesson</Button>)}{category === "Upcoming" && <div className="lw-inline-actions"><Button secondary onClick={() => navigate({ page: "book", teacherId: teacher.id, replaceBookingId: booking.id, format: booking.format })}>Reschedule</Button><Button secondary onClick={() => navigate({ page: "cancel", bookingId: booking.id })}>Cancel lesson</Button></div>}{category === "Past" && <div className="lw-inline-actions"><Button onClick={() => navigate({ page: "review", bookingId: booking.id })}>{booking.review ? "Edit your review" : "Leave a review"}</Button><Button secondary onClick={() => navigate({ page: "book", teacherId: teacher.id, format: booking.format })}>Rebook</Button></div>}<Button secondary icon="message" onClick={() => navigate({ page: "messages", teacherId: teacher.id })}>Send a message</Button></Panel></>;
}
function CancelPage({ booking, navigate }: { booking: Booking; navigate: Navigate }) {
  const { refresh } = useLearner(), teacher = useTeacher(booking.teacherId)!;
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  return <><Heading title="Cancel this lesson?" description="The reserved time will become available again." /><Panel className="lw-stack"><TeacherIdentity teacher={teacher} navigate={navigate} /><p>{dateText(booking.start)} · {booking.format}</p>{error && <ErrorMessage>{error}</ErrorMessage>}<div className="lw-inline-actions"><Button secondary onClick={() => navigate({ page: "lessons", category: "Upcoming" }, true)}>Keep lesson</Button><Button danger disabled={busy} onClick={async () => { setBusy(true); try { await cancelBooking(booking.id); refresh(); navigate({ page: "lessons", category: "Upcoming" }, true); } catch (reason) { setError(reason instanceof Error ? reason.message : "The lesson could not be cancelled. Please try again."); } finally { setBusy(false); } }}> {busy ? "Cancelling…" : "Cancel lesson"}</Button></div></Panel></>;
}
function ReviewPage({ booking, navigate }: { booking: Booking; navigate: Navigate }) {
  const { refresh } = useLearner(), teacher = useTeacher(booking.teacherId)!;
  const [rating, setRating] = useState(booking.review?.rating || 0), [text, setText] = useState(booking.review?.text || ""), [error, setError] = useState(""), [saved, setSaved] = useState(false), [busy, setBusy] = useState(false);
  return <><Heading title="How was your lesson?" description={`Share your experience with ${teacher.name}.`} /><Panel className="lw-stack"><TeacherIdentity teacher={teacher} navigate={navigate} /><fieldset><legend>Your rating</legend><div className="lw-review-stars">{[1, 2, 3, 4, 5].map(value => <button aria-label={`${value} ${value === 1 ? "star" : "stars"}`} aria-pressed={rating === value} key={value} onClick={() => { setRating(value); setSaved(false); }}>{value <= rating ? "★" : "☆"}</button>)}</div></fieldset><Field label="Your review" multiline maxLength={1000} value={text} onChange={value => { setText(value); setSaved(false); }} placeholder="What helped you learn?" />{error && <ErrorMessage>{error}</ErrorMessage>}{saved && <p role="status" className="lw-status">Your review is saved on this device.</p>}<div className="lw-inline-actions"><Button disabled={!rating || !text.trim() || busy} onClick={async () => { setBusy(true); setError(""); try { await saveReview(booking.id, { rating, text }); refresh(); setSaved(true); } catch (reason) { setError(reason instanceof Error ? reason.message : "Your review couldn’t be saved. Please try again."); } finally { setBusy(false); } }}>{busy ? "Saving…" : "Save review"}</Button><Button secondary onClick={() => navigate({ page: "lessons", category: "Past" }, true)}>Back to lessons</Button></div></Panel></>;
}
function MessagesPage({ teacher, navigate }: { teacher?: Teacher; navigate: Navigate }) {
  const [text, setText] = useState(""), [messages, setMessages] = useState<string[]>([]);
  return <><Heading title={teacher ? `Message ${teacher.name.split(" ")[0]}` : "Messages"} description="Talk about your goals before your lesson." />{teacher ? <Panel className="lw-stack"><TeacherIdentity teacher={teacher} navigate={navigate} /><div className="lw-message-history">{messages.length ? messages.map((message, index) => <p key={index} className="lw-message-bubble">{message}</p>) : <p className="lw-muted">Start a conversation about what you’d like to practice.</p>}</div><Field label="Your message" multiline value={text} maxLength={2000} onChange={setText} placeholder="Hello! I’d love to practice…" /><Button disabled={!text.trim()} onClick={() => { setMessages(current => [...current, text.trim()]); setText(""); }}>Send message</Button>{messages.length > 0 && <p role="status" className="lw-muted">Saved in this conversation for this visit.</p>}</Panel> : <Empty title="Start a conversation" action={<Button onClick={() => navigate({ page: "search" })}>Find a teacher</Button>}>Open a teacher’s profile and choose Send a message.</Empty>}</>;
}
function HomePage({ navigate }: { navigate: Navigate }) {
  const { answers, bookings, now } = useLearner();
  const next = bookings.filter(booking => classifyLesson(booking, now) === "Upcoming").sort((a, b) => Date.parse(a.start) - Date.parse(b.start))[0];
  return <><Heading title="A little conversation goes a long way" description="Make space for your next useful, human conversation." /><Panel className="lw-home-welcome"><div><h2>Your teacher, your pace</h2><p>Choose someone who understands your goals and book a time that works for you.</p><Button onClick={() => navigate({ page: "search" })}>Find a teacher</Button></div><img src="/assets/onboarding/luma.png" alt="Luma, your learning companion" draggable={false} /></Panel><div className="lw-section-heading"><h2>Your next lesson</h2><button className="lw-text-button" onClick={() => navigate({ page: "lessons" })}>All lessons <Icon name="arrow" size={16} /></button></div>{next ? <LessonCard booking={next} navigate={navigate} /> : <Empty title="Your next lesson starts here" action={<Button onClick={() => navigate({ page: "search" })}>Find a teacher</Button>}>Choose a teacher and a time.</Empty>}<Panel><h2>Your learning goal</h2><p>{answers?.personalGoal || answers?.learningGoals.join(" · ") || "Feel more confident in everyday conversations."}</p><p className="lw-muted">{answers?.learningLanguages.join(" · ") || "English · Everyday life"}</p></Panel><p className="lw-prototype-boundary">Interactive prototype with fictional teachers, reviews, and lessons. Bookings and reviews stay in this browser. No real payment, message delivery, or video call is connected.</p></>;
}
function ProfilePage() {
  const { answers, mobile } = useLearner();
  return <><Heading title="Your learning profile" description="A starting point for lessons that feel like you." /><Panel className="lw-stack"><div className="lw-learner-profile"><LearnerAvatar large name={answers?.name || "Alex"} /><div><h2>{answers?.name || "Alex"}</h2><p className="lw-muted">Learner profile</p></div></div><dl className="lw-facts"><div><dt>Languages</dt><dd>{answers?.learningLanguages.join(", ") || "English"}</dd></div><div><dt>Your goal</dt><dd>{answers?.personalGoal || answers?.learningGoals.join(" · ") || "Feel more confident in everyday conversations."}</dd></div><div><dt>Speaking confidence</dt><dd>{answers?.speakingConfidence || "Not set"}</dd></div><div><dt>Speaking challenges</dt><dd>{[...(answers?.speakingChallenges || []), answers?.challengeDetails].filter(Boolean).join(" · ") || "Not set"}</dd></div><div><dt>Lesson formats</dt><dd>{answers ? learningFormatsFor(answers).join(" and ") || "Flexible" : "Online and In person"}</dd></div><div><dt>Availability</dt><dd>{answers?.days.join(" and ") || "Flexible days"} · {answers?.time || "Flexible times"}</dd></div></dl><a className="lw-text-button" href={`/?view=${mobile ? "mobile" : "web"}`}>Replay onboarding <Icon name="arrow" size={16} /></a></Panel><Panel><h2>About this prototype</h2><p>Teachers, reviews, and lessons are fictional. Your bookings and review drafts stay in this browser; they do not synchronize to other devices. Payments, messages, and video calls are not connected to services.</p></Panel></>;
}
function PageContent({ route, navigate }: { route: Route; navigate: Navigate }) {
  const { bookings } = useLearner(), teacher = useTeacher(route.teacherId), booking = bookings.find(item => item.id === route.bookingId);
  if (["teacher", "curriculum", "reviews", "book", "checkout"].includes(route.page) && !teacher) return <Empty title="Choose a teacher" action={<Button onClick={() => navigate({ page: "search" }, true)}>Find a teacher</Button>} />;
  if (["lesson", "cancel", "review"].includes(route.page) && !booking) return <Empty title="Lesson not found" action={<Button onClick={() => navigate({ page: "lessons" }, true)}>View lessons</Button>} />;
  switch (route.page) {
    case "search": return <SearchPage navigate={navigate} />;
    case "teacher": return <TeacherProfile teacher={teacher!} navigate={navigate} />;
    case "curriculum": return publicLessonFor(teacher!.id) ? <LessonCurriculum teacher={teacher!} initialSection={route.section} onBook={() => navigate({ page: "book", teacherId: teacher!.id })} onMessage={() => navigate({ page: "messages", teacherId: teacher!.id })} /> : <Empty title="No lesson outline published yet" action={<Button secondary onClick={() => navigate({ page: "teacher", teacherId: teacher!.id }, true)}>View teacher profile</Button>} />;
    case "reviews": return <ReviewsPage teacher={teacher!} navigate={navigate} />;
    case "book": return <BookPage teacher={teacher!} route={route} navigate={navigate} />;
    case "checkout": return <CheckoutPage teacher={teacher!} route={route} navigate={navigate} />;
    case "success": return <SuccessPage route={route} navigate={navigate} />;
    case "lessons": return <LessonsPage route={route} navigate={navigate} />;
    case "lesson": return <LessonPage booking={booking!} navigate={navigate} />;
    case "cancel": return <CancelPage booking={booking!} navigate={navigate} />;
    case "review": return <ReviewPage booking={booking!} navigate={navigate} />;
    case "messages": return <MessagesPage teacher={teacher} navigate={navigate} />;
    case "profile": return <ProfilePage />;
    default: return <HomePage navigate={navigate} />;
  }
}
function screenFor(route: Route): FlowScreen {
  const id = `learner-${route.page}-${crypto.randomUUID()}`;
  return { id, headerHeight: 60, footerHeight: 70,
    header: flow => <Toolbar route={route} navigate={(next, replace) => replace ? flow.replace(screenFor(next)) : flow.push(screenFor(next))} back={flow.pop} canGoBack={flow.canGoBack} />,
    footer: () => <MobileNavigation route={route} />,
    render: flow => <MobileScroll className="lw-mobile-scroll"><main className="lw-content" inert={flow.current.id !== id} aria-hidden={flow.current.id !== id}><PageContent route={route} navigate={(next, replace) => replace ? flow.replace(screenFor(next)) : flow.push(screenFor(next))} /></main></MobileScroll>,
  };
}
function MobileNavigation({ route }: { route: Route }) { return <Navigation route={route} navigate={useLearner().setRoot} />; }
function initialRoute(): Route {
  const params = new URLSearchParams(window.location.search), flow = params.get("flow"), teacherId = params.get("teacherId");
  if (["teacher", "curriculum"].includes(flow || "") && teachers.some(teacher => teacher.id === teacherId)) return { page: flow as Page, teacherId: teacherId!, section: params.get("section") === "curriculum" ? "curriculum" : "overview" };
  return { page: (["search", "lessons", "profile"].includes(flow || "") ? flow : "home") as Page };
}
export default function LearnerWorkspace({ mobile = false, answers }: { mobile?: boolean; answers?: Answers }) {
  const [clock] = useState(() => new Date()), [now, setNow] = useState(clock), slots = useMemo(() => createSlots(clock), [clock]);
  const [bookings, setBookings] = useState<Booking[]>([]), [storageError, setStorageError] = useState("");
  const catalog = useMemo(() => teachers.map(teacher => ({ ...teacher, reviews: [...teacher.reviews, ...bookings.filter(booking => booking.teacherId === teacher.id && booking.review).map(booking => ({ id: `own-${booking.id}`, author: "You", rating: booking.review!.rating, text: booking.review!.text, date: booking.review!.date.slice(0, 10) }))] })), [bookings]);
  const [filters, setFilters] = useState<SearchFilters>(() => ({ language: answers?.learningLanguages[0], formats: answers ? learningFormatsFor(answers) as LessonFormat[] : [], day: "Any day" }));
  const [sort, setSort] = useState<SortOption>("Soonest available"), [route, setRoute] = useState<Route>(initialRoute), [history, setHistory] = useState<Route[]>([]);
  const [mobileRoot, setMobileRoot] = useState({ route: initialRoute(), key: 0 });
  const keyboard = useKeyboard();
  const refresh = () => { try { setBookings(readBookings(fixtureBookings(clock))); setStorageError(""); } catch (reason) { setStorageError(reason instanceof Error ? reason.message : "Bookings couldn’t be loaded. Please reload to try again."); } };
  useEffect(() => { refresh(); return subscribeBookings(refresh); }, [clock]);
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 15000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { document.title = mobile ? "Mimo · Learner mobile" : "Mimo · Learning workspace"; }, [mobile]);
  const navigate: Navigate = (next, replace = false) => { keyboard.hide(); if (replace) setHistory([]); else setHistory(current => [...current, route]); setRoute(next); };
  const setRoot: Navigate = next => { keyboard.hide(); setMobileRoot(current => ({ route: next, key: current.key + 1 })); };
  const back = () => { keyboard.hide(); setRoute(history.at(-1) || { page: "home" }); setHistory(current => current.slice(0, -1)); };
  return <Learner.Provider value={{ mobile, answers, now, slots, bookings, catalog, filters, setFilters, sort, setSort, refresh, storageError, setRoot }}><LearnerPresentation.Provider value={mobile}><div className={`learner-workspace ${mobile ? "learner-mobile" : "learner-web"}`}><WorkspaceDesign />{mobile ? <FlowStack key={mobileRoot.key} initial={screenFor(mobileRoot.route)} /> : <><aside className="lw-sidebar lw-cal-sidebar">
      <button className="lw-account-button" aria-label="Your profile" onClick={() => navigate({ page: "profile" })}>
        <LearnerAvatar name={answers?.name || "Alex"} />
        <span><strong>{answers?.name || "Alex"}</strong></span><Icon name="down" size={15} />
      </button>
      <Navigation route={route} navigate={navigate} />
      <div className="lw-sidebar-bottom"><a href="/?view=web"><Icon name="back" size={17} />Replay onboarding</a></div>
    </aside><div className="lw-web-main"><Toolbar route={route} navigate={navigate} back={back} canGoBack={history.length > 0} /><main className="lw-content" key={JSON.stringify(route)}>{storageError && <ErrorMessage>{storageError}</ErrorMessage>}<PageContent route={route} navigate={navigate} /></main></div></>}{mobile && storageError && <div className="lw-storage-error" role="alert">{storageError}</div>}</div></LearnerPresentation.Provider></Learner.Provider>;
}
