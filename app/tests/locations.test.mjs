import test from 'node:test';
import assert from 'node:assert/strict';
import { findLocations, locationChoices, locationUrl, locationPermissionError } from '../src/locations.ts';
test('suggestions distinguish cities, deduplicate labels and tolerate incomplete records', () => {
  const data = { features: [
    { properties: { name: 'Paris', city: 'Paris', state: 'Île-de-France', country: 'France' } },
    { properties: { name: 'Paris', city: 'Paris', state: 'Île-de-France', country: 'France' } },
    { properties: { name: 'Paris', state: 'Texas', country: 'United States' } },
    {}, { properties: {} },
  ] };
  assert.deepEqual(locationChoices(data), [ { label: 'Paris, Île-de-France, France' }, { label: 'Paris, Texas, United States' } ]);
  assert.deepEqual(locationChoices({ features: [] }), []);
  assert.throws(() => locationChoices({ error: 'bad response' }));
});
test('search encodes typed input and limits requests to place layers', () => {
  const u = new URL(locationUrl('  Saint-Germain & Paris  '));
  assert.equal(u.searchParams.get('q'), 'Saint-Germain & Paris');
  assert.deepEqual(u.searchParams.getAll('layer'), ['city', 'district', 'locality']);
  assert.equal(u.searchParams.get('limit'), '5');
});
test('reverse lookup sends approximate coordinates rather than precision or a home address', () => {
  const u = new URL(locationUrl({ latitude: 48.856614, longitude: 2.3522219 }));
  assert.equal(u.searchParams.get('lat'), '48.86');
  assert.equal(u.searchParams.get('lon'), '2.35');
  assert.equal(u.searchParams.has('q'), false);
  assert.throws(() => locationUrl({ latitude: Infinity, longitude: 1 }));
  assert.throws(() => locationUrl({ latitude: 100, longitude: 1 }));
});
test('service failures and malformed data reject while cancellation is passed through', async () => {
  const controller = new AbortController();
  await assert.rejects(findLocations('Paris', controller.signal, async () => ({ ok: false })));
  await assert.rejects(findLocations('Paris', controller.signal, async () => ({ ok: true, json: async () => ({}) })));
  await assert.rejects(findLocations('Paris', controller.signal, async () => { throw new Error('offline'); }));
  assert.deepEqual(await findLocations('Paris', controller.signal, async (_, init) => {
    assert.equal(init.signal, controller.signal); assert.equal(init.credentials, 'omit');
    return { ok: true, json: async () => ({ features: [] }) };
  }), []);
});
test('denied permission, timeout and unavailable position all offer manual recovery', () => {
  for (const code of [1, 2, 3, 0]) assert.match(locationPermissionError(code), /type your city or neighbourhood/);
  assert.match(locationPermissionError(1), /denied/);
  assert.match(locationPermissionError(3), /too long/);
});
