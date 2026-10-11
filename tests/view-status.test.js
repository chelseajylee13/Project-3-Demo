import { afterEach, describe, expect, it } from 'vitest';
import { buildRecommendationState } from '../src/domain/buildRecommendationState.js';
import { normalizeForecast } from '../src/domain/normalizeForecast.js';
import { createApp } from '../src/views/createApp.js';
import { LOCATION_FIXTURE, MISSING_VALUES_FIXTURE, createOpenMeteoFixture } from './fixtures/openMeteo.js';

class TestNode {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.className = '';
    this._text = '';
  }

  set textContent(value) {
    this._text = String(value);
    this.children = [];
  }

  get textContent() {
    return this._text + this.children.map((child) => (
      typeof child === 'string' ? child : child.textContent
    )).join('');
  }

  get firstElementChild() { return this.children.find((child) => child instanceof TestNode); }
  get lastElementChild() { return [...this.children].reverse().find((child) => child instanceof TestNode); }

  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; this._text = ''; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  addEventListener() {}
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

const previousDocument = globalThis.document;

afterEach(() => { globalThis.document = previousDocument; });

function visibleTree(root, predicate) {
  const found = [];
  function visit(node) {
    if (!(node instanceof TestNode)) return;
    if (predicate(node)) found.push(node);
    node.children.forEach(visit);
  }
  visit(root);
  return found;
}

function mount(status, payload = null, search = {}) {
  globalThis.document = {
    activeElement: null,
    createElement: (tag) => new TestNode(tag),
    createDocumentFragment: () => new TestNode('fragment'),
  };
  const root = new TestNode('root');
  const model = payload ? normalizeForecast(payload, LOCATION_FIXTURE) : null;
  const state = {
    status: { kind: status, message: `Status: ${status}` },
    location: model?.location ?? null,
    model,
    selectedDate: model?.days[0].date ?? null,
    recommendation: model ? buildRecommendationState(model, model.days[0].date) : null,
    unit: 'F',
    search: { query: '', results: [], kind: 'idle', message: '', ...search },
  };
  const weather = {
    getState: () => state,
    subscribe: () => () => {},
    restore: async () => null,
    dispose: () => {},
  };
  const app = createApp(root, weather);
  return { root, app };
}

describe('failure-state rendering and announcements', () => {
  it.each([
    ['loading', false],
    ['updating', false],
    ['error', true],
    ['stale', true],
    ['locating', false],
    ['location-denied', true],
    ['location-timeout', true],
    ['location-unavailable', true],
  ])('shows and announces the %s state', (kind, urgent) => {
    const { root, app } = mount(kind);
    const status = visibleTree(root, (node) => node.className.includes(`home-status--${kind}`));
    expect(status).toHaveLength(1);
    expect(status[0].textContent).toBe(`Status: ${kind}`);
    const announcer = root.children[urgent ? 3 : 2];
    expect(announcer.attributes.role).toBe(urgent ? 'alert' : 'status');
    expect(announcer.textContent).toBe(`Status: ${kind}`);
    app.dispose();
  });

  it.each([
    ['no-results', 'No US locations found. Try a different city or ZIP code.'],
    ['error', 'Location search failed. Try again.'],
  ])('shows a live search message for %s', (kind, expected) => {
    const { root, app } = mount('ready', null, { kind, message: expected });
    const messages = visibleTree(root, (node) => node.className === 'location-dialog__message');
    expect(messages).toHaveLength(1);
    expect(messages[0].attributes.role).toBe('status');
    expect(messages[0].textContent).toBe(expected);
    app.dispose();
  });

  it('keeps completed weather visible during an update and offers Retry after failure', () => {
    const payload = createOpenMeteoFixture();
    const updating = mount('updating', payload);
    expect(visibleTree(updating.root, (node) => node.className.includes('home-content--updating')))
      .toHaveLength(1);
    expect(visibleTree(updating.root, (node) => node.className === 'outfit__image')).toHaveLength(1);
    updating.app.dispose();

    const stale = mount('stale', payload);
    expect(visibleTree(stale.root, (node) => node.className === 'outfit__image')).toHaveLength(1);
    expect(visibleTree(stale.root, (node) => node.textContent === 'Retry weather')).toHaveLength(1);
    stale.app.dispose();
  });

  it('labels missing secondary temperatures unavailable instead of showing zero', () => {
    const payload = createOpenMeteoFixture();
    payload.current.temperature_2m = null;
    payload.daily.temperature_2m_max[0] = null;
    const { root, app } = mount('ready', payload);

    const temperatures = visibleTree(root, (node) => node.tagName === 'dd')
      .map((node) => node.textContent);
    expect(temperatures).toEqual(['Unavailable', '60°F', 'Unavailable', '52°F']);
    expect(visibleTree(root, (node) => node.className === 'outfit__image')).toHaveLength(1);
    app.dispose();
  });

  it.each([
    ['missing apparent temperature', MISSING_VALUES_FIXTURE, 'Apparent-temperature data is incomplete.'],
    ['conflicting hot and snow', createOpenMeteoFixture({
      profiles: [{ apparent: 85, snowfall: 0.2, weatherCode: 71 }],
    }), 'The reported snow conflicts with hot-weather data.'],
  ])('withholds the outfit and shows an alert for %s', (_label, payload, warning) => {
    const { root, app } = mount('ready', payload);
    const alerts = visibleTree(root, (node) => node.attributes.role === 'alert');
    expect(alerts.some((node) => node.textContent.includes(warning))).toBe(true);
    expect(root.textContent).toContain('No outfit is shown; retry');
    expect(visibleTree(root, (node) => node.textContent === 'Retry weather')).toHaveLength(1);
    expect(visibleTree(root, (node) => node.className === 'outfit__image')).toHaveLength(0);
    app.dispose();
  });
});
