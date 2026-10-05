import { describe, expect, it } from 'vitest';
import { SCREENS, isScreen } from '../src/domain/screens.js';
import { createInitialState } from '../src/state/createInitialState.js';

describe('application foundation', () => {
  it('starts on Home without inventing a location or forecast date', () => {
    const state = createInitialState();

    expect(state.screen).toBe(SCREENS.HOME);
    expect(state.location).toBeNull();
    expect(state.selectedDate).toBeNull();
    expect(state.status.kind).toBe('idle');
  });

  it('recognizes only the two approved screens', () => {
    expect(isScreen(SCREENS.HOME)).toBe(true);
    expect(isScreen(SCREENS.ABOUT)).toBe(true);
    expect(isScreen('settings')).toBe(false);
  });

  it('returns a frozen initial state', () => {
    const state = createInitialState();

    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.status)).toBe(true);
  });
});
