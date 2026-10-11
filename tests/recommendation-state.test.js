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
  it('converts a temperature-change callout when Celsius is selected', () => {
    const fixture = createOpenMeteoFixture({
      profiles: [{ apparent: (hour) => hour >= 14 ? 70 : 60, wind: 6 }],
      current: { time: '2026-10-05T09:15', apparent: 60 },
    });
    const state = stateFrom(fixture, '2026-10-05', TEMPERATURE_UNITS.CELSIUS);

    expect(state.forecastChange.type).toBe('temperature');
    expect(state.forecastChange.text).toContain('6°C');
  });

  it('converts warming within a rain callout and keeps three separate messages', () => {
    const fixture = createOpenMeteoFixture({
      profiles: [{}, {
        apparent: (hour) => hour >= 13 ? 72 : 60,
        precipitation: (hour) => hour >= 14 && hour < 16 ? 40 : 10,
        weatherCode: 61,
        hourlyWeatherCode: 0,
      }],
    });
    const state = stateFrom(fixture, '2026-10-06', TEMPERATURE_UNITS.CELSIUS);

    expect(state.forecastChange.items.map(({ text }) => text)).toEqual([
      'Rain may begin around 2 PM.',
      'Rain may stop around 4 PM.',
      'It may feel about 7°C warmer around 1 PM.',
    ]);
    expect(state.forecastChange.text).not.toContain('°F');
  });

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

  it('uses rain clothing and reminders when only the daily weather code reports rain', () => {
    const state = stateFrom(createOpenMeteoFixture({
      profiles: [{}, { apparent: 85, weatherCode: 61, hourlyWeatherCode: 0, precipitation: 10, uv: 4 }],
    }), '2026-10-06');

    expect(state.summary.condition.key).toBe('rain');
    expect(state.outfit.asset).toBe('character/weather/rain-hot.png');
    expect(state.reminders[0].active).toBe(true);
    expect(state.reminders[1].active).toBe(true);
    expect(state.forecastChange.type).toBe('rain-timing-unavailable');
  });

  it('uses the current rain code on today and a daily snow code on a future date', () => {
    const fixture = createOpenMeteoFixture({
      profiles: [
        { apparent: 75, weatherCode: 0, hourlyWeatherCode: 0, precipitation: 10 },
        { apparent: 30, weatherCode: 71, hourlyWeatherCode: 0, snowfall: 0 },
      ],
      current: { weatherCode: 61 },
    });

    expect(stateFrom(fixture).outfit.asset).toBe('character/weather/rain-warm.png');
    expect(stateFrom(fixture, '2026-10-06').outfit.asset).toBe('character/weather/snow-cold.png');
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
    ['no modifiers', {}, [false, false, false, false], true],
    ['rain', { precipitation: 40 }, [true, true, false, false], false],
    ['snow', { snowfall: 0.2, weatherCode: 71 }, [false, true, false, false], false],
    ['high UV', { uv: 9 }, [false, false, true, false], false],
    ['heat', { apparent: 95 }, [false, false, false, true], false],
  ])('keeps four reminder slots and the no-extras state for %s', (_name, profile, active, noExtrasNeeded) => {
    const state = stateFrom(createOpenMeteoFixture({ profiles: [profile] }));

    expect(state.reminders.map(({ key }) => key)).toEqual([
      'umbrella', 'shoes', 'sunscreen', 'hydration',
    ]);
    expect(state.reminders.map((reminder) => reminder.active)).toEqual(active);
    expect(state.reminders.map((reminder) => Boolean(reminder.text))).toEqual(active);
    expect(state.noExtrasNeeded).toBe(noExtrasNeeded);
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

  it('selects the matching state, image, and copy for every eligible modifier/category pair', () => {
    const categoryTemperatures = {
      hot: 90,
      warm: 75,
      mild: 60,
      cool: 45,
      cold: 30,
      'very-cold': 10,
    };
    const modifierProfiles = {
      rain: { precipitation: 40 },
      snow: { snowfall: 0.2, weatherCode: 71 },
      wind: { wind: 16 },
      'high-uv': { uv: 5 },
      heat: {},
    };

    for (const [modifier, categories] of Object.entries(PRIMARY_OUTFIT_DESCRIPTIONS)) {
      for (const [category, description] of Object.entries(categories)) {
        const target = categoryTemperatures[category];
        const apparent = modifier === 'heat' && target < 80
          ? (hour) => hour === 12 ? 80 : (target * 13 - 80) / 12
          : target;
        const payload = createOpenMeteoFixture({
          profiles: [{}, { ...modifierProfiles[modifier], apparent }],
        });
        const state = stateFrom(payload, '2026-10-06');

        expect(state.category, `${modifier}/${category} category`).toBe(category);
        expect(state.outfit.primaryModifier, `${modifier}/${category} primary modifier`)
          .toBe(modifier === 'high-uv' ? 'highUv' : modifier);
        expect(state.outfit.asset).toBe(`character/weather/${modifier}-${category}.png`);
        expect(state.outfit.description).toBe(description);
        expect(state.recommendation).toContain(description);
        expect(state.mascotAlt).toContain(description);
      }
    }
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

  it('preserves provider values in today and later-day summaries', () => {
    const payload = createOpenMeteoFixture({
      timezone: 'America/Chicago',
      profiles: [
        { apparent: 67, high: 82, low: 57, weatherCode: 0 },
        { apparent: 65, high: 75, low: 55, weatherCode: 3 },
      ],
      current: { time: '2026-10-05T09:15', temperature: 71, apparent: 67, weatherCode: 0 },
    });
    const today = stateFrom(payload, '2026-10-05');
    const future = stateFrom(payload, '2026-10-06');

    expect(today.summary).toMatchObject({
      kind: 'current',
      date: payload.daily.time[0],
      location: LOCATION_FIXTURE.label,
      timezone: payload.timezone,
      updatedAt: payload.current.time,
      temperatures: {
        current: { value: payload.current.temperature_2m, text: '71\u00b0F' },
        feelsLike: { value: payload.current.apparent_temperature, text: '67\u00b0F' },
        high: { value: payload.daily.temperature_2m_max[0], text: '82\u00b0F' },
        low: { value: payload.daily.temperature_2m_min[0], text: '57\u00b0F' },
      },
    });
    expect(future.summary).toMatchObject({
      kind: 'forecast',
      date: payload.daily.time[1],
      location: LOCATION_FIXTURE.label,
      timezone: payload.timezone,
      temperatures: {
        high: { value: payload.daily.temperature_2m_max[1], text: '75\u00b0F' },
        low: { value: payload.daily.temperature_2m_min[1], text: '55\u00b0F' },
        averageFeelsLike: { value: 65, text: '65\u00b0F' },
      },
    });
    expect(today.summary.condition.key).toBe('clear');
    expect(future.summary.condition.key).toBe('overcast');

    const todayCelsius = stateFrom(payload, '2026-10-05', TEMPERATURE_UNITS.CELSIUS);
    const futureCelsius = stateFrom(payload, '2026-10-06', TEMPERATURE_UNITS.CELSIUS);
    expect(Object.values(todayCelsius.summary.temperatures).map(({ text }) => text))
      .toEqual(['22\u00b0C', '19\u00b0C', '28\u00b0C', '14\u00b0C']);
    expect(Object.values(futureCelsius.summary.temperatures).map(({ text }) => text))
      .toEqual(['24\u00b0C', '13\u00b0C', '18\u00b0C']);
    expect(todayCelsius.outfit).toEqual(today.outfit);
    expect(futureCelsius.outfit).toEqual(future.outfit);
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
