import {
  useEffect,
  useMemo,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Dialog } from "radix-ui";
import { createPortal } from "react-dom";
import SelectControl from "../SelectControl";
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
import { BlockProperties, CourseProperties, LessonPropertiesFields, ModulePropertiesFields } from "./CourseProperties";
import {
  cloneCourse,
  courseIssues,
  coursePatch,
  createBlock,
  createModule,
  fromLesson,
  id as newId,
  moduleTypes,
  moduleDisplayTitle,
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
import { hasLessonAssignment, LessonUseError, writeDraft, writeLessonUse } from "./course-storage";
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
  processing = false,
  restoreFocus,
  description,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  processing?: boolean;
  restoreFocus?: () => void;
  description?: string;
}) {
  const { mobile } = useWorkspace();
  const descriptionId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const { focusedElement } = useKeyboard();
  const { isKeyboardVisible, keyboardHeight } = useKeyboardInsets();
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!mobile || !isKeyboardVisible || !focusedElement || !sheet?.contains(focusedElement)) return;
    const scroll = sheet.closest<HTMLElement>(".sheet-content");
    if (!scroll) return;
    let frame = 0;
    const reveal = () => {
      frame = 0;
      if (document.activeElement !== focusedElement || !sheet.contains(focusedElement)) return;
      const viewport = scroll.getBoundingClientRect();
      if (!viewport.height) return;
      const cssPerPixel = scroll.clientHeight / viewport.height;
      const margin = 12 / cssPerPixel;
      const top = viewport.top + margin, bottom = viewport.bottom - margin;
      const field = focusedElement.getBoundingClientRect();
      const delta = field.height > bottom - top ? field.top - top
        : field.bottom > bottom ? field.bottom - bottom
        : field.top < top ? field.top - top : 0;
      if (Math.abs(delta) > .5) scroll.scrollTop += delta * cssPerPixel;
    };
    const queueReveal = () => { if (!frame) frame = requestAnimationFrame(reveal); };
    const observer = new ResizeObserver(queueReveal);
    observer.observe(scroll);
    observer.observe(sheet);
    observer.observe(focusedElement);
    // Keep the field visible when BottomSheet shrinks for the phone keyboard.
    queueReveal();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [mobile, isKeyboardVisible, keyboardHeight, focusedElement]);
  if (mobile)
    return (
      <BottomSheet
        open
        onOpenChange={(open) => {
          if (!open && !processing) onClose();
        }}
        title={title}
        description={description}
        snap={0.76}
      >
        <div className="teacher-workspace ce-sheet" ref={sheetRef}>
          <div className="ce-dialog-content">
            <div className="ce-sheet-close"><button type="button" className="tw-icon-button" aria-label="Close dialog" disabled={processing} onClick={onClose}><Icon name="close" /></button></div>
            {children}
          </div>
        </div>
      </BottomSheet>
    );
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !processing) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="ce-overlay" />
        <Dialog.Content
          aria-describedby={description ? descriptionId : undefined}
          className={`teacher-workspace ce-dialog ${wide ? "ce-wide" : ""}`}
          onEscapeKeyDown={(event) => { if (processing) event.preventDefault(); }}
          onPointerDownOutside={(event) => { if (processing) event.preventDefault(); }}
          onCloseAutoFocus={restoreFocus ? (event) => { event.preventDefault(); restoreFocus(); } : undefined}
        >
          <div className="ce-dialog-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="tw-icon-button" aria-label="Close dialog" disabled={processing}>
              <Icon name="close" />
            </Dialog.Close>
          </div>
          <div className="ce-dialog-content">{description && <Dialog.Description id={descriptionId} className="ce-use-description">{description}</Dialog.Description>}{children}</div>
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
          {moduleDisplayTitle(current.module)}
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
            static
            kind="secondary"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            Previous
          </Button>
          <Button
            static
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
    lessons,
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
  const editorRef = useRef<HTMLDivElement>(null);
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
    [recipient, setRecipient] = useState(""),
    [assignStudent, setAssignStudent] = useState(false),
    [asTemplate, setAsTemplate] = useState(false),
    [templateName, setTemplateName] = useState(c.title),
    [errors, setErrors] = useState<string[]>([]),
    [fieldErrors, setFieldErrors] = useState<{ student?: string; template?: string }>({}),
    [processing, setProcessing] = useState(false),
    [moveMenu, setMoveMenu] = useState<string | null>(null),
    [dragging, setDragging] = useState(false);
  const cleanupDrag = useRef<(() => void) | undefined>(undefined);
  const processingRef = useRef(false);
  const templateNameEdited = useRef(false);
  const modalTrigger = useRef<HTMLElement | null>(null);
  const useForm = useRef<HTMLDivElement>(null);
  const useFieldId = useId();
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
      saveDraft();
    }
  };
  const open = (next: typeof modal) => {
    if (processingRef.current) return;
    keyboard.hide();
    setMoveMenu(null);
    modalTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (next === "apply") {
      setAssignStudent(false);
      setAsTemplate(false);
      setErrors([]);
      setFieldErrors({});
      if (!templateNameEdited.current) setTemplateName(c.title);
    }
    if (mobile && next === "preview") {
      navigate({ page: "lesson-preview", id: lesson.id });
      return;
    }
    setModal(next);
  };
  const restoreModalFocus = () => { if (modalTrigger.current?.isConnected) modalTrigger.current.focus({ preventScroll: true }); };
  const closeModal = () => {
    if (processingRef.current) return;
    keyboard.hide();
    if (modal === "apply") { setErrors([]); setFieldErrors({}); }
    setModal(null);
    requestAnimationFrame(restoreModalFocus);
  };
  const changeModule = (m: CourseModule) =>
    commit({ ...c, modules: c.modules.map((x) => (x.id === m.id ? m : x)) });
  const changeBlock = (targetModuleId: string, b: CourseBlock) => {
    const targetModule = c.modules.find((m) => m.id === targetModuleId);
    if (targetModule?.blocks.some((block) => block.id === b.id))
      changeModule({
        ...targetModule,
        blocks: targetModule.blocks.map((x) => (x.id === b.id ? b : x)),
      });
  };
  const showCanvasGroup = (targetId: string) => {
    keyboard.hide();
    setMoveMenu(null);
    setMobilePanel("Canvas");
    requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target || !editorRef.current?.contains(target)) return;
      target.scrollIntoView({ block: "start", behavior: "instant" });
      target.focus({ preventScroll: true });
    });
  };
  const selectModule = (m: CourseModule, reveal = false) => {
    setModuleId(m.id);
    setBlockId(undefined);
    setTab("Module");
    setMoveMenu(null);
    if (reveal) showCanvasGroup(`canvas-module-${m.id}`);
  };
  const selectBlock = (m: CourseModule, b: CourseBlock, reveal = false) => {
    setModuleId(m.id);
    setBlockId(b.id);
    setTab("Block");
    setMoveMenu(null);
    if (reveal) showCanvasGroup(`canvas-block-${b.id}`);
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
    showCanvasGroup(`canvas-block-${block.id}`);
    setModal(null);
    setNotice(`${format} block added. Edit its content on the canvas.`);
  };
  const addModule = (type: ModuleType) => {
    const m = createModule(type);
    commit({ ...c, modules: [...c.modules, m] });
    setModuleId(m.id);
    setBlockId(undefined);
    setTab("Module");
    showCanvasGroup(`canvas-module-${m.id}`);
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
  const focusUseError = (field?: "student" | "template") => {
    requestAnimationFrame(() => {
      const target = field === "student" ? useForm.current?.querySelector<HTMLElement>('[aria-label="Student"]')
        : field === "template" ? useForm.current?.querySelector<HTMLElement>('[aria-label="Template name"]')
        : useForm.current?.querySelector<HTMLElement>('.ce-use-errors');
      target?.focus();
    });
  };
  const saveDraft = () => {
    if (processingRef.current) return false;
    const next: Lesson = {
      ...lesson, ...coursePatch(structuredClone(c)), savedEditor: structuredClone(c), savedAt: new Date().toISOString(),
    };
    let persisted: Lesson;
    try {
      persisted = writeDraft(next, templates);
    } catch {
      setErrors(["Your draft could not be saved. Reload if saved lessons cannot be read, or free up browser storage and try Save draft again. Your edits are still here."]);
      return false;
    }
    updateLesson(lesson.id, persisted);
    setErrors([]);
    setNotice("Draft saved privately. Existing student assignments are unchanged.");
    return true;
  };
  const useLesson = async () => {
    if (processingRef.current || (!assignStudent && !asTemplate)) return;
    keyboard.hide();
    const nextFields: { student?: string; template?: string } = {};
    if (assignStudent && !recipient) nextFields.student = "Choose a student.";
    if (asTemplate && !templateName.trim()) nextFields.template = "Enter a template name.";
    if (assignStudent && recipient && hasLessonAssignment(lessons, lesson.id, recipient))
      nextFields.student = "This lesson is already assigned to this student. Their assigned version and work are unchanged. Create a separate lesson to assign new material.";
    const issues = [...courseIssues(c), ...lessonPublicationIssues(savedProfile, assignStudent)];
    if (offline) issues.unshift("You’re offline. Reconnect in Account settings and try again. Your draft is still editable.");
    setFieldErrors(nextFields);
    setErrors(issues);
    if (nextFields.student || nextFields.template || issues.length) {
      focusUseError(nextFields.student ? "student" : nextFields.template ? "template" : undefined);
      return;
    }
    processingRef.current = true;
    setProcessing(true);
    try {
      const result = await writeLessonUse({ lesson, course: c, templates,
        ...(assignStudent ? { studentId: recipient } : {}), ...(asTemplate ? { templateName } : {}),
      });
      setLessons(current => [...current.map(item => item.id === lesson.id ? result.draft : item), ...(result.assignment ? [result.assignment] : [])]);
      setTemplates(result.templates);
      setErrors([]);
      setFieldErrors({});
      const name = students.find(student => student.id === recipient)?.name;
      setNotice(`Simulated: ${assignStudent && asTemplate ? `Lesson assigned to ${name} and saved as a template.` : assignStudent ? `Lesson assigned to ${name}.` : "Lesson template saved."} No student is notified.`);
      processingRef.current = false;
      setProcessing(false);
      closeModal();
    } catch (reason) {
      if (reason instanceof LessonUseError && reason.field) {
        setFieldErrors({ [reason.field]: reason.message });
        focusUseError(reason.field);
      } else {
        setErrors(["The selected actions could not be saved. No assignment or template was created. Reload if saved lessons cannot be read, or free up browser storage and try again. Your selections and edits are still here."]);
        focusUseError();
      }
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
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
                  .map((m) => ({ value: m.id, label: moduleDisplayTitle(m) })),
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
      ref={editorRef}
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
            {["Modules", "Teach", "Practice", "Templates"].map((t) => (
              <button
                key={t}
                aria-pressed={library === t}
                onClick={() => setLibrary(t)}
              >
                {t === "Templates" ? "Lesson templates" : t}
              </button>
            ))}
          </div>
          <div className="ce-palette">
            {library === "Modules" ? (
              <>
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
            {!c.modules.length && (
              <p className="ce-outline-empty">Add a module to start building your lesson.</p>
            )}
            {c.modules.map((m, i) => (
              <div className="ce-outline-group" key={m.id}>
                <div
                  className={`ce-outline-row ${selectedModule?.id === m.id && !selectedBlock ? "selected" : ""}`}
                  data-ce-module={m.id}
                >
                  {grip({ moduleId: m.id }, moduleDisplayTitle(m))}
                  <button
                    className="ce-outline-title"
                    onClick={() => selectModule(m, true)}
                  >
                    <span>
                      {String(i + 1).padStart(2, "0")} · {moduleDisplayTitle(m)}
                    </span>
                    <small>
                      {m.type} · {m.minutes} min
                    </small>
                  </button>
                  {more({ moduleId: m.id }, moduleDisplayTitle(m), i, c.modules.length)}
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
                      onClick={() => selectBlock(m, b, true)}
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
            <span>Lesson editor</span>
            <span className="ce-view-status">
              <Badge tone={applied ? "green" : "orange"}>{status}</Badge>
            </span>
          </div>
          <div className="ce-lesson-paper">
            <div
              className="ce-lesson-heading ce-direct-lesson-heading"
              role="group"
              aria-label="Lesson details"
              onFocusCapture={() => setTab("Lesson")}
            >
              <h1 className="ce-visually-hidden">{c.title || "Untitled lesson"}</h1>
              <LessonPropertiesFields course={c} changeCourse={commit} presentation="canvas" />
            </div>
            {c.modules.map((m, i) => (
              <section
                className={`ce-module ${selectedModule?.id === m.id ? "ce-module-selected" : ""}`}
                key={m.id}
                data-ce-module={m.id}
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
                    setTab("Block");
                    showCanvasGroup(`canvas-block-${b.id}`);
                  } catch {
                    /* Ignore unrelated drops. */
                  }
                }}
              >
                <div
                  id={`canvas-module-${m.id}`}
                  className="ce-module-heading ce-direct-module-heading"
                  role="group"
                  aria-label="Module properties"
                  tabIndex={-1}
                  onFocusCapture={() => selectModule(m)}
                >
                  <span className="ce-number">{String(i + 1).padStart(2, "0")}</span>
                  <ModulePropertiesFields module={m} changeModule={changeModule} presentation="canvas" />
                </div>
                {m.blocks.map((b) => (
                  <article
                    id={`canvas-block-${b.id}`}
                    className={`ce-canvas-block ce-direct-block ${selectedBlock?.id === b.id ? "selected" : ""}`}
                    key={b.id}
                    role="group"
                    aria-label="Block properties"
                    tabIndex={-1}
                    data-ce-block={b.id}
                    onFocusCapture={() => selectBlock(m, b)}
                  >
                    <div className="ce-direct-block-fields">
                      <BlockProperties block={b} change={(next) => changeBlock(m.id, next)} />
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
            Changes update your draft. Preview shows one block at a time.
          </p>
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
        <CourseProperties
          tab={tab}
          course={c}
          module={selectedModule}
          block={selectedBlock}
          onTab={setTab}
          changeCourse={commit}
          changeModule={changeModule}
          changeBlock={(block) => { if (selectedModule) changeBlock(selectedModule.id, block); }}
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
          <Button kind="secondary" disabled={processing} onClick={() => open("preview")}>
            Preview lesson
          </Button>
          <Button kind="secondary" disabled={processing} onClick={saveDraft}>
            Save draft
          </Button>
          <Button
            disabled={processing}
            onClick={() => {
              setErrors([]);
              open("apply");
            }}
          >
            Use lesson
          </Button>
        </div>
      </EditorActions>
      {modal && (
        <EditorDialog
          title={
            modal === "published"
              ? "Assigned version"
              : modal === "preview"
                ? "Preview lesson"
                : modal === "apply"
                  ? "Use lesson"
                  : modal === "module"
                    ? "Add module"
                    : "Add block"
          }
          onClose={closeModal}
          wide={modal === "preview" || modal === "published"}
          processing={processing}
          restoreFocus={modal === "apply" ? restoreModalFocus : undefined}
          description={modal === "apply" ? "Assign this lesson to a student, save it as a reusable template, or do both." : undefined}
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
              <p>Add content to {selectedModule ? moduleDisplayTitle(selectedModule) : "a module"}.</p>
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
            <>
              <div className="ce-use-form" ref={useForm} aria-busy={processing}>
                <fieldset className="ce-use-choices" disabled={processing}>
                  <div className="ce-use-choice">
                    <label className="ce-checkbox">
                      <input type="checkbox" aria-label="Assign to a student" aria-describedby={`${useFieldId}-assign-help`} checked={assignStudent} onChange={event => {
                        keyboard.hide(); setAssignStudent(event.target.checked); setFieldErrors(previous => ({ ...previous, student: undefined }));
                      }} />
                      <span>Assign to a student</span>
                    </label>
                    <p id={`${useFieldId}-assign-help`} className="ce-use-helper">Give a student access to this version of the lesson.</p>
                    {assignStudent && <div className="ce-use-option-fields">
                      <label className="tw-field" htmlFor={`${useFieldId}-student`}>
                        <span>Student</span>
                        <SelectControl id={`${useFieldId}-student`} aria-label="Student" aria-required="true" aria-invalid={!!fieldErrors.student}
                          aria-describedby={fieldErrors.student ? `${useFieldId}-student-error` : undefined}
                          value={recipient} native={mobile} disabled={processing}
                          options={[{ value: "", label: "Choose a student" }, ...students.map(student => ({ value: student.id, label: `${student.name} · ${student.language} ${student.level}` }))]}
                          onChange={value => { setRecipient(value); setFieldErrors(previous => ({ ...previous, student: undefined })); }} />
                      </label>
                      {fieldErrors.student && <p className="ce-use-field-error" id={`${useFieldId}-student-error`} role="alert">{fieldErrors.student}</p>}
                      <p className="ce-use-snapshot">Future edits won't change this student's assigned version.</p>
                      <p className="ce-use-helper">{savedProfile.duration || "Duration not set"} · {lessonPriceLabel(savedProfile.rate, savedProfile.freeConfirmed)} per lesson</p>
                      {lessonPublicationIssues(savedProfile, true).length > 0 && <div className="ce-use-readiness">
                        <p>Set duration and price before assigning to a student. Your draft and lesson templates can still be saved.</p>
                        <Button kind="secondary" disabled={processing} onClick={() => {
                          if (saveDraft()) { keyboard.hide(); setModal(null); navigate({ page: "profile-edit", id: lesson.id, tab: "return-to-editor" }); }
                        }}>Edit teaching profile</Button>
                      </div>}
                    </div>}
                  </div>
                  <div className="ce-use-choice">
                    <label className="ce-checkbox">
                      <input type="checkbox" aria-label="Save as a lesson template" aria-describedby={`${useFieldId}-template-help`} checked={asTemplate} onChange={event => {
                        keyboard.hide(); setAsTemplate(event.target.checked); setFieldErrors(previous => ({ ...previous, template: undefined }));
                      }} />
                      <span>Save as a lesson template</span>
                    </label>
                    <p id={`${useFieldId}-template-help`} className="ce-use-helper">Create a reusable copy for future lessons.</p>
                    {asTemplate && <div className="ce-use-option-fields">
                      <TextField label="Template name" value={templateName} error={fieldErrors.template} onChange={value => {
                        templateNameEdited.current = true; setTemplateName(value); setFieldErrors(previous => ({ ...previous, template: undefined }));
                      }} />
                    </div>}
                  </div>
                </fieldset>
                {!assignStudent && !asTemplate && <p className="ce-use-helper" role="status">Choose at least one option to continue.</p>}
                <p className="ce-use-notice">Prototype only. Assignment and template creation are simulated; no student is notified.</p>
                {errors.length > 0 && <div className="ce-warning ce-use-errors" role="alert" tabIndex={-1}>
                  <strong>Check these lesson details</strong>
                  {errors.map((error, index) => <p key={index}>{error}</p>)}
                </div>}
                <div className="ce-actions ce-use-footer">
                  <Button kind="secondary" disabled={processing} onClick={closeModal}>Keep editing</Button>
                  <Button disabled={processing || (!assignStudent && !asTemplate)} onClick={() => { void useLesson(); }}>
                    {processing ? "Using lesson…" : assignStudent && asTemplate ? "Assign and save template" : assignStudent ? "Assign lesson" : asTemplate ? "Save template" : "Use lesson"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </EditorDialog>
      )}
    </div>
  );
}
