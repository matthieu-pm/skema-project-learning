import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../teacher/icons";
import { useKeyboard } from "../mobile";
import { Button, Empty, ErrorMessage, Panel } from "./components";
import type { Booking } from "./model";
import PreparationActivity from "./PreparationActivity";
import { preparationForBooking, readPreparation, savePreparationBlock, subscribePreparation } from "./preparation";
import "./lesson-preparation.css";

function loadProgress(booking: Booking) {
  try { return { progress: readPreparation(booking), error: "" }; }
  catch (reason) { return { progress: undefined, error: reason instanceof Error ? reason.message : "Your preparation could not be loaded. Try again." }; }
}

export function PreparationSummary({ booking, onOpen }: { booking: Booking; onOpen: () => void }) {
  const preparation = useMemo(() => preparationForBooking(booking), [booking]);
  const [saved, setSaved] = useState(() => preparation ? loadProgress(booking) : undefined);
  useEffect(() => {
    if (!preparation) return;
    const refresh = () => setSaved(loadProgress(booking));
    refresh();
    return subscribePreparation(refresh);
  }, [booking, preparation]);
  if (!preparation) return null;
  const blocks = preparation.course.modules.flatMap(module => module.blocks);
  const complete = blocks.filter(block => saved?.progress?.blocks[block.id]?.completedAt).length;
  return <div className="lp-session-preparation">
    <div><span className="lw-muted">Before your session</span><strong>{preparation.course.title}</strong><span>{saved?.error ? "Your saved preparation is unavailable" : `${complete} of ${blocks.length} activities complete`}</span></div>
    <Button onClick={onOpen} icon="book">{complete === blocks.length ? "Review preparation" : complete ? "Continue preparation" : "Prepare for lesson"}</Button>
  </div>;
}

export default function LessonPreparation({ booking, onBack, onMessage, screenActive = true }: {
  booking: Booking; onBack: () => void; onMessage: () => void; screenActive?: boolean;
}) {
  const preparation = useMemo(() => preparationForBooking(booking), [booking]);
  const [saved, setSaved] = useState(() => preparation ? loadProgress(booking) : { progress: undefined, error: "" });
  const [activeId, setActiveId] = useState<string>();
  const [pending, setPending] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const pendingRef = useRef(0), revision = useRef(0), mounted = useRef(true);
  const heading = useRef<HTMLHeadingElement>(null);
  const keyboard = useKeyboard();
  const progressRef = useRef(saved.progress);
  progressRef.current = saved.progress;
  useEffect(() => {
    mounted.current = true;
    const refresh = () => {
      if (!pendingRef.current && preparation) setSaved(loadProgress(booking));
    };
    const unsubscribe = subscribePreparation(refresh);
    return () => { mounted.current = false; unsubscribe(); };
  }, [booking, preparation]);
  useEffect(() => { if (activeId) heading.current?.focus({ preventScroll: false }); }, [activeId]);

  if (!preparation) return <Empty title={booking.status === "cancelled" ? "This lesson was cancelled" : "No preparation yet"} action={<Button secondary onClick={onBack}>Back to lesson</Button>}>
    {booking.status === "cancelled" ? "Return to your lessons to choose another session." : "Your lesson modules will appear here when your teacher adds them."}
  </Empty>;
  if (!saved.progress) return <Panel className="lw-stack"><h1>Lesson preparation</h1><ErrorMessage>{saved.error}</ErrorMessage><Button onClick={() => setSaved(loadProgress(booking))}>Try again</Button><Button secondary onClick={onBack}>Back to lesson</Button></Panel>;

  const { course } = preparation;
  const openActivity = (id?: string) => { keyboard.hide(); setActiveId(id); };
  const activities = course.modules.flatMap(module => module.blocks.map(block => ({ module, block })));
  const completed = activities.filter(({ block }) => saved.progress!.blocks[block.id]?.completedAt).length;
  const activeIndex = activities.findIndex(({ block }) => block.id === activeId);
  const active = activities[activeIndex];
  const blockState = active ? saved.progress.blocks[active.block.id] : undefined;
  const nextIncomplete = activities.find(({ block }) => !saved.progress!.blocks[block.id]?.completedAt);
  const sessionDate = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(booking.start));

  const persist = async (blockId: string, answers: Record<string, string>, complete: boolean) => {
    const currentRevision = ++revision.current;
    pendingRef.current++;
    if (complete) setSubmitting(true);
    setPending(pendingRef.current);
    setSaveError("");
    if (!complete) setSaved(previous => ({ ...previous, progress: previous.progress && {
      ...previous.progress, blocks: { ...previous.progress.blocks, [blockId]: { answers } },
    } }));
    try {
      const progress = await savePreparationBlock(booking, blockId, answers, complete);
      if (mounted.current && currentRevision === revision.current) setSaved({ progress, error: "" });
    } catch (reason) {
      if (mounted.current && currentRevision === revision.current) setSaveError(reason instanceof Error ? reason.message : "Your answer could not be saved. Please try again.");
    } finally {
      pendingRef.current--;
      if (mounted.current) { setPending(pendingRef.current); if (complete) setSubmitting(false); }
    }
  };

  return <div className="lp-preparation">
    <div className="lp-heading"><div><p className="lw-muted">Before your session · {sessionDate}</p><h1 ref={heading} tabIndex={-1}>{active ? active.block.title : "Prepare for your lesson"}</h1><p>{active ? `${active.module.title} · Activity ${activeIndex + 1} of ${activities.length}` : "A few useful steps before your conversation."}</p></div><button className="lw-text-button" onClick={onBack}>Back to lesson <Icon name="arrow" size={16} /></button></div>
    <Panel className="lp-course-summary"><div><span className="lp-course-icon" aria-hidden="true"><Icon name="book" size={24} /></span><div><h2>{course.title}</h2><p>{course.language} · {course.level} · {course.modules.length} modules · {course.modules.reduce((minutes, module) => minutes + module.minutes, 0)} min</p></div></div><div className="lp-progress"><div><span>{completed} of {activities.length} activities complete</span><strong>{Math.round(completed / activities.length * 100)}%</strong></div><progress aria-label="Preparation progress" value={completed} max={activities.length} /></div></Panel>
    {saveError && <ErrorMessage>{saveError} Your current answer is still here; use the activity action to try saving again.</ErrorMessage>}
    {active ? <>
      <button className="lw-text-button lp-return" onClick={() => openActivity()}><Icon name="back" size={16} />Return to curriculum</button>
      <Panel className="lp-activity-panel">{screenActive && <PreparationActivity key={active.block.id} block={active.block} language={course.language} answers={blockState?.answers || {}} completed={!!blockState?.completedAt} busy={submitting}
        onChange={answers => { void persist(active.block.id, answers, false); }}
        onComplete={() => { void persist(active.block.id, progressRef.current?.blocks[active.block.id]?.answers || {}, true); }} />}</Panel>
      <div className="lp-player-navigation"><Button secondary disabled={activeIndex === 0 || pending > 0} onClick={() => openActivity(activities[activeIndex - 1].block.id)}>Previous activity</Button><span aria-live="polite">{pending ? "Saving…" : blockState?.completedAt ? "Activity complete" : "Complete this activity to continue"}</span>{activeIndex < activities.length - 1 ? <Button disabled={!blockState?.completedAt || pending > 0} onClick={() => openActivity(activities[activeIndex + 1].block.id)}>Next activity</Button> : <Button disabled={!blockState?.completedAt || pending > 0} onClick={() => openActivity()}>Back to curriculum</Button>}</div>
    </> : <>
      <Panel className="lp-start"><div><h2>{completed === activities.length ? "You’re ready for your conversation" : completed ? "Pick up where you left off" : "A little preparation goes a long way"}</h2><p>{completed === activities.length ? "Your preparation is complete. You can revisit any module before your session." : "Explore the examples and try the activities. Your answers are saved as you go."}</p></div><Button onClick={() => openActivity((nextIncomplete || activities[0]).block.id)}>{completed === activities.length ? "Review activities" : completed ? "Continue preparation" : "Start preparation"}</Button></Panel>
      <section aria-labelledby="lp-curriculum-title"><div className="lp-section-heading"><h2 id="lp-curriculum-title">Your lesson modules</h2><span className="lw-muted">{course.modules.length} modules</span></div><ol className="lp-module-list">{course.modules.map((module, index) => {
        const done = module.blocks.filter(block => saved.progress!.blocks[block.id]?.completedAt).length;
        const next = module.blocks.find(block => !saved.progress!.blocks[block.id]?.completedAt) || module.blocks[0];
        return <li key={module.id}><span className={`lp-module-number ${done === module.blocks.length ? "is-complete" : ""}`}>{done === module.blocks.length ? <Icon name="check" size={16} /> : String(index + 1).padStart(2, "0")}</span><div className="lp-module-copy"><h3>{module.title}</h3><p>{module.minutes} min · {module.blocks.length} {module.blocks.length === 1 ? "activity" : "activities"}</p><span>{done === module.blocks.length ? "Complete" : done ? `${done} of ${module.blocks.length} complete` : "Not started"}</span></div><Button secondary onClick={() => openActivity(next.id)}>{done === module.blocks.length ? `Review ${module.title}` : done ? `Continue ${module.title}` : `Start ${module.title}`}</Button></li>;
      })}</ol></section>
      <div className="lp-help"><Icon name="message" size={20} /><div><h3>A question before your session?</h3><p>Ask your teacher about anything you want to work on.</p></div><Button secondary onClick={onMessage}>Message teacher</Button></div>
    </>}
  </div>;
}
