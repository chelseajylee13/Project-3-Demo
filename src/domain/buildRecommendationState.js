import { selectVariationIndex } from './deterministicVariation.js';
import { evaluateForecastChange } from './forecastChange.js';
import {
  OUTFIT_VARIATIONS,
  PRIMARY_OUTFIT_DESCRIPTIONS,
  REMINDER_CONTENT,
  buildRecommendationText,
} from './recommendationContent.js';
import { evaluateDay } from './recommendationRules.js';
import { displayTemperature, TEMPERATURE_UNITS } from './temperature.js';
import { mapWeatherCode } from './weatherCodes.js';

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

function createReminder(key, active, context) {
  const content = REMINDER_CONTENT[key];
  const variationIndex = selectVariationIndex({
    ...context,
    salt: `reminder:${key}`,
    count: content.variations.length,
  });

  return {
    key,
    label: content.label,
    active,
    variationIndex,
    text: active ? content.variations[variationIndex] : null,
    icon: `reminders/${key === 'shoes' ? 'water-resistant-shoes' : key === 'hydration' ? 'water' : key}.svg`,
  };
}

function selectVisualCondition(day, current, isToday, modifiers) {
  if (modifiers.snow) return mapWeatherCode(71);
  if (modifiers.rain) return mapWeatherCode(61);
  return mapWeatherCode(isToday ? current.weatherCode : day.weatherCode);
}

function selectPrimaryModifier(modifiers) {
  return ['snow', 'rain', 'wind', 'highUv', 'heat'].find((key) => modifiers[key]) ?? null;
}

function assetModifier(primaryModifier) {
  return primaryModifier === 'highUv' ? 'high-uv' : primaryModifier;
}

function describeMascot(outfitDescription, primaryModifier) {
  const accessory = primaryModifier === 'rain' ? ', holding an umbrella'
    : primaryModifier === 'heat' ? ', holding a water bottle'
      : '';
  return `Upright Bichon mascot wearing ${outfitDescription}${accessory}.`;
}

function createSummary(model, day, evaluation, unit, isToday) {
  const condition = mapWeatherCode(isToday ? model.current.weatherCode : day.weatherCode);
  const temperatures = isToday
    ? {
        current: displayTemperature(model.current.temperatureF, unit),
        feelsLike: displayTemperature(model.current.apparentTemperatureF, unit),
        high: displayTemperature(day.highTemperatureF, unit),
        low: displayTemperature(day.lowTemperatureF, unit),
      }
    : {
        high: displayTemperature(day.highTemperatureF, unit),
        low: displayTemperature(day.lowTemperatureF, unit),
        averageFeelsLike: displayTemperature(evaluation.averageApparentTemperatureF, unit),
      };

  return {
    kind: isToday ? 'current' : 'forecast',
    date: day.date,
    location: model.location.label,
    timezone: model.location.timezone,
    updatedAt: model.updatedAt,
    condition,
    unit,
    temperatures,
  };
}

function displayForecastChange(change, unit) {
  if (unit !== TEMPERATURE_UNITS.CELSIUS) return change;
  const items = change.items.map((item) => {
    if (item.kind !== 'temperature') return item;
    const fahrenheitDelta = Math.round(Math.abs(item.differenceF));
    const celsiusDelta = Math.round(Math.abs(item.differenceF) * (5 / 9));
    return {
      ...item,
      text: item.text.replace(`${fahrenheitDelta}\u00b0F`, `${celsiusDelta}\u00b0C`),
    };
  });
  return {
    ...change,
    items,
    text: items.map(({ text }) => text).join(' '),
  };
}

export function buildRecommendationState(
  model,
  selectedDate,
  unit = TEMPERATURE_UNITS.FAHRENHEIT,
) {
  const day = model.days.find(({ date }) => date === selectedDate);
  if (!day) throw new RangeError(`No forecast exists for ${selectedDate}.`);
  if (!Object.values(TEMPERATURE_UNITS).includes(unit)) {
    throw new RangeError(`Unsupported temperature unit: ${unit}.`);
  }

  const isToday = model.current.time?.slice(0, 10) === selectedDate;
  const evaluation = evaluateDay(day, isToday ? model.current.weatherCode : null);
  const condition = selectVisualCondition(day, model.current, isToday, evaluation.modifiers);
  const variationContext = {
    latitude: model.location.latitude,
    longitude: model.location.longitude,
    date: selectedDate,
  };
  const reminders = [
    createReminder('umbrella', evaluation.modifiers.rain, variationContext),
    createReminder('shoes', evaluation.modifiers.rain || evaluation.modifiers.snow, variationContext),
    createReminder('sunscreen', evaluation.modifiers.highUv, variationContext),
    createReminder('hydration', evaluation.modifiers.heat, variationContext),
  ];
  const forecastChange = displayForecastChange(
    evaluateForecastChange({ day, isToday, current: model.current }), unit,
  );

  const unavailableReason = !evaluation.category
    ? 'missing-apparent-temperature'
    : evaluation.category === 'hot' && evaluation.modifiers.snow
      ? 'inconsistent-weather-data'
      : null;

  if (unavailableReason) {
    return deepFreeze({
      available: false,
      reason: unavailableReason,
      location: model.location,
      selectedDate,
      summary: createSummary(model, day, evaluation, unit, isToday),
      category: evaluation.category,
      condition,
      weatherIcon: condition.key === 'unknown' ? null : `weather/${condition.key}.svg`,
      modifiers: evaluation.modifiers,
      outfit: null,
      recommendation: null,
      reminders,
      forecastChange,
    });
  }

  const primaryModifier = selectPrimaryModifier(evaluation.modifiers);
  const outfitVariations = OUTFIT_VARIATIONS[evaluation.category];
  const outfitIndex = primaryModifier ? null : selectVariationIndex({
    ...variationContext,
    salt: `outfit:${evaluation.category}`,
    count: outfitVariations.length,
  });
  const outfitDescription = primaryModifier
    ? PRIMARY_OUTFIT_DESCRIPTIONS[assetModifier(primaryModifier)][evaluation.category]
    : outfitVariations[outfitIndex];
  const outfitAsset = primaryModifier
    ? `character/weather/${assetModifier(primaryModifier)}-${evaluation.category}.png`
    : `character/outfits/${evaluation.category}-${outfitIndex + 1}.png`;

  return deepFreeze({
    available: true,
    reason: null,
    location: model.location,
    selectedDate,
    summary: createSummary(model, day, evaluation, unit, isToday),
    category: evaluation.category,
    averageApparentTemperatureF: evaluation.averageApparentTemperatureF,
    condition,
    weatherIcon: condition.key === 'unknown' ? null : `weather/${condition.key}.svg`,
    modifiers: evaluation.modifiers,
    outfit: {
      primaryModifier,
      variationIndex: outfitIndex,
      description: outfitDescription,
      asset: outfitAsset,
    },
    mascotAlt: describeMascot(outfitDescription, primaryModifier),
    recommendation: buildRecommendationText(outfitDescription, evaluation.modifiers, primaryModifier),
    reminders,
    noExtrasNeeded: reminders.every(({ active }) => !active),
    forecastChange,
  });
}
