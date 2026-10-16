export type AppView = 'mobile' | 'web';

type DeviceHints = {
  userAgent: string;
  maxTouchPoints: number;
  mobile?: boolean;
  compactTouch: boolean;
};

export function resolveAppView(search: string, device: DeviceHints): AppView {
  const requested = new URLSearchParams(search).get('view');
  if (requested === 'web' || requested === 'mobile') return requested;

  // Include landscape phones and iPads that request desktop websites.
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(device.userAgent)
    || (/Macintosh/i.test(device.userAgent) && device.maxTouchPoints > 1)) return 'mobile';
  if (device.mobile !== undefined) return device.mobile ? 'mobile' : 'web';
  return device.compactTouch ? 'mobile' : 'web';
}

export function deviceEntryUrl(url: URL, device: DeviceHints): URL {
  const target = new URL(url);
  target.searchParams.set('view', resolveAppView(url.search, device));
  return target;
}
