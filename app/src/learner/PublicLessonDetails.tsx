import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Button, Panel } from "./components";
import { Icon } from "../teacher/icons";
import type { Teacher } from "./model";
import type { PublicLesson } from "./public-lessons";
import "./public-lesson.css";

type Tab = "overview" | "curriculum";
const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "curriculum", label: "Curriculum" },
];
const currency = new Intl.NumberFormat("en-IE", {
  style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 2,
});

export type PublicLessonDetailsProps = {
  lesson: PublicLesson;
  teacher: Teacher;
  onBook: () => void;
  onMessage: () => void;
  onBack: () => void;
};

export default function PublicLessonDetails({ lesson, teacher, onBook, onMessage, onBack }: PublicLessonDetailsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const changeTabWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length
      : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length
      : event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : null;
    if (next === null) return;
    event.preventDefault();
    setActiveTab(tabs[next].id);
    tabRefs.current[next]?.focus();
  };
  return (
    <div className="public-lesson-details">
      <div className="pld-back"><Button secondary static icon="back" onClick={onBack}>Back to teacher profile</Button></div>
      <header className="pld-hero">
        <div className="pld-introduction">
          <p className="pld-meta">{lesson.language} <span aria-hidden="true">·</span> {lesson.level} <span aria-hidden="true">·</span> One-to-one</p>
          <h1>{lesson.title}</h1>
          <p className="pld-byline">With {teacher.name} <span aria-hidden="true">·</span> {lesson.modules.length} modules <span aria-hidden="true">·</span> {lesson.minutes} min</p>
        </div>
        <div className="pld-cover" aria-hidden="true">
          <span className="pld-cover-level">{lesson.level}</span>
          <span className="pld-cover-greeting">Bonjour !</span>
          <img src="/assets/lessons/cafe-book.svg" alt="" aria-hidden="true" draggable={false} />
        </div>
      </header>
      <div className="pld-layout">
        <Panel className="pld-content">
          <div role="tablist" aria-label="Lesson details" className="pld-tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                ref={element => { tabRefs.current[index] = element; }}
                type="button"
                role="tab"
                id={`${id}-${tab.id}-tab`}
                aria-selected={activeTab === tab.id}
                aria-controls={`${id}-${tab.id}-panel`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={event => changeTabWithKeyboard(event, index)}
              >{tab.label}</button>
            ))}
          </div>
          <section
            role="tabpanel"
            id={`${id}-overview-panel`}
            aria-labelledby={`${id}-overview-tab`}
            hidden={activeTab !== "overview"}
            tabIndex={0}
            className="pld-tabpanel pld-overview"
          >
            <h2>A conversation you can use.</h2>
            <p>{lesson.description}</p>
            <ul className="pld-outcomes">
              {lesson.outcomes.map(outcome => <li key={outcome}><Icon name="check" size={16} /><span>{outcome}</span></li>)}
            </ul>
          </section>
          <section
            role="tabpanel"
            id={`${id}-curriculum-panel`}
            aria-labelledby={`${id}-curriculum-tab`}
            hidden={activeTab !== "curriculum"}
            tabIndex={0}
            className="pld-tabpanel pld-curriculum"
          >
            <h2>Small steps, useful words.</h2>
            <p className="pld-curriculum-total">{lesson.modules.length} modules · {lesson.modules.reduce((sum, module) => sum + module.blockCount, 0)} blocks · {lesson.minutes} minutes</p>
            <ol className="pld-modules">
              {lesson.modules.map((module, index) => {
                const contents = <>
                  <span className="pld-module-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="pld-module-name"><strong>{module.title}</strong><span>{module.blockCount} {module.blockCount === 1 ? "block" : "blocks"}</span></span>
                  <span className="pld-module-duration">{module.minutes} min</span>
                </>;
                return <li key={module.id}>
                  {module.preview ? (
                    <details className="pld-module-preview" open>
                      <summary className="pld-module-row" aria-label={`Preview ${module.title} module`}>{contents}<Icon name="down" size={16} /></summary>
                      <div className="pld-preview-block"><Icon name="book" size={16} /><span>{module.preview}</span></div>
                    </details>
                  ) : <div className="pld-module-row">{contents}<span className="pld-module-icon-space" aria-hidden="true" /></div>}
                </li>;
              })}
            </ol>
          </section>
        </Panel>
        <aside className="pld-booking" aria-label="Book a one-to-one lesson">
          <Panel className="pld-booking-card">
            <h2>One-to-one lesson</h2>
            <p className="pld-price"><strong>{currency.format(teacher.rate)}</strong><span>/ {teacher.duration} min lesson</span></p>
            <dl className="pld-booking-facts">
              <div><dt>Teacher</dt><dd>{teacher.name}</dd></div>
              <div><dt>Lesson material</dt><dd>{lesson.minutes} min</dd></div>
            </dl>
            <div className="pld-booking-actions">
              <Button onClick={onBook}>Book a lesson</Button>
              <Button secondary icon="message" onClick={onMessage}>Ask your teacher</Button>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
