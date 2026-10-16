import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { FlowControls, FlowScreen } from './mobile/FlowStack';
import { routeFor, type Answers, type Step } from './onboarding';
import { Icon } from './teacher/icons';
import './web-onboarding.css';

type Props = {
  answers: Answers;
  initial: FlowScreen;
  onBack: () => void;
  children: (flow: FlowControls) => ReactNode;
};
const finished = new Set<Step>(['learner-ready', 'verification-ready', 'teacher-draft']);

function sectionFor(step: Step) {
  if (['welcome', 'greeting', 'role', 'setup-intro'].includes(step)) return 'A little introduction';
  if (['account', 'google-connect', 'email', 'age', 'guardian', 'verify'].includes(step)) return 'Your account';
  if (['guardian-handoff', 'identity-intro', 'persona-link', 'legal-name', 'date-of-birth', 'country', 'document-type', 'document', 'selfie'].includes(step)) return 'Identity preview';
  if (finished.has(step)) return 'Your setup is ready';
  if (['format', 'city', 'days', 'time', 'duration', 'rate', 'notifications', 'widget', 'benefits'].includes(step)) return 'Lessons that fit your life';
  return 'Make it yours';
}

export default function WebOnboarding({ answers, initial, onBack, children }: Props) {
  const sequence = useRef(1);
  const [stack, setStack] = useState<FlowControls['stack']>(() => [{ ...initial, key: initial.id + '-0' }]);
  const stage = useRef<HTMLElement>(null);
  const current = stack[stack.length - 1];
  const step = current.id as Step;
  const route = routeFor(answers);
  const index = Math.max(0, route.indexOf(step));
  const progress = finished.has(step) ? 100 : Math.round(index / (route.length - 1) * 100);
  const section = sectionFor(step);

  // Shared content/actions use the mobile flow's interface in a desktop shell.
  const entry = (screen: FlowScreen) => ({ ...screen, key: screen.id + '-' + sequence.current++ });
  const flow: FlowControls = {
    current,
    previous: stack.length > 1 ? stack[stack.length - 2] : null,
    stack,
    canGoBack: stack.length > 1,
    push: screen => { const next = entry(screen); setStack(previous => [...previous, next]); },
    pop: () => setStack(previous => previous.length > 1 ? previous.slice(0, -1) : previous),
    replace: screen => { const next = entry(screen); setStack(previous => [...previous.slice(0, -1), next]); },
  };

  useEffect(() => {
    if (current.id === 'welcome') return;
    stage.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [current.key, current.id]);

  return (
    <div className="learning-app updated-onboarding web-onboarding">
      <header className="web-setup-header">
        <nav aria-label="Onboarding">
          {flow.canGoBack ? <button className="web-back" aria-label="Go back" onClick={() => { onBack(); flow.pop(); }}><Icon name="back" size={22} /></button> : <span className="web-back-placeholder" />}
          <div className="progress" role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span style={{ width: progress + '%' }} />
          </div>
          <a className="web-setup-brand" href="/?view=web" aria-label="Mimo web onboarding"><span>mimo</span></a>
        </nav>
      </header>
      <div className="web-setup-main">
        <div className="web-step-meta"><span>{section}</span><span>{finished.has(step) ? 'Ready for the next step' : 'Step ' + (index + 1) + ' of ' + route.length}</span></div>
        <section ref={stage} tabIndex={-1} aria-label={section} className="web-setup-stage" data-testid="web-onboarding-current" data-web-step={step}>
          {children(flow)}
        </section>
        <p className="web-setup-preview">Local preview · Your answers stay in this session.</p>
        <a className="web-mobile-link" href="/">Try the mobile preview <Icon name="arrow" size={14} /></a>
      </div>
    </div>
  );
}
