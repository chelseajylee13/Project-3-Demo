import { SCREENS, isScreen } from '../domain/screens.js';
import { createInitialState } from '../state/createInitialState.js';
import { createWeatherController } from '../state/createWeatherController.js';
import { renderApp } from './renderApp.js';

export function createApp(root, weather = createWeatherController()) {
  let state = Object.freeze({ ...createInitialState(), ...weather.getState() });

  function navigate(screen) {
    if (!isScreen(screen) || screen === state.screen) {
      return;
    }

    state = Object.freeze({ ...state, screen });
    render();
    document.querySelector('#main-content')?.focus();
  }

  function render() {
    const searchHadFocus = document.activeElement?.id === 'location-search';
    const selectionStart = searchHadFocus ? document.activeElement.selectionStart : null;
    const selectionEnd = searchHadFocus ? document.activeElement.selectionEnd : null;
    root.replaceChildren(renderApp(state));

    if (searchHadFocus) {
      const input = root.querySelector('#location-search');
      input?.focus();
      if (selectionStart !== null && selectionEnd !== null) {
        input?.setSelectionRange(selectionStart, selectionEnd);
      }
    }

    root.querySelectorAll('[data-screen]').forEach((control) => {
      control.addEventListener('click', () => navigate(control.dataset.screen));
    });
    root.querySelector('#location-search')?.addEventListener('input', (event) => {
      void weather.search(event.target.value);
    });
    root.querySelectorAll('[data-location-index]').forEach((control) => {
      control.addEventListener('click', () => {
        const location = state.search.results[Number(control.dataset.locationIndex)];
        if (location) void weather.selectLocation(location);
      });
    });
    root.querySelector('[data-weather-action="locate"]')?.addEventListener('click', () => {
      void weather.locate();
    });
    root.querySelector('[data-weather-action="retry"]')?.addEventListener('click', () => {
      void weather.retry();
    });
    root.querySelectorAll('[data-forecast-date]').forEach((control) => {
      control.addEventListener('click', () => weather.selectDate(control.dataset.forecastDate));
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
    retry: weather.retry,
    dispose() {
      unsubscribe();
      weather.dispose();
    },
  });
}
