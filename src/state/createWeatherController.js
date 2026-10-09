import { buildRecommendationState } from '../domain/buildRecommendationState.js';
import { normalizeForecast } from '../domain/normalizeForecast.js';
import { createInitialState } from './createInitialState.js';
import { getDeviceLocation } from '../services/deviceLocation.js';
import { fetchForecast } from '../services/forecast.js';
import { searchUsLocations } from '../services/geocoding.js';
import { loadRecentLocation, saveRecentLocation } from '../services/recentLocation.js';

const status = (kind, message) => Object.freeze({ kind, message });

export function createWeatherController({
  searchLocations = searchUsLocations,
  requestForecast = fetchForecast,
  requestDeviceLocation = getDeviceLocation,
  loadLocation = loadRecentLocation,
  saveLocation = saveRecentLocation,
  searchDelayMs = 250,
} = {}) {
  let state = Object.freeze({
    ...createInitialState(),
    model: null,
    recommendation: null,
    search: Object.freeze({ query: '', results: [], kind: 'idle', message: '' }),
  });
  const listeners = new Set();
  let forecastRequestId = 0;
  let forecastAbort = null;
  let searchRequestId = 0;
  let searchAbort = null;
  let searchTimer = null;
  let settlePendingSearch = null;
  let deviceRequestId = 0;

  function update(patch) {
    state = Object.freeze({ ...state, ...patch });
    listeners.forEach((listener) => listener(state));
  }

  function cancelSearch() {
    searchRequestId += 1;
    if (searchTimer !== null) clearTimeout(searchTimer);
    searchTimer = null;
    searchAbort?.abort();
    searchAbort = null;
    settlePendingSearch?.([]);
    settlePendingSearch = null;
  }

  async function loadForecast(location, { persist = false } = {}) {
    forecastRequestId += 1;
    const id = forecastRequestId;
    forecastAbort?.abort();
    forecastAbort = new AbortController();
    if (persist) saveLocation(location);
    update({
      location,
      status: status(state.model ? 'updating' : 'loading', `Loading weather for ${location.label}.`),
    });

    try {
      const payload = await requestForecast(location, { signal: forecastAbort.signal });
      if (id !== forecastRequestId) return null;
      const model = normalizeForecast(payload, location);
      const selectedDate = model.days.some(({ date }) => date === state.selectedDate)
        ? state.selectedDate : model.days[0]?.date;
      if (!selectedDate) throw new Error('No forecast dates were returned.');
      update({
        model,
        selectedDate,
        recommendation: buildRecommendationState(model, selectedDate),
        status: status('ready', `Weather updated for ${location.label}.`),
      });
      return state.recommendation;
    } catch (error) {
      if (id !== forecastRequestId || error?.name === 'AbortError') return null;
      update({
        status: status(state.model ? 'stale' : 'error',
          state.model ? 'Weather could not update. Showing the last successful forecast; Retry is available.'
            : 'Weather could not load. Retry is available.'),
      });
      return null;
    }
  }

  async function restore() {
    const location = loadLocation();
    return location ? loadForecast(location) : null;
  }

  async function selectLocation(location) {
    deviceRequestId += 1;
    cancelSearch();
    update({ search: Object.freeze({ query: '', results: [], kind: 'idle', message: '' }) });
    return loadForecast(location, { persist: true });
  }

  async function locate() {
    const id = ++deviceRequestId;
    update({ status: status('locating', 'Finding your current location.') });
    try {
      const location = await requestDeviceLocation();
      if (id !== deviceRequestId) return null;
      return selectLocation(location);
    } catch (error) {
      if (id !== deviceRequestId) return null;
      const message = error?.code === 'denied'
        ? 'Location permission was denied. Search for a US city or ZIP instead.'
        : error?.code === 'timeout'
          ? 'Location request timed out. Search for a US city or ZIP instead.'
        : 'Device location is unavailable. Search for a US city or ZIP instead.';
      const kind = error?.code === 'denied' ? 'location-denied'
        : error?.code === 'timeout' ? 'location-timeout' : 'location-unavailable';
      update({ status: status(kind, message) });
      return null;
    }
  }

  function search(query) {
    cancelSearch();
    const trimmed = String(query ?? '').trim();
    if (trimmed.length < 2) {
      update({ search: Object.freeze({ query: trimmed, results: [], kind: 'idle', message: '' }) });
      return Promise.resolve([]);
    }

    const id = searchRequestId;
    update({ search: Object.freeze({ query: trimmed, results: [], kind: 'searching', message: 'Searching US locations.' }) });
    return new Promise((resolve) => {
      settlePendingSearch = resolve;
      searchTimer = setTimeout(async () => {
        searchTimer = null;
        searchAbort = new AbortController();
        try {
          const results = await searchLocations(trimmed, { signal: searchAbort.signal });
          if (id !== searchRequestId) return;
          update({ search: Object.freeze({
            query: trimmed,
            results: Object.freeze(results),
            kind: results.length ? 'results' : 'no-results',
            message: results.length ? '' : 'No US locations found.',
          }) });
          resolve(results);
        } catch (error) {
          if (id !== searchRequestId || error?.name === 'AbortError') return;
          update({ search: Object.freeze({
            query: trimmed, results: [], kind: 'error', message: 'Location search failed. Try again.',
          }) });
          resolve([]);
        } finally {
          if (id === searchRequestId) settlePendingSearch = null;
        }
      }, searchDelayMs);
    });
  }

  function selectDate(date) {
    if (!state.model?.days.some((day) => day.date === date)) return false;
    update({ selectedDate: date, recommendation: buildRecommendationState(state.model, date) });
    return true;
  }

  function dispose() {
    forecastRequestId += 1;
    deviceRequestId += 1;
    forecastAbort?.abort();
    cancelSearch();
    listeners.clear();
  }

  return Object.freeze({
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    restore,
    selectLocation,
    locate,
    search,
    selectDate,
    retry: () => state.location ? loadForecast(state.location) : Promise.resolve(null),
    dispose,
  });
}
