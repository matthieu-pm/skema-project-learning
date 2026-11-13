import {
  useEffect,
  useId,
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
  MobileScroll,
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
import { StudentBlock } from "./CourseContent";
import { BlockProperties } from "./CourseProperties";
import { LiveLessonPreview } from "./LiveLessonPreview";
import { InlineField } from "./InlineField";
import {
  cloneCourse,
  courseIssues,
  coursePatch,
  createBlock,
  createModule,
  fromLesson,
  id as newId,
  moduleHeading,
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
import { writeDraft, writeLibraryChanges } from "./course-storage";
import { prepareLessonUse, useLessonErrors, type UseErrors } from "./lesson-use";
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
  busy = false,
  description,
  restoreFocus,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  busy?: boolean;
  description?: string;
  restoreFocus?: () => void;
}) {
  const { mobile } = useWorkspace();
  if (mobile)
    return (
      <BottomSheet
        open
        onOpenChange={(open) => {
          if (!open && !busy) onClose();
        }}
        title={title}
        description={description}
        snap={0.76}
      >
        <div className="teacher-workspace ce-sheet">
          <div className="ce-dialog-content">
            {title === "Use lesson" ? <button className="tw-icon-button" aria-label="Close dialog" disabled={busy} onClick={onClose}><Icon name="close" /></button> : <Button kind="quiet" onClick={onClose}>
              Close {title.toLowerCase()}
            </Button>}
            {children}
          </div>
        </div>
      </BottomSheet>
    );
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="ce-overlay" />
        <Dialog.Content
          {...(!description ? { "aria-describedby": undefined } : {})}
          onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}
          onPointerDownOutside={event => { if (busy) event.preventDefault(); }}
          onCloseAutoFocus={event => { if (restoreFocus) { event.preventDefault(); restoreFocus(); } }}
          className={`teacher-workspace ce-dialog ${wide ? "ce-wide" : ""}`}
        >
          <div className="ce-dialog-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="tw-icon-button" aria-label="Close dialog" disabled={busy}>
              <Icon name="close" />
            </Dialog.Close>
          </div>
          {description && <Dialog.Description className="ce-dialog-description">{description}</Dialog.Description>}
          <div className="ce-dialog-content">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function LessonPlayer({ course: c, fitMobile = false }: { course: Course; fitMobile?: boolean }) {
  const { mobile } = useWorkspace();
  const { isKeyboardVisible, keyboardHeight } = useKeyboardInsets();
  const activityRef = useRef<HTMLDivElement>(null);
  const compact = mobile && fitMobile;
  const [step, setStep] = useState(0),
    [finished, setFinished] = useState(false);
  const sequence = c.modules.flatMap((m) =>
    m.blocks.map((b) => ({ module: m, block: b })),
  );
  const current = sequence[step];
  useEffect(() => {
    if (!compact || !isKeyboardVisible) return;
    const frame = requestAnimationFrame(() => {
      const scroll = activityRef.current?.querySelector<HTMLElement>(".mobile-scroll");
      const input = document.activeElement;
      if (!scroll || !(input instanceof HTMLElement) || !scroll.contains(input)) return;
      const viewport = scroll.getBoundingClientRect(), field = input.getBoundingClientRect();
      const scale = viewport.height ? scroll.clientHeight / viewport.height : 1;
      if (field.bottom > viewport.bottom - 10) scroll.scrollTop += (field.bottom - viewport.bottom + 10) * scale;
      else if (field.top < viewport.top + 10) scroll.scrollTop -= (viewport.top - field.top + 10) * scale;
    });
    return () => cancelAnimationFrame(frame);
  }, [compact, isKeyboardVisible, keyboardHeight, step]);
  if (!current) return <p>Add a block to preview this lesson.</p>;
  const activity = finished ? (
    <div className="ce-finished">
      <Icon name="check" size={48} />
      <h2>Lesson complete</h2>
      <p>Take one useful phrase into your next conversation.</p>
      <Button kind="secondary" onClick={() => { setFinished(false); setStep(0); }}>
        Restart preview
      </Button>
    </div>
  ) : <StudentBlock key={current.block.id} block={current.block} language={c.language} />;
  return (
    <div className={`ce-student-preview${compact ? " ce-mobile-player" : ""}`} data-keyboard={isKeyboardVisible}>
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
          {moduleHeading(current.module)}
        </strong>
        <small>
          Block {step + 1} of {sequence.length} · {current.module.minutes} min
          in this module
        </small>
      </div>
      {compact ? (
        <div className="ce-player-body" ref={activityRef}>
          <MobileScroll key={current.block.id} className="ce-player-scroll">{activity}</MobileScroll>
        </div>
      ) : activity}
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
    [mobilePanel, setMobilePanel] = useState<"Canvas" | "Preview">("Canvas"),
    [outlineOpen, setOutlineOpen] = useState(false),
    [collapsed, setCollapsed] = useState<Set<string>>(() => new Set()),
    [moveTarget, setMoveTarget] = useState(""),
    [templateQuery, setTemplateQuery] = useState(""),
    [templateError, setTemplateError] = useState(""),
    [modal, setModal] = useState<
      "preview" | "published" | "block" | "module" | "apply" | "templates" | null
    >(null),
    [purpose, setPurpose] = useState<Purpose>("Teach"),
    [recipient, setRecipient] = useState(""),
    [assignStudent, setAssignStudent] = useState(false),
    [asTemplate, setAsTemplate] = useState(false),
    [templateName, setTemplateName] = useState(c.title),
    [errors, setErrors] = useState<string[]>([]),
    [moveMenu, setMoveMenu] = useState<string | null>(null),
    [dragging, setDragging] = useState(false);
  const useHelpId = useId(), outlineId = useId();
  const [useErrors, setUseErrors] = useState<UseErrors>({ content: [] }), [busy, setBusy] = useState(false);
  const processing = useRef(false), useTrigger = useRef<HTMLButtonElement>(null), useDialog = useRef<HTMLDivElement>(null);
  const closeUse = () => { if (processing.current) return; setModal(null); requestAnimationFrame(() => useTrigger.current?.focus()); };
  useEffect(() => {
    if (modal !== "apply") return;
    const selector = useErrors.student ? '[data-use-field="student"] select' : useErrors.templateName ? '[data-use-field="template"] input' : useErrors.content.length ? '[data-use-errors]' : "";
    if (selector) requestAnimationFrame(() => useDialog.current?.querySelector<HTMLElement>(selector)?.focus());
  }, [useErrors, modal]);
  const cleanupDrag = useRef<(() => void) | undefined>(undefined);
  const inlineEdit = useRef<{ field: HTMLElement; recorded: boolean } | null>(null);
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
    ? "Assigned version"
    : changed
      ? "Draft · Edited"
      : lesson.savedAt
        ? "Draft · Saved"
        : "Draft";
  const commit = (next: Course) => {
    if (JSON.stringify(next) === JSON.stringify(c)) return;
    // Treat one continuous canvas field edit as one Undo action.
    if (!inlineEdit.current?.recorded) {
      setEditorHistories((h) => ({
        ...h,
        [lesson.id]: {
          past: [...(h[lesson.id]?.past || []), structuredClone(c)].slice(-80),
          future: [],
        },
      }));
    }
    if (inlineEdit.current) inlineEdit.current.recorded = true;
    updateLesson(lesson.id, coursePatch(next));
    setErrors([]);
  };
  const undo = (redo = false) => {
    inlineEdit.current = null;
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
  // Files dropped outside an upload area must not replace content or open the file in the browser.
  useEffect(() => {
    const guard = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      if (event.target instanceof Element && event.target.closest(".ce-dropzone")) return;
      event.preventDefault();
      if (event.type === "drop") setNotice("Drop files onto an upload area inside a block.");
    };
    window.addEventListener("dragover", guard);
    window.addEventListener("drop", guard);
    return () => { window.removeEventListener("dragover", guard); window.removeEventListener("drop", guard); };
  }, [setNotice]);
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
  const changeBlock = (b: CourseBlock, inModule = selectedModule) => {
    if (inModule)
      changeModule({
        ...inModule,
        blocks: inModule.blocks.map((x) => (x.id === b.id ? b : x)),
      });
  };
  const selectModule = (m: CourseModule) => {
    setModuleId(m.id);
    setBlockId(undefined);
    setMoveMenu(null);
  };
  const selectBlock = (m: CourseModule, b: CourseBlock) => {
    setModuleId(m.id);
    setBlockId(b.id);
    setMoveMenu(null);
  };
  // Outline jumps keep the canvas where the teacher is working.
  const reveal = (targetId: string) => requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView({ block: "start", behavior: "smooth" }));
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
    setMobilePanel("Canvas");
    setModal(null);
    setNotice(`${format} block added. Type directly in the canvas.`);
  };
  const addModule = (type: ModuleType) => {
    const m = createModule(type);
    commit({ ...c, modules: [...c.modules, m] });
    setModuleId(m.id);
    setBlockId(undefined);
    setMobilePanel("Canvas");
    setModal(null);
  };
  const deleteModule = (target: CourseModule) => {
    commit({
      ...c,
      modules: c.modules.filter((m) => m.id !== target.id),
    });
    setBlockId(undefined);
    setNotice(`${moduleHeading(target)} deleted. Use Undo to restore it.`);
  };
  const deleteBlock = (inModule: CourseModule, target: CourseBlock) => {
    changeModule({
      ...inModule,
      blocks: inModule.blocks.filter((b) => b.id !== target.id),
    });
    setBlockId(undefined);
    setNotice(`${target.title || "Block"} deleted. Use Undo to restore it.`);
  };
  const save = () => {
    const next: Lesson = { ...lesson, ...coursePatch(structuredClone(c)), savedEditor: structuredClone(c), savedAt: new Date().toISOString() };
    try { writeDraft(next, templates); }
    catch { setErrors(["Draft could not be saved on this device. Free up browser storage and try Save draft again. Your edits are still here."]); return false; }
    updateLesson(lesson.id, next); setErrors([]);
    setNotice("Draft saved on this device. Student assignments and lesson templates are unchanged.");
    return true;
  };
  const useLesson = async () => {
    if (processing.current) return;
    const choices = { assign: assignStudent, studentId: recipient, template: asTemplate, templateName };
    if (!choices.assign && !choices.template) return;
    const issues = useLessonErrors(lesson, c, savedProfile, choices);
    if (offline) issues.content.push("You’re offline in this simulation. Reconnect in Account settings and try again. Your edits are still here.");
    setUseErrors(issues);
    if (issues.student || issues.templateName || issues.content.length) return;
    processing.current = true; setBusy(true);
    try {
      await Promise.resolve();
      const result = prepareLessonUse(lesson, c, templates, choices);
      const changes = result.assigned ? [result.draft, result.assigned] : [result.draft];
      writeLibraryChanges(changes, result.templates);
      setLessons(previous => [...previous.filter(item => !changes.some(next => next.id === item.id)), ...changes]);
      setTemplates(result.templates); setErrors([]); setModal(null);
      const name = students.find(student => student.id === recipient)?.name;
      setNotice(choices.assign ? `Prototype only. Lesson assigned to ${name}${choices.template ? " and saved as a template" : ""}. No student is notified.` : "Prototype only. Lesson template saved on this device.");
      requestAnimationFrame(() => useTrigger.current?.focus());
    } catch (reason) {
      setUseErrors({ content: [reason instanceof Error && reason.message.includes("could not be read") ? reason.message : "The selected actions could not be saved. No assignment or template was created. Keep your choices and try again after freeing browser storage."] });
    } finally { processing.current = false; setBusy(false); }
  };
  /** Insert independent copies of a template's modules after the selected module (Undo removes them). */
  const addTemplate = (content: Course) => {
    const copies = cloneCourse(content).modules,
      at = selectedModule ? c.modules.indexOf(selectedModule) + 1 : c.modules.length;
    commit({ ...c, modules: [...c.modules.slice(0, at), ...copies, ...c.modules.slice(at)] });
    setModuleId(copies[0]?.id);
    setBlockId(copies[0]?.blocks[0]?.id);
    setModal(null);
    setNotice(`${copies.length} ${copies.length === 1 ? "module" : "modules"} added from the template. Use Undo to remove them.`);
    if (copies[0]) reveal(`ce-module-${copies[0].id}`);
  };
  /** Save this draft first, persist an independent new draft, then open it. Stops on any failed save. */
  const createFromTemplate = (content: Course) => {
    setTemplateError("");
    if (!save()) { setTemplateError("Your current draft couldn’t be saved, so no new lesson was created. Free up browser storage and try again. Your edits are still here."); return; }
    const course = cloneCourse(content),
      lessonId = newId();
    const created: Lesson = {
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
      savedEditor: structuredClone(course),
      savedAt: new Date().toISOString(),
    };
    try { writeDraft(created, templates); }
    catch { setTemplateError("The new lesson couldn’t be saved on this device. Your current lesson is saved and still open."); return; }
    setLessons((ls) => [...ls, created]);
    setModal(null);
    navigate({ page: "editor", id: lessonId });
    setNotice("New lesson created from the template. The template and your previous lesson are unchanged.");
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
          setMoveTarget("");
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
          <Select
            label={target.blockId ? "Move to module" : "Move to position"}
            value={moveTarget}
            options={target.blockId
              ? [{ value: "", label: "Choose module" }, ...c.modules.map((m) => ({ value: m.id, label: moduleHeading(m) }))]
              : [{ value: "", label: "Choose position" }, { value: "start", label: "At the start" }, ...c.modules.filter((m) => m.id !== target.moduleId).map((m) => ({ value: m.id, label: `After ${moduleHeading(m)}` }))]}
            onChange={(v) => {
              if (target.blockId) { setMoveTarget(v); return; }
              if (!v) return;
              const first = c.modules.find((m) => m.id !== target.moduleId);
              if (v === "start") { if (first) move(target, { moduleId: first.id }); }
              else move(target, { moduleId: v }, true);
              setMoveTarget("");
            }}
          />
          {target.blockId && moveTarget && (() => {
            const destination = c.modules.find((m) => m.id === moveTarget);
            if (!destination) return null;
            const others = destination.blocks.filter((b) => b.id !== target.blockId);
            return (
              <Select
                label="Position"
                value=""
                options={[{ value: "", label: "Choose position" }, { value: "start", label: "At the start" }, ...others.map((b) => ({ value: b.id, label: `After ${b.title || b.format}` }))]}
                onChange={(v) => {
                  if (!v) return;
                  if (v === "start") move(target, others[0] ? { moduleId: destination.id, blockId: others[0].id } : { moduleId: destination.id });
                  else move(target, { moduleId: destination.id, blockId: v }, true);
                  setMoveTarget("");
                }}
              />
            );
          })()}
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
  const outlineList = (
    <div className="ce-outline-list">
      <div className="ce-outline-tools">
        <Button kind="quiet" onClick={() => setCollapsed(new Set(c.modules.map((m) => m.id)))}>Collapse all</Button>
        <Button kind="quiet" onClick={() => setCollapsed(new Set())}>Expand all</Button>
        <Button kind="quiet" icon="plus" onClick={() => { setOutlineOpen(false); open("module"); }}>Add module</Button>
      </div>
      <p className="ce-outline-hint">Drag the grip to reorder, or use More actions to move items with the keyboard.</p>
      {!c.modules.length && <p>Add a module to start building your lesson.</p>}
      {c.modules.map((m, i) => (
        <div className="ce-outline-group" key={m.id}>
          <div className={`ce-outline-row ${selectedModule?.id === m.id && !selectedBlock ? "selected" : ""}`} data-ce-module={m.id}>
            <button className="tw-icon-button ce-outline-toggle" aria-expanded={!collapsed.has(m.id)} aria-label={`${collapsed.has(m.id) ? "Expand" : "Collapse"} ${moduleHeading(m)}`} onClick={() => setCollapsed((current) => { const next = new Set(current); if (next.has(m.id)) next.delete(m.id); else next.add(m.id); return next; })}>
              <Icon name={collapsed.has(m.id) ? "arrow" : "down"} size={14} />
            </button>
            {grip({ moduleId: m.id }, moduleHeading(m))}
            <button className="ce-outline-title" onClick={() => { selectModule(m); if (mobile) setOutlineOpen(false); reveal(`ce-module-${m.id}`); }}>
              <span>{String(i + 1).padStart(2, "0")} · {moduleHeading(m)}</span>
              <small>{m.type} · {m.minutes} min · {m.blocks.length} {m.blocks.length === 1 ? "block" : "blocks"}</small>
            </button>
            {more({ moduleId: m.id }, moduleHeading(m), i, c.modules.length)}
          </div>
          {!collapsed.has(m.id) && m.blocks.map((b, j) => (
            <div className={`ce-outline-row ce-outline-block ${selectedBlock?.id === b.id ? "selected" : ""}`} data-ce-module={m.id} data-ce-block={b.id} key={b.id}>
              {grip({ moduleId: m.id, blockId: b.id }, b.title)}
              <button className="ce-outline-title" onClick={() => { selectBlock(m, b); if (mobile) setOutlineOpen(false); reveal(`ce-block-${b.id}`); }}>
                <span>{b.title || b.format}</span>
                <small>{b.purpose} · {b.format}</small>
              </button>
              {more({ moduleId: m.id, blockId: b.id }, b.title, j, m.blocks.length)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
  return (
    <div
      className={`ce-editor ${dragging ? "ce-dragging" : ""}`}
      onKeyDown={shortcuts}
      onFocusCapture={(e) => {
        const field = e.target;
        if (
          field instanceof HTMLElement &&
          field.matches("input,textarea") &&
          field.closest(".ce-canvas")
        ) {
          if (inlineEdit.current?.field !== field)
            inlineEdit.current = { field, recorded: false };
        } else inlineEdit.current = null;
      }}
      onBlurCapture={(e) => {
        if (inlineEdit.current?.field === e.target) inlineEdit.current = null;
      }}
    >
      {errors.length > 0 && !modal && (
        <div className="ce-warning" role="alert">
          {errors.map((s) => (
            <p key={s}>{s}</p>
          ))}
        </div>
      )}
      {mobile && (
        <div className="ce-mode-switch" role="tablist" aria-label="Editor view">
          {([["Canvas", "Edit lesson"], ["Preview", "Student preview"]] as const).map(([value, label]) => (
            <button key={value} role="tab" aria-selected={mobilePanel === value} onClick={() => { keyboard.hide(); setMobilePanel(value); }}>{label}</button>
          ))}
        </div>
      )}
      <div className="ce-layout ce-canvas-first" data-mobile-panel={mobilePanel}>
        <div className="ce-canvas-column">
          <div className="ce-toolbar" role="toolbar" aria-label="Lesson tools">
            <div className="ce-history" role="group" aria-label="Edit history">
              <button className="tw-icon-button" aria-label="Undo" title="Undo (⌘/Ctrl Z)" disabled={!histories.past.length} onClick={() => undo()}><Icon name="undo" /></button>
              <button className="tw-icon-button" aria-label="Redo" title="Redo (⌘/Ctrl Shift Z)" disabled={!histories.future.length} onClick={() => undo(true)}><Icon name="redo" /></button>
            </div>
            <button className="ce-tool-button" aria-expanded={outlineOpen} aria-controls={outlineId} aria-pressed={outlineOpen} onClick={() => { keyboard.hide(); setOutlineOpen(!outlineOpen); }}>
              <Icon name="sidebar" size={16} /><span>Lesson outline</span><Icon name={outlineOpen ? "up" : "down"} size={14} />
            </button>
            <button className="ce-tool-button" aria-haspopup="dialog" onClick={() => { setTemplateQuery(""); setTemplateError(""); setOutlineOpen(false); open("templates"); }}>
              <Icon name="book" size={16} /><span>Lesson templates</span><Icon name="down" size={14} />
            </button>
            <Badge tone={applied ? "green" : "orange"}>{status}</Badge>
          </div>
          {outlineOpen && !mobile && (
            <div className="ce-outline-overlay" id={outlineId} role="region" aria-label="Lesson outline">
              <div className="ce-outline-overlay-heading">
                <h2>Lesson outline</h2>
                <button className="tw-icon-button" aria-label="Close lesson outline" onClick={() => setOutlineOpen(false)}><Icon name="close" size={16} /></button>
              </div>
              {outlineList}
            </div>
          )}
          <main className="ce-canvas">
          <div className="ce-lesson-paper">
            <div className="ce-lesson-heading">
              <div role="heading" aria-level={1}>
                <InlineField
                  className="ce-inline-lesson-title"
                  label="Lesson title"
                  multiline
                  value={c.title}
                  placeholder="Untitled lesson"
                  onChange={(title) => commit({ ...c, title })}
                />
              </div>
              <div className="ce-lesson-metadata">
                <Select
                  label="Language"
                  value={c.language}
                  options={[...new Set([c.language, "French", "English", "Spanish", "German", "Italian", "Japanese"])]}
                  onChange={(language) => commit({ ...c, language })}
                />
                <Select
                  label="Level"
                  value={c.level}
                  options={["A1", "A2", "B1", "B2", "C1", "C2"]}
                  onChange={(level) => commit({ ...c, level })}
                />
                <span>
                  <Icon name="clock" size={14} />
                  {totalMinutes(c)} min
                </span>
              </div>
              <InlineField
                label="Lesson learning goal"
                multiline
                value={c.goal}
                placeholder="Add a learning goal…"
                onChange={(goal) => commit({ ...c, goal })}
              />
            </div>
            {c.modules.map((m, i) => (
              <section
                id={`ce-module-${m.id}`}
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
                      !["Teach", "Practice"].includes(data.purpose)
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
                  } catch {
                    /* Ignore unrelated drops. */
                  }
                }}
              >
                <div className="ce-module-heading">
                  <span className="ce-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className="ce-module-heading-content"
                    onFocusCapture={() => selectModule(m)}
                  >
                    <div className="ce-inline-module-metadata">
                      <Select
                        label="Module type"
                        value={m.type}
                        options={[...moduleTypes]}
                        onChange={(type) => changeModule({ ...m, type: type as ModuleType })}
                      />
                      <InlineField
                        label="Estimated minutes"
                        type="number"
                        min="1"
                        max="240"
                        value={String(m.minutes)}
                        onChange={(minutes) => changeModule({ ...m, minutes: Number(minutes) })}
                      />
                      <small>min</small>
                    </div>
                    <div role="heading" aria-level={2}>
                      <InlineField
                        className="ce-inline-module-title"
                        label="Module title (optional)"
                        multiline
                        value={m.title}
                        placeholder={moduleHeading({ ...m, title: "" })}
                        onChange={(title) => changeModule({ ...m, title })}
                      />
                    </div>
                    <InlineField
                      label="Module learning goal (optional)"
                      multiline
                      value={m.goal}
                      placeholder="Add a learning goal (optional)…"
                      onChange={(goal) => changeModule({ ...m, goal })}
                    />
                  </div>
                  <div className="ce-item-actions" role="group" aria-label={`Actions for ${moduleHeading(m)}`}>
                    <button className="tw-icon-button" aria-label={`Move ${moduleHeading(m)} earlier`} disabled={i === 0} onClick={() => move({ moduleId: m.id }, { moduleId: c.modules[i - 1].id })}><Icon name="up" size={16} /></button>
                    <button className="tw-icon-button" aria-label={`Move ${moduleHeading(m)} later`} disabled={i === c.modules.length - 1} onClick={() => move({ moduleId: m.id }, { moduleId: c.modules[i + 1].id }, true)}><Icon name="down" size={16} /></button>
                    <button className="tw-icon-button ce-danger-icon" aria-label={`Delete ${moduleHeading(m)}`} onClick={() => deleteModule(m)}><Icon name="close" size={16} /></button>
                  </div>
                </div>
                {m.blocks.map((b, j) => (
                  <article
                    id={`ce-block-${b.id}`}
                    className={`ce-canvas-block ${selectedBlock?.id === b.id ? "selected" : ""}`}
                    key={b.id}
                    onFocusCapture={() => selectBlock(m, b)}
                    onPointerDown={() => selectBlock(m, b)}
                  >
                    <div className="ce-block-header">
                      <span className={`ce-purpose ${b.purpose === "Teach" ? "teach" : "practice"}`}>{b.purpose}</span>
                      <span className="ce-block-format">{b.format}</span>
                      <div className="ce-item-actions" role="group" aria-label={`Actions for ${b.title || b.format}`}>
                        <button className="tw-icon-button" aria-label={`Move ${b.title || b.format} earlier`} disabled={j === 0} onClick={() => move({ moduleId: m.id, blockId: b.id }, { moduleId: m.id, blockId: m.blocks[j - 1].id })}><Icon name="up" size={16} /></button>
                        <button className="tw-icon-button" aria-label={`Move ${b.title || b.format} later`} disabled={j === m.blocks.length - 1} onClick={() => move({ moduleId: m.id, blockId: b.id }, { moduleId: m.id, blockId: m.blocks[j + 1].id }, true)}><Icon name="down" size={16} /></button>
                        <button className="tw-icon-button ce-danger-icon" aria-label={`Delete ${b.title || b.format}`} onClick={() => deleteBlock(m, b)}><Icon name="close" size={16} /></button>
                      </div>
                    </div>
                    <details className="ce-block-settings">
                      <summary><Icon name="settings" size={14} />Block settings</summary>
                      <div className="ce-block-settings-body">
                        <Select label="Block purpose" value={b.purpose} options={["Teach", "Practice"]} onChange={(v) => changeBlock({ ...b, purpose: v as Purpose }, m)} />
                        <Select label="Block type" value={b.format} options={[...new Set([b.format, ...(b.purpose === "Teach" ? teachFormats : practiceFormats)])]} onChange={(v) => changeBlock({ ...b, format: v as Format }, m)} />
                      </div>
                    </details>
                    <div className="ce-inline-block-content">
                      <BlockProperties inline block={b} change={(next) => changeBlock(next, m)} />
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
          {lesson.publishedEditor && (
            <div className="ce-applied-link">
              <button
                className="tw-text-link"
                onClick={() => open("published")}
              >
                View assigned version
              </button>
              <small>
                {lesson.publishedEditor.studentId
                  ? `Assigned to ${students.find((s) => s.id === lesson.publishedEditor!.studentId)?.name}`
                  : "Saved as a reusable template"}
              </small>
            </div>
          )}
          </main>
        </div>
        {(!mobile || mobilePanel === "Preview") && (
          <LiveLessonPreview course={c} followId={selectedBlock?.id ?? selectedModule?.blocks[0]?.id} native={mobile} />
        )}
      </div>
      {mobile && outlineOpen && (
        <BottomSheet open onOpenChange={(value) => { if (!value) setOutlineOpen(false); }} title="Lesson outline" snap={0.76}>
          <div className="teacher-workspace ce-sheet" id={outlineId}>{outlineList}</div>
        </BottomSheet>
      )}
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
          <Button kind="secondary" onClick={() => save()}>
            Save draft
          </Button>
          <button ref={useTrigger} className="tw-button tw-primary" onClick={() => { setErrors([]); setUseErrors({ content: [] }); setAssignStudent(false); setAsTemplate(false); setRecipient(""); setTemplateName(c.title); open("apply"); }}>Use lesson</button>
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
                  ? "Use lesson"
                  : modal === "templates"
                    ? "Lesson templates"
                    : modal === "module"
                      ? "Add module"
                      : "Add block"
          }
          onClose={modal === "apply" ? closeUse : () => setModal(null)}
          busy={busy}
          description={modal === "apply" ? "Assign this lesson to a student, save it as a reusable template, or do both." : undefined}
          restoreFocus={modal === "apply" ? () => useTrigger.current?.focus() : undefined}
          wide={modal === "preview" || modal === "published" || modal === "templates"}
        >
          {modal === "published" && lesson.publishedEditor ? (
            <LessonPlayer course={lesson.publishedEditor.content} />
          ) : modal === "preview" ? (
            <LessonPlayer course={c} />
          ) : modal === "templates" ? (
            <div className="ce-templates">
              <TextField label="Search lesson templates" value={templateQuery} onChange={setTemplateQuery} />
              {templateError && <div className="ce-warning" role="alert"><p>{templateError}</p></div>}
              {(() => {
                const query = templateQuery.trim().toLowerCase();
                const list = [...builtInTemplates, ...templates].filter((t) => !query || `${t.name} ${t.content.goal} ${t.level} ${t.content.modules.map((m) => moduleHeading(m)).join(" ")}`.toLowerCase().includes(query));
                return list.length ? list.map((t) => (
                  <section className="ce-template" key={t.id}>
                    <Badge>{t.own ? "Your template" : "Ready-made"} · {t.level}</Badge>
                    <h3>{t.name}</h3>
                    {t.content.goal && <p>{t.content.goal}</p>}
                    <p className="tw-subtle">{t.content.modules.length} {t.content.modules.length === 1 ? "module" : "modules"} · {totalMinutes(t.content)} min</p>
                    <details className="ce-template-outline">
                      <summary>Module outline</summary>
                      <ol>{t.content.modules.map((m) => <li key={m.id}>{moduleHeading(m)} <small>· {m.blocks.length} {m.blocks.length === 1 ? "block" : "blocks"}</small></li>)}</ol>
                    </details>
                    <div className="ce-actions">
                      <Button kind="secondary" icon="plus" onClick={() => addTemplate(t.content)}>Add to this lesson</Button>
                      <Button icon="book" onClick={() => createFromTemplate(t.content)}>Create a new lesson</Button>
                    </div>
                  </section>
                )) : <p>No lesson templates match “{templateQuery.trim()}”. Try another word.</p>;
              })()}
            </div>
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
                {(["Teach", "Practice"] as Purpose[]).map((p) => (
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
            <div ref={useDialog} className="ce-use-lesson" aria-busy={busy}>
              <label className="ce-use-choice"><input type="checkbox" aria-label="Assign to a student" aria-describedby={`${useHelpId}-assign`} checked={assignStudent} disabled={busy} onChange={event => { setAssignStudent(event.target.checked); setUseErrors({ content: [] }); }} /><span><strong>Assign to a student</strong><small id={`${useHelpId}-assign`}>Give a student access to this version of the lesson.</small></span></label>
              {assignStudent && <div data-use-field="student"><Select label="Student" value={recipient} error={useErrors.student} options={[{ value: "", label: "Choose a student" }, ...students.map(student => ({ value: student.id, label: `${student.name} · ${student.language} ${student.level}` }))]} onChange={value => { setRecipient(value); setUseErrors(previous => ({ ...previous, student: undefined })); }} /><p className="ce-version-notice">Future edits won’t change this student’s assigned version.</p><div className="ce-info"><strong>Lesson details</strong><p>{savedProfile.duration || "Duration not set"} · {lessonPriceLabel(savedProfile.rate, savedProfile.freeConfirmed)} per lesson</p>{lessonPublicationIssues(savedProfile, true).length > 0 && <><p>Set duration and price before assigning. Your draft and lesson templates can still be saved.</p><Button kind="secondary" onClick={() => { if (save()) navigate({ page: "profile-edit", id: lesson.id, tab: "return-to-editor" }); }}>Edit teaching profile</Button></>}</div></div>}
              <label className="ce-use-choice"><input type="checkbox" aria-label="Save as a lesson template" aria-describedby={`${useHelpId}-template`} checked={asTemplate} disabled={busy} onChange={event => { setAsTemplate(event.target.checked); setUseErrors({ content: [] }); }} /><span><strong>Save as a lesson template</strong><small id={`${useHelpId}-template`}>Create a reusable copy for future lessons.</small></span></label>
              {asTemplate && <div data-use-field="template"><TextField label="Template name" value={templateName} error={useErrors.templateName} onChange={value => { setTemplateName(value); setUseErrors(previous => ({ ...previous, templateName: undefined })); }} /></div>}
              {!assignStudent && !asTemplate && <p className="tw-subtle">Choose at least one option to continue.</p>}
              <p className="ce-prototype-notice">Prototype only. Assignment and template creation are simulated; no student is notified.</p>
              {useErrors.content.length > 0 && <div className="ce-warning" role="alert" tabIndex={-1} data-use-errors>{useErrors.content.map((message, index) => <p key={index}>{message}</p>)}</div>}
              <div className="ce-actions"><Button kind="secondary" disabled={busy} onClick={closeUse}>Keep editing</Button><Button disabled={busy || !assignStudent && !asTemplate} onClick={() => { void useLesson(); }}>{busy ? "Saving…" : assignStudent && asTemplate ? "Assign and save template" : assignStudent ? "Assign lesson" : asTemplate ? "Save template" : "Use lesson"}</Button></div>
            </div>
          )}
        </EditorDialog>
      )}
    </div>
  );
}
