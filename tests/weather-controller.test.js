import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWeatherController } from '../src/state/createWeatherController.js';
import { createOpenMeteoFixture } from './fixtures/openMeteo.js';
import { MISSING_VALUES_FIXTURE } from './fixtures/openMeteo.js';

const austin = { label: 'Austin, Texas', latitude: 30.2672, longitude: -97.7431 };
const dallas = { label: 'Dallas, Texas', latitude: 32.7767, longitude: -96.797 };

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

afterEach(() => vi.useRealTimers());

describe('weather data controller', () => {
  it('does not request weather on first use without a saved location', async () => {
    const requestForecast = vi.fn();
    const controller = createWeatherController({ loadLocation: () => null, requestForecast });

    await controller.restore();

    expect(requestForecast).not.toHaveBeenCalled();
    expect(controller.getState().status.kind).toBe('idle');
    controller.dispose();
  });

  it('restores one location and builds a seven-date recommendation state', async () => {
    const requestForecast = vi.fn(async () => createOpenMeteoFixture());
    const controller = createWeatherController({ loadLocation: () => austin, requestForecast });

    await controller.restore();

    expect(controller.getState().model.days).toHaveLength(7);
    expect(controller.getState().selectedDate).toBe('2026-10-05');
    expect(controller.getState().recommendation.outfit.asset).toBe('character/outfits/mild-2.png');
    expect(controller.getState().status.kind).toBe('ready');
    expect(controller.selectDate('2026-10-06')).toBe(true);
    expect(controller.getState().recommendation.selectedDate).toBe('2026-10-06');
    expect(controller.selectDate('2026-10-12')).toBe(false);
    controller.dispose();
  });

  it('converts displayed temperatures without changing the outfit category', async () => {
    const controller = createWeatherController({
      loadLocation: () => austin,
      requestForecast: async () => createOpenMeteoFixture(),
    });
    await controller.restore();
    const originalAsset = controller.getState().recommendation.outfit.asset;

    expect(controller.selectUnit('C')).toBe(true);
    expect(controller.getState().recommendation.summary.temperatures.current.text).toBe('17°C');
    expect(controller.getState().recommendation.outfit.asset).toBe(originalAsset);
    expect(controller.selectUnit('K')).toBe(false);
    controller.dispose();
  });

  it('saves the selected location and retains stale weather when Retry fails', async () => {
    const saveLocation = vi.fn();
    const requestForecast = vi.fn()
      .mockResolvedValueOnce(createOpenMeteoFixture())
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(createOpenMeteoFixture({ profiles: [{ apparent: 70 }] }));
    const controller = createWeatherController({ saveLocation, requestForecast });

    await controller.selectLocation(austin);
    const lastModel = controller.getState().model;
    await controller.retry();

    expect(saveLocation).toHaveBeenCalledWith(austin);
    expect(controller.getState().status.kind).toBe('stale');
    expect(controller.getState().model).toBe(lastModel);
    await controller.retry();
    expect(controller.getState().status.kind).toBe('ready');
    expect(controller.getState().recommendation.category).toBe('warm');
    controller.dispose();
  });

  it('exposes loading, updating, and service-failure states without hiding completed weather', async () => {
    const first = deferred();
    const second = deferred();
    const third = deferred();
    const requestForecast = vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
      .mockReturnValueOnce(third.promise);
    const controller = createWeatherController({ requestForecast, saveLocation: () => true });

    const initialLoad = controller.selectLocation(austin);
    expect(controller.getState().status.kind).toBe('loading');
    expect(controller.getState().recommendation).toBeNull();
    first.reject(new Error('offline'));
    await initialLoad;
    expect(controller.getState().status.kind).toBe('error');

    const retry = controller.retry();
    expect(controller.getState().status.kind).toBe('loading');
    second.resolve(createOpenMeteoFixture());
    await retry;
    const completed = controller.getState().recommendation;

    const update = controller.retry();
    expect(controller.getState().status.kind).toBe('updating');
    expect(controller.getState().recommendation).toBe(completed);
    third.reject(new Error('offline'));
    await update;
    expect(controller.getState().status.kind).toBe('stale');
    expect(controller.getState().recommendation).toBe(completed);
    controller.dispose();
  });

  it('ignores out-of-order forecast responses after selecting another location', async () => {
    const first = deferred();
    const second = deferred();
    const requestForecast = vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const controller = createWeatherController({ requestForecast, saveLocation: () => true });

    const oldLoad = controller.selectLocation(austin);
    const oldSignal = requestForecast.mock.calls[0][1].signal;
    const newLoad = controller.selectLocation(dallas);
    expect(oldSignal.aborted).toBe(true);
    second.resolve(createOpenMeteoFixture());
    await newLoad;
    first.resolve(createOpenMeteoFixture());
    await oldLoad;

    expect(controller.getState().model.location.label).toBe('Dallas, Texas');
    controller.dispose();
  });

  it('debounces search and ignores an older result', async () => {
    vi.useFakeTimers();
    const first = deferred();
    const searchLocations = vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce([dallas]);
    const controller = createWeatherController({ searchLocations, searchDelayMs: 250 });

    const oldSearch = controller.search('Austin');
    await vi.advanceTimersByTimeAsync(250);
    const oldSignal = searchLocations.mock.calls[0][1].signal;
    const newSearch = controller.search('Dallas');
    expect(oldSignal.aborted).toBe(true);
    expect(await oldSearch).toEqual([]);
    await vi.advanceTimersByTimeAsync(250);
    expect(await newSearch).toEqual([dallas]);
    first.resolve([austin]);
    await Promise.resolve();

    expect(controller.getState().search.results).toEqual([dallas]);
    expect(controller.getState().search.kind).toBe('results');
    controller.dispose();
  });

  it('keeps manual search available after device permission denial', async () => {
    const requestDeviceLocation = vi.fn(async () => { throw { code: 'denied' }; });
    const controller = createWeatherController({ requestDeviceLocation });

    await controller.locate();

    expect(controller.getState().status.kind).toBe('location-denied');
    expect(controller.getState().status.message).toContain('Search for a US city');
    controller.dispose();
  });

  it('distinguishes device timeout and fetches after explicit location activation', async () => {
    const requestDeviceLocation = vi.fn()
      .mockRejectedValueOnce({ code: 'timeout' })
      .mockResolvedValueOnce(austin);
    const requestForecast = vi.fn(async () => createOpenMeteoFixture());
    const controller = createWeatherController({ requestDeviceLocation, requestForecast, saveLocation: () => true });

    expect(requestDeviceLocation).not.toHaveBeenCalled();
    await controller.locate();
    expect(controller.getState().status.kind).toBe('location-timeout');
    await controller.locate();
    expect(controller.getState().location).toEqual(austin);
    expect(controller.getState().status.kind).toBe('ready');
    controller.dispose();
  });

  it('reports no search results and service errors without losing the query', async () => {
    vi.useFakeTimers();
    const searchLocations = vi.fn()
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('offline'));
    const controller = createWeatherController({ searchLocations, searchDelayMs: 250 });

    const noResults = controller.search('Unknown');
    await vi.advanceTimersByTimeAsync(250);
    expect(await noResults).toEqual([]);
    expect(controller.getState().search.kind).toBe('no-results');

    const failed = controller.search('Austin');
    await vi.advanceTimersByTimeAsync(250);
    expect(await failed).toEqual([]);
    expect(controller.getState().search).toMatchObject({ query: 'Austin', kind: 'error' });
    controller.dispose();
  });

  it('clears search results when a location is selected', async () => {
    vi.useFakeTimers();
    const controller = createWeatherController({
      searchLocations: async () => [austin],
      requestForecast: async () => createOpenMeteoFixture(),
      saveLocation: () => true,
    });

    const search = controller.search('Austin');
    await vi.advanceTimersByTimeAsync(250);
    await search;
    expect(controller.getState().search.results).toHaveLength(1);

    await controller.selectLocation(austin);

    expect(controller.getState().search).toMatchObject({ query: '', results: [], kind: 'idle' });
    controller.dispose();
  });

  it('keeps reported weather but withholds an outfit when apparent temperatures are missing', async () => {
    const controller = createWeatherController({
      requestForecast: async () => MISSING_VALUES_FIXTURE,
      saveLocation: () => true,
    });

    await controller.selectLocation(austin);

    expect(controller.getState().status.kind).toBe('ready');
    expect(controller.getState().recommendation.available).toBe(false);
    expect(controller.getState().recommendation.reason).toBe('missing-apparent-temperature');
    controller.dispose();
  });
});
