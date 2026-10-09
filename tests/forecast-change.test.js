import { describe, expect, it } from 'vitest';
import { evaluateForecastChange } from '../src/domain/forecastChange.js';

function createDay(overrides = {}) {
  return {
    hours: Array.from({ length: 14 }, (_, index) => {
      const localHour = index + 7;
      const value = (key, fallback) => {
        const configured = overrides[key];
        return typeof configured === 'function' ? configured(localHour) : configured ?? fallback;
      };
      return {
        time: `2026-10-05T${String(localHour).padStart(2, '0')}:00`,
        localHour,
        apparentTemperatureF: value('apparent', 60),
        precipitationProbability: value('precipitation', 10),
        snowfallInches: value('snowfall', 0),
        weatherCode: value('weatherCode', 0),
      };
    }),
  };
}

describe('Forecast Change', () => {
  it('reports the first rain threshold crossing', () => {
    const result = evaluateForecastChange({
      day: createDay({ precipitation: (hour) => (hour >= 11 ? 30 : 10) }),
      isToday: false,
      current: null,
    });

    expect(result).toMatchObject({ type: 'rain', localHour: 11 });
    expect(result.text).toContain('11 AM');
  });

  it('reports when snow begins', () => {
    const result = evaluateForecastChange({
      day: createDay({ snowfall: (hour) => (hour >= 13 ? 0.1 : 0) }),
      isToday: false,
      current: null,
    });

    expect(result).toMatchObject({ type: 'snow', localHour: 13 });
  });

  it.each([
    ['warmer', (hour) => (hour >= 14 ? 70 : 60), 14],
    ['cooler', (hour) => (hour >= 12 ? 49 : 60), 12],
  ])('reports a %s change of at least 10°F', (direction, apparent, localHour) => {
    const result = evaluateForecastChange({
      day: createDay({ apparent }),
      isToday: false,
      current: null,
    });

    expect(result).toMatchObject({ type: 'temperature', direction, localHour });
  });

  it('prioritizes precipitation even when temperature changes earlier', () => {
    const result = evaluateForecastChange({
      day: createDay({
        apparent: (hour) => (hour >= 10 ? 72 : 60),
        precipitation: (hour) => (hour >= 16 ? 40 : 10),
      }),
      isToday: false,
      current: null,
    });

    expect(result).toMatchObject({ type: 'rain', localHour: 16 });
  });

  it('compares today with the current hour, including before the evaluation window', () => {
    const result = evaluateForecastChange({
      day: createDay({ precipitation: (hour) => (hour >= 8 ? 35 : 10) }),
      isToday: true,
      current: { time: '2026-10-05T07:20', apparentTemperatureF: 60 },
    });

    expect(result).toMatchObject({ type: 'rain', localHour: 8 });
  });

  it('returns steady wording for high UV alone or no threshold crossing', () => {
    const result = evaluateForecastChange({
      day: createDay(),
      isToday: false,
      current: null,
    });

    expect(result).toEqual({
      type: 'steady',
      time: null,
      text: 'Conditions should stay fairly steady.',
    });
  });
});
