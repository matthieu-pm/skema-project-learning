import LocationField from "../LocationField";
import FreeLessonConfirmation from "../FreeLessonConfirmation";
import ProfilePortrait from "../ProfilePortrait";
import {
  isFreeLesson,
  lessonDurations,
  lessonPriceLabel,
  lessonPublicationIssues,
  lessonSettingsReady,
  validLessonSettings,
} from "../lesson-settings";
import ReviewQueue from "./ReviewQueue";
import ModuleResults from "./ModuleResults";
import {
  cloneCourse,
  fromLesson,
  createBlock,
  createModule,
  coursePatch,
  readyTemplates,
  totalMinutes,
  type Course,
} from "./course";
import CourseEditor, { LessonPlayer } from "./CourseEditor";
import { useState, type ReactNode } from "react";
import { CalendarPage } from "./CalendarPage";
import {
  useWorkspace,
  Icon,
  TextField,
  Select,
  Button,
  Badge,
  Avatar,
  Panel,
  PageHeading,
  StudentLine,
  type Navigate,
} from "./components";
import {
  students,
  uid,
  makeBlocks,
  learnerMaterial,
  adaptLesson,
  lessonValid,
  overlaps,
  dateLabel,
  type Route,
  type Lesson,
} from "./model";
const findStudent = (id?: string) =>
  students.find((s) => s.id === id) || students[0];
function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="tw-section-title">
      <h2>{children}</h2>
      {action}
    </div>
  );
}
function Segments({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="tw-segments" role="group">
      {items.map((x) => (
        <button key={x} aria-pressed={x === value} onClick={() => onChange(x)}>
          {x}
        </button>
      ))}
    </div>
  );
}
function Empty({ title, description }: { title: string; description: string }) {
  return (
    <div className="tw-empty">
      <Icon name="book" size={32} />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
function StudentsPage({ navigate }: { navigate: Navigate }) {
  const { sessions, feedbackShared, lessons } = useWorkspace();
  const nextSession = sessions
    .filter((s) => s.status === "Confirmed" && s.date >= "2026-10-10")
    .sort((a, b) =>
      `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
    )[0];
  const request = sessions.find((s) => s.status === "Requested");
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All students");
  const matched = students.filter(
    (s) =>
      (filter === "All students" || s.language === filter) &&
      `${s.name} ${s.language} ${s.goal}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="Students"
        description="Prepare a lesson, review a response, or pick up a conversation."
      />
      <div className="tw-students-dashboard">
        <div className="tw-dashboard-main">
          <SectionTitle>Your next session</SectionTitle>
          <Panel className="tw-next-session">
            <div className="tw-next-copy">
              <h2>
                {nextSession ? (
                  <>
                    A conversation with{" "}
                    {findStudent(nextSession.studentId).name.split(" ")[0]}
                  </>
                ) : (
                  <>
                    A little space
                    <br />
                    for your next lesson
                  </>
                )}
              </h2>
              <p>
                <Icon name="clock" size={17} />
                {nextSession
                  ? `${dateLabel(nextSession.date)} · ${nextSession.time} · ${nextSession.format}`
                  : "Your schedule is clear"}
              </p>
              <Button
                onClick={() =>
                  navigate(
                    nextSession
                      ? { page: "session", id: nextSession.id }
                      : { page: "schedule" },
                  )
                }
                icon="arrow"
              >
                {nextSession ? "View session" : "View schedule"}
              </Button>
            </div>
          </Panel>

          <SectionTitle
            action={
              <button
                className="tw-text-link"
                onClick={() => navigate({ page: "modules" })}
              >
                Ongoing modules <Icon name="arrow" size={16} />
              </button>
            }
          >
            Your students <span className="tw-count">4</span>
          </SectionTitle>
          <div className="tw-filter-bar">
            <TextField
              label="Search students"
              value={query}
              onChange={setQuery}
              placeholder="Find a name, language, or goal"
            />
            <Segments
              items={["All students", "French", "English"]}
              value={filter}
              onChange={setFilter}
            />
          </div>
          <div className="tw-student-grid">
            {matched.map((s) => (
              <button
                className="tw-student-card"
                key={s.id}
                onClick={() => navigate({ page: "student", id: s.id })}
              >
                <div className="tw-student-card-head">
                  <Avatar id={s.id} />
                  <Icon name="arrow" size={19} />
                </div>
                <h2>{s.name}</h2>
                <span className="tw-subtle">
                  {s.language} <span>·</span> {s.level}
                </span>
                <p>{s.goal}</p>
                <div className="tw-card-bottom">
                  <Icon name="calendar" size={16} />
                  <span>
                    {(() => {
                      const next = sessions
                        .filter(
                          (session) =>
                            session.studentId === s.id &&
                            session.status === "Confirmed" &&
                            session.date >= "2026-10-10",
                        )
                        .sort((a, b) =>
                          `${a.date}${a.time}`.localeCompare(
                            `${b.date}${b.time}`,
                          ),
                        )[0];
                      return next
                        ? `${dateLabel(next.date)} · ${next.time}`
                        : sessions.some(
                              (session) =>
                                session.studentId === s.id &&
                                session.status === "Requested",
                            )
                          ? "Meeting request"
                          : "No upcoming session";
                    })()}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {matched.length === 0 && (
            <Empty
              title="No students found"
              description="Try another name or choose all students."
            />
          )}
        </div>
        <aside className="tw-dashboard-aside">
          {" "}
          <Panel className="tw-follow-up">
            <SectionTitle>To pick up</SectionTitle>
            <button
              className="tw-task-row"
              onClick={() => navigate({ page: "submission", id: "maya" })}
            >
              <span className="tw-task-icon lilac">
                <Icon name="book" />
              </span>
              <div>
                <strong>Feedback for Maya</strong>
                <span>
                  {feedbackShared
                    ? "Feedback shared"
                    : "One short response to review"}
                </span>
              </div>
              <Icon name="arrow" size={17} />
            </button>
            <button
              className="tw-task-row"
              onClick={() => navigate({ page: "recap", id: "s5" })}
            >
              <span className="tw-task-icon peach">
                <Icon name="message" />
              </span>
              <div>
                <strong>Léa’s lesson recap</strong>
                <span>
                  {sessions.find((s) => s.id === "s5")?.recapShared
                    ? "Shared"
                    : "Ready for your final check"}
                </span>
              </div>
              <Icon name="arrow" size={17} />
            </button>
            <button
              className="tw-task-row"
              onClick={() =>
                navigate(
                  request
                    ? { page: "session", id: request.id }
                    : { page: "schedule" },
                )
              }
            >
              <span className="tw-task-icon blue">
                <Icon name="calendar" />
              </span>
              <div>
                <strong>
                  {request
                    ? `A request from ${findStudent(request.studentId).name.split(" ")[0]}`
                    : "Meetings up to date"}
                </strong>
                <span>
                  {request
                    ? `${dateLabel(request.date)} · ${request.time} · ${request.format}`
                    : "View your schedule"}
                </span>
              </div>
              <Icon name="arrow" size={17} />
            </button>
          </Panel>
          <Panel className="tw-library-summary">
            <span className="tw-small-art">
              <Icon name="book" size={30} />
            </span>
            <h2>Make your next lesson yours.</h2>
            <p>Start with a reusable idea. Adapt it for one person.</p>
            <span className="tw-library-count">
              {lessons.filter((l) => !l.studentId && !l.archived).length}{" "}
              reusable lessons in your library
            </span>
            <Button
              kind="secondary"
              onClick={() => navigate({ page: "lessons", tab: "Library" })}
            >
              Explore your library
            </Button>
          </Panel>
          <Panel className="tw-week-summary">
            <SectionTitle>This week</SectionTitle>
            <div className="tw-week-stat">
              <Icon name="calendar" size={22} />
              <div>
                <strong>
                  {
                    sessions.filter(
                      (s) =>
                        s.status === "Confirmed" &&
                        s.date >= "2026-10-05" &&
                        s.date <= "2026-10-11",
                    ).length
                  }{" "}
                  upcoming sessions
                </strong>
                <span>One teacher. One learner.</span>
              </div>
            </div>
            <Button kind="quiet" onClick={() => navigate({ page: "schedule" })}>
              View schedule <Icon name="arrow" size={16} />
            </Button>
          </Panel>
        </aside>
      </div>

    </>
  );
}
function StudentPage({ id, navigate }: { id?: string; navigate: Navigate }) {
  const s = findStudent(id);
  const { lessons, sessions } = useWorkspace();
  return (
    <>
      <div className="tw-profile-hero">
        <Avatar id={s.id} size="large" />
        <div>
          <h1>{s.name}</h1>
          <p>
            {s.language} · {s.level}
          </p>
        </div>
        <Button
          kind="secondary"
          icon="message"
          onClick={() => navigate({ page: "messages", id: s.id })}
        >
          Message
        </Button>
      </div>
      <div className="tw-columns">
        <div>
          <Panel className="tw-goal-panel">
            <Badge tone="orange">In their own words</Badge>
            <h2>“{s.goal}”</h2>
            <p>Current focus: {s.focus}</p>
            <Button
              icon="plus"
              onClick={() =>
                navigate({ page: "lessons", id: s.id, tab: "Library" })
              }
            >
              Prepare a lesson
            </Button>
          </Panel>
          <SectionTitle>Ongoing modules</SectionTitle>
          {lessons
            .filter(
              (l) =>
                l.studentId === s.id || l.publishedEditor?.studentId === s.id,
            )
            .map((l) => (
              <LessonCard key={l.id} lesson={l} navigate={navigate} />
            ))}
          {!lessons.some(
            (l) =>
              l.studentId === s.id || l.publishedEditor?.studentId === s.id,
          ) && (
            <Panel>
              <p>
                No learner-specific lesson yet. Start with a saved lesson and
                make it their own.
              </p>
            </Panel>
          )}
          <Button
            kind="quiet"
            onClick={() => navigate({ page: "results", id: s.id })}
          >
            Open module results
          </Button>
        </div>
        <div>
          <Panel>
            <SectionTitle>Learning notes</SectionTitle>
            <p>A comfortable pace, a practical goal, and room to try again.</p>
            <div className="tw-detail-row">
              <span>Goal</span>
              <strong>{s.focus}</strong>
            </div>
            <div className="tw-detail-row">
              <span>Feedback</span>
              <strong>Private, from you</strong>
            </div>
          </Panel>
          <SectionTitle>Sessions</SectionTitle>
          {sessions
            .filter((x) => x.studentId === s.id)
            .map((x) => (
              <button
                className="tw-session-row"
                key={x.id}
                onClick={() => navigate({ page: "session", id: x.id })}
              >
                <div className="tw-date-icon">
                  <Icon name={x.format === "Online" ? "video" : "pin"} />
                </div>
                <div>
                  <strong>
                    {dateLabel(x.date)} · {x.time}
                  </strong>
                  <span>
                    {x.duration} minutes · {x.status}
                  </span>
                </div>
                <Icon name="arrow" size={17} />
              </button>
            ))}
          {s.id === "maya" && (
            <Button
              kind="secondary"
              onClick={() => navigate({ page: "submission", id: s.id })}
            >
              Review submitted work
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
function ModulesPage({ navigate }: { navigate: Navigate }) {
  const { lessons } = useWorkspace();
  const [view, setView] = useState("Review queue");
  const [studentId, setStudentId] = useState(students[0].id);
  const student = findStudent(studentId);
  const assigned = lessons.filter(
    (l) =>
      !l.archived &&
      (l.studentId === studentId || l.publishedEditor?.studentId === studentId),
  );
  return (
    <>
      <PageHeading
        title="Ongoing modules"
        description="Review student work or find their assigned lessons."
      />
      <div className="tw-module-views" aria-label="Ongoing module views">
        <Segments
          items={["Review queue", "Lessons by student"]}
          value={view}
          onChange={setView}
        />
      </div>
      <div hidden={view !== "Review queue"}>
        <ReviewQueue navigate={navigate} />
      </div>
      {view === "Lessons by student" && (
        <>
          <Panel>
            <SectionTitle>Lessons by student</SectionTitle>
            <Select
              label="Select student"
              value={studentId}
              onChange={setStudentId}
              options={students.map((s) => ({ value: s.id, label: s.name }))}
            />
            <StudentLine id={student.id} />
            <p>{student.goal}</p>
            {assigned.length ? (
              assigned.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  navigate={navigate}
                />
              ))
            ) : (
              <p className="tw-module-empty">
                No lessons assigned yet. Prepare a lesson for this student to
                get started.
              </p>
            )}
            <div className="tw-actions">
              <Button
                kind="secondary"
                onClick={() => navigate({ page: "results", id: student.id })}
              >
                Module results
              </Button>
              <Button
                kind="quiet"
                onClick={() =>
                  navigate({ page: "lessons", id: student.id, tab: "Library" })
                }
              >
                Prepare lesson
              </Button>
            </div>
          </Panel>
        </>
      )}
    </>
  );
}
function ResultsPage({
  id,
  selected,
  navigate,
}: {
  id?: string;
  selected?: string;
  navigate: Navigate;
}) {
  const s = findStudent(id);
  const { lessons, updateLesson, setLessons, setNotice } = useWorkspace();
  const l = lessons.find((l) => l.studentId === s.id);
  const [points, setPoints] = useState(l?.outcome || s.focus);
  return (
    <>
      <PageHeading
        title="Module results"
        description="Review completed blocks and give feedback on each response."
      />
      <StudentLine id={s.id} />
      <ModuleResults
        key={`${s.id}-${selected || ""}`}
        studentId={s.id}
        selected={selected}
        navigate={navigate}
      />
      <Panel>
        <TextField
          label="Module learning points"
          value={points}
          onChange={setPoints}
          multiline
        />
        <div className="tw-actions">
          <Button
            disabled={points.trim().length < 5}
            onClick={() => {
              if (l) updateLesson(l.id, { outcome: points, status: "Draft" });
              else
                setLessons((ls) => [
                  ...ls,
                  {
                    id: uid(),
                    title: `${s.name.split(" ")[0]}’s next conversation`,
                    outcome: points,
                    language: s.language,
                    level: s.level,
                    blocks: makeBlocks(),
                    notes: "",
                    studentId: s.id,
                    status: "Draft",
                    archived: false,
                  },
                ]);
              setNotice(
                "Student module updated. Previous session notes are preserved.",
              );
              navigate({ page: "student", id: s.id });
            }}
          >
            Update student module
          </Button>
          <Button
            kind="secondary"
            onClick={() => navigate({ page: "student", id: s.id })}
          >
            Continue with lesson
          </Button>
        </div>
      </Panel>
    </>
  );
}
function MessagesPage({ id, navigate }: { id?: string; navigate: Navigate }) {
  const { messages, messageDrafts, setMessageDrafts, setMessages, attempt } =
    useWorkspace();
  const s = findStudent(id);
  return (
    <>
      <PageHeading
        title="Messages"
        description="Private messages with your learners."
      />
      {!id ? (
        <div className="tw-inbox">
          {students.map((s) => (
            <button
              key={s.id}
              className="tw-message-row"
              onClick={() => navigate({ page: "messages", id: s.id })}
            >
              <Avatar id={s.id} />
              <div>
                <strong>{s.name}</strong>
                <p>
                  {messageDrafts[s.id]
                    ? `Draft: ${messageDrafts[s.id]}`
                    : messages[s.id]?.at(-1)?.body || "Start a conversation"}
                </p>
              </div>
              <Icon name="arrow" size={17} />
            </button>
          ))}
        </div>
      ) : (
        <>
          <StudentLine id={s.id} />
          <Panel className="tw-conversation">
            <div className="tw-messages">
              {(messages[s.id] || []).map((m, i) => (
                <div className={`tw-message ${m.mine ? "mine" : ""}`} key={i}>
                  <p>{m.body}</p>
                  <span>
                    {m.mine ? "Sent" : s.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
            <TextField
              label={`Message ${s.name.split(" ")[0]}`}
              value={messageDrafts[s.id] || ""}
              onChange={(v) => setMessageDrafts((d) => ({ ...d, [s.id]: v }))}
              multiline
              placeholder="Write a thoughtful reply…"
            />
            <div className="tw-actions">
              <Button
                disabled={!messageDrafts[s.id]?.trim()}
                onClick={() =>
                  attempt(() => {
                    setMessages((m) => ({
                      ...m,
                      [s.id]: [
                        ...(m[s.id] || []),
                        { body: messageDrafts[s.id].trim(), mine: true },
                      ],
                    }));
                    setMessageDrafts((d) => ({ ...d, [s.id]: "" }));
                  }, "Message saved.")
                }
              >
                Send message
              </Button>
              <Badge tone="gray">
                Only {s.name.split(" ")[0]} can see this
              </Badge>
            </div>
          </Panel>
        </>
      )}
    </>
  );
}
function SubmissionPage({
  id,
  navigate,
  preview = false,
}: {
  id?: string;
  navigate: Navigate;
  preview?: boolean;
}) {
  const s = findStudent(id || "maya");
  const { feedback, setFeedback, feedbackShared, setFeedbackShared, attempt } =
    useWorkspace();
  return (
    <>
      <PageHeading
        title={
          preview
            ? "Your feedback, before sharing"
            : "A little feedback goes a long way"
        }
        description={`${s.name} · A short written response`}
      />
      <StudentLine id={s.id} />
      <Panel>
        <Badge tone="orange">Learner submission</Badge>
        <h2>Present an idea for a team meeting</h2>
        <blockquote>
          “À mon avis, nous devrions organiser une réunion plus courte parce que
          nous avons beaucoup de travail. Par exemple, vingt minutes chaque
          lundi.”
        </blockquote>
        <p className="tw-subtle">Submitted · Written response</p>
      </Panel>
      <Panel>
        {preview ? (
          <>
            <h2>Your feedback</h2>
            <p className="tw-preserve">{feedback}</p>
            <div className="tw-actions">
              <Button
                onClick={() =>
                  attempt(
                    () => setFeedbackShared(true),
                    "Private feedback shared.",
                  )
                }
                disabled={feedbackShared}
              >
                {feedbackShared
                  ? "Feedback shared"
                  : "Confirm & share feedback"}
              </Button>
              <Button
                kind="secondary"
                onClick={() => navigate({ page: "submission", id: s.id })}
              >
                Keep editing
              </Button>
            </div>
          </>
        ) : (
          <>
            <TextField
              label="Your private feedback"
              value={feedback}
              onChange={(v) => {
                setFeedback(v);
                setFeedbackShared(false);
              }}
              multiline
              placeholder="What worked? What’s one useful thing to try next?"
            />
            <Button
              disabled={feedback.trim().length < 5}
              onClick={() => navigate({ page: "feedback-preview", id: s.id })}
            >
              Review feedback
            </Button>
            <p className="tw-subtle">
              You make the final assessment. No AI evaluation is used.
            </p>
          </>
        )}
      </Panel>
    </>
  );
}
function LessonCard({
  lesson: l,
  navigate,
}: {
  lesson: Lesson;
  navigate: Navigate;
}) {
  const recipient = l.publishedEditor?.studentId || l.studentId;
  const s = recipient ? findStudent(recipient) : null;
  return (
    <article className="tw-lesson-card">
      <div className="tw-lesson-card-body">
        <div className="tw-lesson-meta">
          <span>
            {l.language} · {l.level}
          </span>
          <Badge
            tone={
              l.status === "Draft"
                ? "gray"
                : l.status === "Shared"
                  ? "green"
                  : "blue"
            }
          >
            {l.status}
          </Badge>
        </div>
        <h2>{l.title}</h2>
        <p>{l.outcome}</p>
        <div className="tw-lesson-footer">
          <span>
            {l.course
              ? `${l.course.modules.length} modules · ${l.course.modules.reduce((n, m) => n + m.blocks.length, 0)} blocks`
              : `${l.blocks.length} blocks`}{" "}
            ·{" "}
            {l.course
              ? totalMinutes(l.course)
              : l.blocks.reduce((n, b) => n + b.minutes, 0)}{" "}
            min
            {s ? ` · ${s.name.split(" ")[0]}` : ""}
          </span>
          <button
            className="tw-icon-button"
            aria-label={`Edit ${l.title}`}
            onClick={() => navigate({ page: "editor", id: l.id })}
          >
            <Icon name="arrow" size={19} />
          </button>
        </div>
      </div>
    </article>
  );
}
function LessonsPage({
  route,
  navigate,
}: {
  route: Route;
  navigate: Navigate;
}) {
  const {
    lessons,
    setLessons,
    updateLesson,
    setNotice,
    templates: savedTemplates,
  } = useWorkspace();
  const [tab, setTab] = useState(route.tab || "Library"),
    [query, setQuery] = useState("");
  const learner = route.id ? findStudent(route.id) : null;
  const create = (template?: Course) => {
    const id = uid();
    const course = template ? cloneCourse(template) : undefined;
    setLessons((ls) => [
      ...ls,
      {
        id,
        title: course?.title || "",
        outcome: learner?.goal || "",
        language: learner?.language || "French",
        level: learner?.level || "A2",
        blocks: [],
        ...(course ? coursePatch(course) : {}),
        notes: "",
        studentId: learner?.id,
        status: "Draft",
        archived: false,
      },
    ]);
    navigate({ page: "editor", id });
  };
  const list = lessons.filter(
    (l) =>
      (!learner || !l.studentId || l.studentId === learner.id) &&
      (tab === "Archive" ? l.archived : !l.archived) &&
      (tab !== "Module editor" || l.status === "Draft") &&
      `${l.title} ${l.language}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title={
          learner
            ? `Make it personal for ${learner.name.split(" ")[0]}`
            : "Lesson library"
        }
        description={
          learner
            ? `Goal: ${learner.goal}`
            : "Keep what works. Adapt it for the person in front of you."
        }
        action={
          <Button icon="plus" onClick={() => create()}>
            New lesson
          </Button>
        }
      />
      <Segments
        items={["Library", "Module editor", "Templates", "Archive"]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Templates" ? (
        <>
          <div className="tw-template-intro">
            <div>
              <h2>Lesson templates</h2>
              <p>Short, editable activities. You bring the teaching.</p>
            </div>
          </div>
          <div className="tw-lesson-grid">
            {[...readyTemplates(), ...savedTemplates].map((template, i) => (
              <Panel key={template.id} className="tw-template-card">
                <span
                  className={`tw-template-icon ${["peach", "blue", "lilac"][i % 3]}`}
                >
                  <Icon name="book" size={30} />
                </span>
                <Badge>
                  {template.own ? "Your template" : "Ready-made"} ·{" "}
                  {template.level}
                </Badge>
                <h2>{template.name}</h2>
                <p>{template.content.goal}</p>
                <Button
                  kind="secondary"
                  onClick={() => create(template.content)}
                >
                  Use template
                </Button>
              </Panel>
            ))}
          </div>
        </>
      ) : (
        <>
          <TextField
            label="Search lessons"
            value={query}
            onChange={setQuery}
            placeholder="A topic, title, or language"
          />
          <div className="tw-lesson-grid">
            {list.map((l) => (
              <div key={l.id}>
                <LessonCard lesson={l} navigate={navigate} />
                <div className="tw-small-actions">
                  {learner && (
                    <Button
                      kind="secondary"
                      onClick={() => {
                        const id = uid();
                        setLessons((ls) => [
                          ...ls,
                          { ...adaptLesson(l, learner), id },
                        ]);
                        navigate({ page: "editor", id });
                      }}
                    >
                      Adapt for {learner.name.split(" ")[0]}
                    </Button>
                  )}
                  <button
                    className="tw-text-link"
                    onClick={() => {
                      updateLesson(l.id, { archived: !l.archived });
                      setNotice(
                        l.archived
                          ? "Lesson restored to library."
                          : "Lesson archived. Session versions are preserved.",
                      );
                    }}
                  >
                    {l.archived ? "Restore" : "Archive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {list.length === 0 && (
            <Empty
              title="A fresh page"
              description="Create a short lesson or try another search."
            />
          )}
        </>
      )}
    </>
  );
}
function EditorPage({ id, navigate }: { id?: string; navigate: Navigate }) {
  return <CourseEditor id={id} navigate={navigate} />;
}
function LessonPreview({
  id,
  navigate,
  sessionId,
}: {
  id?: string;
  navigate: Navigate;
  sessionId?: string;
}) {
  const { mobile, lessons, sessions, updateLesson, attempt } = useWorkspace();
  const l =
    (sessionId
      ? sessions.find((s) => s.id === sessionId)?.lessonSnapshot
      : undefined) || lessons.find((l) => l.id === id)!;
  if (!l) return null;
  if (l.course || mobile)
    return (
      <div className="ce-preview-screen">
        <LessonPlayer course={l.course || fromLesson(l)} fitMobile />
        {!mobile && <p className="tw-subtle">Student preview · Private teaching notes are excluded.</p>}
        <Button
          kind="secondary"
          onClick={() =>
            navigate(
              sessionId
                ? { page: "session", id: sessionId }
                : { page: "editor", id: l.id },
            )
          }
        >
          {sessionId ? "Back to session" : "Back to editor"}
        </Button>
      </div>
    );
  return (
    <>
      <PageHeading
        title="Student preview"
        description={
          l.studentId
            ? `Visible to ${findStudent(l.studentId).name} when you share.`
            : "Review the reusable lesson before saving."
        }
      />
      {l.course ? (
        <LessonPlayer course={l.course} />
      ) : (
        <Panel className="tw-learner-preview">
          <Badge tone="orange">
            {l.language} · {l.level}
          </Badge>
          <h2>{l.title}</h2>
          <p>{l.outcome}</p>
          {l.blocks.map((b, i) => (
            <section className="tw-preview-block" key={b.id}>
              <span>
                {String(i + 1).padStart(2, "0")} · {b.type} · {b.minutes} min
              </span>
              <h3>{b.title}</h3>
              <p className="tw-preserve">{b.content}</p>
            </section>
          ))}
        </Panel>
      )}
      <p className="tw-subtle">
        Private teaching notes are excluded. Nothing is shared by previewing.
      </p>
      <div className="tw-actions">
        {!sessionId && (
          <>
            <Button
              disabled={!lessonValid(l)}
              onClick={() =>
                attempt(
                  () => updateLesson(l.id, { status: "Approved" }),
                  "Lesson approved for use.",
                )
              }
            >
              {l.status === "Draft"
                ? "Approve lesson"
                : "Approved for teaching"}
            </Button>
            {l.studentId && (
              <Button
                disabled={l.status === "Draft"}
                kind="secondary"
                onClick={() => navigate({ page: "share", id: l.id })}
              >
                Share with learner
              </Button>
            )}
            <Button
              kind="secondary"
              onClick={() => navigate({ page: "editor", id: l.id })}
            >
              Keep editing
            </Button>
          </>
        )}
      </div>
      {!sessionId && !l.studentId && (
        <Panel>
          <h2>Ready to make it personal?</h2>
          <p>
            Choose one learner to create a separate version. Your reusable
            lesson stays in the library.
          </p>
          <div className="tw-learner-choices">
            {students.map((s) => (
              <AdaptButton
                key={s.id}
                lesson={l}
                studentId={s.id}
                navigate={navigate}
              />
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}
function AdaptButton({
  lesson,
  studentId,
  navigate,
}: {
  lesson: Lesson;
  studentId: string;
  navigate: Navigate;
}) {
  const { setLessons } = useWorkspace();
  const s = findStudent(studentId);
  return (
    <button
      className="tw-mini-person"
      onClick={() => {
        const id = uid();
        setLessons((ls) => [...ls, { ...adaptLesson(lesson, s), id }]);
        navigate({ page: "editor", id });
      }}
    >
      <Avatar id={s.id} />
      <span>{s.name}</span>
      <Icon name="arrow" size={16} />
    </button>
  );
}
function AiPage({ id, navigate }: { id?: string; navigate: Navigate }) {
  const { lessons, aiUnavailable, updateLesson, setNotice } = useWorkspace();
  const l = lessons.find((l) => l.id === id)!;
  if (!l) return null;
  return (
    <>
      <PageHeading
        title="Review AI draft"
        description="AI assistance for a short, personal lesson."
      />
      {aiUnavailable ? (
        <Panel>
          <h2>The draft is unavailable</h2>
          <p>Your lesson is intact. You can continue preparing it yourself.</p>
          <Button onClick={() => navigate({ page: "editor", id: l.id })}>
            Continue manually
          </Button>
        </Panel>
      ) : (
        <>
          <Panel className="tw-ai-review">
            <Badge tone="orange">Unreviewed draft</Badge>
            <h2>One more question</h2>
            <p>
              Ask the learner to make the conversation last a little longer.
              After ordering, ask for a recommendation, then respond with a
              reason for their choice.
            </p>
            <TextField
              label="Learner goal"
              value={l.outcome}
              onChange={(v) =>
                updateLesson(l.id, { outcome: v, status: "Draft" })
              }
              multiline
            />
            <p className="tw-subtle">
              Check the language, difficulty, and relevance. This adds one
              editable block only after your approval.
            </p>
          </Panel>
          <div className="tw-actions">
            <Button
              onClick={() => {
                updateLesson(l.id, {
                  ...(l.course
                    ? coursePatch({
                        ...l.course,
                        modules: [
                          ...l.course.modules,
                          {
                            ...createModule("Speaking"),
                            title: "One more question",
                            goal: "Keep a conversation going with a follow-up question.",
                            blocks: [
                              {
                                ...createBlock("Role-play", "Practice"),
                                title: "One more question",
                                text: "After ordering, ask for a recommendation. Explain why you would choose it, then ask a follow-up question.",
                              },
                            ],
                          },
                        ],
                      })
                    : {
                        blocks: [
                          ...l.blocks,
                          {
                            id: uid(),
                            type: "Role-play",
                            title: "One more question",
                            content:
                              "After ordering, ask for a recommendation. Explain why you would choose it, then ask a follow-up question.",
                            minutes: 5,
                          },
                        ],
                      }),
                  status: "Draft",
                });
                setNotice(
                  "Activity added for you to edit. It is not shared.",
                );
                navigate({ page: "editor", id: l.id });
              }}
            >
              Use & edit this activity
            </Button>
            <Button
              kind="secondary"
              onClick={() => navigate({ page: "editor", id: l.id })}
            >
              Discard draft
            </Button>
          </div>
        </>
      )}
    </>
  );
}
function SharePage({ id, navigate }: { id?: string; navigate: Navigate }) {
  const { lessons, updateLesson, attempt, savedProfile } = useWorkspace();
  const l = lessons.find((l) => l.id === id)!;
  if (!l || !l.studentId) return null;
  const s = findStudent(l.studentId);
  return (
    <>
      <PageHeading
        title="Share lesson"
        description="Check the recipient and visible material before sharing."
      />
      <Panel>
        <StudentLine id={s.id} />
        <h2>{l.title}</h2>
        <p>{l.outcome}</p>
        <p className="tw-subtle">
          Only the lesson activities are shared. Your private teaching notes
          stay private.
        </p>
        {lessonPublicationIssues(savedProfile, true).length > 0 && <div className="tw-callout"><p>Set your lesson duration and price before publishing a lesson.</p><Button kind="secondary" onClick={() => navigate({ page: "profile-edit", id: l.id, tab: "return-to-editor" })}>Edit teaching profile</Button></div>}
        <div className="tw-actions">
          <Button
            disabled={l.status === "Draft" || l.status === "Shared" || !lessonSettingsReady(savedProfile)}
            onClick={() =>
              lessonSettingsReady(savedProfile) && attempt(
                () =>
                  updateLesson(l.id, {
                    status: "Shared",
                    sharedVersion: learnerMaterial(l),
                  }),
                `Lesson shared with ${s.name.split(" ")[0]}.`,
              )
            }
          >
            {l.status === "Shared"
              ? "Shared"
              : "Confirm & share lesson"}
          </Button>
          <Button
            kind="secondary"
            onClick={() => navigate({ page: "lesson-preview", id: l.id })}
          >
            Review learner version
          </Button>
        </div>
      </Panel>
    </>
  );
}
function AvailabilityPage() {
  const {
    availability: a,
    setAvailability,
    availabilitySaved,
    setAvailabilitySaved,
    attempt,
  } = useWorkspace();
  const [error, setError] = useState("");
  const change = (patch: Partial<typeof a>) => {
    setAvailability((v) => ({ ...v, ...patch }));
    setAvailabilitySaved(false);
    setError("");
  };
  return (
    <>
      <PageHeading
        title="Availability"
        description="Choose your open hours. Existing bookings stay reserved."
      />
      <Panel>
        <Select
          label="Time zone"
          value={a.zone}
          options={[
            "Europe/Paris",
            "Europe/London",
            "America/New_York",
            "Asia/Tokyo",
          ]}
          onChange={(zone) => change({ zone })}
        />
        {a.zone !== "Europe/Paris" && (
          <p className="tw-error" role="alert">
            Choose Europe/Paris to save your availability.
          </p>
        )}
        <h2>Your teaching days</h2>
        <div className="tw-day-options">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <button
              key={day}
              className={a.days.includes(day) ? "selected" : ""}
              aria-pressed={a.days.includes(day)}
              onClick={() =>
                change({
                  days: a.days.includes(day)
                    ? a.days.filter((d) => d !== day)
                    : [...a.days, day],
                })
              }
            >
              {day}
            </button>
          ))}
        </div>
        <div className="tw-form-pair">
          <TextField
            label="Start time"
            type="time"
            value={a.start}
            onChange={(start) => change({ start })}
          />
          <TextField
            label="End time"
            type="time"
            value={a.end}
            onChange={(end) => change({ end })}
          />
        </div>
        <div className="tw-callout">
          <Icon name="calendar" />
          <p>
            Confirmed sessions are reserved automatically within these hours.
            Removing an open day does not cancel an existing booking.
          </p>
        </div>
        {error && (
          <p className="tw-error" role="alert">
            {error}
          </p>
        )}
        <Button
          disabled={a.zone !== "Europe/Paris"}
          onClick={() => {
            if (!a.days.length || !a.start || !a.end || a.start >= a.end) {
              setError(
                "Choose at least one day and an end time after the start time.",
              );
              return;
            }
            attempt(
              () => setAvailabilitySaved(true),
              "Availability saved. Confirmed bookings are preserved.",
            );
          }}
        >
          {availabilitySaved ? "Availability saved" : "Save availability"}
        </Button>
      </Panel>
    </>
  );
}
function SessionPage({ id, navigate }: { id?: string; navigate: Navigate }) {
  const { sessions, lessons, attempt, updateSession } =
    useWorkspace();
  const s = sessions.find((s) => s.id === id)!;
  if (!s) return null;
  const l = s.lessonSnapshot || lessons.find((l) => l.id === s.lessonId);
  const active = ["Confirmed", "Requested"].includes(s.status);
  return (
    <>
      <PageHeading
        title={
          s.status === "Completed"
            ? "A conversation to build on"
            : s.status === "Cancelled"
              ? "Session cancelled"
              : s.status === "Issue recorded"
                ? "Session issue recorded"
                : "Your next conversation"
        }
        description={`${dateLabel(s.date)} · ${s.time} · Europe/Paris`}
      />
      <div className="tw-columns">
        <Panel>
          <StudentLine id={s.studentId} />
          <div className="tw-session-details">
            <Badge tone={s.status === "Requested" ? "orange" : "blue"}>
              {s.status}
            </Badge>
            <h2>{l?.title || "A personal lesson"}</h2>
            <div className="tw-detail-row">
              <span>Meeting</span>
              <strong>
                {s.format}
                {s.format === "In person" ? " · Paris, France" : ""}
              </strong>
            </div>
            <div className="tw-detail-row">
              <span>Duration</span>
              <strong>{s.duration} minutes</strong>
            </div>
            <div className="tw-detail-row">
              <span>Learner’s goal</span>
              <strong>{findStudent(s.studentId).goal}</strong>
            </div>
          </div>
          {s.status === "Confirmed" && (
            <div className="tw-actions">
              <Button
                icon={s.format === "Online" ? "video" : "check"}
                onClick={() =>
                  navigate({
                    page: s.format === "Online" ? "lobby" : "live",
                    id: s.id,
                  })
                }
              >
                {s.format === "Online"
                  ? "Open session lobby"
                  : "Start in-person lesson"}
              </Button>
              <Button
                kind="secondary"
                onClick={() =>
                  navigate({ page: "lessons", id: s.studentId, tab: "Library" })
                }
              >
                Prepare lesson
              </Button>
            </div>
          )}
          {s.status === "Requested" && !s.pending && (
            <div className="tw-actions">
              <Button
                onClick={() => {
                  if (overlaps(sessions, s.date, s.time, s.duration, s.id)) {
                    navigate({ page: "reschedule", id: s.id });
                    return;
                  }
                  attempt(
                    () => updateSession(s.id, { status: "Confirmed" }),
                    "Meeting confirmed.",
                  );
                }}
              >
                Confirm meeting
              </Button>
              <Button
                kind="secondary"
                onClick={() => navigate({ page: "reschedule", id: s.id })}
              >
                Propose another time
              </Button>
            </div>
          )}
          {s.status === "Completed" && (
            <Button onClick={() => navigate({ page: "recap", id: s.id })}>
              {s.recapShared ? "View shared recap" : "Prepare recap"}
            </Button>
          )}
          {s.issue && <p className="tw-callout">Recorded issue: {s.issue}</p>}
        </Panel>
        <div>
          {s.pending && (
            <Panel className="tw-pending">
              <Badge tone="orange">Awaiting learner confirmation</Badge>
              <h2>
                {dateLabel(s.pending.date)} · {s.pending.time}
              </h2>
              <p>
                {s.status === "Confirmed"
                  ? `The original booking on ${dateLabel(s.date)} at ${s.time} is retained until confirmation.`
                  : "The request is still unconfirmed."}
              </p>

              <div className="tw-actions">
                <Button
                  onClick={() => {
                    if (
                      overlaps(
                        sessions,
                        s.pending!.date,
                        s.pending!.time,
                        s.duration,
                        s.id,
                      )
                    ) {
                      updateSession(s.id, { pending: undefined });
                      navigate({ page: "reschedule", id: s.id });
                      return;
                    }
                    attempt(
                      () =>
                        updateSession(s.id, {
                          date: s.pending!.date,
                          time: s.pending!.time,
                          status: "Confirmed",
                          pending: undefined,
                        }),
                      "New time confirmed.",
                    );
                  }}
                >
                  Learner accepts
                </Button>
                <Button
                  kind="secondary"
                  onClick={() => {
                    updateSession(s.id, { pending: undefined });
                    navigate({ page: "reschedule", id: s.id });
                  }}
                >
                  Learner declines
                </Button>
              </div>
            </Panel>
          )}
          <Panel>
            <SectionTitle>Prepared lesson</SectionTitle>
            {active ? (
              <Select
                label="Lesson for this session"
                value={s.lessonId}
                options={[
                  { value: "", label: "Choose a lesson" },
                  ...lessons
                    .filter(
                      (l) =>
                        l.status !== "Draft" &&
                        !l.archived &&
                        (!l.studentId || l.studentId === s.studentId),
                    )
                    .map((l) => ({
                      value: l.id,
                      label: `${l.title} · ${l.studentId ? "Personal version" : "Reusable"}`,
                    })),
                ]}
                onChange={(v) => updateSession(s.id, { lessonId: v })}
              />
            ) : (
              <p>{l?.title || "No prepared lesson"}</p>
            )}
            {l && (
              <Button
                kind="secondary"
                onClick={() =>
                  navigate({
                    page: "lesson-preview",
                    id: l.id,
                    tab: s.status === "Completed" ? s.id : undefined,
                  })
                }
              >
                Preview material
              </Button>
            )}
          </Panel>
          {active && (
            <Panel>
              <SectionTitle>Manage this session</SectionTitle>
              <button
                className="tw-menu-row"
                onClick={() => navigate({ page: "reschedule", id: s.id })}
              >
                <Icon name="calendar" />
                Reschedule
                <Icon name="arrow" size={17} />
              </button>
              <button
                className="tw-menu-row"
                onClick={() => navigate({ page: "cancel", id: s.id })}
              >
                <Icon name="clock" />
                Cancel session
                <Icon name="arrow" size={17} />
              </button>
              <button
                className="tw-menu-row"
                onClick={() => navigate({ page: "issue", id: s.id })}
              >
                <Icon name="help" />
                Learner hasn’t arrived
                <Icon name="arrow" size={17} />
              </button>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
function ReschedulePage({ id, navigate }: { id?: string; navigate: Navigate }) {
  const { sessions, updateSession, attempt, sessionDrafts, setSessionDrafts } =
    useWorkspace();
  const s = sessions.find((s) => s.id === id)!;
  const date = sessionDrafts[s.id]?.date ?? s.pending?.date ?? s.date,
    time = sessionDrafts[s.id]?.time ?? s.pending?.time ?? s.time;
  const setDate = (date: string) =>
      setSessionDrafts((v) => ({ ...v, [s.id]: { ...v[s.id], date } })),
    setTime = (time: string) =>
      setSessionDrafts((v) => ({ ...v, [s.id]: { ...v[s.id], time } }));
  const [error, setError] = useState(""),
    [review, setReview] = useState(false);
  return (
    <>
      <PageHeading
        title={
          s.status === "Requested"
            ? "Find a time that fits"
            : "Make space for a new time"
        }
        description="The learner confirms a replacement before the booking changes."
      />
      <StudentLine id={s.studentId} />
      <Panel>
        <p>
          Original time:{" "}
          <strong>
            {dateLabel(s.date)} · {s.time}
          </strong>
        </p>
        {review ? (
          <>
            <Badge tone="orange">Proposed replacement</Badge>
            <h2>
              {dateLabel(date)} · {time}
            </h2>
            <p>
              Europe/Paris · {s.duration} minutes · {s.format}
            </p>
            <p>
              The original booking stays in place until the learner accepts.
            </p>
            <div className="tw-actions">
              <Button
                onClick={() => {
                  if (overlaps(sessions, date, time, s.duration, s.id)) {
                    setError(
                      "This time overlaps a confirmed session. Choose another time.",
                    );
                    setReview(false);
                    return;
                  }
                  if (
                    attempt(
                      () => updateSession(s.id, { pending: { date, time } }),
                      "Alternative time proposed.",
                    )
                  )
                    navigate({ page: "session", id: s.id });
                }}
              >
                Confirm proposal
              </Button>
              <Button kind="secondary" onClick={() => setReview(false)}>
                Choose another time
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="tw-form-pair">
              <TextField
                label="Replacement date"
                type="date"
                value={date}
                onChange={(v) => {
                  setDate(v);
                  setError("");
                }}
              />
              <TextField
                label="Replacement time"
                type="time"
                value={time}
                onChange={(v) => {
                  setTime(v);
                  setError("");
                }}
              />
            </div>
            {error && (
              <p role="alert" className="tw-error">
                {error}
              </p>
            )}
            <div className="tw-actions">
              <Button
                disabled={!date || !time}
                onClick={() => {
                  if (date === s.date && time === s.time) {
                    setError("Choose a different time for the replacement.");
                    return;
                  }
                  if (overlaps(sessions, date, time, s.duration, s.id)) {
                    setError(
                      "This time overlaps a confirmed session. Choose another time.",
                    );
                    return;
                  }
                  setReview(true);
                }}
              >
                Review change
              </Button>
              <Button
                kind="secondary"
                onClick={() => navigate({ page: "session", id: s.id })}
              >
                Keep original booking
              </Button>
            </div>
          </>
        )}
      </Panel>
    </>
  );
}
function CancelPage({ id, navigate }: { id?: string; navigate: Navigate }) {
  const { sessions, updateSession, attempt } = useWorkspace();
  const s = sessions.find((s) => s.id === id)!;
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <PageHeading
        title="Before you cancel"
        description="Take a moment to check this session."
      />
      <Panel>
        <StudentLine id={s.studentId} />
        <h2>
          {dateLabel(s.date)} · {s.time}
        </h2>
        <p>
          Cancelling releases the time and marks the session as cancelled.
        </p>

        {confirm && (
          <div className="tw-callout">
            <p>
              Confirm cancellation of this one-to-one session with{" "}
              {findStudent(s.studentId).name}?
            </p>
          </div>
        )}
        <div className="tw-actions">
          <Button
            kind="danger"
            disabled={s.status === "Cancelled"}
            onClick={() => {
              if (!confirm) {
                setConfirm(true);
                return;
              }
              if (
                attempt(
                  () =>
                    updateSession(s.id, {
                      status: "Cancelled",
                      pending: undefined,
                    }),
                  "Cancellation confirmed.",
                )
              )
                navigate({ page: "session", id: s.id });
            }}
          >
            {confirm ? "Confirm cancellation" : "Cancel this session"}
          </Button>
          <Button
            kind="secondary"
            onClick={() => navigate({ page: "session", id: s.id })}
          >
            Keep booking
          </Button>
        </div>
      </Panel>
    </>
  );
}
function IssuePage({ id, navigate }: { id?: string; navigate: Navigate }) {
  const { sessions, updateSession, attempt, sessionDrafts, setSessionDrafts } =
    useWorkspace();
  const s = sessions.find((s) => s.id === id)!;
  const issue = sessionDrafts[s.id]?.issue ?? s.issue ?? "";
  const setIssue = (issue: string) =>
    setSessionDrafts((v) => ({ ...v, [s.id]: { ...v[s.id], issue } }));
  const [review, setReview] = useState(false);
  return (
    <>
      <PageHeading
        title="The learner hasn’t arrived?"
        description="Check in with them, then record what happened."
      />
      <StudentLine id={s.studentId} />
      <Panel>
        <div className="tw-actions">
          <Button
            kind="secondary"
            icon="message"
            onClick={() => navigate({ page: "messages", id: s.studentId })}
          >
            Message learner
          </Button>
          <Button
            kind="secondary"
            onClick={() => navigate({ page: "lobby", id: s.id })}
          >
            Learner arrived · Continue
          </Button>
        </div>
        {review ? (
          <>
            <h2>Review the session issue</h2>
            <p className="tw-preserve">{issue}</p>
            <p>
              Next step: follow up privately with the learner to understand what
              happened. This records an issue, without a fault or compensation
              decision.
            </p>
            <div className="tw-actions">
              <Button
                onClick={() => {
                  if (
                    attempt(
                      () =>
                        updateSession(s.id, {
                          issue,
                          status: "Issue recorded",
                        }),
                      "Session issue recorded with a private follow-up step.",
                    )
                  )
                    navigate({ page: "session", id: s.id });
                }}
              >
                Submit issue
              </Button>
              <Button kind="secondary" onClick={() => setReview(false)}>
                Keep editing
              </Button>
            </div>
          </>
        ) : (
          <>
            <TextField
              label="Describe what happened"
              value={issue}
              onChange={setIssue}
              multiline
              placeholder="What did you observe? What did you try?"
            />
            <Button
              disabled={issue.trim().length < 10}
              onClick={() => setReview(true)}
            >
              Review issue
            </Button>
          </>
        )}
      </Panel>
    </>
  );
}
function LobbyPage({ id, navigate }: { id?: string; navigate: Navigate }) {
  const { sessions, lessons, offline, profile } = useWorkspace();
  const s = sessions.find((s) => s.id === id)!;
  const l = lessons.find((l) => l.id === s.lessonId);
  const [mic, setMic] = useState(true),
    [camera, setCamera] = useState(true),
    [failed, setFailed] = useState(false);
  return (
    <>
      <PageHeading
        title="Lesson lobby"
        description={`${findStudent(s.studentId).name} · ${s.duration} minutes · Online`}
      />
      <Panel className="tw-lobby">
        <div className="tw-camera-preview">
          <span className="tw-teacher-avatar large">
            {profile.name === "Gilbert" ? <ProfilePortrait id="gilbert" initials="G" /> : profile.name.slice(0, 1).toUpperCase()}
          </span>
          <span>{camera ? "Camera preview" : "Camera off"}</span>
        </div>
        <div className="tw-actions">
          <Button kind="secondary" onClick={() => setMic(!mic)}>
            Microphone {mic ? "on" : "off"}
          </Button>
          <Button kind="secondary" onClick={() => setCamera(!camera)}>
            Camera {camera ? "on" : "off"}
          </Button>
        </div>

        {failed && (
          <p className="tw-error" role="alert">
            Connection unavailable. Reconnect in Account settings, then retry.
          </p>
        )}
        {(!l || l.status === "Draft") && (
          <p className="tw-callout">
            Approve a prepared lesson before joining the session.
          </p>
        )}
        <Button
          disabled={!l || l.status === "Draft"}
          icon="video"
          onClick={() => {
            if (offline) {
              setFailed(true);
              return;
            }
            navigate({ page: "live", id: s.id });
          }}
        >
          {failed ? "Reconnect & join" : "Join session"}
        </Button>
      </Panel>
      <Button
        kind="quiet"
        onClick={() => navigate({ page: "issue", id: s.id })}
      >
        Learner hasn’t arrived
      </Button>
    </>
  );
}
function LivePage({ id, navigate }: { id?: string; navigate: Navigate }) {
  const { sessions, lessons, updateSession, offline, profile } = useWorkspace();
  const s = sessions.find((s) => s.id === id)!;
  const l = lessons.find((l) => l.id === s.lessonId)!;
  const [block, setBlock] = useState(0);
  const feedback = s.liveFeedback || "",
    setFeedback = (liveFeedback: string) =>
      updateSession(s.id, { liveFeedback });
  if (!l)
    return (
      <Empty
        title="Prepare a lesson first"
        description="Return to the session and choose an approved lesson."
      />
    );
  const b = l.blocks[Math.min(block, l.blocks.length - 1)];
  return (
    <>
      <PageHeading
        title={
          s.format === "Online"
            ? "Online lesson"
            : "In-person lesson"
        }
        description={`${findStudent(s.studentId).name} · ${l.title}`}
      />
      {offline ? (
        <Panel>
          <h2>Connection interrupted</h2>
          <p>
            Your private notes are kept. Reconnect in Account settings, then
            return to this lesson.
          </p>
          <Button
            kind="secondary"
            onClick={() => navigate({ page: "settings" })}
          >
            Open connection controls
          </Button>
        </Panel>
      ) : (
        <div className="tw-live-people">
          <div>
            <Avatar id={s.studentId} size="large" />
            <span>{findStudent(s.studentId).name}</span>
          </div>
          <div>
            <span className="tw-teacher-avatar large">
              {profile.name === "Gilbert" ? <ProfilePortrait id="gilbert" initials="G" /> : profile.name.slice(0, 1).toUpperCase()}
            </span>
            <span>You · Teacher</span>
          </div>
          <Badge tone="white">
            {s.format === "Online" ? "Online session" : "In-person lesson"} · 1:1
          </Badge>
        </div>
      )}
      <Panel className="tw-live-activity">
        <Badge tone="orange">
          Activity {block + 1} of {l.blocks.length}
        </Badge>
        <h2>{b?.title}</h2>
        <p>{b?.content}</p>
        <div className="tw-actions">
          <Button
            kind="secondary"
            disabled={block === 0}
            onClick={() => setBlock((i) => i - 1)}
          >
            Previous
          </Button>
          <Button
            disabled={block === l.blocks.length - 1}
            onClick={() => setBlock((i) => i + 1)}
          >
            Next activity
          </Button>
        </div>
      </Panel>
      <Panel>
        <TextField
          label="Private session notes"
          value={s.notes}
          onChange={(v) => updateSession(s.id, { notes: v })}
          multiline
        />
        <TextField
          label="Human feedback to discuss"
          value={feedback}
          onChange={setFeedback}
          multiline
          placeholder="One thing that worked and one useful next step…"
        />
        <div className="tw-actions">
          <Button
            kind="secondary"
            onClick={() => navigate({ page: "results", id: s.studentId })}
          >
            Review module results
          </Button>
          <Button
            onClick={() => {
              updateSession(s.id, {
                status: "Completed",
                notes: [s.notes, feedback].filter(Boolean).join("\n"),
                lessonSnapshot: structuredClone(l),
              });
              navigate({ page: "recap", id: s.id });
            }}
          >
            End session & prepare recap
          </Button>
        </div>
      </Panel>
    </>
  );
}
function RecapPage({
  id,
  navigate,
  preview = false,
}: {
  id?: string;
  navigate: Navigate;
  preview?: boolean;
}) {
  const { sessions, updateSession, attempt } = useWorkspace();
  const s = sessions.find((s) => s.id === id)!;
  if (!s) return null;
  const name = findStudent(s.studentId).name;
  return (
    <>
      <PageHeading
        title={
          preview
            ? "A final look before you share."
            : "Leave them with something useful."
        }
        description={`${name} · ${dateLabel(s.date)} · Completed lesson`}
      />
      <StudentLine id={s.studentId} />
      {preview ? (
        <Panel className="tw-learner-preview">
          <h2>Your lesson recap</h2>
          <p className="tw-preserve">{s.recap}</p>
          {s.practice && (
            <>
              <h3>Something to try, if you’d like</h3>
              <p className="tw-preserve">{s.practice}</p>
            </>
          )}
          <p className="tw-subtle">
            Private session notes are excluded. Only {name} is the recipient.
          </p>
          <div className="tw-actions">
            <Button
              disabled={s.recapShared || s.status !== "Completed"}
              onClick={() =>
                attempt(
                  () => updateSession(s.id, { recapShared: true }),
                  `Private recap shared with ${name.split(" ")[0]}.`,
                )
              }
            >
              {s.recapShared
                ? "Recap shared"
                : "Confirm & share recap"}
            </Button>
            <Button
              kind="secondary"
              onClick={() => navigate({ page: "recap", id: s.id })}
            >
              Keep recap draft
            </Button>
          </div>
        </Panel>
      ) : (
        <>
          <Panel>
            <Badge tone="gray">Private session notes</Badge>
            <p className="tw-preserve">{s.notes || "No private notes yet."}</p>
          </Panel>
          <Panel>
            <TextField
              label="A concise recap for the learner"
              value={s.recap}
              onChange={(v) =>
                updateSession(s.id, { recap: v, recapShared: false })
              }
              multiline
              placeholder="What did they practice? What improved?"
            />
            <TextField
              label="Optional next practice"
              value={s.practice}
              onChange={(v) =>
                updateSession(s.id, { practice: v, recapShared: false })
              }
              multiline
              placeholder="A small thing to try in real life, if they want to."
            />
            <div className="tw-actions">
              <Button
                disabled={s.recap.trim().length < 5 || s.status !== "Completed"}
                onClick={() => navigate({ page: "recap-preview", id: s.id })}
              >
                Review learner version
              </Button>
              <Button
                kind="secondary"
                onClick={() =>
                  attempt(() => {}, "Recap draft saved.")
                }
              >
                Save draft
              </Button>
            </div>
          </Panel>
        </>
      )}
    </>
  );
}
function ProfilePage({
  navigate,
  preview = false,
}: {
  navigate: Navigate;
  preview?: boolean;
}) {
  const { savedProfile: p } = useWorkspace();
  return (
    <>
      <PageHeading
        title={
          preview
            ? "Teaching profile preview"
            : "Teaching profile"
        }
        description={
          preview
            ? "Your public teaching details."
            : "A profile learners can get to know."
        }
      />
      <Panel className="tw-teaching-profile">
        <div className="tw-profile-hero">
          <span className="tw-teacher-avatar large">
            {p.name === "Gilbert" ? <ProfilePortrait id="gilbert" initials="G" /> : p.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h2>{p.name}</h2>
            <p>
              {p.languages} · {p.levels}
            </p>
          </div>
          <Badge tone="orange">Profile draft</Badge>
        </div>
        <blockquote>{p.approach}</blockquote>
        <div className="tw-profile-facts">
          <span>
            <Icon name="video" />
            {p.format === "Either"
              ? "Online & in person"
              : p.format || "Format not set"}
          </span>
          {p.format !== "Online" && (
            <span>
              <Icon name="pin" />
              {p.city || "City not set"}
            </span>
          )}
          <span>
            <Icon name="clock" />
            {p.duration || "Duration not set"}
          </span>
          <strong>Price: {lessonPriceLabel(p.rate, p.freeConfirmed)}</strong>
        </div>
        {!preview && (
          <>
            <div className="tw-actions">
              <Button
                kind="secondary"
                onClick={() => navigate({ page: "profile-edit" })}
              >
                Edit teaching profile
              </Button>

            </div>
            {!lessonSettingsReady(p) && (
              <p className="tw-subtle">
                Duration or price is not set. You can prepare lessons now and
                complete these details before publishing a lesson.
              </p>
            )}
          </>
        )}
      </Panel>
      {!preview && (
        <div className="tw-columns">
          <Panel>
            <SectionTitle>Your account</SectionTitle>
            {[
              ["help", "Help", "help"],
              ["settings", "Account settings", "settings"],
              ["wallet", "Payout", "payout"],
            ].map(([icon, title, page]) => (
              <button
                className="tw-menu-row"
                key={page}
                onClick={() => navigate({ page })}
              >
                <Icon name={icon} />
                {title}
                <Icon name="arrow" size={18} />
              </button>
            ))}
          </Panel>
          <Panel className="tw-trust-panel">
            <Icon name="person" />
            <h2>
              {p.identity
                ? "Identity details complete"
                : "Identity check"}
            </h2>
            <p>
              {p.identity
                ? "Your identity details are complete."
                : "You can finish your identity check whenever you’re ready."}
            </p>
            <Button
              kind="secondary"
              onClick={() => navigate({ page: "identity", tab: "intro" })}
            >
              Open identity check
            </Button>
            <p className="tw-subtle">
              Identity and teaching qualifications are separate.
            </p>
          </Panel>
        </div>
      )}
    </>
  );
}
function ProfileEditPage({
  navigate,
  returnLessonId,
}: {
  navigate: Navigate;
  returnLessonId?: string;
}) {
  const {
    mobile,
    profile: p,
    setProfile,
    setSavedProfile,
    attempt,
  } = useWorkspace();
  const [preview, setPreview] = useState(false);
  const update = (patch: Partial<typeof p>) => {
    setProfile((v) => ({ ...v, ...patch }));
    setPreview(false);
  };
  const valid =
    p.name.trim().length >= 2 &&
    p.languages.trim() &&
    p.levels.trim() &&
    p.approach.trim().length >= 5 &&
    validLessonSettings(p);
  return (
    <>
      <PageHeading
        title="Edit teaching profile"
        description="Teaching details are separate from your legal identity."
      />
      {returnLessonId && (
        <div className="tw-callout">
          <p>Your lesson draft is saved. Set duration and price, then save your profile to return to the editor.</p>
          <Button kind="secondary" onClick={() => navigate({ page: "editor", id: returnLessonId })}>
            Return to lesson
          </Button>
        </div>
      )}
      <Panel>
        {preview ? (
          <>
            <h2>{p.name}</h2>
            <p>
              {p.languages} · {p.levels}
            </p>
            <blockquote>{p.approach}</blockquote>
            <p>
              {p.format || "Format not set"} ·{" "}
              {p.duration || "Duration not set"} ·{" "}
              {lessonPriceLabel(p.rate, p.freeConfirmed)}
            </p>
            {p.format !== "Online" && <p>{p.city}</p>}
            <div className="tw-actions">
              <Button
                onClick={() => {
                  if (
                    attempt(() => {
                      setSavedProfile({ ...p });
                    }, "Teaching profile updated. Existing booking terms are preserved.")
                  )
                    navigate(returnLessonId ? { page: "editor", id: returnLessonId } : { page: "profile" });
                }}
              >
                Save changes
              </Button>
              <Button kind="secondary" onClick={() => setPreview(false)}>
                Keep editing
              </Button>
            </div>
          </>
        ) : (
          <>
            <TextField
              label="Display name"
              value={p.name}
              onChange={(name) => update({ name })}
            />
            <div className="tw-form-pair">
              <TextField
                label="Teaching languages"
                value={p.languages}
                onChange={(languages) => update({ languages })}
              />
              <TextField
                label="Teaching levels"
                value={p.levels}
                onChange={(levels) => update({ levels })}
              />
            </div>
            <TextField
              label="Your teaching approach"
              value={p.approach}
              onChange={(approach) => update({ approach })}
              multiline
            />
            <Select
              label="Meeting format"
              value={p.format}
              options={[
                { value: "", label: "Not set" },
                "Online",
                "In person",
                "Either",
              ]}
              onChange={(format) =>
                update({ format, ...(format === "Online" ? { city: "" } : {}) })
              }
            />
            {p.format !== "Online" && (
              <LocationField mobile={mobile} value={p.city} onChange={(city) => update({ city })} />
            )}
            <div className="tw-form-pair">
              <Select
                label="Lesson duration"
                value={p.duration}
                options={[{ value: "", label: "Not set" }, ...lessonDurations]}
                onChange={(duration) => update({ duration })}
              />
              <TextField
                label="Price per lesson in euros"
                error={p.rate.trim() && (!Number.isFinite(Number(p.rate)) || Number(p.rate) < 0 || Number(p.rate) > 1000) ? "Enter a price from €0 to €1,000, or leave it blank to decide later." : undefined}
                value={p.rate}
                type="number"
                min="0"
                max="1000"
                onChange={(rate) => update({ rate, freeConfirmed: false })}
              />
            </div>
            {isFreeLesson(p.rate) && (
              <FreeLessonConfirmation
                confirmed={p.freeConfirmed}
                onChange={(freeConfirmed) => update({ freeConfirmed })}
              />
            )}
            <p className="tw-subtle">
              Required before publishing a lesson. You can save your profile with
              these fields blank. Enter 0 and confirm to offer free lessons.
            </p>
            <Button disabled={!valid} onClick={() => setPreview(true)}>
              Review teaching profile
            </Button>
          </>
        )}
      </Panel>
    </>
  );
}
function SettingsPage() {
  const { offline, setOffline, aiUnavailable, setAiUnavailable, mobile } =
    useWorkspace();
  return (
    <>
      <PageHeading
        title="Account settings"
        description="Account preferences and connection settings."
      />
      <Panel>
        <SectionTitle>Connection</SectionTitle>
        <p>
          Your draft remains editable if saving or sharing fails.
        </p>
        <div className="tw-setting-row">
          <div>
            <strong>Connection available</strong>
            <span>Sharing and booking confirmations</span>
          </div>
          <button
            className={`tw-toggle ${!offline ? "on" : ""}`}
            role="switch"
            aria-checked={!offline}
            aria-label="Connection available"
            onClick={() => setOffline((v) => !v)}
          >
            <span />
          </button>
        </div>
        <div className="tw-setting-row">
          <div>
            <strong>AI drafts available</strong>
            <span>Optional drafts, always teacher-reviewed</span>
          </div>
          <button
            className={`tw-toggle ${!aiUnavailable ? "on" : ""}`}
            role="switch"
            aria-checked={!aiUnavailable}
            aria-label="AI drafts available"
            onClick={() => setAiUnavailable((v) => !v)}
          >
            <span />
          </button>
        </div>
      </Panel>
      <Panel>
        <SectionTitle>App access</SectionTitle>

        <div className="tw-actions">
          <a className="tw-button tw-secondary" href="/?teacher=1&view=web">
            Open web app
          </a>
          <a className="tw-button tw-secondary" href="/?teacher=1&view=mobile">
            Open mobile app
          </a>
          <a
            className="tw-button tw-quiet"
            href={mobile ? "/?view=mobile" : "/?view=web"}
          >
            Replay onboarding
          </a>
        </div>
      </Panel>
    </>
  );
}
function HelpPage() {
  return (
    <>
      <PageHeading
        title="Help"
        description="Keep your focus on the conversation."
      />
      <Panel>
        {[
          [
            "How do I prepare a personal lesson?",
            "Open a student, read their goal, and choose Prepare a lesson. Adapt a saved lesson or start a new one. Review the learner version before approving and sharing.",
          ],
          [
            "What does the learner see?",
            "Shared activities, messages, approved feedback, and recaps. Private teaching notes and private session notes are excluded from the learner preview.",
          ],
          [
            "What happens when sharing fails?",
            "The draft stays editable and is never marked as sent. Restore the connection in Account settings, then retry.",
          ],
          [
            "How does a time change work?",
            "Propose a replacement and wait for the learner to accept. The original confirmed booking stays reserved until the new time is confirmed.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </Panel>
    </>
  );
}
function PayoutPage() {
  const [status, setStatus] = useState("Pending"),
    [setup, setSetup] = useState(false);
  return (
    <>
      <PageHeading
        title="Payout"
        description="Track session earnings and payout status."
      />
      <div className="tw-payout-summary">
        <Panel>
          <span>Session earnings</span>
          <h2>€120.00</h2>
          <p>4 completed sessions</p>
        </Panel>
        <Panel>
          <span>Transfer</span>
          <h2>{setup ? status : "Setup needed"}</h2>
          <p>
            {status === "Pending"
              ? "Waiting for a provider status update"
              : "Provider status"}
          </p>
        </Panel>
      </div>
      <Panel>
        <SectionTitle>Payout details</SectionTitle>

        {!setup ? (
          <>

            <Button onClick={() => setSetup(true)}>
              Set up payouts
            </Button>
          </>
        ) : (
          <>
            <Badge
              tone={
                status === "Paid"
                  ? "green"
                  : status === "Pending"
                    ? "orange"
                    : "gray"
              }
            >
              {status === "Paid" ? "Payout received" : status}
            </Badge>
            <p>
              {status === "Pending"
                ? "Waiting for a provider status update."
                : status === "Action needed"
                  ? "Check your payout setup and try again."
                  : "Transfer complete."}
            </p>
            <Select
              label="Provider status"
              value={status}
              options={["Pending", "Action needed", "Paid"]}
              onChange={setStatus}
            />
            {status === "Action needed" && (
              <Button kind="secondary" onClick={() => setStatus("Pending")}>
                Confirm setup & recheck
              </Button>
            )}
          </>
        )}
      </Panel>
    </>
  );
}
function IdentityPage({
  route,
  navigate,
}: {
  route: Route;
  navigate: Navigate;
}) {
  const {
    identityDraft: a,
    setIdentityDraft,
    profile,
    setProfile,
    setSavedProfile,
  } = useWorkspace();
  const step = route.tab || "intro";
  const next = (tab: string) => navigate({ page: "identity", tab });
  const update = (patch: Partial<typeof a>) =>
    setIdentityDraft((v) => ({ ...v, ...patch }));
  const finish = () => {
    setProfile({ ...profile, identity: true });
    setSavedProfile((p) => ({ ...p, identity: true }));
    navigate({ page: "profile" });
  };
  return (
    <>
      <PageHeading
        title="Identity check"
      />
      <Panel>
        {step === "intro" ? (
          <>
            <p>
              Choose how to complete your identity check.
            </p>
            <div className="tw-actions">
              <Button onClick={() => next("name")}>
                Use a document
              </Button>
              <Button kind="secondary" onClick={() => next("persona")}>
                Link Persona ID
              </Button>
              <Button
                kind="quiet"
                onClick={() => navigate({ page: "profile" })}
              >
                Finish this later
              </Button>
            </div>
          </>
        ) : step === "persona" ? (
          <>
            <img
              className="tw-persona-logo"
              src="/assets/onboarding/persona.png"
              alt="Persona"
            />
            <h2>Link your Persona ID</h2>

            <div className="tw-actions">
              <Button onClick={finish}>Confirm link</Button>
              <Button kind="secondary" onClick={() => next("name")}>
                Use a document instead
              </Button>
            </div>
          </>
        ) : step === "name" ? (
          <>
            <TextField
              label="Full legal name"
              value={a.legalName}
              onChange={(legalName) => update({ legalName })}
            />
            <Button
              disabled={a.legalName.trim().length < 3}
              onClick={() => next("birth")}
            >
              Continue
            </Button>
          </>
        ) : step === "birth" ? (
          <>
            <TextField
              label="Date of birth"
              value={a.dateOfBirth}
              placeholder="DD/MM/YYYY"
              onChange={(v) => update({ dateOfBirth: formatDateOfBirth(v) })}
            />
            <Button
              disabled={!dateOfBirthValid(a.dateOfBirth)}
              onClick={() => next("country")}
            >
              Continue
            </Button>
          </>
        ) : step === "country" ? (
          <>
            <Select
              label="Issuing country"
              value={a.country || "France"}
              options={[
                "France",
                "United Kingdom",
                "Germany",
                "Italy",
                "Spain",
                "United States",
              ]}
              onChange={(country) => update({ country })}
            />
            <Button
              onClick={() => {
                update({ country: a.country || "France" });
                next("document-type");
              }}
            >
              Continue
            </Button>
          </>
        ) : step === "document-type" ? (
          <>
            <Select
              label="Document type"
              value={a.documentType || "Passport"}
              options={[
                "Passport",
                "National identity card",
                "Driving licence",
              ]}
              onChange={(documentType) => update({ documentType })}
            />
            <Button
              onClick={() => {
                update({ documentType: a.documentType || "Passport" });
                next("document");
              }}
            >
              Continue
            </Button>
          </>
        ) : step === "document" ? (
          <>
            <h2>Add a document</h2>
            <p>
              {a.country} · {a.documentType}
            </p>
            <Button onClick={() => next("selfie")}>Add document</Button>
          </>
        ) : (
          <>
            <h2>Confirm your details</h2>

            <Button onClick={finish}>Complete identity check</Button>
          </>
        )}
      </Panel>
    </>
  );
}
import { formatDateOfBirth, dateOfBirthValid } from "../onboarding";
export function TeacherPage({
  route: r,
  navigate,
  back,
}: {
  route: Route;
  navigate: Navigate;
  back: () => void;
}) {
  switch (r.page) {
    case "students":
      return <StudentsPage navigate={navigate} />;
    case "student":
      return <StudentPage id={r.id} navigate={navigate} />;
    case "modules":
      return <ModulesPage navigate={navigate} />;
    case "results":
      return <ResultsPage id={r.id} selected={r.tab} navigate={navigate} />;
    case "messages":
      return <MessagesPage id={r.id} navigate={navigate} />;
    case "submission":
      return <SubmissionPage id={r.id} navigate={navigate} />;
    case "feedback-preview":
      return <SubmissionPage id={r.id} navigate={navigate} preview />;
    case "lessons":
      return <LessonsPage route={r} navigate={navigate} />;
    case "editor":
      return <EditorPage id={r.id} navigate={navigate} />;
    case "lesson-preview":
      return <LessonPreview id={r.id} navigate={navigate} sessionId={r.tab} />;
    case "ai-review":
      return <AiPage id={r.id} navigate={navigate} />;
    case "share":
      return <SharePage id={r.id} navigate={navigate} />;
    case "schedule":
      return <CalendarPage navigate={navigate} />;
    case "availability":
      return <AvailabilityPage />;
    case "session":
      return <SessionPage id={r.id} navigate={navigate} />;
    case "reschedule":
      return <ReschedulePage id={r.id} navigate={navigate} />;
    case "cancel":
      return <CancelPage id={r.id} navigate={navigate} />;
    case "issue":
      return <IssuePage id={r.id} navigate={navigate} />;
    case "lobby":
      return <LobbyPage id={r.id} navigate={navigate} />;
    case "live":
      return <LivePage id={r.id} navigate={navigate} />;
    case "recap":
      return <RecapPage id={r.id} navigate={navigate} />;
    case "recap-preview":
      return <RecapPage id={r.id} navigate={navigate} preview />;
    case "profile":
      return <ProfilePage navigate={navigate} />;
    case "profile-preview":
      return <ProfilePage navigate={navigate} preview />;
    case "profile-edit":
      return <ProfileEditPage navigate={navigate} returnLessonId={r.tab === "return-to-editor" ? r.id : undefined} />;
    case "settings":
      return <SettingsPage />;
    case "help":
      return <HelpPage />;
    case "payout":
      return <PayoutPage />;
    case "identity":
      return <IdentityPage route={r} navigate={navigate} />;
    default:
      return <Button onClick={back}>Return to workspace</Button>;
  }
}
