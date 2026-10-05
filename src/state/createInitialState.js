import { SCREENS } from '../domain/screens.js';

export function createInitialState() {
  return Object.freeze({
    screen: SCREENS.HOME,
    location: null,
    selectedDate: null,
    status: Object.freeze({
      kind: 'idle',
      message: 'Choose a US location to see weather and an outfit recommendation.',
    }),
  });
}
