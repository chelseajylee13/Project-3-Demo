import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { buildRecommendationState } from '../src/domain/buildRecommendationState.js';
import { selectVariationIndex } from '../src/domain/deterministicVariation.js';
import { normalizeForecast } from '../src/domain/normalizeForecast.js';
import { PRIMARY_OUTFIT_DESCRIPTIONS } from '../src/domain/recommendationContent.js';
import { TEMPERATURE_UNITS } from '../src/domain/temperature.js';
import {
  CATEGORY_FIXTURES,
  COMBINED_MODIFIER_FIXTURE,
  LOCATION_FIXTURE,
  MISSING_VALUES_FIXTURE,
  createOpenMeteoFixture,
} from './fixtures/openMeteo.js';

function stateFrom(payload, date = '2026-10-05', unit) {
  return buildRecommendationState(normalizeForecast(payload, LOCATION_FIXTURE), date, unit);
}

describe('immutable recommendation state', () => {
  it.each(Object.entries(CATEGORY_FIXTURES))('builds the %s category from fixture data', (category, payload) => {
    const state = stateFrom(payload);

    expect(state.category).toBe(category);
    if (category === 'hot') {
      expect(state.outfit.asset).toBe('character/weather/heat-hot.png');
    } else {
      expect(state.outfit.asset).toMatch(new RegExp(`${category}-[1-3]\\.png$`));
    }
    expect(state.recommendation).toContain(state.outfit.description);
    expect(state.summary.condition.key).toBe('clear');
  });

  it('keeps every active modifier but selects one integrated snow outfit', () => {
    const state = stateFrom(COMBINED_MODIFIER_FIXTURE);

    expect(state.modifiers).toEqual({
      rain: true,
      snow: true,
      highUv: true,
      heat: true,
      wind: true,
    });
    expect(state.outfit).toMatchObject({
      primaryModifier: 'snow',
      variationIndex: null,
      asset: 'character/weather/snow-warm.png',
    });
    expect(state.reminders.map(({ active }) => active)).toEqual([true, true, true, true]);
    expect(state.condition.key).toBe('snow');
    expect(state.summary.condition.key).toBe('clear');
    expect(state.recommendation).toContain('Bring an umbrella');
    expect(state.mascotAlt).toContain('blue snow jacket');
    expect(state.mascotAlt).not.toContain('umbrella');
    expect(state).not.toHaveProperty('modifierAssets');
  });

  it('uses one complete rain or snow look and retains appropriate reminders', () => {
    const rain = stateFrom(createOpenMeteoFixture({
      profiles: [{ precipitation: 40 }],
    }));
    const snow = stateFrom(createOpenMeteoFixture({
      profiles: [{ snowfall: 0.2, weatherCode: 71 }],
    }));

    expect(rain.outfit.asset).toBe('character/weather/rain-mild.png');
    expect(snow.outfit.asset).toBe('character/weather/snow-mild.png');
    expect(rain.mascotAlt).toContain('holding an umbrella');
    expect(snow.mascotAlt).not.toContain('umbrella');
    expect(rain.reminders[0].active).toBe(true);
    expect(snow.reminders[0].active).toBe(false);
  });

  it.each([
    ['wind', { wind: 40 }, 'wind'],
    ['high UV', { uv: 9 }, 'high-uv'],
    ['heat', { apparent: 95 }, 'heat'],
  ])('selects a single integrated %s look', (_label, profile, assetModifier) => {
    const state = stateFrom(createOpenMeteoFixture({ profiles: [profile] }));

    expect(state.outfit.asset).toBe(`character/weather/${assetModifier}-${state.category}.png`);
    expect(state.outfit.variationIndex).toBeNull();
    expect(state).not.toHaveProperty('modifierAssets');
  });

  it('has a specific description and a production image for all 29 eligible modified looks', () => {
    const pairs = Object.entries(PRIMARY_OUTFIT_DESCRIPTIONS)
      .flatMap(([modifier, categories]) => Object.entries(categories)
        .map(([category, description]) => ({ modifier, category, description })));

    expect(pairs).toHaveLength(29);
    for (const { modifier, category, description } of pairs) {
      expect(description).not.toContain('temperature-appropriate');
      expect(existsSync(new URL(`../src/assets/character/weather/${modifier}-${category}.png`, import.meta.url))).toBe(true);
    }
    expect(PRIMARY_OUTFIT_DESCRIPTIONS.snow).not.toHaveProperty('hot');
  });

  it('keeps category and deterministic content unchanged when only display units change', () => {
    const fahrenheit = stateFrom(CATEGORY_FIXTURES.warm, '2026-10-05', TEMPERATURE_UNITS.FAHRENHEIT);
    const celsius = stateFrom(CATEGORY_FIXTURES.warm, '2026-10-05', TEMPERATURE_UNITS.CELSIUS);

    expect(celsius.category).toBe(fahrenheit.category);
    expect(celsius.outfit).toEqual(fahrenheit.outfit);
    expect(celsius.reminders).toEqual(fahrenheit.reminders);
    expect(fahrenheit.summary.temperatures.current.text).toBe('72°F');
    expect(celsius.summary.temperatures.current.text).toBe('22°C');
  });

  it('returns the same variations for repeat visits without storing history', () => {
    const first = stateFrom(COMBINED_MODIFIER_FIXTURE);
    const second = stateFrom(COMBINED_MODIFIER_FIXTURE);

    expect(second.outfit.variationIndex).toBe(first.outfit.variationIndex);
    expect(second.reminders.map(({ variationIndex }) => variationIndex))
      .toEqual(first.reminders.map(({ variationIndex }) => variationIndex));
  });

  it('keeps each reminder selection stable when its eligibility changes', () => {
    const dry = stateFrom(createOpenMeteoFixture());
    const rainy = stateFrom(createOpenMeteoFixture({
      profiles: [{ precipitation: (hour) => (hour >= 12 ? 40 : 10) }],
    }));

    expect(dry.reminders[0].active).toBe(false);
    expect(rainy.reminders[0].active).toBe(true);
    expect(rainy.reminders[0].variationIndex).toBe(dry.reminders[0].variationIndex);
  });

  it('uses separately salted selections rather than fixed outfit/reminder pairs', () => {
    const pairs = Array.from({ length: 14 }, (_, offset) => {
      const date = `2026-10-${String(offset + 1).padStart(2, '0')}`;
      const common = { ...LOCATION_FIXTURE, date, count: 3 };
      return [
        selectVariationIndex({ ...common, salt: 'outfit:warm' }),
        selectVariationIndex({ ...common, salt: 'reminder:umbrella' }),
      ].join(':');
    });

    expect(new Set(pairs).size).toBeGreaterThan(3);
  });

  it('distinguishes current and forecast summaries', () => {
    const today = stateFrom(createOpenMeteoFixture(), '2026-10-05');
    const future = stateFrom(createOpenMeteoFixture(), '2026-10-06');

    expect(today.summary.kind).toBe('current');
    expect(today.summary.temperatures.current).not.toBeNull();
    expect(future.summary.kind).toBe('forecast');
    expect(future.summary.temperatures.averageFeelsLike).not.toBeNull();
  });

  it('prevents an outfit recommendation when the entire apparent-temperature window is missing', () => {
    const state = stateFrom(MISSING_VALUES_FIXTURE);

    expect(state.available).toBe(false);
    expect(state.reason).toBe('missing-apparent-temperature');
    expect(state.outfit).toBeNull();
    expect(state.recommendation).toBeNull();
  });

  it('does not invent a hot-and-snow outfit for inconsistent forecast data', () => {
    const state = stateFrom(createOpenMeteoFixture({
      profiles: [{ apparent: 85, snowfall: 0.2, weatherCode: 71 }],
    }));

    expect(state.available).toBe(false);
    expect(state.reason).toBe('inconsistent-weather-data');
    expect(state.category).toBe('hot');
    expect(state.outfit).toBeNull();
    expect(state.recommendation).toBeNull();
  });

  it('deep-freezes the complete recommendation output', () => {
    const state = stateFrom(COMBINED_MODIFIER_FIXTURE);

    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.summary.temperatures)).toBe(true);
    expect(Object.isFrozen(state.reminders[0])).toBe(true);
    expect(Object.isFrozen(state.outfit)).toBe(true);
  });
});
