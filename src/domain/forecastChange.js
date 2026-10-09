import { isSnowCode } from './weatherCodes.js';

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

export function evaluateForecastChange({ day, isToday, current }) {
  const windowHours = day.hours.filter(({ localHour }) => localHour >= 8 && localHour <= 20);
  if (windowHours.length === 0) {
    return Object.freeze({ type: 'steady', time: null, text: 'Conditions should stay fairly steady.' });
  }

  let baselineHour = windowHours[0];
  let baselineTemperatureF = baselineHour.apparentTemperatureF;
  let candidates = windowHours.slice(1);

  if (isToday && current?.time) {
    const currentHour = Number(current.time.slice(11, 13));
    baselineHour = day.hours.find(({ localHour }) => localHour === currentHour) ?? baselineHour;
    candidates = windowHours.filter(({ localHour }) => localHour > currentHour);

    if (candidates.length === 0) {
      return Object.freeze({ type: 'steady', time: null, text: 'Conditions should stay fairly steady.' });
    }

    if (Number.isFinite(current.apparentTemperatureF)) {
      baselineTemperatureF = current.apparentTemperatureF;
    }
  }
  const precipitationEvents = [];
  let previousRainProbability = baselineHour.precipitationProbability;
  let previousSnowing = isSnowing(baselineHour);

  for (const hour of candidates) {
    const probability = hour.precipitationProbability;
    if (
      Number.isFinite(previousRainProbability)
      && previousRainProbability < 30
      && Number.isFinite(probability)
      && probability >= 30
    ) {
      precipitationEvents.push(createEvent('rain', hour));
    }

    const snowing = isSnowing(hour);
    if (!previousSnowing && snowing) {
      precipitationEvents.push(createEvent('snow', hour));
    }

    if (Number.isFinite(probability)) previousRainProbability = probability;
    previousSnowing = snowing;
  }

  if (precipitationEvents.length) {
    precipitationEvents.sort((a, b) => a.localHour - b.localHour || (a.type === 'snow' ? -1 : 1));
    const event = precipitationEvents[0];
    const noun = event.type === 'snow' ? 'Snow' : 'Rain';
    return Object.freeze({
      ...event,
      text: `${noun} may begin around ${formatHour(event.localHour)}.`,
    });
  }

  if (Number.isFinite(baselineTemperatureF)) {
    const temperatureEvent = candidates.find((hour) => (
      Number.isFinite(hour.apparentTemperatureF)
      && Math.abs(hour.apparentTemperatureF - baselineTemperatureF) >= 10
    ));

    if (temperatureEvent) {
      const differenceF = temperatureEvent.apparentTemperatureF - baselineTemperatureF;
      const direction = differenceF > 0 ? 'warmer' : 'cooler';
      return Object.freeze({
        ...createEvent('temperature', temperatureEvent, { direction, differenceF }),
        text: `It may feel about ${Math.round(Math.abs(differenceF))}°F ${direction} around ${formatHour(temperatureEvent.localHour)}.`,
      });
    }
  }

  return Object.freeze({ type: 'steady', time: null, text: 'Conditions should stay fairly steady.' });
}
