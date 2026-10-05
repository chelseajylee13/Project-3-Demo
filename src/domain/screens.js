export const SCREENS = Object.freeze({
  HOME: 'home',
  ABOUT: 'about',
});

export function isScreen(value) {
  return Object.values(SCREENS).includes(value);
}
