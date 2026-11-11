import { useId, useRef, useState } from "react";
import { Icon } from "../teacher/icons";
import { Button, Panel } from "./components";
import { curriculumSummary, publicLessonFor } from "./curriculum";
import type { Teacher } from "./model";

export type LessonSection = "overview" | "curriculum";
type Props = { teacher: Teacher; onOpen: (section: LessonSection) => void; onMessage: () => void };

export function TeacherLessons({ teacher, onOpen, onMessage }: Props) {
  const lesson = publicLessonFor(teacher.id);
  if (!lesson) return <Panel className="lw-public-lessons"><h2>Lessons & curriculum</h2><p>No lesson outlines published yet. Ask {teacher.name.split(" ")[0]} about the topics you’d like to work on.</p><Button secondary icon="message" onClick={onMessage}>Ask about lessons</Button></Panel>;
  const summary = curriculumSummary(lesson);
  return <Panel className="lw-public-lessons">
    <h2>Lessons & curriculum</h2>
    <div className="lw-public-lesson-heading">
      <div className="lw-lesson-cover-mini" aria-hidden="true"><Icon name="book" size={28} /><span>{lesson.greeting}</span></div>
      <div><p className="lw-muted">{lesson.language} · {lesson.level}</p><h3>{lesson.title}</h3><p className="lw-muted">{summary.modules} modules · {summary.blocks} blocks · {summary.minutes} min</p></div>
    </div>
    <p>{lesson.description}</p>
    <div className="lw-inline-actions"><Button onClick={() => onOpen("overview")}>View lesson details</Button><Button secondary icon="book" onClick={() => onOpen("curriculum")}>View curriculum</Button></div>
  </Panel>;
}

export default function LessonCurriculum({ teacher, initialSection = "overview", onBook, onMessage }: {
  teacher: Teacher; initialSection?: LessonSection; onBook: () => void; onMessage: () => void;
}) {
  const lesson = publicLessonFor(teacher.id)!;
  const [section, setSection] = useState<LessonSection>(initialSection);
  const id = useId(), tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const summary = curriculumSummary(lesson);
  return <>
    <div className="lw-public-lesson-hero">
      <div className="lw-lesson-cover" aria-hidden="true"><span>{lesson.greeting}</span><Icon name="book" size={52} /></div>
      <div className="lw-public-lesson-title"><p className="lw-muted">{lesson.language} · {lesson.level} · One-to-one</p><h1>{lesson.title}</h1><p>With {teacher.name} · {summary.modules} modules · {summary.minutes} min</p></div>
    </div>
    <div className="lw-curriculum-tabs" role="tablist" aria-label="Lesson information">
      {(["overview", "curriculum"] as const).map((value, index) => <button key={value} ref={element => { tabs.current[index] = element; }} role="tab" id={`${id}-${value}-tab`} aria-selected={section === value} aria-controls={`${id}-${value}`} tabIndex={section === value ? 0 : -1} onClick={() => setSection(value)} onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
        setSection(next === 0 ? "overview" : "curriculum"); tabs.current[next]?.focus();
      }}>{value === "overview" ? "Overview" : "Curriculum"}</button>)}
    </div>
    <div className="lw-two-columns lw-lesson-details-layout">
      <div className="lw-stack">
        <section role="tabpanel" id={`${id}-overview`} aria-labelledby={`${id}-overview-tab`} hidden={section !== "overview"} tabIndex={0}>
          <Panel className="lw-lesson-overview"><h2>A conversation you can use.</h2><p>{lesson.description}</p><h3>What you’ll learn</h3><ul className="lw-lesson-goals">{lesson.goals.map(goal => <li key={goal}><Icon name="check" size={18} /><span>{goal}</span></li>)}</ul></Panel>
        </section>
        <section role="tabpanel" id={`${id}-curriculum`} aria-labelledby={`${id}-curriculum-tab`} hidden={section !== "curriculum"} tabIndex={0}>
          <div className="lw-curriculum-intro"><h2>Small steps, useful words.</h2><p className="lw-muted">{summary.modules} modules · {summary.blocks} blocks · {summary.minutes} minutes</p></div>
          <div className="lw-curriculum-modules">{lesson.modules.map((module, index) => <details key={module.title} className="lw-curriculum-module" open={index === 0}>
            <summary><span className="lw-module-number">{String(index + 1).padStart(2, "0")}</span><span><strong>{module.title}</strong><small>{module.blocks.length} {module.blocks.length === 1 ? "block" : "blocks"} · {module.minutes} min</small></span><Icon name="down" size={18} /></summary>
            <ul>{module.blocks.map((block, blockIndex) => <li key={`${block.title}-${blockIndex}`}><Icon name={block.purpose === "Teach" ? "book" : "text"} size={18} /><span>{block.title}</span><small>{block.purpose}</small></li>)}</ul>
          </details>)}</div>
        </section>
      </div>
      <Panel className="lw-lesson-terms"><h2>Your one-to-one lesson</h2><dl className="lw-facts"><div><dt>Teacher</dt><dd>{teacher.name}</dd></div><div><dt>Language & level</dt><dd>{lesson.language} · {lesson.level}</dd></div><div><dt>Lesson format</dt><dd>{teacher.formats.join(" and ")}</dd></div><div><dt>Session duration</dt><dd>{teacher.duration} minutes</dd></div><div><dt>Price per session</dt><dd>€{teacher.rate}</dd></div></dl><Button icon="calendar" onClick={onBook}>Book with {teacher.name.split(" ")[0]}</Button><Button secondary icon="message" onClick={onMessage}>Ask about this lesson</Button></Panel>
    </div>
  </>;
}
