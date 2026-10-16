import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAppView, deviceEntryUrl } from '../src/device-routing.ts';

const desktop = { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 0, compactTouch: false };
const phone = { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile', maxTouchPoints: 5, compactTouch: true };

test('desktop, narrow desktop, and touch laptops open web onboarding', () => {
  assert.equal(resolveAppView('', desktop), 'web');
  assert.equal(resolveAppView('', { ...desktop, userAgent: 'Windows NT 10.0', maxTouchPoints: 10, mobile: false, compactTouch: true }), 'web');
});

test('phones including landscape, Android tablets, and desktop-mode iPads open mobile', () => {
  for (const device of [phone, { ...phone, compactTouch: false }, { ...phone, userAgent: 'Android 16; Tablet' }, { ...desktop, maxTouchPoints: 5 }]) {
    assert.equal(resolveAppView('', device), 'mobile');
  }
});

test('browser mobile hint and compact touch fallback work without a recognizable user agent', () => {
  assert.equal(resolveAppView('', { ...desktop, userAgent: '', mobile: true }), 'mobile');
  assert.equal(resolveAppView('', { ...desktop, userAgent: '', compactTouch: true }), 'mobile');
});

test('explicit previews override device detection; unknown views use detection', () => {
  assert.equal(resolveAppView('?view=web', phone), 'web');
  assert.equal(resolveAppView('?view=mobile', desktop), 'mobile');
  assert.equal(resolveAppView('?view=unknown', desktop), 'web');
  assert.equal(resolveAppView('?view=', phone), 'mobile');
});

test('entry keeps teacher links, other parameters, path and hash and is idempotent', () => {
  const original = new URL('https://example.com/?teacher=1&campaign=hello#schedule');
  const target = deviceEntryUrl(original, desktop);
  assert.equal(target.searchParams.get('teacher'), '1');
  assert.equal(target.searchParams.get('campaign'), 'hello');
  assert.equal(target.hash, '#schedule');
  assert.equal(target.pathname, original.pathname);
  assert.equal(target.searchParams.get('view'), 'web');
  assert.equal(original.searchParams.has('view'), false);
  assert.equal(deviceEntryUrl(target, phone).href, target.href);
});
