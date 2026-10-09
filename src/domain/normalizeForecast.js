function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function valueAt(values, index) {
  return Array.isArray(values) ? finiteOrNull(values[index]) : null;
}

function parseLocalTimestamp(time) {
  if (typeof time !== 'string') return null;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):\d{2}/.exec(time);
  if (!match) return null;
  return Object.freeze({ date: match[1], hour: Number(match[2]) });
}

function freezeHour(hour) {
  return Object.freeze(hour);
}

function freezeDay(day) {
  return Object.freeze({ ...day, hours: Object.freeze(day.hours) });
}

export function normalizeForecast(payload, location) {
  if (!payload || typeof payload !== 'object') {
    throw new TypeError('A forecast payload is required.');
  }
  if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    throw new TypeError('A selected location with numeric coordinates is required.');
  }

  const hourlyTimes = Array.isArray(payload.hourly?.time) ? payload.hourly.time : [];
  const hoursByDate = new Map();

  hourlyTimes.forEach((time, index) => {
    const local = parseLocalTimestamp(time);
    if (!local) return;

    const hour = freezeHour({
      time,
      date: local.date,
      localHour: local.hour,
      apparentTemperatureF: valueAt(payload.hourly?.apparent_temperature, index),
      precipitationProbability: valueAt(payload.hourly?.precipitation_probability, index),
      snowfallInches: valueAt(payload.hourly?.snowfall, index),
      weatherCode: valueAt(payload.hourly?.weather_code, index),
      windSpeedMph: valueAt(payload.hourly?.wind_speed_10m, index),
    });

    const dateHours = hoursByDate.get(local.date) ?? [];
    dateHours.push(hour);
    hoursByDate.set(local.date, dateHours);
  });

  const dailyTimes = Array.isArray(payload.daily?.time) ? payload.daily.time.slice(0, 7) : [];
  const days = dailyTimes.map((date, index) => freezeDay({
    date,
    highTemperatureF: valueAt(payload.daily?.temperature_2m_max, index),
    lowTemperatureF: valueAt(payload.daily?.temperature_2m_min, index),
    weatherCode: valueAt(payload.daily?.weather_code, index),
    uvIndexMax: valueAt(payload.daily?.uv_index_max, index),
    hours: (hoursByDate.get(date) ?? []).sort((a, b) => a.time.localeCompare(b.time)),
  }));

  const currentTime = typeof payload.current?.time === 'string' ? payload.current.time : null;
  const current = Object.freeze({
    time: currentTime,
    temperatureF: finiteOrNull(payload.current?.temperature_2m),
    apparentTemperatureF: finiteOrNull(payload.current?.apparent_temperature),
    weatherCode: finiteOrNull(payload.current?.weather_code),
  });

  return Object.freeze({
    location: Object.freeze({
      label: location.label,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: payload.timezone ?? null,
      timezoneAbbreviation: payload.timezone_abbreviation ?? null,
    }),
    current,
    updatedAt: currentTime,
    days: Object.freeze(days),
  });
}
