import { SCREENS, isScreen } from '../domain/screens.js';
import { createInitialState } from '../state/createInitialState.js';
import { createWeatherController } from '../state/createWeatherController.js';
import { createLocationDialog } from './createLocationDialog.js';
import { renderApp } from './renderApp.js';

export function createApp(root, weather = createWeatherController()) {
  let state = Object.freeze({ ...createInitialState(), ...weather.getState() });
  const viewRoot = document.createElement('div');
  const locationDialog = createLocationDialog(weather, () => state);
  const politeAnnouncer = document.createElement('div');
  politeAnnouncer.className = 'visually-hidden';
  politeAnnouncer.setAttribute('role', 'status');
  const urgentAnnouncer = document.createElement('div');
  urgentAnnouncer.className = 'visually-hidden';
  urgentAnnouncer.setAttribute('role', 'alert');
  root.replaceChildren(viewRoot, locationDialog.element, politeAnnouncer, urgentAnnouncer);
  let lastAnnouncement = null;

  function navigate(screen) {
    if (!isScreen(screen) || screen === state.screen) {
      return;
    }

    state = Object.freeze({ ...state, screen });
    render();
    document.querySelector('#main-content')?.focus();
    window.scrollTo?.(0, 0);
  }

  function render() {
    viewRoot.replaceChildren(renderApp(state));
    locationDialog.update(state);
    const announcement = `${state.status.kind}:${state.status.message}`;
    if (announcement !== lastAnnouncement) {
      const urgent = ['error', 'stale', 'location-denied', 'location-timeout', 'location-unavailable']
        .includes(state.status.kind);
      politeAnnouncer.textContent = urgent ? '' : state.status.message;
      urgentAnnouncer.textContent = urgent ? state.status.message : '';
      lastAnnouncement = announcement;
    }

    viewRoot.querySelectorAll('[data-screen]').forEach((control) => {
      control.addEventListener('click', () => navigate(control.dataset.screen));
    });
    viewRoot.querySelectorAll('[data-location-dialog-open]').forEach((control) => {
      control.addEventListener('click', () => {
        locationDialog.open(control);
      });
    });
    viewRoot.querySelector('[data-weather-action="retry"]')?.addEventListener('click', () => {
      void weather.retry();
    });
    viewRoot.querySelectorAll('[data-forecast-date]').forEach((control) => {
      control.addEventListener('click', () => weather.selectDate(control.dataset.forecastDate));
    });
    viewRoot.querySelector('[data-date-shortcut]')?.addEventListener('click', () => {
      const selected = viewRoot.querySelector('.date-selector [aria-pressed="true"]');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      selected?.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
      selected?.focus({ preventScroll: true });
    });
    viewRoot.querySelectorAll('[data-temperature-unit]').forEach((control) => {
      control.addEventListener('click', () => weather.selectUnit(control.dataset.temperatureUnit));
    });
  }

  const unsubscribe = weather.subscribe((weatherState) => {
    state = Object.freeze({ ...weatherState, screen: state.screen });
    render();
  });
  render();
  void weather.restore();

  return Object.freeze({
    getState: () => state,
    navigate,
    screens: SCREENS,
    searchLocations: weather.search,
    selectLocation: weather.selectLocation,
    useDeviceLocation: weather.locate,
    selectDate: weather.selectDate,
    selectUnit: weather.selectUnit,
    retry: weather.retry,
    dispose() {
      unsubscribe();
      weather.dispose();
    },
  });
}
