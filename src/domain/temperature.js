export const TEMPERATURE_UNITS = Object.freeze({
  FAHRENHEIT: 'F',
  CELSIUS: 'C',
});

export function fahrenheitToCelsius(valueF) {
  return Number.isFinite(valueF) ? (valueF - 32) * (5 / 9) : null;
}

export function displayTemperature(valueF, unit = TEMPERATURE_UNITS.FAHRENHEIT) {
  if (!Number.isFinite(valueF)) return null;
  const value = unit === TEMPERATURE_UNITS.CELSIUS ? fahrenheitToCelsius(valueF) : valueF;
  return Object.freeze({
    value: Math.round(value),
    unit,
    text: `${Math.round(value)}°${unit}`,
  });
}
