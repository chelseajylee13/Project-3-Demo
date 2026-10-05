import { SCREENS, isScreen } from '../domain/screens.js';
import { createInitialState } from '../state/createInitialState.js';
import { renderApp } from './renderApp.js';

export function createApp(root) {
  let state = createInitialState();

  function navigate(screen) {
    if (!isScreen(screen) || screen === state.screen) {
      return;
    }

    state = Object.freeze({ ...state, screen });
    render();
    document.querySelector('#main-content')?.focus();
  }

  function render() {
    root.replaceChildren(renderApp(state));

    root.querySelectorAll('[data-screen]').forEach((control) => {
      control.addEventListener('click', () => navigate(control.dataset.screen));
    });
  }

  render();

  return Object.freeze({
    getState: () => state,
    navigate,
    screens: SCREENS,
  });
}
