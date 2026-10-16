import { deviceEntryUrl } from './device-routing';

const deviceNavigator = navigator as Navigator & { userAgentData?: { mobile: boolean } };
const target = deviceEntryUrl(new URL(window.location.href), {
  userAgent: navigator.userAgent,
  maxTouchPoints: navigator.maxTouchPoints,
  mobile: deviceNavigator.userAgentData?.mobile,
  compactTouch: window.matchMedia('(max-width: 767px) and (pointer: coarse)').matches,
});

// Resolve before mounting either flow, without a reload or an extra Back entry.
document.documentElement.dataset.appView = target.searchParams.get('view')!;
if (target.href !== window.location.href) window.history.replaceState(window.history.state, '', target);
void import('./main');
