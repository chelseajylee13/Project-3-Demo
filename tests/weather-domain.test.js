import { describe, expect, it } from 'vitest';
import { normalizeForecast } from '../src/domain/normalizeForecast.js';
import {
  CATEGORIES,
  evaluateDay,
  selectTemperatureCategory,
} from '../src/domain/recommendationRules.js';
import { mapWeatherCode } from '../src/domain/weatherCodes.js';
import {
  COMBINED_MODIFIER_FIXTURE,
  LOCATION_FIXTURE,
  MISSING_VALUES_FIXTURE,
  createOpenMeteoFixture,
} from './fixtures/openMeteo.js';

function createDay({
  apparent = 60,
  precipitation = 10,
  snowfall = 0,
  weatherCode = 0,
  wind = 6,
  uvIndexMax = 2,
} = {}) {
  return {
    uvIndexMax,
    hours: Array.from({ length: 13 }, (_, index) => {
      const localHour = index + 8;
      const value = (configured) => (
        typeof configured === 'function' ? configured(localHour) : configured
      );
      return {
        time: `2026-10-05T${String(localHour).padStart(2, '0')}:00`,
        localHour,
        apparentTemperatureF: value(apparent),
        precipitationProbability: value(precipitation),
        snowfallInches: value(snowfall),
        weatherCode: value(weatherCode),
        windSpeedMph: value(wind),
      };
    }),
  };
}

describe('Open-Meteo normalization', () => {
  it('creates seven date-owned models without converting local timestamps', () => {
    const payload = createOpenMeteoFixture();
    const model = normalizeForecast(payload, LOCATION_FIXTURE);

    expect(model.days).toHaveLength(7);
    expect(model.days[0].date).toBe('2026-10-05');
    expect(model.days[0].hours).toHaveLength(24);
    expect(model.days[0].hours[8].time).toBe('2026-10-05T08:00');
    expect(model.days[0].hours[8].localHour).toBe(8);
    expect(model.location.timezone).toBe('America/Chicago');
    expect(Object.isFrozen(model.days[0].hours[0])).toBe(true);
  });

  it('handles a short DST day by using provider-local date and hour strings', () => {
    const payload = createOpenMeteoFixture({
      startDate: '2026-03-08',
      profiles: [{ omitHours: [2], apparent: 55 }],
    });
    const model = normalizeForecast(payload, LOCATION_FIXTURE);
    const evaluation = evaluateDay(model.days[0]);

    expect(model.days[0].hours).toHaveLength(23);
    expect(evaluation.hours).toHaveLength(13);
    expect(evaluation.averageApparentTemperatureF).toBe(55);
  });

  it('uses null for incomplete parallel arrays instead of inventing zero', () => {
    const payload = createOpenMeteoFixture();
    payload.hourly.wind_speed_10m = [];
    payload.daily.uv_index_max = [];
    const model = normalizeForecast(payload, LOCATION_FIXTURE);

    expect(model.days[0].hours[10].windSpeedMph).toBeNull();
    expect(model.days[0].uvIndexMax).toBeNull();
  });
});

describe('weather codes and recommendation thresholds', () => {
  it.each([
    [0, 'clear'], [2, 'partly-cloudy'], [3, 'overcast'], [45, 'fog'],
    [61, 'rain'], [71, 'snow'], [95, 'thunderstorm'], [999, 'unknown'],
  ])('maps WMO code %s to %s', (code, key) => {
    expect(mapWeatherCode(code).key).toBe(key);
  });

  it.each([
    [85, CATEGORIES.HOT],
    [84.99, CATEGORIES.WARM],
    [70, CATEGORIES.WARM],
    [69.99, CATEGORIES.MILD],
    [55, CATEGORIES.MILD],
    [54.99, CATEGORIES.COOL],
    [40, CATEGORIES.COOL],
    [39.99, CATEGORIES.COLD],
    [20, CATEGORIES.COLD],
    [19.99, CATEGORIES.VERY_COLD],
  ])('classifies %s°F as %s', (temperature, category) => {
    expect(selectTemperatureCategory(temperature)).toBe(category);
  });

  it('evaluates the inclusive 8 AM through 8 PM window only', () => {
    const day = createDay({ apparent: 60 });
    day.hours.unshift({ ...day.hours[0], localHour: 7, apparentTemperatureF: 100 });
    day.hours.push({ ...day.hours.at(-1), localHour: 21, apparentTemperatureF: 100 });

    const evaluation = evaluateDay(day);
    expect(evaluation.hours).toHaveLength(13);
    expect(evaluation.averageApparentTemperatureF).toBe(60);
  });

  it('activates every modifier at its threshold', () => {
    const model = normalizeForecast(COMBINED_MODIFIER_FIXTURE, LOCATION_FIXTURE);
    const evaluation = evaluateDay(model.days[0]);

    expect(evaluation.modifiers).toEqual({
      rain: true,
      snow: true,
      highUv: true,
      heat: true,
      wind: true,
    });
  });

  it('keeps every modifier inactive immediately below its threshold', () => {
    const evaluation = evaluateDay(createDay({
      apparent: 79.99,
      precipitation: 29.99,
      snowfall: 0,
      weatherCode: 0,
      wind: 14.99,
      uvIndexMax: 2.99,
    }));

    expect(evaluation.modifiers).toEqual({
      rain: false,
      snow: false,
      highUv: false,
      heat: false,
      wind: false,
    });
  });

  it('returns no category when the evaluation window has no apparent temperatures', () => {
    const model = normalizeForecast(MISSING_VALUES_FIXTURE, LOCATION_FIXTURE);
    expect(evaluateDay(model.days[0]).category).toBeNull();
  });
});
