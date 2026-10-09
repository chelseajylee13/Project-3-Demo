import { describe, expect, it, vi } from 'vitest';
import { getDeviceLocation } from '../src/services/deviceLocation.js';
import { createForecastUrl, fetchForecast } from '../src/services/forecast.js';
import { searchUsLocations } from '../src/services/geocoding.js';
import { loadRecentLocation, RECENT_LOCATION_KEY, saveRecentLocation } from '../src/services/recentLocation.js';
import { ServiceRequestError } from '../src/services/requestJson.js';
import {
  GEOCODING_MALFORMED_FIXTURE,
  GEOCODING_NO_RESULTS_FIXTURE,
  GEOCODING_SUCCESS_FIXTURE,
} from './fixtures/geocoding.js';
import { createOpenMeteoFixture } from './fixtures/openMeteo.js';

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status });
}

describe('US geocoding adapter', () => {
  it('requests US-only results and normalizes the location label', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(GEOCODING_SUCCESS_FIXTURE));
    const signal = new AbortController().signal;

    const results = await searchUsLocations(' Austin ', { fetchImpl, signal });
    const [url, options] = fetchImpl.mock.calls[0];

    expect(url.origin).toBe('https://geocoding-api.open-meteo.com');
    expect(url.searchParams.get('name')).toBe('Austin');
    expect(url.searchParams.get('countryCode')).toBe('US');
    expect(options.signal).toBe(signal);
    expect(results).toEqual([{
      label: 'Austin, Texas',
      latitude: 30.2672,
      longitude: -97.7431,
      timezone: 'America/Chicago',
    }]);
  });

  it('does not request a query shorter than two characters', async () => {
    const fetchImpl = vi.fn();
    expect(await searchUsLocations(' A ', { fetchImpl })).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns no results when the provider has no matches', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(GEOCODING_NO_RESULTS_FIXTURE));
    expect(await searchUsLocations('not-a-city', { fetchImpl })).toEqual([]);
  });

  it('rejects malformed responses and filters non-US or invalid coordinates', async () => {
    const malformedFetch = vi.fn(async () => jsonResponse(GEOCODING_MALFORMED_FIXTURE));
    await expect(searchUsLocations('Austin', { fetchImpl: malformedFetch }))
      .rejects.toMatchObject({ code: 'invalid-response' });

    const filteredFetch = vi.fn(async () => jsonResponse({ results: [
      ...GEOCODING_SUCCESS_FIXTURE.results,
      { name: 'Toronto', country_code: 'CA', latitude: 43.6, longitude: -79.4 },
      { name: 'Bad', country_code: 'US', latitude: 100, longitude: 0 },
    ] }));
    expect(await searchUsLocations('Austin', { fetchImpl: filteredFetch })).toHaveLength(1);
  });

  it('distinguishes service and unreadable-data failures', async () => {
    const failedFetch = vi.fn(async () => jsonResponse({ error: true }, 500));
    await expect(searchUsLocations('Austin', { fetchImpl: failedFetch }))
      .rejects.toMatchObject({ code: 'http-error' });

    const unreadableFetch = vi.fn(async () => ({ ok: true, json: () => Promise.reject(new SyntaxError()) }));
    await expect(searchUsLocations('Austin', { fetchImpl: unreadableFetch }))
      .rejects.toBeInstanceOf(ServiceRequestError);

    const offlineFetch = vi.fn(async () => { throw new TypeError('offline'); });
    await expect(searchUsLocations('Austin', { fetchImpl: offlineFetch }))
      .rejects.toMatchObject({ code: 'network-error' });

    const abortedFetch = vi.fn(async () => { throw new DOMException('aborted', 'AbortError'); });
    await expect(searchUsLocations('Austin', { fetchImpl: abortedFetch }))
      .rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('forecast adapter', () => {
  const location = { label: 'Austin, Texas', latitude: 30.2672, longitude: -97.7431, timezone: 'America/Chicago' };

  it('requests the exact seven-day fields and units needed by the domain', () => {
    const url = createForecastUrl(location);

    expect(url.origin).toBe('https://api.open-meteo.com');
    expect(url.searchParams.get('current')).toBe('temperature_2m,apparent_temperature,weather_code');
    expect(url.searchParams.get('hourly')).toBe('apparent_temperature,precipitation_probability,snowfall,weather_code,wind_speed_10m');
    expect(url.searchParams.get('daily')).toBe('temperature_2m_max,temperature_2m_min,weather_code,uv_index_max');
    expect(url.searchParams.get('temperature_unit')).toBe('fahrenheit');
    expect(url.searchParams.get('wind_speed_unit')).toBe('mph');
    expect(url.searchParams.get('precipitation_unit')).toBe('inch');
    expect(url.searchParams.get('timezone')).toBe('America/Chicago');
    expect(url.searchParams.get('forecast_days')).toBe('7');
    expect(createForecastUrl({ latitude: 30, longitude: -97 }).searchParams.get('timezone')).toBe('auto');
  });

  it('returns a valid provider payload and forwards cancellation', async () => {
    const payload = createOpenMeteoFixture();
    const fetchImpl = vi.fn(async () => jsonResponse(payload));
    const signal = new AbortController().signal;

    expect(await fetchForecast(location, { fetchImpl, signal })).toEqual(payload);
    expect(fetchImpl.mock.calls[0][1].signal).toBe(signal);
  });

  it('rejects malformed payloads and invalid coordinates', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ daily: { time: [] } }));
    await expect(fetchForecast(location, { fetchImpl })).rejects.toMatchObject({ code: 'invalid-response' });
    const incomplete = createOpenMeteoFixture();
    incomplete.daily.time.pop();
    const incompleteFetch = vi.fn(async () => jsonResponse(incomplete));
    await expect(fetchForecast(location, { fetchImpl: incompleteFetch }))
      .rejects.toMatchObject({ code: 'invalid-response' });
    expect(() => createForecastUrl({ latitude: 100, longitude: 0 })).toThrow(TypeError);
  });
});

describe('device-location adapter', () => {
  it('requests coordinates only when called and labels them without inventing a city', async () => {
    const geolocation = {
      getCurrentPosition: vi.fn((resolve) => resolve({ coords: { latitude: 30.2, longitude: -97.7 } })),
    };
    expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();

    expect(await getDeviceLocation({ geolocation, timeoutMs: 5000 })).toEqual({
      label: 'Current location', latitude: 30.2, longitude: -97.7,
    });
    expect(geolocation.getCurrentPosition.mock.calls[0][2]).toEqual({
      enableHighAccuracy: false, timeout: 5000, maximumAge: 0,
    });
  });

  it.each([[1, 'denied'], [2, 'unavailable'], [3, 'timeout']])
  ('maps browser error %i to %s', async (browserCode, expected) => {
    const geolocation = { getCurrentPosition: (_resolve, reject) => reject({ code: browserCode }) };
    await expect(getDeviceLocation({ geolocation })).rejects.toMatchObject({ code: expected });
  });

  it('handles missing geolocation and invalid coordinates', async () => {
    await expect(getDeviceLocation({ geolocation: null })).rejects.toMatchObject({ code: 'unavailable' });
    const geolocation = { getCurrentPosition: (resolve) => resolve({ coords: { latitude: NaN, longitude: 0 } }) };
    await expect(getDeviceLocation({ geolocation })).rejects.toMatchObject({ code: 'invalid-response' });
  });
});

describe('one recent location', () => {
  function memoryStorage() {
    const entries = new Map();
    return {
      entries,
      getItem: (key) => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value),
    };
  }

  it('replaces the prior record and stores only label and coordinates', () => {
    const storage = memoryStorage();
    saveRecentLocation({ label: 'Austin, Texas', latitude: 30, longitude: -97, timezone: 'America/Chicago' }, storage);
    saveRecentLocation({ label: 'Dallas, Texas', latitude: 32, longitude: -96 }, storage);

    expect([...storage.entries.keys()]).toEqual([RECENT_LOCATION_KEY]);
    expect(loadRecentLocation(storage)).toEqual({ label: 'Dallas, Texas', latitude: 32, longitude: -96 });
    expect(JSON.parse(storage.entries.get(RECENT_LOCATION_KEY))).toEqual({
      label: 'Dallas, Texas', latitude: 32, longitude: -96,
    });
  });

  it('continues without persistence when storage is blocked or malformed', () => {
    const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(loadRecentLocation(blocked)).toBeNull();
    expect(saveRecentLocation({ label: 'Austin', latitude: 30, longitude: -97 }, blocked)).toBe(false);

    const malformed = memoryStorage();
    malformed.entries.set(RECENT_LOCATION_KEY, '{bad json');
    expect(loadRecentLocation(malformed)).toBeNull();
    malformed.entries.set(RECENT_LOCATION_KEY, JSON.stringify({ label: 'Bad', latitude: 200, longitude: 0 }));
    expect(loadRecentLocation(malformed)).toBeNull();
  });
});
