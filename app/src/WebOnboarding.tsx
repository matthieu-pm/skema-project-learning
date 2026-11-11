import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FlowControls, FlowScreen } from "./mobile/FlowStack";
import { setupProgress, type Answers, type Step } from "./onboarding";
import { Icon } from "./teacher/icons";
import { Button } from "./teacher/ui/button";
import "./web-onboarding.css";

type Props = {
  answers: Answers;
  initial: FlowScreen;
  onBack: () => void;
  children: (flow: FlowControls) => ReactNode;
};
const finished = new Set<Step>([
  "learner-ready",
  "verification-ready",
  "teacher-draft",
]);
const wideSteps = new Set<Step>([
  "language", "teaching-languages", "teaching-levels", "teacher-subjects",
  "teacher-lessons", "learner-preferences", "extras", "learner-ready",
]);

function sectionFor(step: Step) {
  if (["welcome", "role"].includes(step)) return "A little introduction";
  if (
    [
      "account",
      "google-connect",
      "email",
      "age",
      "guardian",
      "verify",
    ].includes(step)
  )
    return "Your account";
  if (
    [
      "guardian-handoff",
      "identity-intro",
      "persona-link",
      "identity-details",
      "document-details",
      "legal-name",
      "date-of-birth",
      "country",
      "document-type",
      "document",
      "selfie",
    ].includes(step)
  )
    return "Identity check";
  if (finished.has(step)) return "Your setup is ready";
  if (
    [
      "teacher-lessons",
      "learner-preferences",
      "extras",
      "format",
      "city",
      "days",
      "time",
      "duration",
      "rate",
      "notifications",
      "widget",
      "benefits",
    ].includes(step)
  )
    return "Lessons that fit your life";
  return "Make it yours";
}

export default function WebOnboarding({
  answers,
  initial,
  onBack,
  children,
}: Props) {
  const sequence = useRef(1);
  const [stack, setStack] = useState<FlowControls["stack"]>(() => [
    { ...initial, key: initial.id + "-0" },
  ]);
  const stage = useRef<HTMLElement>(null);
  const current = stack[stack.length - 1];
  const step = current.id as Step;
  const {
    index,
    total,
    optionalIdentity,
  } = setupProgress(answers, step);
  const section = optionalIdentity
    ? "Optional identity check"
    : sectionFor(step);
  const progressTotal = answers.role ? total : 2;
  const progressStep = answers.role ? (finished.has(step) ? total : index + 1) : step === "welcome" ? 1 : 2;
  const progressLabel = answers.role ? `Step ${progressStep} of ${total}` : "Choose your path";
  const setupLabel = answers.role === "teacher" ? "Teaching setup" : answers.role === "learner" ? "Learning setup" : "Get started";

  // Shared content/actions use the mobile flow's interface in a desktop shell.
  const entry = (screen: FlowScreen) => ({
    ...screen,
    key: screen.id + "-" + sequence.current++,
  });
  const flow: FlowControls = {
    current,
    previous: stack.length > 1 ? stack[stack.length - 2] : null,
    stack,
    canGoBack: stack.length > 1,
    push: (screen) => {
      const next = entry(screen);
      setStack((previous) => [...previous, next]);
    },
    pop: () =>
      setStack((previous) =>
        previous.length > 1 ? previous.slice(0, -1) : previous,
      ),
    replace: (screen) => {
      const next = entry(screen);
      setStack((previous) => [...previous.slice(0, -1), next]);
    },
  };

  useEffect(() => {
    if (current.id === "welcome") return;
    stage.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [current.key, current.id]);

  return (
    <div className={`learning-app updated-onboarding web-onboarding ${wideSteps.has(step) ? "web-setup-wide" : ""} ${step === "teacher-review" ? "web-teacher-review" : ""}`}>
      <header className="web-setup-header">
        <div className="web-setup-brand-row">
          <a
            className="web-setup-brand"
            href="/?view=web"
            aria-label="Mimo web onboarding"
          >
            <span>mimo</span>
          </a>
          <span className="web-setup-context">{setupLabel}</span>
        </div>
      </header>
      <div className="web-setup-main">
        <div className="web-setup-card">
          <nav className="web-step-meta" aria-label="Onboarding">
            {flow.canGoBack ? (
              <Button
                static
                variant="ghost"
                size="sm"
                className="web-back"
                aria-label="Go back"
                onClick={() => {
                  onBack();
                  flow.pop();
                }}
              >
                <Icon name="back" size={16} />
                Back
              </Button>
            ) : <span>{section}</span>}
            <span className="web-step-count">
              {finished.has(step) ? "Ready for the next step" : progressLabel}
            </span>
          </nav>
          <div
            className="setup-segments"
            style={{ gridTemplateColumns: `repeat(${progressTotal}, minmax(0, 1fr))` }}
            role="progressbar"
            aria-label="Setup progress"
            aria-valuemin={0}
            aria-valuemax={progressTotal}
            aria-valuenow={progressStep}
            aria-valuetext={progressLabel}
          >
            {Array.from({ length: progressTotal }, (_, segment) => <span key={segment} data-complete={segment < progressStep ? "true" : undefined} aria-hidden="true" />)}
          </div>
          <section
            ref={stage}
            tabIndex={-1}
            aria-label={section}
            className="web-setup-stage"
            data-testid="web-onboarding-current"
            data-web-step={step}
          >
            {children(flow)}
          </section>
        </div>
        <a className="web-mobile-link" href="/?view=mobile">
          Open mobile app <Icon name="arrow" size={14} />
        </a>
      </div>
    </div>
  );
}
