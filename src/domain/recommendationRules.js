import { isRainCode, isSnowCode } from './weatherCodes.js';

export const CATEGORIES = Object.freeze({
  HOT: 'hot',
  WARM: 'warm',
  MILD: 'mild',
  COOL: 'cool',
  COLD: 'cold',
  VERY_COLD: 'very-cold',
});

export const MODIFIERS = Object.freeze({
  RAIN: 'rain',
  SNOW: 'snow',
  HIGH_UV: 'high-uv',
  HEAT: 'heat',
  WIND: 'wind',
});

export function average(values) {
  const available = values.filter(Number.isFinite);
  if (available.length === 0) return null;
  return available.reduce((sum, value) => sum + value, 0) / available.length;
}

export function getEvaluationHours(day) {
  return day.hours.filter(({ localHour }) => localHour >= 8 && localHour <= 20);
}

export function selectTemperatureCategory(averageApparentTemperatureF) {
  if (!Number.isFinite(averageApparentTemperatureF)) return null;
  if (averageApparentTemperatureF >= 85) return CATEGORIES.HOT;
  if (averageApparentTemperatureF >= 70) return CATEGORIES.WARM;
  if (averageApparentTemperatureF >= 55) return CATEGORIES.MILD;
  if (averageApparentTemperatureF >= 40) return CATEGORIES.COOL;
  if (averageApparentTemperatureF >= 20) return CATEGORIES.COLD;
  return CATEGORIES.VERY_COLD;
}

export function evaluateDay(day, currentWeatherCode = null) {
  const hours = getEvaluationHours(day);
  const apparentTemperatures = hours.map((hour) => hour.apparentTemperatureF);
  const precipitationProbabilities = hours
    .map((hour) => hour.precipitationProbability)
    .filter(Number.isFinite);
  const windSpeeds = hours.map((hour) => hour.windSpeedMph).filter(Number.isFinite);
  const averageApparentTemperatureF = average(apparentTemperatures);
  const maxPrecipitationProbability = precipitationProbabilities.length
    ? Math.max(...precipitationProbabilities)
    : null;
  const maxWindSpeedMph = windSpeeds.length ? Math.max(...windSpeeds) : null;
  const hasSnow = isSnowCode(day.weatherCode) || isSnowCode(currentWeatherCode)
    || hours.some((hour) => (
    (Number.isFinite(hour.snowfallInches) && hour.snowfallInches > 0)
    || isSnowCode(hour.weatherCode)
  ));

  const modifiers = Object.freeze({
    rain: isRainCode(day.weatherCode) || isRainCode(currentWeatherCode)
      || hours.some((hour) => isRainCode(hour.weatherCode))
      || (Number.isFinite(maxPrecipitationProbability) && maxPrecipitationProbability >= 30),
    snow: hasSnow,
    highUv: Number.isFinite(day.uvIndexMax) && day.uvIndexMax >= 3,
    heat: apparentTemperatures.some((value) => Number.isFinite(value) && value >= 80),
    wind: Number.isFinite(maxWindSpeedMph) && maxWindSpeedMph >= 15,
  });

  return Object.freeze({
    hours: Object.freeze(hours),
    averageApparentTemperatureF,
    category: selectTemperatureCategory(averageApparentTemperatureF),
    maxPrecipitationProbability,
    maxWindSpeedMph,
    modifiers,
  });
}
