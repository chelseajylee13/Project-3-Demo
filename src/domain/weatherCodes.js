const CONDITIONS = Object.freeze({
  CLEAR: Object.freeze({ key: 'clear', label: 'Clear' }),
  PARTLY_CLOUDY: Object.freeze({ key: 'partly-cloudy', label: 'Partly cloudy' }),
  OVERCAST: Object.freeze({ key: 'overcast', label: 'Overcast' }),
  FOG: Object.freeze({ key: 'fog', label: 'Foggy' }),
  RAIN: Object.freeze({ key: 'rain', label: 'Rain' }),
  SNOW: Object.freeze({ key: 'snow', label: 'Snow' }),
  THUNDERSTORM: Object.freeze({ key: 'thunderstorm', label: 'Thunderstorms' }),
  UNKNOWN: Object.freeze({ key: 'unknown', label: 'Condition unavailable' }),
});

const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const THUNDERSTORM_CODES = new Set([95, 96, 99]);

export function mapWeatherCode(code) {
  if (!Number.isFinite(code)) return CONDITIONS.UNKNOWN;
  if (code === 0) return CONDITIONS.CLEAR;
  if (code === 1 || code === 2) return CONDITIONS.PARTLY_CLOUDY;
  if (code === 3) return CONDITIONS.OVERCAST;
  if (code === 45 || code === 48) return CONDITIONS.FOG;
  if (RAIN_CODES.has(code)) return CONDITIONS.RAIN;
  if (SNOW_CODES.has(code)) return CONDITIONS.SNOW;
  if (THUNDERSTORM_CODES.has(code)) return CONDITIONS.THUNDERSTORM;
  return CONDITIONS.UNKNOWN;
}

export function isRainCode(code) {
  return RAIN_CODES.has(code);
}

export function isSnowCode(code) {
  return SNOW_CODES.has(code);
}
