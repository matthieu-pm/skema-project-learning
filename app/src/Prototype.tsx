import TeacherLanguagePicker from "./TeacherLanguagePicker";
import LocationField from "./LocationField";
import FreeLessonConfirmation from "./FreeLessonConfirmation";
import { isFreeLesson, lessonPriceLabel } from "./lesson-settings";
import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type InputHTMLAttributes,
} from "react";
import { Icon, CheckIcon } from "./teacher/icons";
import { createPortal } from "react-dom";
import ViewSwitch from "./ViewSwitch";
const TeacherWorkspace = lazy(() => import("./teacher/TeacherWorkspace"));
const LearnerWorkspace = lazy(() => import("./learner/LearnerWorkspace"));
const WebOnboarding = lazy(() => import("./WebOnboarding"));
import {
  FlowStack,
  MobileScroll,
  KeyboardInput,
  KeyboardTextarea,
  useFlow,
  useKeyboard,
  useKeyboardInsets,
  type FlowScreen,
  type FlowControls,
} from "./mobile";
import {
  teacherLanguageLevels,
  toggleTeachingLanguage,
  setTeacherLevels,
  teachingLanguageSummary,
  initialAnswers,
  changeAccountMethod,
  sampleGoogleAccount,
  languageChoices,
  toggleLearningLanguage,
  learnerFormatChoices,
  learningFormatsFor,
  toggleLearningFormat,
  needsGuardian,
  changeAge,
  clearedIdentity,
  verificationExit,
  levelChoices,
  formatDateOfBirth,
  dateOfBirthValid,
  emailValid,
  nextStep,
  routeFor,
  setupProgress,
  stepIds,
  validStep,
  type Answers,
  type Step,
} from "./onboarding";

const asset = (name: string) => `/assets/onboarding/${name}.png`;
const languages = languageChoices;
const flags = ["spanish", "french", "german", "italian", "english", "japanese"];
const endings = new Set<Step>([
  "learner-ready",
  "verification-ready",
  "teacher-draft",
]);
type Media = { name: string; url: string; type: string } | null;
type SetupContext = {
  answers: Answers;
  update: (patch: Partial<Answers>) => void;
  resource: Media;
  setResource: (media: Media) => void;
  photo: Media;
  setPhoto: (media: Media) => void;
  error: string;
  setError: (s: string) => void;
  resendAt: number;
  setResendAt: (n: number) => void;
  editingReview: boolean;
  setEditingReview: (value: boolean) => void;
  reset: () => void;
  openWorkspace: (options?: { returning?: boolean }) => void;
  web: boolean;
};
const Setup = createContext<SetupContext>(null!);
const useSetup = () => useContext(Setup);
const SetupNavigation = createContext<FlowControls>(null!);
const useSetupFlow = () => useContext(SetupNavigation);
function Mascot({ className = "" }: { className?: string }) {
  const teacher = useSetup().answers.role === "teacher";
  return (
    <img
      className={`mascot ${className}`}
      src={asset(teacher ? "nori" : "luma")}
      alt={
        teacher
          ? "Nori, your fuzzy blue teaching companion"
          : "Luma, your fuzzy purple learning companion"
      }
      draggable={false}
    />
  );
}
function GoogleMark() {
  return (
    <svg
      className="google-mark"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20.4 20.4 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.5a12.3 12.3 0 0 1 0-7.8v-5.3H5.8a20.4 20.4 0 0 0 0 18.4l6.8-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 11.3c3 0 5.6 1 7.7 3l5.8-5.8A19.6 19.6 0 0 0 24 3.2 20.4 20.4 0 0 0 5.8 14.4l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"
      />
    </svg>
  );
}
function Bubble({ children }: { children: ReactNode }) {
  const { web } = useSetup();
  return web ? (
    <h1 className="speech">{children}</h1>
  ) : (
    <div className="speech">{children}</div>
  );
}
function Choice({
  label,
  description,
  icon,
  selected,
  onClick,
  check = false,
}: {
  label: string;
  description?: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
  check?: boolean;
}) {
  return (
    <button
      className={`choice ${selected ? "selected" : ""} ${description ? "detailed" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {icon && <img className="choice-icon" src={asset(icon)} alt="" />}
      <span className="choice-copy">
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </span>
      {check && (
        <span className="checkbox" aria-hidden="true">
          {selected && <CheckIcon />}
        </span>
      )}
    </button>
  );
}
function Note({ children }: { children: ReactNode }) {
  return <p className="setup-note">{children}</p>;
}
function Field({
  label,
  multiline = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  multiline?: boolean;
}) {
  const keyboard = useKeyboard(),
    { web } = useSetup();
  if (web)
    return (
      <label className="setup-field">
        <span>{label}</span>
        {multiline ? (
          <textarea
            aria-label={label}
            placeholder={props.placeholder}
            value={props.value}
            maxLength={props.maxLength}
            onChange={(e) =>
              props.onChange?.(
                e as unknown as React.ChangeEvent<HTMLInputElement>,
              )
            }
            rows={4}
          />
        ) : (
          <input {...props} aria-label={label} />
        )}
      </label>
    );
  return (
    <label className="setup-field">
      <span>{label}</span>
      {multiline ? (
        <KeyboardTextarea
          aria-label={label}
          placeholder={props.placeholder}
          value={props.value}
          maxLength={props.maxLength}
          onChange={(e) =>
            props.onChange?.(
              e as unknown as React.ChangeEvent<HTMLInputElement>,
            )
          }
          onBlur={() => keyboard.hide()}
          rows={4}
        />
      ) : (
        <KeyboardInput
          {...props}
          aria-label={label}
          onBlur={() => keyboard.hide()}
        />
      )}
    </label>
  );
}
function Upload({ kind }: { kind: "resource" | "photo" }) {
  const setup = useSetup(),
    keyboard = useKeyboard(),
    fileRef = useRef<HTMLInputElement>(null);
  const media = kind === "photo" ? setup.photo : setup.resource;
  const setMedia = kind === "photo" ? setup.setPhoto : setup.setResource;
  return (
    <div className="upload-section">
      <input
        ref={fileRef}
        className="file-input"
        type="file"
        aria-label={
          kind === "photo"
            ? "Choose a profile photo or video"
            : "Choose a file or voice note"
        }
        accept={
          kind === "photo"
            ? "image/*,video/*"
            : ".pdf,.txt,.doc,.docx,image/*,audio/*"
        }
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.size > 20 * 1024 * 1024) {
            setup.setError("Choose a file smaller than 20 MB.");
            return;
          }
          setup.setError("");
          setMedia({ name: f.name, url: URL.createObjectURL(f), type: f.type });
          e.target.value = "";
        }}
      />
      {media?.type.startsWith("image/") && (
        <img
          className="upload-preview"
          src={media.url}
          alt={kind === "photo" ? "Your profile photo" : "Attached image"}
        />
      )}
      {media?.type.startsWith("video/") && (
        <video className="upload-preview" src={media.url} controls />
      )}
      {media?.type.startsWith("audio/") && (
        <audio className="audio-preview" src={media.url} controls />
      )}
      <button
        className="upload-target"
        onClick={() => {
          keyboard.hide();
          fileRef.current?.click();
        }}
      >
        <Icon name="upload" />
        <strong>
          {media
            ? "Choose a different file"
            : kind === "photo"
              ? "Add a photo or short video"
              : "Add a file or voice note"}
        </strong>
        <span>{media?.name || "Choose a file from your device"}</span>
      </button>
      {media && (
        <button className="text-button" onClick={() => setMedia(null)}>
          Remove file
        </button>
      )}
      <Note>
        {kind === "photo"
          ? "Give learners a friendly first impression."
          : "A document, photo, or recorded voice note can help explain your goal."}{" "}
        Up to 20 MB.
      </Note>
    </div>
  );
}
const headings: Partial<Record<Step, string>> = {
  "teacher-profile": "Your teaching profile",
  "teacher-subjects": "Languages and levels",
  "teacher-lessons": "Your lesson details",
  "learner-confidence": "How confident do you feel speaking?",
  "learner-challenges": "What makes speaking difficult?",
  "learner-goal": "What would you love to do?",
  entry: "How would you like to continue?",
  "learner-preferences": "When and how would you like to meet?",
  extras: "Make Mimo work for you",
  "identity-details": "Your identity details",
  "document-details": "About your identity document",
  account: "Create your account",
  "google-connect": "Choose your Google account",
  role: "What brings you here?",
  email: "First, a place to keep your progress.",
  age: "Which age range are you in?",
  guardian: "Let’s bring your parent or guardian in.",
  verify: "You’ve got mail.",
  language: "Which languages would you like to learn?",
  level: "Let’s find a comfortable starting point.",
  topic: "Make it about your life.",
  "personal-goal": "What’s one thing you’d love to do?",
  resource: "Want to share a little more?",
  format: "How do you like to meet?",
  city: "Where would you like to meet?",
  days: "Which days usually work for you?",
  time: "What time suits you best?",
  notifications: "Would you like to allow notifications?",
  widget: "I’ll cheer you on from your home screen!",
  benefits: "A real connection. Progress at your pace.",
  name: "What should your learners call you?",
  photo: "Let learners put a face to your name.",
  "teaching-languages": "Which languages do you teach?",
  "teaching-levels": "Which levels do you teach?",
  approach: "Your teaching. Your own style.",
  duration: "How long is a lesson?",
  rate: "What’s your price per lesson?",
  "persona-link": "Your Persona ID. A quicker hello.",
  "teacher-review": "Here’s your teaching profile.",
  "identity-intro": "A little trust goes a long way.",
  "legal-name": "What’s your full legal name?",
  "date-of-birth": "When were you born?",
  country: "Which country issued your ID?",
  "document-type": "Which document would you use?",
  document: "Next, add your identity document.",
  selfie: "One last check: confirm it’s you.",
  "guardian-handoff": "It’s your parent or guardian’s turn.",
  "learner-ready": "Your learning setup is ready",
  "verification-ready": "Your profile is ready for the next step.",
  "teacher-draft": "Your teaching profile is a draft.",
};
function Header({ step }: { step: Step }) {
  const flow = useFlow(),
    { answers, setError, setEditingReview } = useSetup();
  const { percent, index, total } = setupProgress(answers, step);
  return (
    <nav className="onboarding-nav" aria-label="Onboarding">
      <button
        className="back"
        aria-label="Go back"
        onClick={() => {
          setError("");
          setEditingReview(false);
          flow.pop();
        }}
      >
        <Icon name="back" />
      </button>
      {step !== "login" &&
        <div
          className="progress"
          role="progressbar"
          aria-label="Setup progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      }
      <span className="setup-step-count">
        {answers.role && step !== "login" ? `${index + 1}/${total}` : ""}
      </span>
    </nav>
  );
}
function Footer({ step, inline = false }: { step: Step; inline?: boolean }) {
  const flow = useSetupFlow(),
    keyboard = useKeyboard(),
    {
      answers: a,
      update,
      setError,
      setResendAt,
      setResource,
      setPhoto,
      reset,
      openWorkspace,
      editingReview,
      setEditingReview,
    } = useSetup();
  const advance = (patch: Partial<Answers> = {}) => {
    keyboard.hide();
    setError("");
    const next = nextStep(step, { ...a, ...patch });
    update(patch);
    if (
      editingReview &&
      ["teacher-profile", "teacher-subjects", "teacher-lessons"].includes(step)
    ) {
      setEditingReview(false);
      flow.pop();
      return;
    }
    if (next && endings.has(next) && a.role === "teacher") {
      openWorkspace();
      return;
    }
    if (next) flow.push(screens[next]);
  };
  const submit = () => {
    if (!validStep(step, a)) {
      if (step === "teacher-subjects") {
        keyboard.hide();
        const missing = a.teachingLanguages.find(language => !teacherLanguageLevels(a)[language]?.length);
        setError(missing ? `Choose at least one level for ${missing}.` : "Choose at least one language.");
        const target = [...document.querySelectorAll<HTMLElement>('[data-step="teacher-subjects"]:not([inert]) [data-teaching-language]')].find(element => element.dataset.teachingLanguage === missing);
        (target || document.querySelector<HTMLElement>('[data-step="teacher-subjects"]:not([inert]) [role="combobox"]'))?.focus();
      }
      return;
    }
    if (endings.has(step)) {
      openWorkspace();
      return;
    }
    // Choose learn/teach first, then create an account or log in.
    if (step === "verify" && a.code !== "481629") {
      setError("That code doesn’t match. Check the latest email from Mimo and try again.");
      keyboard.hide();
      return;
    }
    if (step === "age" || (step === "email" && a.role === "teacher"))
      setResendAt(Date.now() + 30000);
    advance(
      step === "google-connect"
        ? sampleGoogleAccount
        : step === "verify"
          ? { verified: true }
          : step === "guardian"
            ? { guardianReady: true }
            : step === "notifications"
              ? { notifications: true }
              : step === "widget"
                ? { widget: true }
                : step === "selfie" || step === "persona-link"
                  ? { identityPreviewComplete: true }
                  : step === "identity-intro"
                    ? {
                        identityMethod: "document",
                        identityPreviewComplete: false,
                      }
                    : {},
    );
  };
  const optional: Partial<Record<Step, string>> = {
    "learner-challenges": "Skip for now",
    resource: "Skip for now",
    photo: "Skip for now",
    format: "I’ll choose later",
    city: "I’ll choose later",
    days: "I’ll choose later",
    time: "I’ll choose later",
    notifications: "Not now",
    widget: "Not now",
    "teacher-review": "Finish verification later",
    "identity-intro": "Finish verification later",
    "teacher-lessons": "Set duration and price later",
    "persona-link": "Use a document instead",
  };
  const label: Partial<Record<Step, string>> = {
    welcome: "Get started",
    "google-connect": "Continue as Alex",
    email: "Continue",
    guardian: "Continue",
    "guardian-handoff": "I’m the parent or guardian",
    verify: "Verify & continue",
    notifications: "Allow notifications",
    widget: "Add widget",
    "teacher-review": "Continue to identity check",
    "identity-intro": "Start verification",
    "persona-link": "Link Persona ID",
    document: "Continue",
    selfie: "Finish verification",
    "learner-ready": "Finish setup",
    "verification-ready": "Finish setup",
    "teacher-draft": "Back to welcome",
  };
  const endLabel = endings.has(step)
    ? a.role === "teacher"
      ? "Open teaching workspace"
      : "Find a teacher"
    : undefined;
  const mainDisabled =
    (step !== "teacher-subjects" && !validStep(step, a)) ||
    (["format", "city", "days", "time"].includes(step) &&
      !(
        {
          format: a.role === "learner" ? learningFormatsFor(a).length : a.format,
          city: a.city.trim(),
          days: a.days.length,
          time: a.time,
        } as Record<string, unknown>
      )[step]);
  if ((step === "account" && !inline) || step === "entry" || step === "login") return null;
  if (step === "account")
    return (
      <div className="actions two-actions account-actions account-inline-actions">
        <button
          className="primary"
          disabled={a.accountMethod !== "email" || !emailValid(a.email)}
          onClick={() => {
            setResendAt(Date.now() + 30000);
            advance(changeAccountMethod(a, "email"));
          }}
        >
          Continue with email
        </button>
        <span className="account-divider" aria-hidden="true">
          or
        </span>
        <button
          className="secondary google-button"
          onClick={() => advance(changeAccountMethod(a, "google"))}
        >
          <GoogleMark />
          Continue with Google
        </button>
      </div>
    );
  return (
    <div
      className={`actions ${optional[step] ? "two-actions" : ""}`}
    >
      <button className="primary" disabled={mainDisabled} onClick={submit}>
        {editingReview &&
        ["teacher-profile", "teacher-subjects", "teacher-lessons"].includes(
          step,
        )
          ? "Save and return"
          : endLabel || label[step] || "Continue"}
      </button>
      {optional[step] && (
        <button
          className="text-button"
          disabled={step === "teacher-review" && !validStep(step, a)}
          onClick={() => {
            if (step === "persona-link") {
              keyboard.hide();
              setError("");
              update({
                identityMethod: "document",
                identityPreviewComplete: false,
              });
              flow.replace(screens["identity-details"]);
              return;
            }
            if (step === "teacher-lessons") {
              advance({ duration: "", rate: "", freeConfirmed: false });
              return;
            }
            if (step === "teacher-review") {
              keyboard.hide();
              update({ identityPreviewComplete: false });
              setError("");
              openWorkspace();
              return;
            }
            if (step === "identity-intro" && a.role === "teacher") {
              keyboard.hide();
              update({ identityPreviewComplete: false });
              setError("");
              openWorkspace();
              return;
            }
            if (step === "identity-intro") {
              keyboard.hide();
              update({ identityPreviewComplete: false });
              setError("");
              flow.push(screens[verificationExit(a)]);
              return;
            }
            if (step === "resource") setResource(null);
            if (step === "photo") setPhoto(null);
            const clears: Partial<Record<Step, Partial<Answers>>> = {
              "learner-challenges": { speakingChallenges: [], challengeDetails: "" },
              format: { format: "", learningFormats: [], city: "" },
              city: { city: "" },
              days: { days: [] },
              time: { time: "" },
              notifications: { notifications: false },
              widget: { widget: false },
            };
            advance(clears[step]);
          }}
        >
          {optional[step]}
        </button>
      )}
    </div>
  );
}
function Screen({ step }: { step: Step }) {
  const setup = useSetup(),
    { answers: a, update, error, setError, resendAt, setResendAt, web } = setup;
  const flow = useSetupFlow(),
    keyboard = useKeyboard(),
    { isKeyboardVisible } = useKeyboardInsets();
  const active = flow.current.id === step;
  const guardian = needsGuardian(a);
  const learningFormats = learningFormatsFor(a);
  const isLevel = step === "level" || step.startsWith("level-");
  const levelLanguage = step.startsWith("level-")
    ? step.slice(6)
    : a.learningLanguages[0];
  const heading = isLevel
    ? `How much ${levelLanguage} do you know?`
    : step === "learner-confidence"
      ? `How confident do you feel speaking ${a.learningLanguages.join(" or ") || "your chosen language"}?`
    : step === "identity-intro" && guardian
      ? "Let’s verify you, the parent or guardian."
      : headings[step];
  const [search, setSearch] = useState(""),
    [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (step !== "verify" || !active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [step, active]);
  const chooseRole = (role: Answers["role"]) => {
    if (a.role === role) return;
    setup.setResource(null);
    setup.setPhoto(null);
    setError("");
    update({
      ...initialAnswers,
      role,
      email: a.accountMethod === "google" ? "" : a.email,
      age: a.age,
    });
  };
  const toggle = (
    field: "days" | "teachingLanguages" | "teachingLevels" | "speakingChallenges",
    value: string,
  ) =>
    update({
      [field]: a[field].includes(value)
        ? a[field].filter((v) => v !== value)
        : [...a[field], value],
    });
  const single = (
    values: string[],
    field: keyof Answers,
    descriptions?: string[],
  ) => (
    <div className="options">
      {values.map((value, i) => (
        <Choice
          key={value}
          label={value}
          description={descriptions?.[i]}
          selected={a[field] === value}
          onClick={() =>
            update(
              field === "age"
                ? changeAge(a, value)
                : {
                    [field]: value,
                    ...(field === "format" && value === "Online"
                      ? { city: "" }
                      : {}),
                  },
            )
          }
        />
      ))}
    </div>
  );
  const mediaHeading = step === "photo" || step === "resource";
  const Scroll = setup.web ? "div" : MobileScroll;
  return (
    <Scroll
      className={`learning-scroll setup-scroll ${!setup.web && isKeyboardVisible ? "keyboard-open" : ""}`}
    >
      <main
        inert={!active}
        aria-hidden={!active}
        className={`onboarding-content setup-content ${step === "welcome" ? "setup-welcome" : ""}`}
        data-step={isLevel ? "level" : step}
        aria-label={heading || step}
      >
        {step === "welcome" ? (
          <div className="welcome">
            <Mascot />
            <h1>mimo</h1>
            <p>A language. A real connection.</p>
          </div>
        ) : step === "account" ? (
          <div className="account-intro">
            <Mascot />
            <h1>Create your account</h1>
            <p>Use your email or continue with Google.</p>
          </div>
        ) : step === "login" ? (
          <div className="account-intro entry-intro">
            <Mascot />
            <h1>Welcome back</h1>
            <p>Log in with the Google account you used to sign up.</p>
          </div>
        ) : (
          <div className="guide">
            <Mascot />
            <Bubble>{heading}</Bubble>
          </div>
        )}
        {step === "entry" && (
          <p className="step-description">
            New to Mimo? Create an account. Been here before? Log in.
          </p>
        )}
        {step === "entry" && (
          <div className="options entry-options">
            <Choice
              label="Create an account"
              description={a.role === "teacher" ? "Set up your teaching profile in a few steps." : "Set up your profile in a few steps."}
              icon="conversation"
              selected={false}
              onClick={() => { keyboard.hide(); flow.push(screens.account); }}
            />
            <Choice
              label="Log in"
              description="Pick up where you left off."
              icon="book"
              selected={false}
              onClick={() => { keyboard.hide(); flow.push(screens.login); }}
            />
          </div>
        )}
        {step === "login" && (
          <div className="actions account-inline-actions">
            <button className="secondary google-button" onClick={() => { keyboard.hide(); setup.openWorkspace({ returning: true }); }}>
              <GoogleMark />
              Continue with Google
            </button>
          </div>
        )}
        {step === "role" && (
          <p className="step-description">
            Let’s make language learning personal. Choose how you’d like to use
            Mimo.
          </p>
        )}
        {step === "role" && (
          <div className="options role-options">
            <Choice
              label="I want to learn"
              description="Find a teacher. Make it personal."
              icon="conversation"
              selected={a.role === "learner"}
              onClick={() => chooseRole("learner")}
            />
            <Choice
              label="I want to teach"
              description="Share your language, your way."
              icon="book"
              selected={a.role === "teacher"}
              onClick={() => chooseRole("teacher")}
            />
          </div>
        )}
        {step === "role" && a.role === "teacher" && <div className="teacher-value"><h2>Your lessons. Real connections.</h2><p>Create lessons you can edit and reuse. Connect with students through in-person or online meetups.</p></div>}
        {step === "role" && a.role === "learner" && <div className="teacher-value learner-value"><h2>Your teacher. Your pace.</h2><p>Choose a teacher who fits your goals. Meet one-to-one online or in person, and prepare with short activities before each lesson.</p></div>}
        {step === "account" && (
          <>
            <Field
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={a.accountMethod === "email" ? a.email : ""}
              aria-invalid={
                a.accountMethod === "email" && !!a.email && !emailValid(a.email)
              }
              onChange={(e) => {
                setError("");
                update({
                  ...changeAccountMethod(a, "email"),
                  email: e.target.value,
                  code: "",
                  verified: false,
                });
              }}
            />
            {a.accountMethod === "email" && a.email && !emailValid(a.email) && (
              <p className="field-error" role="alert">
                Enter an email address, such as you@example.com.
              </p>
            )}
            <Note>
              No password needed. Continue with email to use a sign-in code.
            </Note>
            <Footer step="account" inline />
          </>
        )}
        {step === "teacher-profile" && (
          <div className="setup-group">
            <p className="step-description">
              Let learners get to know you. You can edit this profile later.
            </p>
            {/* Media first, so the optional photo/video is visible without scrolling. */}
            <details className="setup-optional">
              <summary>Add a photo or video (optional)</summary>
              <Upload kind="photo" />
            </details>
            <Field
              label="Display name"
              autoComplete="given-name"
              maxLength={60}
              value={a.name}
              onChange={(e) => update({ name: e.target.value })}
            />
            {a.name && a.name.trim().length < 2 && (
              <p className="field-error" role="alert">
                Use at least 2 characters for your display name.
              </p>
            )}
            <Field
              label="Your teaching approach"
              multiline
              maxLength={300}
              placeholder="Practical conversation, at your pace."
              value={a.approach}
              onChange={(e) => update({ approach: e.target.value })}
            />
            {a.approach && a.approach.trim().length < 5 && (
              <p className="field-error" role="alert">
                Add a short description of at least 5 characters.
              </p>
            )}
            <Field label="Language teaching experience (optional)" multiline maxLength={2000} value={a.teachingExperience || ""} onChange={event => update({ teachingExperience: event.target.value })} />
            <p className="step-description">Your teaching or tutoring background and the learners you’ve helped.</p>
          </div>
        )}
        {step === "teacher-subjects" && (
          <TeacherLanguagePicker mobile={!web} selected={a.teachingLanguages} levels={teacherLanguageLevels(a)} showErrors={!!error} onToggle={language => { setError(""); update(toggleTeachingLanguage(a, language)); }} onLevels={(language, levels) => { setError(""); update(setTeacherLevels(a, language, levels)); }} />
        )}
        {step === "teacher-lessons" && (
          <div className="setup-group">
            <fieldset className="setup-section">
              <legend>Teaching format (optional)</legend>
              <div className="options setup-compact three-columns">
                {["In person", "Online", "Either"].map((format) => (
                  <Choice
                    key={format}
                    label={format}
                    selected={a.format === format}
                    onClick={() =>
                      update({
                        format,
                        meetingFormatDeferred: false,
                        ...(format === "Online" ? { city: "" } : {}),
                      })
                    }
                  />
                ))}
              </div>
              <Choice label="Decide later" check selected={!!a.meetingFormatDeferred} onClick={() => update({ format: "", city: "", meetingFormatDeferred: true })} />
            </fieldset>
            {a.format && a.format !== "Online" && (
              <LocationField label="City or neighbourhood (optional)" mobile={!web} value={a.city} onChange={(city) => update({ city })} allowLocation={a.role === "teacher"} />
            )}
            <fieldset className="setup-section">
              <legend>Lesson duration (optional)</legend>
              <div className="options setup-compact three-columns">
                {["30 minutes", "45 minutes", "60 minutes"].map((duration) => (
                  <Choice
                    key={duration}
                    label={duration}
                    selected={a.duration === duration}
                    onClick={() => update({ duration })}
                  />
                ))}
              </div>
              <button
                className="inline-link"
                onClick={() => update({ duration: "" })}
              >
                Set duration later
              </button>
            </fieldset>
            <Field
              label={`Price in euros / ${a.duration || "lesson"} (optional)`}
              type="number"
              inputMode="decimal"
              min="0"
              max="1000"
              step="0.5"
              value={a.rate}
              placeholder="30"
              onChange={(e) =>
                update({ rate: e.target.value, freeConfirmed: false })
              }
            />
            {a.rate &&
              !(
                Number.isFinite(Number(a.rate)) &&
                Number(a.rate) >= 0 &&
                Number(a.rate) <= 1000
              ) && (
                <p className="field-error" role="alert">
                  Enter a price from €0 to €1,000.
                </p>
              )}
            {isFreeLesson(a.rate) && (
              <FreeLessonConfirmation
                confirmed={a.freeConfirmed}
                onChange={(freeConfirmed) => update({ freeConfirmed })}
              />
            )}
            <Note>
              Leave duration and price blank to decide later. Enter 0 to offer
              free lessons. Set both before publishing a lesson.
            </Note>
          </div>
        )}
        {step === "learner-confidence" && (
          <div className="setup-group">
            <p className="step-description">We’ll use this to help your teacher understand you. There’s no right answer.</p>
            {single(["I feel comfortable", "I’m finding my confidence"], "speakingConfidence", ["I’m ready to try conversations.", "Speaking can feel difficult."])}
          </div>
        )}
        {step === "learner-challenges" && (
          <div className="setup-group">
            <p className="step-description">Choose any that fit, tell us in your own words, or skip this step.</p>
            <div className="options setup-compact">
              {["Fear of mistakes", "Finding the right words", "Understanding replies", "Pronunciation"].map(challenge => (
                <Choice key={challenge} label={challenge} check selected={a.speakingChallenges.includes(challenge)} onClick={() => toggle("speakingChallenges", challenge)} />
              ))}
            </div>
            <Field label="Something else? Tell us in your own words (optional)" multiline maxLength={500} placeholder="What would help you feel more comfortable?" value={a.challengeDetails} onChange={e => update({ challengeDetails: e.target.value })} />
          </div>
        )}
        {step === "learner-goal" && (
          <div className="setup-group">
            <fieldset className="setup-section">
              <legend>Choose all the goals that matter to you</legend>
              <div className="options setup-compact">
                {["Everyday life", "Travel", "Work", "Friends & family", "For my studies"].map((topic) => (
                  <Choice
                    key={topic}
                    label={topic}
                    check
                    selected={a.learningGoals.includes(topic)}
                    onClick={() => {
                      const learningGoals = a.learningGoals.includes(topic) ? a.learningGoals.filter(value => value !== topic) : [...a.learningGoals, topic];
                      update({ learningGoals, topic: learningGoals[0] || "" });
                    }}
                  />
                ))}
              </div>
            </fieldset>
            <Field
              label="My goal in my own words (optional)"
              multiline
              maxLength={300}
              placeholder={`Order a meal confidently in ${a.learningLanguages[0] || "French"}.`}
              value={a.personalGoal}
              onChange={(e) => update({ personalGoal: e.target.value })}
            />
            {a.personalGoal && a.personalGoal.trim().length < 3 && (
              <p className="field-error" role="alert">
                Describe your goal in at least 3 characters.
              </p>
            )}
            <details className="setup-optional">
              <summary>Add a file or voice note (optional)</summary>
              <Upload kind="resource" />
            </details>
            <Note>
              Your teacher can use this goal to personalize your lessons.
            </Note>
          </div>
        )}
        {step === "learner-preferences" && (
          <div className="setup-group">
            <p className="step-description">
              All preferences are optional. Choose exact lesson times later.
            </p>
            <fieldset className="setup-section">
              <legend>Meeting format · choose one or both</legend>
              <div className="options setup-compact two-columns">
                {learnerFormatChoices.map((format) => (
                  <Choice
                    key={format}
                    label={format}
                    check
                    selected={learningFormats.includes(format)}
                    onClick={() => update(toggleLearningFormat(a, format))}
                  />
                ))}
              </div>
              <Choice label="Decide later" check selected={!!a.meetingFormatDeferred} onClick={() => update({ learningFormats: [], format: "", city: "", meetingFormatDeferred: true })} />
            </fieldset>
            {learningFormats.includes("In person") && (
              <LocationField label="City or neighbourhood (optional)" mobile={!web} value={a.city} onChange={(city) => update({ city })} allowLocation={a.role === "teacher"} />
            )}
            <fieldset className="setup-section">
              <legend>Days that usually work</legend>
              <div className="options setup-compact two-columns">
                {["Weekdays", "Weekends"].map((day) => (
                  <Choice
                    key={day}
                    label={day}
                    check
                    selected={a.days.includes(day)}
                    onClick={() => update({ days: a.days.includes(day) ? a.days.filter(v => v !== day) : [...a.days, day], scheduleFlexible: false })}
                  />
                ))}
              </div>
            </fieldset>
            <fieldset className="setup-section">
              <legend>Preferred time</legend>
              <div className="options setup-compact three-columns">
                {["Morning", "Afternoon", "Evening"].map((time) => (
                  <Choice
                    key={time}
                    label={time}
                    selected={a.time === time}
                    onClick={() => update({ time, scheduleFlexible: false })}
                  />
                ))}
              </div>
              <Choice
                label="Keep my schedule flexible"
                check
                selected={!!a.scheduleFlexible}
                onClick={() => update(a.scheduleFlexible ? { scheduleFlexible: false } : { time: "", days: [], scheduleFlexible: true })}
              />
            </fieldset>
          </div>
        )}
        {step === "extras" && (
          <div className="setup-group">
            <fieldset className="setup-section">
              <legend>Notifications</legend>
              <p className="step-description">
                Messages and lesson updates. No daily practice reminders.
              </p>
              <div className="options setup-compact two-columns">
                <Choice
                  label="Allow notifications"
                  selected={a.notifications}
                  onClick={() => update({ notifications: true })}
                />
                <Choice
                  label="Not now"
                  selected={!a.notifications}
                  onClick={() => update({ notifications: false })}
                />
              </div>
            </fieldset>
            <fieldset className="setup-section">
              <legend>Home screen widget</legend>
              <p className="step-description">
                An optional little encouragement from Luma.
              </p>
              <div className="options setup-compact two-columns">
                <Choice
                  label="Add widget"
                  selected={a.widget}
                  onClick={() => update({ widget: true })}
                />
                <Choice
                  label="Not now"
                  selected={!a.widget}
                  onClick={() => update({ widget: false })}
                />
              </div>
              <details className="setup-optional">
                <summary>Preview widget</summary>
                <div className="widget-illustration">
                  <img
                    className="widget-phone"
                    src={asset("widget-phone")}
                    alt="Mimo home screen widget preview"
                  />
                  <div className="mimo-widget">
                    <span>You’ve got this!</span>
                    <Mascot />
                  </div>
                </div>
              </details>
            </fieldset>
          </div>
        )}
        {step === "identity-details" && (
          <div className="setup-group">
            <p className="step-description">
              {guardian
                ? "Parent or guardian: enter your own details."
                : "Use the details shown on your document."}
            </p>
            <Field
              label="Full legal name"
              value={a.legalName}
              placeholder="Example Adult"
              onChange={(e) => update({ legalName: e.target.value })}
            />
            {a.legalName && a.legalName.trim().length < 3 && (
              <p className="field-error" role="alert">
                Enter a full name of at least 3 characters.
              </p>
            )}
            <Field
              label="Date of birth"
              inputMode="numeric"
              autoComplete="off"
              placeholder="DD/MM/YYYY"
              maxLength={10}
              value={a.dateOfBirth}
              aria-invalid={
                a.dateOfBirth.length === 10 && !dateOfBirthValid(a.dateOfBirth)
              }
              onChange={(e) =>
                update({ dateOfBirth: formatDateOfBirth(e.target.value) })
              }
            />
            {a.dateOfBirth.length === 10 &&
              !dateOfBirthValid(a.dateOfBirth) && (
                <p role="alert" className="field-error">
                  Enter a real date that isn’t in the future.
                </p>
              )}
            <Note>
              Day / month / year. This won’t appear on your public profile.
            </Note>
          </div>
        )}
        {step === "document-details" && (
          <div className="setup-group">
            <Field
              label="Document issuing country"
              value={a.country}
              placeholder="France"
              onChange={(e) => update({ country: e.target.value })}
            />
            <fieldset className="setup-section">
              <legend>Document type</legend>
              {single(
                ["Passport", "National identity card", "Driving licence"],
                "documentType",
              )}
            </fieldset>
            <Note>
              No document is uploaded here. The next step uses a sample.
            </Note>
          </div>
        )}
        {step === "google-connect" && (
          <>
            <div className="google-preview">
              <GoogleMark />
              <h2>Choose an account</h2>
              <p>to continue to Mimo</p>
              <div className="sample-account">
                <span aria-hidden="true">A</span>
                <div>
                  <strong>Alex</strong>
                  <span>{sampleGoogleAccount.email}</span>
                </div>
              </div>
            </div>
          </>
        )}
        {step === "email" && (
          <>
            <Field
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={a.email}
              onChange={(e) =>
                update({ email: e.target.value, code: "", verified: false })
              }
            />
            <Note>No password to remember. Just a sign-in code.</Note>
          </>
        )}
        {step === "age" && (
          <>
            {single(["18 or older", "Under 18"], "age")}
            <Note>
              {a.age === "Under 18"
                ? "We’ll include a parent or guardian before you continue."
                : "This helps us guide you to the right setup."}
            </Note>
          </>
        )}
        {step === "guardian" && (
          <>
            <Field
              label="Parent or guardian’s email"
              type="email"
              placeholder="guardian@example.com"
              value={a.guardianEmail}
              aria-invalid={!!a.guardianEmail && !validStep("guardian", a)}
              onChange={(e) =>
                update({
                  guardianEmail: e.target.value,
                  guardianReady: false,
                  ...clearedIdentity,
                })
              }
            />
            {a.guardianEmail && !validStep("guardian", a) && (
              <p role="alert" className="field-error">
                {emailValid(a.guardianEmail)
                  ? "Use a different email address from the learner’s."
                  : "Enter an email address, such as guardian@example.com."}
              </p>
            )}
            <Note>
              {a.accountMethod === "google"
                ? "Next, your parent or guardian will confirm their identity."
                : "Your parent or guardian will have their own identity check right after the email code step."}
            </Note>
          </>
        )}
        {step === "verify" && (
          <>
            <p className="step-description">
              A code would be sent to <b>{a.email}</b>.
            </p>
            <Field
              label="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={a.code}
              onChange={(e) => {
                setError("");
                update({ code: e.target.value.replace(/\D/g, "").slice(0, 6) });
              }}
            />
            <Note>
              Enter the 6-digit code we sent to your email.
            </Note>
            <button
              className="inline-link"
              onClick={() => {
                keyboard.hide();
                update({ code: "", verified: false });
                setError("");
                flow.push(screens.account);
              }}
            >
              Change email address
            </button>
            <button
              className="inline-link"
              disabled={now < resendAt}
              onClick={() => {
                update({ code: "" });
                setError("");
                setResendAt(Date.now() + 30000);
                setNow(Date.now());
              }}
            >
              {" "}
              {now < resendAt
                ? `Resend code in ${Math.ceil((resendAt - now) / 1000)}s`
                : "Resend code"}
            </button>
          </>
        )}
        {(step === "language" || step === "teaching-languages") && (
          <>
            {step === "teaching-languages" ? (
              <>
                <p className="step-description">
                  Your language. Your way of teaching. Choose one or more.
                </p>
                <Field
                  label="Search languages"
                  type="search"
                  placeholder="Search by name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </>
            ) : (
              <p className="step-description">Choose one or more.</p>
            )}
            <div className="options languages">
              {languages
                .filter(
                  (l) =>
                    step === "language" ||
                    l.toLowerCase().includes(search.toLowerCase()),
                )
                .map((language) => (
                  <Choice
                    key={language}
                    label={language}
                    icon={flags[languages.indexOf(language)]}
                    check
                    selected={
                      step === "language"
                        ? a.learningLanguages.includes(language)
                        : a.teachingLanguages.includes(language)
                    }
                    onClick={() => {
                      keyboard.hide();
                      step === "language"
                        ? update(toggleLearningLanguage(a, language))
                        : toggle("teachingLanguages", language);
                    }}
                  />
                ))}
            </div>
            {step === "language" ? (
              <div className="languages-coming-soon">
                <div className="coming-soon-pet">
                  <img
                    className="mascot"
                    src={asset("luma-coming-soon")}
                    alt="Luma looking ahead to new languages"
                    draggable={false}
                  />
                </div>
                <div>
                  <strong>More languages</strong>
                  <span>Coming soon</span>
                </div>
              </div>
            ) : (
              !languages.some((l) =>
                l.toLowerCase().includes(search.toLowerCase()),
              ) && <Note>No matching language. Try another name.</Note>
            )}
          </>
        )}
        {isLevel && (
          <div className="options level-options">
            {levelChoices.map(([level, description]) => (
              <Choice
                key={level}
                label={level}
                description={description}
                selected={a.learningLevels[levelLanguage] === level}
                onClick={() =>
                  update({
                    learningLevels: {
                      ...a.learningLevels,
                      [levelLanguage]: level,
                    },
                  })
                }
              />
            ))}
            <Choice
              label="I’m not sure yet"
              description="My teacher can help me find out."
              icon="conversation"
              selected={a.learningLevels[levelLanguage] === "Not sure"}
              onClick={() =>
                update({
                  learningLevels: {
                    ...a.learningLevels,
                    [levelLanguage]: "Not sure",
                  },
                })
              }
            />
          </div>
        )}
        {step === "topic" && (
          <div className="options topic-options">
            {[
              [
                "Everyday life",
                "Cafés, travel, and new conversations.",
                "conversation",
              ],
              ["At work", "Meetings, interviews, and ideas.", "career"],
              [
                "For my studies",
                "Classes, exams, and presentations.",
                "education",
              ],
            ].map(([label, description, icon]) => (
              <Choice
                key={label}
                label={label}
                description={description}
                icon={icon}
                selected={a.topic === label}
                onClick={() => update({ topic: label })}
              />
            ))}
          </div>
        )}
        {step === "personal-goal" && (
          <>
            <Field
              label="One thing I’d love to do"
              multiline
              maxLength={300}
              placeholder={`Order a meal confidently in ${a.learningLanguages[0] || "French"}.`}
              value={a.personalGoal}
              onChange={(e) => update({ personalGoal: e.target.value })}
            />
            <Note>
              Your goal can be small and specific. You can change it later.
            </Note>
          </>
        )}
        {mediaHeading && (
          <Upload kind={step === "photo" ? "photo" : "resource"} />
        )}
        {step === "format" && (
          <p className="step-description">
            {a.role === "teacher"
              ? "Choose how you’d like to teach."
              : "Choose how you’d like to practice toward your goal."}
          </p>
        )}
        {step === "format" &&
          (a.role === "learner" ? (
            <div className="options">
              {learnerFormatChoices.map((format) => (
                <Choice
                  key={format}
                  label={format}
                  check
                  selected={learningFormats.includes(format)}
                  onClick={() => update(toggleLearningFormat(a, format))}
                />
              ))}
              <Note>Choose one or both formats.</Note>
            </div>
          ) : single(["In person", "Online", "Either"], "format"))}
        {step === "city" && (
          <>
            <LocationField label="City or neighbourhood (optional)" mobile={!web} value={a.city} onChange={(city) => update({ city })} allowLocation={a.role === "teacher"} />
            <Note>
              Type a city or neighbourhood, or choose a suggestion. You can decide later.
            </Note>
          </>
        )}
        {step === "days" && (
          <>
            <div className="options">
              {["Weekdays", "Weekends"].map((day) => (
                <Choice
                  key={day}
                  label={day}
                  check
                  selected={a.days.includes(day)}
                  onClick={() => toggle("days", day)}
                />
              ))}
            </div>
            <Note>Choose one or both. You’ll book an exact day later.</Note>
          </>
        )}
        {step === "time" && (
          <>
            {single(["Morning", "Afternoon", "Evening"], "time")}
            <Note>
              These are preferences. You’ll choose an exact time when you book.
            </Note>
          </>
        )}
        {step === "notifications" && (
          <>
            <div className="notification-example" aria-hidden="true">
              <div className="permission-preview">
                <b>
                  “Mimo” Would Like to
                  <br />
                  Send You Notifications
                </b>
                <p>Messages, lesson updates, and more.</p>
                <div>
                  <span>Don’t Allow</span>
                  <span>Allow</span>
                </div>
              </div>
            </div>
          </>
        )}
        {step === "widget" && (
          <>
            <div className="widget-illustration">
              <img
                className="widget-phone"
                src={asset("widget-phone")}
                alt="Mimo home screen widget preview"
              />
              <div className="mimo-widget">
                <span>You’ve got this!</span>
                <Mascot />
              </div>
            </div>
          </>
        )}
        {step === "benefits" && (
          <div className="benefits">
            {[
              [
                "conversation",
                "Conversations that matter",
                "Learn with a teacher who gets you.",
              ],
              [
                "vocabulary",
                "Your real-life goals",
                "Build lessons around what you want to do.",
              ],
              [
                "habit",
                "Lessons that fit your life",
                "Choose a format and time that work for you.",
              ],
            ].map(([icon, title, description]) => (
              <div className="benefit" key={icon}>
                <img src={asset(icon)} alt="" />
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {step === "name" && (
          <p className="step-description">
            Let learners get to know you. Start with the name you’d like to use.
          </p>
        )}
        {step === "name" && (
          <Field
            label="Display name"
            autoComplete="given-name"
            placeholder="Maya"
            maxLength={60}
            value={a.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        )}
        {step === "teaching-levels" && (
          <>
            <p className="step-description">
              Choose all the levels you’re comfortable teaching.
            </p>
            <div className="options teaching-level-options">
              {levelChoices.map(([level], i) => (
                <Choice
                  key={level}
                  label={level}
                  description={
                    [
                      "Beginner",
                      "Elementary",
                      "Intermediate",
                      "Upper intermediate",
                      "Advanced",
                      "Proficient",
                    ][i]
                  }
                  check
                  selected={a.teachingLevels.includes(level)}
                  onClick={() => toggle("teachingLevels", level)}
                />
              ))}
            </div>
          </>
        )}
        {step === "approach" && (
          <>
            <Field
              label="Your teaching approach"
              multiline
              maxLength={300}
              placeholder="Practical conversation, at your pace."
              value={a.approach}
              onChange={(e) => update({ approach: e.target.value })}
            />
            <Note>
              Help learners picture what a lesson with you feels like.
            </Note>
          </>
        )}
        {step === "duration" &&
          single(["30 minutes", "45 minutes", "60 minutes"], "duration")}
        {step === "rate" && (
          <>
            <Field
              label={`Price in euros / ${a.duration}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="1000"
              step="0.5"
              placeholder="30"
              value={a.rate}
              onChange={(e) => update({ rate: e.target.value })}
            />
            <Note>This stays editable in your teaching profile.</Note>
          </>
        )}
        {step === "teacher-review" && !validStep(step, a) && (
          <p role="alert" className="field-error">
            Some profile details need attention. Use the edit buttons below to
            complete them.
          </p>
        )}
        {step === "teacher-review" && (
          <div className="setup-summary">
            {setup.photo?.type.startsWith("image/") && (
              <img
                className="summary-photo"
                src={setup.photo.url}
                alt="Your profile"
              />
            )}
            <h2>{a.name}</h2>
            <p>
              {teachingLanguageSummary(a)}
            </p>
            <blockquote>{a.approach}</blockquote>
            <p>
              {a.format || "Format to decide"}
              {a.city ? ` · ${a.city}` : ""}
            </p>
            <p>Lesson duration: {a.duration || "Not set"}</p>
            <strong>
              Price per lesson: {lessonPriceLabel(a.rate, a.freeConfirmed)}
            </strong>
            <Note>Your profile remains a draft until you’re ready.</Note>
            <div className="setup-review-edits">
              {[
                ["teacher-profile", "Edit profile"],
                ["teacher-subjects", "Edit languages and levels"],
                ["teacher-lessons", "Edit lesson details"],
              ].map(([target, label]) => (
                <button
                  className="inline-link"
                  key={target}
                  onClick={() => {
                    keyboard.hide();
                    setError("");
                    setup.setEditingReview(true);
                    flow.push(screens[target as Step]);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === "guardian-handoff" && (
          <>
            <div className="info-card">
              <strong>Hand over to your parent or guardian</strong>
              <p>
                The next steps are for the adult helping you set up your
                account.
              </p>
              <p>{a.guardianEmail}</p>
            </div>
            <Note>
              Parent or guardian: continue with your own details and ID, rather
              than the learner’s.
            </Note>
          </>
        )}
        {step === "identity-intro" && (
          <>
            <div className={a.role === "teacher" ? "verification-info" : "options"}>
              <div className={a.role === "teacher" ? "verification-info-item" : "info-card"}>
                <strong>
                  {a.role === "teacher"
                    ? "Verify before accepting bookings"
                    : guardian
                      ? "A check for the adult supporting the learner"
                      : "Let’s build a little trust"}
                </strong>
                <p>
                  {guardian
                    ? "Use your own ID and selfie for this check. We won’t ask for the child’s ID."
                    : "Your identity document won’t appear on your public profile."}
                </p>
              </div>
              <div className={a.role === "teacher" ? "verification-info-item" : "info-card"}>
                <strong>
                  {a.role === "teacher"
                    ? "Identity, not qualifications"
                    : "Your ID, then a selfie"}
                </strong>
                <p>
                  {a.role === "teacher"
                    ? "This check confirms who you are, not your teaching qualifications."
                    : "First, add your identity details. Then use a document and a selfie to confirm it’s you."}
                </p>
              </div>
            </div>
            <button
              className="choice persona-option"
              onClick={() => {
                keyboard.hide();
                setError("");
                update({
                  identityMethod: "persona",
                  identityPreviewComplete: false,
                });
                flow.push(screens["persona-link"]);
              }}
            >
              <img src={asset("persona")} alt="" />
              <span className="choice-copy">
                <strong>Link Persona ID</strong>
                <span>Already have one? Verify instantly.</span>
              </span>
              <span className="persona-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </>
        )}
        {step === "persona-link" && (
          <>
            <div className="persona-link-card">
              <img src={asset("persona")} alt="Persona" />
              <h2>Link your Persona ID</h2>
              <p>
                {guardian
                  ? "Parent or guardian: use your own Persona ID to confirm your identity."
                  : "Use your existing Persona ID to confirm your identity without repeating the document steps."}
              </p>
            </div>
            <Note>
              Link the Persona ID you already use to confirm it’s you.
            </Note>
          </>
        )}
        {step === "legal-name" && (
          <>
            <Field
              label="Full legal name"
              placeholder="Maya Laurent"
              value={a.legalName}
              onChange={(e) => update({ legalName: e.target.value })}
            />
            <Note>
              {guardian
                ? "Parent or guardian: use your own legal name, as it appears on your ID."
                : "Use your name as it appears on your ID."}
            </Note>
          </>
        )}
        {step === "date-of-birth" && (
          <>
            <Field
              label="Date of birth"
              inputMode="numeric"
              autoComplete="off"
              placeholder="DD/MM/YYYY"
              maxLength={10}
              value={a.dateOfBirth}
              aria-describedby="birth-date-help"
              aria-invalid={
                a.dateOfBirth.length === 10 && !dateOfBirthValid(a.dateOfBirth)
              }
              onChange={(e) =>
                update({ dateOfBirth: formatDateOfBirth(e.target.value) })
              }
            />
            <p id="birth-date-help" className="step-description">
              Day / month / year, as shown on your ID.
            </p>
            {a.dateOfBirth.length === 10 &&
              !dateOfBirthValid(a.dateOfBirth) && (
                <p role="alert" className="field-error">
                  Enter a real date that isn’t in the future.
                </p>
              )}
            <Note>
              {guardian
                ? "Enter the parent or guardian’s date of birth."
                : "Your date of birth helps confirm your identity."}{" "}
              It won’t appear on a public profile.
            </Note>
          </>
        )}
        {step === "country" && (
          <Field
            label="Document issuing country"
            placeholder="France"
            value={a.country}
            onChange={(e) => update({ country: e.target.value })}
          />
        )}
        {step === "document-type" &&
          single(
            ["Passport", "National identity card", "Driving licence"],
            "documentType",
          )}
        {step === "document" && (
          <>
            <button
              className={`choice sample-action ${a.documentReady ? "selected" : ""}`}
              aria-pressed={a.documentReady}
              onClick={() => update({ documentReady: !a.documentReady })}
            >
              <span className="choice-copy">
                <strong>
                  {a.documentReady
                    ? "Document added"
                    : "Add your document"}
                </strong>
                <span>
                  {a.documentType} · {a.country}
                </span>
              </span>
              {a.documentReady && <CheckIcon />}
            </button>
            <Note>
              Your document is checked securely and never shown on your profile.
            </Note>
          </>
        )}
        {step === "selfie" && (
          <>
            <div className="selfie-preview">
              <Mascot />
            </div>
            <button
              className={`choice sample-action ${a.selfieReady ? "selected" : ""}`}
              aria-pressed={a.selfieReady}
              onClick={() => update({ selfieReady: !a.selfieReady })}
            >
              <span className="choice-copy">
                <strong>
                  {a.selfieReady
                    ? "Selfie check complete"
                    : "Take a selfie"}
                </strong>
                <span>A quick check that it’s really you.</span>
              </span>
              {a.selfieReady && <CheckIcon />}
            </button>
          </>
        )}
        {step === "learner-ready" && (
          <>
            <div className="setup-summary">
              <h2>Your setup</h2>
              {a.learningLanguages.map((language) => (
                <p key={language}>
                  <strong>{language}</strong> ·{" "}
                  {a.learningLevels[language] === "Not sure"
                    ? "Level to explore"
                    : a.learningLevels[language]}
                </p>
              ))}
              {a.personalGoal && <blockquote>{a.personalGoal}</blockquote>}
              <p><strong>Goals</strong> · {a.learningGoals.join(" · ") || a.topic}</p>
              {guardian && (
                <p>
                  Parent or guardian verification:{" "}
                  {a.identityPreviewComplete ? "done" : "to finish later"}
                </p>
              )}
            </div>
            <Note>
              Next, choose a teacher and a time. You can add your speaking
              confidence, challenges and availability anytime in Profile.
            </Note>
          </>
        )}
        {(step === "verification-ready" || step === "teacher-draft") && (
          <>
            <div className="setup-summary">
              <h2>{a.name || "Your profile"}</h2>
              <p>
                {a.teachingLanguages.join(", ")} · €{a.rate} / {a.duration}
              </p>
              <p>
                {step === "teacher-draft"
                  ? "You can finish verification later."
                  : a.identityMethod === "persona"
                    ? "Verified with Persona."
                    : "Identity verified."}
              </p>
            </div>
            <Note>
              Next, explore your teaching workspace with your students and
              sessions.
            </Note>
          </>
        )}
        {error && active && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
      </main>
    </Scroll>
  );
}
function MobileScreen({ step }: { step: Step }) {
  const flow = useFlow();
  return (
    <SetupNavigation.Provider value={flow}>
      <Screen step={step} />
    </SetupNavigation.Provider>
  );
}
function MobileFooter({ step }: { step: Step }) {
  const flow = useFlow();
  return (
    <SetupNavigation.Provider value={flow}>
      <Footer step={step} />
    </SetupNavigation.Provider>
  );
}
const screens = Object.fromEntries(
  [...new Set(stepIds)].map((step) => [
    step,
    {
      id: step,
      header: step === "welcome" ? undefined : () => <Header step={step} />,
      headerHeight: 54,
      footer: () => <MobileFooter step={step} />,
      footerHeight:
        step === "account" || step === "entry" || step === "login"
          ? 0
          : [
                "welcome",
                "resource",
                "learner-challenges",
                "photo",
                "format",
                "city",
                "days",
                "time",
                "notifications",
                "widget",
                "teacher-review",
                "teacher-lessons",
                "identity-intro",
                "persona-link",
              ].includes(step)
            ? 139
            : 82,
      render: () => <MobileScreen step={step} />,
    } satisfies FlowScreen,
  ]),
) as unknown as Record<Step, FlowScreen>;
export default function Prototype() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers),
    [resource, setResource] = useState<Media>(null),
    [photo, setPhoto] = useState<Media>(null);
  const [editingReview, setEditingReview] = useState(false);
  const [error, setError] = useState(""),
    [resendAt, setResendAt] = useState(0),
    [run, setRun] = useState(0);
  const [workspaceOpen, setWorkspaceOpen] = useState(
    () => ["teacher", "learner"].some(key => new URLSearchParams(window.location.search).get(key) === "1"),
  );
  const web = new URLSearchParams(window.location.search).get("view") === "web";
  const [returning, setReturning] = useState(false);
  const keyboard = useKeyboard();
  useEffect(
    () => () => {
      if (resource) URL.revokeObjectURL(resource.url);
    },
    [resource],
  );
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.url);
    },
    [photo],
  );
  const reset = () => {
    keyboard.hide();
    setAnswers({ ...initialAnswers });
    setResource(null);
    setPhoto(null);
    setError("");
    setEditingReview(false);
    setRun((r) => r + 1);
  };
  if (workspaceOpen) {
    const teacher = answers.role === "teacher" || new URLSearchParams(window.location.search).get("teacher") === "1";
    const workspace = (
      <Suspense
        fallback={
          <div role="status" className="teacher-loading">
            Opening your workspace…
          </div>
        }
      >
        {teacher ? <TeacherWorkspace
          mobile={!web}
          answers={answers.role === "teacher" && !returning ? answers : undefined}
        /> : <LearnerWorkspace mobile={!web} answers={answers.role === "learner" && !returning ? answers : undefined} />}
      </Suspense>
    );
    return <>{web ? createPortal(workspace, document.body) : workspace}{!web && <ViewSwitch web={false} />}</>;
  }
  const webFlow = (
    <Suspense
      fallback={
        <div role="status" className="teacher-loading">
          Opening your setup…
        </div>
      }
    >
      <WebOnboarding
        key={run}
        answers={answers}
        initial={screens.welcome}
        onBack={() => {
          setError("");
          setEditingReview(false);
        }}
      >
        {(flow) => (
          <SetupNavigation.Provider value={flow}>
            <Screen key={flow.current.key} step={flow.current.id as Step} />
            <Footer step={flow.current.id as Step} />
          </SetupNavigation.Provider>
        )}
      </WebOnboarding>
    </Suspense>
  );
  return (
    <Setup.Provider
      value={{
        answers,
        update: (patch) => setAnswers((a) => ({ ...a, ...patch })),
        resource,
        setResource,
        photo,
        setPhoto,
        error,
        setError,
        resendAt,
        setResendAt,
        editingReview,
        setEditingReview,
        reset,
        web,
        openWorkspace: (options) => {
          keyboard.hide();
          // A returning user logs in to their existing account and lands on Home.
          setReturning(!!options?.returning);
          setWorkspaceOpen(true);
        },
      }}
    >
      {!web && <ViewSwitch web={false} />}
      {web ? (
        createPortal(webFlow, document.body)
      ) : (
        <div
          className={`learning-app updated-onboarding ${answers.role === "teacher" ? "teacher-theme" : ""}`}
        >
          <FlowStack key={run} initial={screens.welcome} />
        </div>
      )}
    </Setup.Provider>
  );
}
