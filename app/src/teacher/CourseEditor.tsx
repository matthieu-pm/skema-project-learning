import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { createPortal } from "react-dom";
import {
  BottomSheet,
  useKeyboard,
  useKeyboardInsets,
  useScreenPortal,
  useFlow,
} from "../mobile";
import {
  Badge,
  Button,
  Icon,
  Select,
  TextField,
  useWorkspace,
  type Navigate,
} from "./components";
import { lessonPublicationIssues, lessonPriceLabel } from "../lesson-settings";
import { students, type Lesson } from "./model";
import { BlockSummary, StudentBlock } from "./CourseContent";
import { CourseProperties } from "./CourseProperties";
import {
  cloneCourse,
  courseIssues,
  coursePatch,
  createBlock,
  createModule,
  fromLesson,
  id as newId,
  moduleTypes,
  moveOutline,
  practiceFormats,
  readyTemplates,
  teachFormats,
  totalMinutes,
  type Course,
  type CourseBlock,
  type CourseModule,
  type Format,
  type ModuleType,
  type Move,
  type Purpose,
} from "./course";
import { writeDraft } from "./course-storage";
import "./course-editor.css";

function EditorActions({ children }: { children: ReactNode }) {
  const { mobile } = useWorkspace();
  return mobile ? (
    <MobileEditorActions>{children}</MobileEditorActions>
  ) : (
    <footer className="ce-editor-footer" aria-label="Lesson actions">
      {children}
    </footer>
  );
}
function MobileEditorActions({ children }: { children: ReactNode }) {
  const flow = useFlow();
  const screenId = useRef(flow.current.id);
  const { screenRef } = useScreenPortal();
  const { bottomInset } = useKeyboardInsets();
  // Portaled controls must not remain active on a previous FlowStack screen.
  if (flow.current.id !== screenId.current || !screenRef.current) return null;
  return createPortal(
    <footer
      className="teacher-workspace ce-editor-footer ce-phone-actions"
      aria-label="Lesson actions"
      style={{ bottom: bottomInset + 70 }}
    >
      {children}
    </footer>,
    screenRef.current,
  );
}

function EditorDialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const { mobile } = useWorkspace();
  if (mobile)
    return (
      <BottomSheet
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        title={title}
        snap={0.76}
      >
        <div className="teacher-workspace ce-sheet">
          <div className="ce-dialog-content">
            <Button kind="quiet" onClick={onClose}>
              Close {title.toLowerCase()}
            </Button>
            {children}
          </div>
        </div>
      </BottomSheet>
    );
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="ce-overlay" />
        <Dialog.Content
          aria-describedby={undefined}
          className={`teacher-workspace ce-dialog ${wide ? "ce-wide" : ""}`}
        >
          <div className="ce-dialog-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="tw-icon-button" aria-label="Close dialog">
              <Icon name="close" />
            </Dialog.Close>
          </div>
          <div className="ce-dialog-content">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function LessonPlayer({ course: c }: { course: Course }) {
  const [step, setStep] = useState(0),
    [finished, setFinished] = useState(false);
  const sequence = c.modules.flatMap((m) =>
    m.blocks.map((b) => ({ module: m, block: b })),
  );
  const current = sequence[step];
  if (!current) return <p>Add a block to preview this lesson.</p>;
  return (
    <div className="ce-student-preview">
      <div className="ce-student-heading">
        <small>
          {c.language} · {c.level} · {totalMinutes(c)} min
        </small>
        <h3>{c.title}</h3>
        <div
          className="ce-progress"
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuenow={step + 1}
          aria-valuemin={0}
          aria-valuemax={sequence.length}
        >
          <span style={{ width: `${((step + 1) / sequence.length) * 100}%` }} />
        </div>
        <strong>
          {current.module.type} · {current.module.title}
        </strong>
        <small>
          Block {step + 1} of {sequence.length} · {current.module.minutes} min
          in this module
        </small>
      </div>
      {finished ? (
        <div className="ce-finished">
          <Icon name="check" size={48} />
          <h2>Lesson complete</h2>
          <p>Take one useful phrase into your next conversation.</p>
          <Button
            kind="secondary"
            onClick={() => {
              setFinished(false);
              setStep(0);
            }}
          >
            Restart preview
          </Button>
        </div>
      ) : (
        <StudentBlock
          key={current.block.id}
          block={current.block}
          language={c.language}
        />
      )}
      {!finished && (
        <div className="ce-student-navigation">
          <Button
            kind="secondary"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            Previous
          </Button>
          <Button
            onClick={() =>
              step === sequence.length - 1
                ? setFinished(true)
                : setStep(step + 1)
            }
          >
            {step === sequence.length - 1 ? "Finish lesson" : "Next block"}
          </Button>
        </div>
      )}
      <small className="ce-simulation">
        Student preview · responses and sharing are simulated
      </small>
    </div>
  );
}
export default function CourseEditor({
  id,
  navigate,
}: {
  id?: string;
  navigate: Navigate;
}) {
  const { lessons } = useWorkspace(),
    lesson = lessons.find((l) => l.id === id);
  return lesson ? (
    <Editor key={lesson.id} lesson={lesson} navigate={navigate} />
  ) : (
    <>
      <h1>Lesson unavailable</h1>
      <Button onClick={() => navigate({ page: "lessons" })}>
        Back to lessons
      </Button>
    </>
  );
}
function Editor({ lesson, navigate }: { lesson: Lesson; navigate: Navigate }) {
  const {
    mobile,
    updateLesson,
    setLessons,
    templates,
    setTemplates,
    setNotice,
    editorHistories,
    setEditorHistories,
    offline,
    savedProfile,
  } = useWorkspace();
  const keyboard = useKeyboard(),
    c = useMemo(() => fromLesson(lesson), [lesson]);
  const builtInTemplates = useMemo(readyTemplates, []);
  const initial = useRef(c),
    [moduleId, setModuleId] = useState(c.modules[0]?.id),
    [blockId, setBlockId] = useState<string | undefined>(
      c.modules[0]?.blocks[0]?.id,
    ),
    [tab, setTab] = useState("Lesson"),
    [library, setLibrary] = useState("Modules"),
    [mobilePanel, setMobilePanel] = useState("Canvas"),
    [modal, setModal] = useState<
      "preview" | "published" | "block" | "module" | "apply" | null
    >(null),
    [purpose, setPurpose] = useState<Purpose>("Teach"),
    [recipient, setRecipient] = useState(lesson.studentId || ""),
    [asTemplate, setAsTemplate] = useState(false),
    [templateName, setTemplateName] = useState(c.title),
    [errors, setErrors] = useState<string[]>([]),
    [moveMenu, setMoveMenu] = useState<string | null>(null),
    [dragging, setDragging] = useState(false);
  const cleanupDrag = useRef<(() => void) | undefined>(undefined);
  const histories = editorHistories[lesson.id] || { past: [], future: [] };
  const selectedModule =
      c.modules.find((m) => m.id === moduleId) || c.modules[0],
    selectedBlock = selectedModule?.blocks.find((b) => b.id === blockId);
  const saved = lesson.savedEditor || initial.current,
    changed = JSON.stringify(saved) !== JSON.stringify(c),
    applied =
      !!lesson.publishedEditor &&
      JSON.stringify(lesson.publishedEditor.content) === JSON.stringify(c);
  const status = applied
    ? "Applied"
    : changed
      ? "Draft · Edited"
      : lesson.savedAt
        ? "Draft · Saved"
        : "Draft";
  const commit = (next: Course) => {
    if (JSON.stringify(next) === JSON.stringify(c)) return;
    setEditorHistories((h) => ({
      ...h,
      [lesson.id]: {
        past: [...(h[lesson.id]?.past || []), structuredClone(c)].slice(-80),
        future: [],
      },
    }));
    updateLesson(lesson.id, coursePatch(next));
    setErrors([]);
  };
  const undo = (redo = false) => {
    const stack = redo ? histories.future : histories.past,
      next = stack.at(-1);
    if (!next) return;
    setEditorHistories((h) => ({
      ...h,
      [lesson.id]: redo
        ? {
            past: [...histories.past, c],
            future: histories.future.slice(0, -1),
          }
        : {
            past: histories.past.slice(0, -1),
            future: [...histories.future, c],
          },
    }));
    updateLesson(lesson.id, coursePatch(next));
    setErrors([]);
    setNotice(redo ? "Action redone." : "Action undone.");
  };
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (changed) e.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [changed]);
  useEffect(() => () => cleanupDrag.current?.(), []);
  // Do not intercept native text-field undo or keyboard shortcuts in another view.
  const shortcuts = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setMoveMenu(null);
    if (
      (e.metaKey || e.ctrlKey) &&
      e.key.toLowerCase() === "z" &&
      !(
        e.target instanceof HTMLElement &&
        e.target.closest("input,textarea,[contenteditable]")
      )
    ) {
      e.preventDefault();
      undo(e.shiftKey);
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      save();
    }
  };
  const open = (next: typeof modal) => {
    keyboard.hide();
    setMoveMenu(null);
    if (mobile && next === "preview") {
      navigate({ page: "lesson-preview", id: lesson.id });
      return;
    }
    setModal(next);
  };
  const changeModule = (m: CourseModule) =>
    commit({ ...c, modules: c.modules.map((x) => (x.id === m.id ? m : x)) });
  const changeBlock = (b: CourseBlock) => {
    if (selectedModule)
      changeModule({
        ...selectedModule,
        blocks: selectedModule.blocks.map((x) => (x.id === b.id ? b : x)),
      });
  };
  const selectModule = (m: CourseModule) => {
    setModuleId(m.id);
    setBlockId(undefined);
    setTab("Module");
    setMoveMenu(null);
  };
  const selectBlock = (m: CourseModule, b: CourseBlock, properties = false) => {
    setModuleId(m.id);
    setBlockId(b.id);
    setTab("Block");
    setMoveMenu(null);
    if (properties) setMobilePanel("Properties");
  };
  const addBlock = (format: Format, usePurpose = purpose) => {
    if (!selectedModule) {
      open("module");
      return;
    }
    const block = createBlock(format, usePurpose);
    if (
      ["Flashcards", "Vocabulary recall", "Useful phrases"].includes(format)
    ) {
      const source = selectedModule.blocks.find((b) =>
        ["Flashcards", "Vocabulary recall", "Useful phrases"].includes(
          b.format,
        ),
      );
      if (source) block.words = structuredClone(source.words);
    }
    changeModule({
      ...selectedModule,
      blocks: [...selectedModule.blocks, block],
    });
    setBlockId(block.id);
    setTab("Block");
    setMobilePanel("Properties");
    setModal(null);
    setNotice(`${format} block added. Edit its content in Block properties.`);
  };
  const addModule = (type: ModuleType) => {
    const m = createModule(type);
    commit({ ...c, modules: [...c.modules, m] });
    setModuleId(m.id);
    setBlockId(undefined);
    setTab("Module");
    setMobilePanel("Properties");
    setModal(null);
  };
  const deleteModule = () => {
    if (!selectedModule) return;
    commit({
      ...c,
      modules: c.modules.filter((m) => m.id !== selectedModule.id),
    });
    setBlockId(undefined);
    setNotice("Module deleted. Use Undo to restore it.");
  };
  const deleteBlock = () => {
    if (!selectedModule || !selectedBlock) return;
    changeModule({
      ...selectedModule,
      blocks: selectedModule.blocks.filter((b) => b.id !== selectedBlock.id),
    });
    setBlockId(undefined);
    setNotice("Block deleted. Use Undo to restore it.");
  };
  const save = (apply = false) => {
    if (apply && offline) {
      setErrors([
        "You’re offline in this simulation. Reconnect in Account settings, then apply. Your draft is still editable.",
      ]);
      return false;
    }
    const issues = apply ? [...courseIssues(c), ...lessonPublicationIssues(savedProfile, !!recipient)] : [];
    if (apply && !recipient && !asTemplate)
      issues.push("Select a student or save this lesson as a template.");
    if (apply && asTemplate && !templateName.trim())
      issues.push("Give your template a name.");
    if (issues.length) {
      setErrors(issues);
      return false;
    }
    const now = new Date().toISOString();
    const next: Lesson = {
      ...lesson,
      ...coursePatch(c),
      savedEditor: structuredClone(c),
      savedAt: now,
      ...(apply
        ? {
            publishedEditor: {
              content: structuredClone(c),
              studentId: recipient,
              appliedAt: now,
            },
            status: recipient ? "Shared" : "Approved",
          }
        : {}),
    };
    const nextTemplates =
      apply && asTemplate
        ? [
            ...templates,
            {
              id: newId(),
              name: templateName.trim(),
              level: c.level,
              content: structuredClone(c),
              own: true,
            },
          ]
        : templates;
    try {
      writeDraft(next, nextTemplates);
    } catch {
      setErrors([
        "Changes could not be saved on this device. Free up browser storage and try Save changes again. Your edits are still here.",
      ]);
      return false;
    }
    updateLesson(lesson.id, next);
    setTemplates(nextTemplates);
    setErrors([]);
    if (apply) {
      setModal(null);
      setNotice(
        `Changes applied in this prototype${recipient ? ` for ${students.find((s) => s.id === recipient)?.name}` : ""}${asTemplate ? "; template saved" : ""}.`,
      );
    } else
      setNotice(
        "Changes saved on this device. The applied lesson is unchanged.",
      );
    return true;
  };
  const useTemplate = (content: Course) => {
    const course = cloneCourse(content),
      lessonId = newId();
    setLessons((ls) => [
      ...ls,
      {
        id: lessonId,
        title: course.title,
        outcome: course.goal,
        language: course.language,
        level: course.level,
        notes: "",
        blocks: [],
        archived: false,
        status: "Draft",
        ...coursePatch(course),
      },
    ]);
    navigate({ page: "editor", id: lessonId });
    setNotice("An editable template copy is ready. The original is preserved.");
  };
  const move = (from: Move, to: Move, after = false) => {
    const next = moveOutline(c, from, to, after);
    commit(next);
    if (next !== c)
      setNotice("Lesson sequence updated. Use Undo to restore it.");
    setMoveMenu(null);
  };
  const startDrag = (e: PointerEvent, from: Move) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    keyboard.hide();
    const start = { x: e.clientX, y: e.clientY };
    let moved = false;
    const pointerMove = (event: globalThis.PointerEvent) => {
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) {
        moved = true;
        setDragging(true);
      }
    };
    const end = (event: globalThis.PointerEvent) => {
      stop();
      setDragging(false);
      if (!moved) return;
      const row = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-ce-module]");
      if (!row?.dataset.ceModule) return;
      const rect = row.getBoundingClientRect();
      move(
        from,
        {
          moduleId: row.dataset.ceModule,
          blockId: from.blockId ? row.dataset.ceBlock : undefined,
        },
        event.clientY > rect.top + rect.height / 2,
      );
    };
    const stop = () => {
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", cancel);
    };
    const cancel = () => {
      stop();
      setDragging(false);
    };
    cleanupDrag.current?.();
    cleanupDrag.current = stop;
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", cancel);
  };
  const grip = (from: Move, title: string) => (
    <button
      className="ce-grip"
      data-scroll-drag="ignore"
      aria-label={`Drag ${title}`}
      title="Drag to reorder; use More actions for keyboard controls"
      onPointerDown={(e) => startDrag(e, from)}
    >
      <Icon name="grip" size={14} />
    </button>
  );
  const more = (target: Move, title: string, i: number, count: number) => (
    <div className="ce-outline-more">
      <button
        className="tw-icon-button"
        aria-label={`More actions for ${title}`}
        aria-expanded={moveMenu === (target.blockId || target.moduleId)}
        onClick={() => {
          keyboard.hide();
          setMoveMenu(
            moveMenu === (target.blockId || target.moduleId)
              ? null
              : target.blockId || target.moduleId,
          );
        }}
      >
        <Icon name="more" size={16} />
      </button>
      {moveMenu === (target.blockId || target.moduleId) && (
        <div className="ce-move-menu">
          <Button
            kind="quiet"
            disabled={i === 0}
            onClick={() => {
              const previous = target.blockId
                ? c.modules.find((m) => m.id === target.moduleId)!.blocks[i - 1]
                    .id
                : undefined;
              move(target, {
                moduleId: target.blockId
                  ? target.moduleId
                  : c.modules[i - 1].id,
                blockId: previous,
              });
            }}
          >
            Move earlier
          </Button>
          <Button
            kind="quiet"
            disabled={i === count - 1}
            onClick={() => {
              const next = target.blockId
                ? c.modules.find((m) => m.id === target.moduleId)!.blocks[i + 1]
                    .id
                : undefined;
              move(
                target,
                {
                  moduleId: target.blockId
                    ? target.moduleId
                    : c.modules[i + 1].id,
                  blockId: next,
                },
                true,
              );
            }}
          >
            Move later
          </Button>
          {target.blockId && (
            <Select
              label="Move to module"
              value=""
              options={[
                { value: "", label: "Choose module" },
                ...c.modules
                  .filter((m) => m.id !== target.moduleId)
                  .map((m) => ({ value: m.id, label: m.title })),
              ]}
              onChange={(v) => {
                if (v) move(target, { moduleId: v });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
  const formatIcon = (f: string) =>
    f === "Audio"
      ? "audio"
      : ["Spoken response", "Role-play"].includes(f)
        ? "message"
        : f === "Video"
          ? "video"
          : f === "Image"
            ? "image"
            : f === "Document"
              ? "document"
              : ["Text box", "Transcript", "Lesson recap"].includes(f)
                ? "text"
                : "book";
  const paletteItem = (format: Format, p: Purpose) => (
    <button
      className="ce-palette-item"
      key={format}
      draggable={!mobile}
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "application/mimo-block",
          JSON.stringify({ format, purpose: p }),
        );
      }}
      onClick={() => addBlock(format, p)}
    >
      <Icon name={formatIcon(format)} />
      <span>{format}</span>
      <Icon name="plus" size={14} />
    </button>
  );
  return (
    <div
      className={`ce-editor ${dragging ? "ce-dragging" : ""}`}
      onKeyDown={shortcuts}
    >
      {errors.length > 0 && !modal && (
        <div className="ce-warning" role="alert">
          {errors.map((s) => (
            <p key={s}>{s}</p>
          ))}
        </div>
      )}
      <nav className="ce-mobile-panels" aria-label="Editor areas">
        {["Elements", "Canvas", "Properties"].map((p) => (
          <button
            key={p}
            aria-pressed={mobilePanel === p}
            onClick={() => {
              keyboard.hide();
              setMobilePanel(p);
            }}
          >
            {p}
          </button>
        ))}
      </nav>
      <div className="ce-layout" data-mobile-panel={mobilePanel}>
        <aside className="ce-elements">
          <div className="ce-panel-heading">
            <div className="ce-heading-title">
              <h2>Elements</h2>
              <div
                className="ce-history"
                role="group"
                aria-label="Edit history"
              >
                {" "}
                <button
                  className="tw-icon-button"
                  aria-label="Undo"
                  title="Undo (⌘/Ctrl Z)"
                  disabled={!histories.past.length}
                  onClick={() => undo()}
                >
                  <Icon name="undo" />
                </button>
                <button
                  className="tw-icon-button"
                  aria-label="Redo"
                  title="Redo (⌘/Ctrl Shift Z)"
                  disabled={!histories.future.length}
                  onClick={() => undo(true)}
                >
                  <Icon name="redo" />
                </button>
              </div>
            </div>
          </div>
          <div className="ce-tabs">
            {["Modules", "Teach", "Practise", "Templates"].map((t) => (
              <button
                key={t}
                aria-pressed={library === t}
                onClick={() => setLibrary(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="ce-palette">
            {library === "Modules" ? (
              <>
                <p>
                  Choose a learning focus. Add any teaching or practice blocks.
                </p>
                <div className="ce-module-palette">
                  {moduleTypes.map((type) => (
                    <button key={type} onClick={() => addModule(type)}>
                      <Icon name={type === "Listening" ? "message" : "book"} />
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : library === "Templates" ? (
              <>
                <p>
                  Start an editable copy. Your current lesson stays in the
                  library.
                </p>
                {[...builtInTemplates, ...templates].map((t) => (
                  <section className="ce-template" key={t.id}>
                    <Badge>
                      {t.own ? "Your template" : "Ready-made"} · {t.level}
                    </Badge>
                    <h3>{t.name}</h3>
                    <p>
                      {t.content.modules.length} modules ·{" "}
                      {totalMinutes(t.content)} min
                    </p>
                    <Button
                      kind="secondary"
                      onClick={() => useTemplate(t.content)}
                    >
                      Use template
                    </Button>
                  </section>
                ))}
              </>
            ) : (
              (library === "Teach" ? teachFormats : practiceFormats).map((f) =>
                paletteItem(f, library as Purpose),
              )
            )}
          </div>
          <div className="ce-outline">
            <div className="ce-panel-heading">
              <h2>Lesson outline</h2>
              <button
                className="tw-icon-button"
                aria-label="Add module to outline"
                onClick={() => open("module")}
              >
                <Icon name="plus" size={16} />
              </button>
            </div>
            <p className="ce-outline-hint">
              Drag the grip to reorder. More actions offers the same controls.
            </p>
            {!c.modules.length && (
              <p>Add a module to start building your lesson.</p>
            )}
            {c.modules.map((m, i) => (
              <div className="ce-outline-group" key={m.id}>
                <div
                  className={`ce-outline-row ${selectedModule?.id === m.id && !selectedBlock ? "selected" : ""}`}
                  data-ce-module={m.id}
                >
                  {grip({ moduleId: m.id }, m.title)}
                  <button
                    className="ce-outline-title"
                    onClick={() => selectModule(m)}
                  >
                    <span>
                      {String(i + 1).padStart(2, "0")} · {m.title}
                    </span>
                    <small>
                      {m.type} · {m.minutes} min
                    </small>
                  </button>
                  {more({ moduleId: m.id }, m.title, i, c.modules.length)}
                </div>
                {m.blocks.map((b, j) => (
                  <div
                    className={`ce-outline-row ce-outline-block ${selectedBlock?.id === b.id ? "selected" : ""}`}
                    data-ce-module={m.id}
                    data-ce-block={b.id}
                    key={b.id}
                  >
                    {grip({ moduleId: m.id, blockId: b.id }, b.title)}
                    <button
                      className="ce-outline-title"
                      onClick={() => selectBlock(m, b)}
                    >
                      <span>{b.title}</span>
                      <small>
                        {b.purpose} · {b.format}
                      </small>
                    </button>
                    {more(
                      { moduleId: m.id, blockId: b.id },
                      b.title,
                      j,
                      m.blocks.length,
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>
        <main className="ce-canvas">
          <div className="ce-canvas-label">
            <span>Module editor</span>
            <span className="ce-view-status">
              <span>Teacher view</span>
              <Badge tone={applied ? "green" : "orange"}>{status}</Badge>
            </span>
          </div>
          <div className="ce-lesson-paper">
            <div className="ce-lesson-heading">
              <h1>{c.title || "Untitled lesson"}</h1>
              <div className="ce-lesson-metadata">
                <span>{c.language}</span>
                <span>{c.level}</span>
                <span>
                  <Icon name="clock" size={14} />
                  {totalMinutes(c)} min
                </span>
              </div>
              <p>{c.goal || "Add a learning goal in Lesson properties."}</p>
            </div>
            {c.modules.map((m, i) => (
              <section
                className={`ce-module ${selectedModule?.id === m.id ? "ce-module-selected" : ""}`}
                key={m.id}
                onDragOver={(e) => {
                  if (e.dataTransfer.types.includes("application/mimo-block"))
                    e.preventDefault();
                }}
                onDrop={(e) => {
                  const raw = e.dataTransfer.getData("application/mimo-block");
                  if (!raw) return;
                  e.preventDefault();
                  try {
                    const data = JSON.parse(raw);
                    if (
                      ![...teachFormats, ...practiceFormats].includes(
                        data.format,
                      ) ||
                      !["Teach", "Practise"].includes(data.purpose)
                    )
                      return;
                    const b = createBlock(data.format, data.purpose);
                    commit({
                      ...c,
                      modules: c.modules.map((x) =>
                        x.id === m.id ? { ...x, blocks: [...x.blocks, b] } : x,
                      ),
                    });
                    setModuleId(m.id);
                    setBlockId(b.id);
                    setTab("Block");
                  } catch {
                    /* Ignore unrelated drops. */
                  }
                }}
              >
                <button
                  className="ce-module-heading"
                  onClick={() => {
                    selectModule(m);
                    if (mobile) setMobilePanel("Properties");
                  }}
                >
                  <span className="ce-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <small>
                      {m.type} · {m.minutes} min
                    </small>
                    <h2>{m.title}</h2>
                    <p>{m.goal || "Add this module’s learning goal."}</p>
                  </span>
                  <Icon name="settings" size={18} />
                </button>
                {m.blocks.map((b) => (
                  <article
                    className={`ce-canvas-block ${selectedBlock?.id === b.id ? "selected" : ""}`}
                    key={b.id}
                  >
                    <button
                      className="ce-block-select"
                      onClick={() => selectBlock(m, b, mobile)}
                      aria-label={`Edit ${b.title}`}
                    >
                      <span
                        className={`ce-purpose ${b.purpose === "Teach" ? "teach" : "practice"}`}
                      >
                        {b.purpose}
                      </span>
                      <span>{b.format}</span>
                      <Icon name="settings" size={16} />
                    </button>
                    <div onClick={() => selectBlock(m, b)}>
                      <h3>{b.title}</h3>
                      <p>{b.instructions}</p>
                      <BlockSummary block={b} />
                    </div>
                  </article>
                ))}
                <button
                  className="ce-add-block"
                  onClick={() => {
                    setModuleId(m.id);
                    open("block");
                  }}
                >
                  <Icon name="plus" size={16} />
                  Add block
                </button>
              </section>
            ))}
            <button className="ce-add-module" onClick={() => open("module")}>
              <Icon name="plus" />
              Add module
            </button>
          </div>
          <p className="ce-canvas-footnote">
            Select a block to edit it. Preview shows one block at a time.
          </p>
          {lesson.publishedEditor && (
            <div className="ce-applied-link">
              <button
                className="tw-text-link"
                onClick={() => open("published")}
              >
                View applied version
              </button>
              <small>
                {lesson.publishedEditor.studentId
                  ? `Assigned to ${students.find((s) => s.id === lesson.publishedEditor!.studentId)?.name}`
                  : "Saved as a reusable template"}
              </small>
            </div>
          )}
        </main>
        <CourseProperties
          tab={tab}
          course={c}
          module={selectedModule}
          block={selectedBlock}
          onTab={setTab}
          changeCourse={commit}
          changeModule={changeModule}
          changeBlock={changeBlock}
          addModule={() => open("module")}
          deleteModule={deleteModule}
          addBlock={() => open("block")}
          deleteBlock={deleteBlock}
        />
      </div>
      <EditorActions>
        <div className="ce-footer-back">
          <Button
            kind="secondary"
            icon="back"
            onClick={() => navigate({ page: "lessons", tab: "Library" }, true)}
          >
            Back
          </Button>
        </div>
        <div className="ce-bottom-actions">
          <Button kind="secondary" onClick={() => open("preview")}>
            Preview lesson
          </Button>
          <Button kind="secondary" onClick={() => save()}>
            Save changes
          </Button>
          <Button
            onClick={() => {
              setErrors([]);
              open("apply");
            }}
          >
            Apply changes
          </Button>
        </div>
      </EditorActions>
      {modal && (
        <EditorDialog
          title={
            modal === "published"
              ? "Applied version"
              : modal === "preview"
                ? "Preview lesson"
                : modal === "apply"
                  ? "Apply lesson changes"
                  : modal === "module"
                    ? "Add module"
                    : "Add block"
          }
          onClose={() => setModal(null)}
          wide={modal === "preview" || modal === "published"}
        >
          {modal === "published" && lesson.publishedEditor ? (
            <LessonPlayer course={lesson.publishedEditor.content} />
          ) : modal === "preview" ? (
            <LessonPlayer course={c} />
          ) : modal === "module" ? (
            <>
              <p>
                Choose the focus. You can change its type and sequence anytime.
              </p>
              <div className="ce-module-palette">
                {moduleTypes.map((type) => (
                  <button key={type} onClick={() => addModule(type)}>
                    <Icon name="book" />
                    {type}
                  </button>
                ))}
              </div>
            </>
          ) : modal === "block" ? (
            <>
              <p>Add content to {selectedModule?.title || "a module"}.</p>
              <div className="ce-tabs">
                {(["Teach", "Practise"] as Purpose[]).map((p) => (
                  <button
                    key={p}
                    aria-pressed={purpose === p}
                    onClick={() => setPurpose(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="ce-block-chooser">
                {(purpose === "Teach" ? teachFormats : practiceFormats).map(
                  (f) => paletteItem(f, purpose),
                )}
              </div>
            </>
          ) : (
            <>
              <p>
                Apply this version for a student, save it as a reusable
                template, or do both.
              </p>
              <p className="ce-info">
                Prototype only · changes and files stay in this browser. No
                student is notified.
              </p>
              <Select
                label="Student"
                value={recipient}
                options={[
                  {
                    value: "",
                    label: "Choose a student (optional for a template)",
                  },
                  ...students.map((s) => ({
                    value: s.id,
                    label: `${s.name} · ${s.language} ${s.level}`,
                  })),
                ]}
                onChange={setRecipient}
              />
              {recipient && (
                <div className="ce-info">
                  <strong>Lesson details</strong>
                  <p>{savedProfile.duration || "Duration not set"} · {lessonPriceLabel(savedProfile.rate, savedProfile.freeConfirmed)} per lesson</p>
                  {lessonPublicationIssues(savedProfile, true).length > 0 && <>
                    <p>Set duration and price before publishing for a student. Your draft and templates can still be saved.</p>
                    <Button kind="secondary" onClick={() => {
                      if (save()) navigate({ page: "profile-edit", id: lesson.id, tab: "return-to-editor" });
                    }}>Edit teaching profile</Button>
                  </>}
                </div>
              )}
              <label className="ce-checkbox">
                <input
                  type="checkbox"
                  checked={asTemplate}
                  onChange={(e) => setAsTemplate(e.target.checked)}
                />
                Save as a template
              </label>
              {asTemplate && (
                <TextField
                  label="Template name"
                  value={templateName}
                  onChange={setTemplateName}
                />
              )}
              {errors.length > 0 && (
                <div className="ce-warning" role="alert">
                  <strong>Complete these before applying</strong>
                  {errors.map((s, i) => (
                    <p key={i}>{s}</p>
                  ))}
                </div>
              )}
              <div className="ce-actions">
                <Button kind="secondary" onClick={() => setModal(null)}>
                  Keep editing
                </Button>
                <Button onClick={() => save(true)}>Apply changes</Button>
              </div>
            </>
          )}
        </EditorDialog>
      )}
    </div>
  );
}
