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
  const { sessions, profile, feedbackShared, lessons } = useWorkspace();
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
        title={`Welcome back, ${profile.name}!`}
        description="A good conversation starts with a little preparation."
      />
      <div className="tw-students-dashboard">
        <div className="tw-dashboard-main">
          <SectionTitle>Your next session</SectionTitle>
          <Panel className="tw-next-session">
            <div className="tw-next-copy">
              <Badge tone="white">Your next conversation</Badge>
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
            <img
              src="/assets/onboarding/nori.png"
              alt="Nori, your teaching companion"
              draggable={false}
            />
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
                    ? "Feedback shared in preview"
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
                    ? "Shared in this preview"
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
              {
                lessons.filter((l) => !l.studentId && !l.archived)
                  .length
              }{" "}
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
      <p className="tw-preview-caption">
        Sample workspace · Fictional learners · Changes stay in this preview
      </p>
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
            .filter((l) => l.studentId === s.id)
            .map((l) => (
              <LessonCard key={l.id} lesson={l} navigate={navigate} />
            ))}
          {!lessons.some((l) => l.studentId === s.id) && (
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
  return (
    <>
      <PageHeading
        title="Ongoing modules"
        description="A learner’s goal stays at the heart of each lesson."
      />
      {students.map((s) => (
        <Panel key={s.id}>
          <StudentLine id={s.id} />
          {lessons
            .filter((l) => l.studentId === s.id)
            .map((l) => (
              <LessonCard key={l.id} lesson={l} navigate={navigate} />
            ))}
          <div className="tw-actions">
            <Button
              kind="secondary"
              onClick={() => navigate({ page: "results", id: s.id })}
            >
              Module results
            </Button>
            <Button
              kind="quiet"
              onClick={() =>
                navigate({ page: "lessons", id: s.id, tab: "Library" })
              }
            >
              Prepare lesson
            </Button>
          </div>
        </Panel>
      ))}
    </>
  );
}
function ResultsPage({ id, navigate }: { id?: string; navigate: Navigate }) {
  const s = findStudent(id);
  const { lessons, updateLesson, setLessons, setNotice } = useWorkspace();
  const l = lessons.find((l) => l.studentId === s.id);
  const [points, setPoints] = useState(l?.outcome || s.focus);
  return (
    <>
      <PageHeading
        title="A useful next step"
        description="Review what worked, then adjust the learner’s module."
      />
      <StudentLine id={s.id} />
      <Panel>
        <Badge tone="green">Teacher observations</Badge>
        <h2>Confidence is growing</h2>
        <p>
          The learner tried the main activity independently. Spontaneous
          follow-up questions still need support.
        </p>
        <div className="tw-detail-row">
          <span>Completed activity</span>
          <strong>Guided role-play</strong>
        </div>
        <div className="tw-detail-row">
          <span>Next focus</span>
          <strong>{l?.outcome || s.focus}</strong>
        </div>
      </Panel>
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
        title="A conversation between lessons"
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
                    {m.mine ? "Sent in this preview" : s.name.split(" ")[0]}
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
                  }, "Message sent in this preview.")
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
        <p className="tw-subtle">Submitted sample · Written response</p>
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
                    "Private feedback shared in this preview.",
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
  const s = l.studentId ? findStudent(l.studentId) : null;
  return (
    <article className="tw-lesson-card">
      <div
        className={`tw-lesson-art ${l.language === "French" ? "peach" : "blue"}`}
      >
        <Icon
          name={l.blocks[0]?.type === "Listening" ? "message" : "book"}
          size={32}
        />
        <span>{l.language === "French" ? "Bonjour !" : "Hello there."}</span>
        <small>{l.level}</small>
      </div>
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
            {l.blocks.length} blocks ·{" "}
            {l.blocks.reduce((n, b) => n + b.minutes, 0)} min
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
  const { lessons, setLessons, updateLesson, setNotice } = useWorkspace();
  const [tab, setTab] = useState(route.tab || "Library"),
    [query, setQuery] = useState("");
  const learner = route.id ? findStudent(route.id) : null;
  const create = (template?: string) => {
    const id = uid();
    setLessons((ls) => [
      ...ls,
      {
        id,
        title: template || "",
        outcome: learner?.goal || "",
        language: learner?.language || "French",
        level: learner?.level || "A2",
        blocks: template ? makeBlocks() : [],
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
            : "Good lessons start with a small idea."
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
            <img src="/assets/onboarding/nori.png" alt="Nori" />
            <div>
              <h2>A starting point, never a script.</h2>
              <p>Short, editable activities. You bring the teaching.</p>
            </div>
          </div>
          <div className="tw-lesson-grid">
            {[
              "Everyday conversation",
              "Listening with confidence",
              "An idea worth sharing",
            ].map((title, i) => (
              <Panel key={title} className="tw-template-card">
                <span
                  className={`tw-template-icon ${["peach", "blue", "lilac"][i]}`}
                >
                  <Icon name={["message", "book", "spark"][i]} size={30} />
                </span>
                <h2>{title}</h2>
                <p>
                  Warm-up, useful words, a role-play, and a moment to reflect.
                </p>
                <Button kind="secondary" onClick={() => create(title)}>
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
  const { lessons, updateLesson, attempt } = useWorkspace();
  const l = lessons.find((l) => l.id === id)!;
  if (!l)
    return (
      <Empty
        title="Lesson unavailable"
        description="Return to the library to choose a lesson."
      />
    );
  const edit = (patch: Partial<Lesson>) =>
    updateLesson(l.id, { ...patch, status: "Draft" });
  const changeBlock = (bid: string, patch: Partial<Lesson["blocks"][number]>) =>
    edit({
      blocks: l.blocks.map((b) => (b.id === bid ? { ...b, ...patch } : b)),
    });
  return (
    <>
      <PageHeading
        title={l.title || "Your next useful lesson"}
        description={
          l.studentId
            ? `A personal version for ${findStudent(l.studentId).name}. The reusable original is preserved.`
            : "A reusable lesson. Save it first; share it only when you choose."
        }
        action={
          <Badge tone={l.status === "Draft" ? "orange" : "green"}>
            {l.status}
          </Badge>
        }
      />
      {l.studentId && (
        <Panel className="tw-brief">
          <StudentLine id={l.studentId} />
          <p>“{findStudent(l.studentId).goal}”</p>
        </Panel>
      )}
      <div className="tw-editor-layout">
        <div>
          <Panel>
            <TextField
              label="Lesson title"
              value={l.title}
              onChange={(v) => edit({ title: v })}
            />
            <TextField
              label="One clear outcome"
              value={l.outcome}
              onChange={(v) => edit({ outcome: v })}
              multiline
            />
            <div className="tw-form-pair">
              <Select
                label="Language"
                value={l.language}
                options={[
                  "French",
                  "English",
                  "Spanish",
                  "German",
                  "Italian",
                  "Japanese",
                ]}
                onChange={(v) => edit({ language: v })}
              />
              <Select
                label="Level"
                value={l.level}
                options={["A1", "A2", "B1", "B2", "C1", "C2"]}
                onChange={(v) => edit({ level: v })}
              />
            </div>
          </Panel>
          <SectionTitle>
            Short activity blocks{" "}
            <span className="tw-count">{l.blocks.length}</span>
          </SectionTitle>
          {l.blocks.map((b, i) => (
            <Panel className="tw-block" key={b.id}>
              <div className="tw-block-heading">
                <span className="tw-block-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <strong>{b.type}</strong>
                <div className="tw-block-tools">
                  <button
                    aria-label={`Move ${b.title || "block"} up`}
                    disabled={i === 0}
                    onClick={() => {
                      const blocks = [...l.blocks];
                      [blocks[i - 1], blocks[i]] = [blocks[i], blocks[i - 1]];
                      edit({ blocks });
                    }}
                  >
                    <Icon name="up" size={16}/>
                  </button>
                  <button
                    aria-label={`Move ${b.title || "block"} down`}
                    disabled={i === l.blocks.length - 1}
                    onClick={() => {
                      const blocks = [...l.blocks];
                      [blocks[i + 1], blocks[i]] = [blocks[i], blocks[i + 1]];
                      edit({ blocks });
                    }}
                  >
                    <Icon name="down" size={16}/>
                  </button>
                  <button
                    aria-label={`Remove ${b.title || "block"}`}
                    onClick={() =>
                      edit({ blocks: l.blocks.filter((x) => x.id !== b.id) })
                    }
                  >
                    <Icon name="close" size={16}/>
                  </button>
                </div>
              </div>
              <div className="tw-form-pair">
                <Select
                  label={`Activity type ${i + 1}`}
                  value={b.type}
                  options={[
                    "Warm-up",
                    "Vocabulary",
                    "Role-play",
                    "Listening",
                    "Speaking",
                    "Reflection",
                  ]}
                  onChange={(v) => changeBlock(b.id, { type: v })}
                />
                <TextField
                  label={`Minutes ${i + 1}`}
                  type="number"
                  min="1"
                  max="60"
                  value={String(b.minutes)}
                  onChange={(v) => changeBlock(b.id, { minutes: Number(v) })}
                />
              </div>
              <TextField
                label={`Block title ${i + 1}`}
                value={b.title}
                onChange={(v) => changeBlock(b.id, { title: v })}
              />
              <TextField
                label={`Learner instructions ${i + 1}`}
                value={b.content}
                onChange={(v) => changeBlock(b.id, { content: v })}
                multiline
              />
            </Panel>
          ))}
          <Button
            kind="secondary"
            icon="plus"
            onClick={() =>
              edit({
                blocks: [
                  ...l.blocks,
                  {
                    id: uid(),
                    type: "Speaking",
                    title: "",
                    content: "",
                    minutes: 5,
                  },
                ],
              })
            }
          >
            Add activity block
          </Button>
          <Panel className="tw-private-notes">
            <TextField
              label="Private teaching notes"
              value={l.notes}
              onChange={(v) => edit({ notes: v })}
              multiline
            />
            <p className="tw-subtle">
              Only for you. Excluded from the learner preview and shared
              material.
            </p>
          </Panel>
        </div>
        <aside className="tw-editor-aside">
          <Panel>
            <Icon name="clock" />
            <h2>
              {l.blocks.reduce((n, b) => n + b.minutes, 0)} minutes of
              possibility
            </h2>
            <p>{l.blocks.length} small activities around one clear outcome.</p>
            <Button
              disabled={!lessonValid(l)}
              onClick={() => navigate({ page: "lesson-preview", id: l.id })}
            >
              Preview learner view
            </Button>
            <Button
              kind="secondary"
              disabled={!lessonValid(l)}
              onClick={() =>
                attempt(() => {}, "Lesson draft saved to your preview library.")
              }
            >
              Save draft
            </Button>
          </Panel>
          <Panel className="tw-ai-panel">
            <Icon name="spark" />
            <h2>A little help, if you want it.</h2>
            <p>
              Try a sample AI-assisted activity. Review it, change it, or leave
              it out.
            </p>
            <Button
              kind="secondary"
              icon="spark"
              onClick={() => navigate({ page: "ai-review", id: l.id })}
            >
              Try optional AI draft
            </Button>
            <span className="tw-subtle">
              Sample content · No AI service connected
            </span>
          </Panel>
        </aside>
      </div>
    </>
  );
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
  const { lessons, sessions, updateLesson, attempt } = useWorkspace();
  const l =
    (sessionId
      ? sessions.find((s) => s.id === sessionId)?.lessonSnapshot
      : undefined) || lessons.find((l) => l.id === id)!;
  if (!l) return null;
  return (
    <>
      <PageHeading
        title="Through your learner’s eyes"
        description={
          l.studentId
            ? `Visible to ${findStudent(l.studentId).name} when you share.`
            : "Review the reusable lesson before saving."
        }
      />
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
                  "Lesson approved for use in this preview.",
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
        title="A draft. Your judgment."
        description="Sample AI assistance for a short, personal lesson."
      />
      {aiUnavailable ? (
        <Panel>
          <h2>The sample draft is unavailable</h2>
          <p>Your lesson is intact. You can continue preparing it yourself.</p>
          <Button onClick={() => navigate({ page: "editor", id: l.id })}>
            Continue manually
          </Button>
        </Panel>
      ) : (
        <>
          <Panel className="tw-ai-review">
            <Badge tone="orange">Unreviewed sample</Badge>
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
                  status: "Draft",
                });
                setNotice(
                  "Sample activity added for you to edit. It is not shared.",
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
  const { lessons, updateLesson, attempt } = useWorkspace();
  const l = lessons.find((l) => l.id === id)!;
  if (!l || !l.studentId) return null;
  const s = findStudent(l.studentId);
  return (
    <>
      <PageHeading
        title="One lesson. One learner."
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
        <div className="tw-actions">
          <Button
            disabled={l.status === "Draft" || l.status === "Shared"}
            onClick={() =>
              attempt(
                () =>
                  updateLesson(l.id, {
                    status: "Shared",
                    sharedVersion: learnerMaterial(l),
                  }),
                `Lesson shared with ${s.name.split(" ")[0]} in this preview.`,
              )
            }
          >
            {l.status === "Shared"
              ? "Shared in preview"
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
        title="Teach when it works for you."
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
            This preview supports Europe/Paris. Switch back before saving; no
            time-zone conversion service is connected.
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
              "Availability published in this preview. Confirmed bookings are preserved.",
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
  const { sessions, lessons, attempt, updateSession } = useWorkspace();
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
                    "Meeting confirmed in this preview.",
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
              <p className="tw-subtle">
                Simulate the learner’s response in this preview.
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
                      "New time confirmed in this preview.",
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
              Commercial change terms are not defined in this prototype; no
              charges are applied.
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
                      "Alternative time proposed in this preview.",
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
          Cancelling releases the time and marks the session as cancelled in
          this preview.
        </p>
        <p className="tw-subtle">
          Cancellation fees, deadlines, and refunds are undecided. This
          prototype makes no charge or refund.
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
                  "Cancellation confirmed in this preview.",
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
  const { sessions, lessons, offline } = useWorkspace();
  const s = sessions.find((s) => s.id === id)!;
  const l = lessons.find((l) => l.id === s.lessonId);
  const [mic, setMic] = useState(true),
    [camera, setCamera] = useState(true),
    [failed, setFailed] = useState(false);
  return (
    <>
      <PageHeading
        title="Ready for a real conversation?"
        description={`${findStudent(s.studentId).name} · ${s.duration} minutes · Online`}
      />
      <Panel className="tw-lobby">
        <div className="tw-camera-preview">
          <img
            src="/assets/onboarding/nori.png"
            alt="Nori in the sample camera preview"
          />
          <span>{camera ? "Sample camera preview" : "Sample camera off"}</span>
        </div>
        <div className="tw-actions">
          <Button kind="secondary" onClick={() => setMic(!mic)}>
            Microphone {mic ? "on" : "off"}
          </Button>
          <Button kind="secondary" onClick={() => setCamera(!camera)}>
            Camera {camera ? "on" : "off"}
          </Button>
        </div>
        <p className="tw-subtle">
          Local call simulation. No camera, microphone, or video service is
          connected.
        </p>
        {failed && (
          <p className="tw-error" role="alert">
            Connection unavailable. Reconnect in Account settings, then retry.
          </p>
        )}
        {(!l || l.status === "Draft") && (
          <p className="tw-callout">
            Approve a prepared lesson before joining this simulation.
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
          {failed ? "Reconnect & join" : "Join sample session"}
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
  const { sessions, lessons, updateSession, offline } = useWorkspace();
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
            ? "A conversation, together."
            : "Your in-person lesson."
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
            <img src="/assets/onboarding/nori.png" alt="Teacher sample tile" />
            <span>You · Teacher</span>
          </div>
          <Badge tone="white">
            {s.format === "Online" ? "Sample call" : "In-person preview"} · 1:1
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
                  `Private recap shared with ${name.split(" ")[0]} in this preview.`,
                )
              }
            >
              {s.recapShared
                ? "Recap shared in preview"
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
              placeholder="What did they practise? What improved?"
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
                  attempt(() => {}, "Recap draft saved in this preview.")
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
            ? "Your teaching, at a glance."
            : "Your teaching. Your own style."
        }
        description={
          preview
            ? "A local preview of the public teaching details."
            : "A profile learners can get to know."
        }
      />
      <Panel className="tw-teaching-profile">
        <div className="tw-profile-hero">
          <span className="tw-teacher-avatar large">
            {p.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h2>{p.name}</h2>
            <p>
              {p.languages} · {p.levels}
            </p>
          </div>
          <Badge tone="orange">Local profile draft</Badge>
        </div>
        <blockquote>{p.approach}</blockquote>
        <div className="tw-profile-facts">
          <span>
            <Icon name="video" />
            {p.format === "Either" ? "Online & in person" : p.format}
          </span>
          {p.format !== "Online" && (
            <span>
              <Icon name="pin" />
              {p.city}
            </span>
          )}
          <span>
            <Icon name="clock" />
            {p.duration}
          </span>
          <strong>€{p.rate} / lesson</strong>
        </div>
        {!preview && (
          <Button
            kind="secondary"
            onClick={() => navigate({ page: "profile-edit" })}
          >
            Edit teaching profile
          </Button>
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
                ? "Identity preview complete"
                : "A little trust goes a long way."}
            </h2>
            <p>
              {p.identity
                ? "You completed a sample check. No identity has been verified."
                : "You can finish the sample identity preview whenever you’re ready."}
            </p>
            <Button
              kind="secondary"
              onClick={() => navigate({ page: "identity", tab: "intro" })}
            >
              Open identity preview
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
function ProfileEditPage({ navigate }: { navigate: Navigate }) {
  const { profile: p, setProfile, setSavedProfile, attempt } = useWorkspace();
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
    Number(p.rate) > 0 &&
    Number(p.rate) <= 1000 &&
    (p.format === "Online" || p.city.trim());
  return (
    <>
      <PageHeading
        title="Help learners picture a lesson with you."
        description="Teaching details are separate from your legal identity."
      />
      <Panel>
        {preview ? (
          <>
            <h2>{p.name}</h2>
            <p>
              {p.languages} · {p.levels}
            </p>
            <blockquote>{p.approach}</blockquote>
            <p>
              {p.format} · {p.duration} · €{p.rate}
            </p>
            {p.format !== "Online" && <p>{p.city}</p>}
            <div className="tw-actions">
              <Button
                onClick={() => {
                  if (
                    attempt(
                      () => setSavedProfile({ ...p }),
                      "Teaching profile updated in this preview. Existing booking terms are preserved.",
                    )
                  )
                    navigate({ page: "profile" });
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
              options={["Online", "In person", "Either"]}
              onChange={(format) => update({ format })}
            />
            {p.format !== "Online" && (
              <TextField
                label="City"
                value={p.city}
                onChange={(city) => update({ city })}
              />
            )}
            <div className="tw-form-pair">
              <Select
                label="Lesson duration"
                value={p.duration}
                options={["30 minutes", "45 minutes", "60 minutes"]}
                onChange={(duration) => update({ duration })}
              />
              <TextField
                label="Rate in euros"
                value={p.rate}
                type="number"
                min="1"
                max="1000"
                onChange={(rate) => update({ rate })}
              />
            </div>
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
  const { offline, setOffline, aiUnavailable, setAiUnavailable } =
    useWorkspace();
  return (
    <>
      <PageHeading
        title="A workspace that’s yours."
        description="Account preferences and preview controls."
      />
      <Panel>
        <SectionTitle>Preview connection</SectionTitle>
        <p>
          Try the recovery paths without connecting external services. Failed
          saves and sharing keep the draft.
        </p>
        <div className="tw-setting-row">
          <div>
            <strong>Connection available</strong>
            <span>Used for sample sharing and confirmations</span>
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
            <strong>AI sample available</strong>
            <span>Optional sample draft, always teacher-reviewed</span>
          </div>
          <button
            className={`tw-toggle ${!aiUnavailable ? "on" : ""}`}
            role="switch"
            aria-checked={!aiUnavailable}
            aria-label="AI sample available"
            onClick={() => setAiUnavailable((v) => !v)}
          >
            <span />
          </button>
        </div>
      </Panel>
      <Panel>
        <SectionTitle>Privacy in this preview</SectionTitle>
        <p>
          Messages, feedback, and teaching notes use local sample data. No
          email, recording, calendar, payment, or AI request is sent. Reloading
          resets workspace edits.
        </p>
        <div className="tw-actions">
          <a className="tw-button tw-secondary" href="/?teacher=1&view=web">
            Open web app
          </a>
          <a className="tw-button tw-secondary" href="/?teacher=1">
            Open mobile app
          </a>
          <a className="tw-button tw-quiet" href="/">
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
        title="A little help, right here."
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
            "The draft stays editable and is never marked as sent. Restore the preview connection in Account settings, then retry.",
          ],
          [
            "How does a time change work?",
            "Propose a replacement and wait for the learner to accept. The original confirmed booking stays reserved until the new time is confirmed.",
          ],
          [
            "What is connected in this preview?",
            "The screens and local state are interactive. Video, AI, identity, calendars, payments, and message delivery are simulations. Workspace changes reset on reload.",
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
        title="Your teaching deserves clarity."
        description="A payout concept with sample data. No money moves."
      />
      <div className="tw-payout-summary">
        <Panel>
          <span>Sample session earnings</span>
          <h2>€120.00</h2>
          <p>4 completed sample sessions</p>
        </Panel>
        <Panel>
          <span>Sample transfer</span>
          <h2>{setup ? status : "Setup needed"}</h2>
          <p>
            {status === "Pending"
              ? "Waiting for a provider status update"
              : "Sample provider state"}
          </p>
        </Panel>
      </div>
      <Panel>
        <SectionTitle>Payout details</SectionTitle>
        <p>
          Provider, fees, transfer timing, and automatic versus requested
          payouts are undecided.
        </p>
        {!setup ? (
          <>
            <p>
              A real provider would collect payout details securely. This sample
              does not request bank information.
            </p>
            <Button onClick={() => setSetup(true)}>
              Try sample provider setup
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
              {status === "Paid" ? "Payout received · Sample" : status}
            </Badge>
            <p>
              {status === "Pending"
                ? "Pending is still waiting, not failed. No duplicate transfer is initiated."
                : status === "Action needed"
                  ? "Follow the sample provider instructions: check your payout setup. No bank details are collected."
                  : "This is a sample completed transfer; no payment has been made."}
            </p>
            <Select
              label="Simulate provider status"
              value={status}
              options={["Pending", "Action needed", "Paid"]}
              onChange={setStatus}
            />
            {status === "Action needed" && (
              <Button kind="secondary" onClick={() => setStatus("Pending")}>
                Confirm sample setup & recheck
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
        title="A little trust goes a long way."
        description="Sample identity preview. No real verification is submitted."
      />
      <Panel>
        {step === "intro" ? (
          <>
            <p>
              Identity is separate from teaching qualifications. Choose a local
              preview route.
            </p>
            <div className="tw-actions">
              <Button onClick={() => next("name")}>
                Use sample document route
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
            <h2>Link a sample Persona ID</h2>
            <p>
              No Persona account is connected. This confirms a local sample link
              only.
            </p>
            <div className="tw-actions">
              <Button onClick={finish}>Confirm sample link</Button>
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
            <h2>Use a sample document</h2>
            <p>
              No document upload is collected. {a.country} · {a.documentType}
            </p>
            <Button onClick={() => next("selfie")}>Use sample document</Button>
          </>
        ) : (
          <>
            <img
              className="tw-identity-nori"
              src="/assets/onboarding/nori.png"
              alt="Nori"
            />
            <h2>Confirm the sample check</h2>
            <p>
              No camera or selfie is collected. Your identity has not been
              verified.
            </p>
            <Button onClick={finish}>Complete sample preview</Button>
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
      return <ResultsPage id={r.id} navigate={navigate} />;
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
      return <ProfileEditPage navigate={navigate} />;
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
