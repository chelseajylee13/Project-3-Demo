import { isRainCode, isSnowCode } from './weatherCodes.js';

function isSnowing(hour) {
  return (Number.isFinite(hour.snowfallInches) && hour.snowfallInches > 0)
    || isSnowCode(hour.weatherCode);
}

function formatHour(localHour) {
  if (localHour === 0) return '12 AM';
  if (localHour === 12) return '12 PM';
  return localHour > 12 ? `${localHour - 12} PM` : `${localHour} AM`;
}

function createEvent(type, hour, extra = {}) {
  return Object.freeze({ type, time: hour.time, localHour: hour.localHour, ...extra });
}

function withItems(event, items) {
  return Object.freeze({
    ...event,
    items: Object.freeze(items),
    text: items.map(({ text }) => text).join(' '),
  });
}

function isRainLikely(hour) {
  return isRainCode(hour.weatherCode)
    || (Number.isFinite(hour.precipitationProbability) && hour.precipitationProbability >= 30);
}

function temperatureChange(candidates, baselineTemperatureF) {
  if (!Number.isFinite(baselineTemperatureF)) return null;
  const hour = candidates.find((candidate) => Number.isFinite(candidate.apparentTemperatureF)
    && Math.abs(candidate.apparentTemperatureF - baselineTemperatureF) >= 10);
  if (!hour) return null;
  const differenceF = hour.apparentTemperatureF - baselineTemperatureF;
  const direction = differenceF > 0 ? 'warmer' : 'cooler';
  const text = `It may feel about ${Math.round(Math.abs(differenceF))}°F ${direction} around ${formatHour(hour.localHour)}.`;
  return withItems(createEvent('temperature', hour, { direction, differenceF }), [
    { kind: 'temperature', differenceF, text },
  ]);
}

export function evaluateForecastChange({ day, isToday, current }) {
  const windowHours = day.hours.filter(({ localHour }) => localHour >= 8 && localHour <= 20);
  if (windowHours.length === 0) {
    return withItems({ type: 'steady', time: null }, [
      { kind: 'steady', text: 'Conditions should stay fairly steady.' },
    ]);
  }

  let baselineHour = windowHours[0];
  let baselineTemperatureF = baselineHour.apparentTemperatureF;
  let candidates = windowHours.slice(1);

  if (isToday && current?.time) {
    const currentHour = Number(current.time.slice(11, 13));
    baselineHour = day.hours.find(({ localHour }) => localHour === currentHour) ?? baselineHour;
    candidates = windowHours.filter(({ localHour }) => localHour > currentHour);
    if (Number.isFinite(current.apparentTemperatureF)) {
      baselineTemperatureF = current.apparentTemperatureF;
    }
  }

  let previousRain = isRainLikely(baselineHour);
  let previousSnow = isSnowing(baselineHour);
  let rainStart = null;
  let rainStop = null;
  let snowStart = null;

  for (const hour of candidates) {
    const raining = isRainLikely(hour);
    if (!previousRain && raining && !rainStart) rainStart = hour;
    if (previousRain && !raining && !rainStop) rainStop = hour;
    previousRain = raining;

    const snowing = isSnowing(hour);
    if (!previousSnow && snowing && !snowStart) snowStart = hour;
    previousSnow = snowing;
  }

  const weatherEvents = [];
  if (rainStart || rainStop) {
    const first = rainStart && rainStop
      ? (rainStart.localHour < rainStop.localHour ? rainStart : rainStop)
      : rainStart ?? rainStop;
    const parts = [
      rainStart && { hour: rainStart.localHour, text: `Rain may begin around ${formatHour(rainStart.localHour)}.` },
      rainStop && { hour: rainStop.localHour, text: `Rain may stop around ${formatHour(rainStop.localHour)}.` },
    ].filter(Boolean).sort((a, b) => a.hour - b.hour);
    weatherEvents.push(withItems({
      ...createEvent('rain', first),
      startTime: rainStart?.time ?? null,
      stopTime: rainStop?.time ?? null,
    }, parts.map(({ text }) => ({ kind: 'rain', text }))));
  } else if (isRainCode(day.weatherCode)
    || windowHours.some(isRainLikely)) {
    weatherEvents.push(withItems({
      type: 'rain-timing-unavailable',
      time: null,
      localHour: Number.POSITIVE_INFINITY,
    }, [{ kind: 'rain', text: 'Rain is forecast, but hourly start and stop times are unavailable.' }]));
  }
  if (snowStart) {
    weatherEvents.push(withItems({
      ...createEvent('snow', snowStart),
    }, [{ kind: 'snow', text: `Snow may begin around ${formatHour(snowStart.localHour)}.` }]));
  }

  weatherEvents.sort((a, b) => a.localHour - b.localHour || (a.type === 'snow' ? -1 : 1));
  const weather = weatherEvents[0] ?? null;
  const temperature = temperatureChange(candidates, baselineTemperatureF);
  if (weather) {
    return withItems(weather, [...weather.items, ...(temperature?.items ?? [])]);
  }
  if (temperature) return temperature;
  return withItems({ type: 'steady', time: null }, [
    { kind: 'steady', text: 'Conditions should stay fairly steady.' },
  ]);
}
