const DAY_COUNT = 7;

function isoDateFrom(startDate, offset) {
  const date = new Date(`${startDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function profileValue(profile, key, hour, fallback) {
  const configured = profile[key];
  if (typeof configured === 'function') return configured(hour);
  return configured ?? fallback;
}

export function createOpenMeteoFixture({
  startDate = '2026-10-05',
  timezone = 'America/Chicago',
  profiles = [],
  current = {},
} = {}) {
  const dates = Array.from({ length: DAY_COUNT }, (_, index) => isoDateFrom(startDate, index));
  const hourly = {
    time: [],
    apparent_temperature: [],
    precipitation_probability: [],
    snowfall: [],
    weather_code: [],
    wind_speed_10m: [],
  };
  const daily = {
    time: dates,
    temperature_2m_max: [],
    temperature_2m_min: [],
    weather_code: [],
    uv_index_max: [],
  };

  dates.forEach((date, dayIndex) => {
    const profile = profiles[dayIndex] ?? {};
    const baseApparent = profile.apparent ?? 60;

    for (let hour = 0; hour < 24; hour += 1) {
      if (profile.omitHours?.includes(hour)) continue;
      hourly.time.push(`${date}T${String(hour).padStart(2, '0')}:00`);
      hourly.apparent_temperature.push(profileValue(profile, 'apparent', hour, baseApparent));
      hourly.precipitation_probability.push(profileValue(profile, 'precipitation', hour, 10));
      hourly.snowfall.push(profileValue(profile, 'snowfall', hour, 0));
      hourly.weather_code.push(profileValue(profile, 'hourlyWeatherCode', hour, profile.weatherCode ?? 0));
      hourly.wind_speed_10m.push(profileValue(profile, 'wind', hour, 6));
    }

    const apparentForHighLow = typeof baseApparent === 'number' ? baseApparent : 60;
    daily.temperature_2m_max.push(profile.high ?? apparentForHighLow + 8);
    daily.temperature_2m_min.push(profile.low ?? apparentForHighLow - 8);
    daily.weather_code.push(profile.weatherCode ?? 0);
    daily.uv_index_max.push(profile.uv ?? 2);
  });

  return {
    latitude: 30.2672,
    longitude: -97.7431,
    timezone,
    timezone_abbreviation: 'CDT',
    utc_offset_seconds: -18000,
    current: {
      time: current.time ?? `${dates[0]}T09:15`,
      temperature_2m: current.temperature ?? (typeof profiles[0]?.apparent === 'number' ? profiles[0].apparent + 2 : 62),
      apparent_temperature: current.apparent ?? (typeof profiles[0]?.apparent === 'number' ? profiles[0].apparent : 60),
      weather_code: current.weatherCode ?? 0,
    },
    hourly,
    daily,
  };
}

export const LOCATION_FIXTURE = Object.freeze({
  label: 'Austin, Texas',
  latitude: 30.2672,
  longitude: -97.7431,
});

export const CATEGORY_FIXTURES = Object.freeze({
  hot: createOpenMeteoFixture({ profiles: [{ apparent: 85 }] }),
  warm: createOpenMeteoFixture({ profiles: [{ apparent: 70 }] }),
  mild: createOpenMeteoFixture({ profiles: [{ apparent: 55 }] }),
  cool: createOpenMeteoFixture({ profiles: [{ apparent: 40 }] }),
  cold: createOpenMeteoFixture({ profiles: [{ apparent: 20 }] }),
  'very-cold': createOpenMeteoFixture({ profiles: [{ apparent: 19 }] }),
});

export const COMBINED_MODIFIER_FIXTURE = createOpenMeteoFixture({
  profiles: [{
    apparent: (hour) => (hour === 15 ? 82 : 72),
    precipitation: (hour) => (hour >= 12 ? 45 : 10),
    snowfall: (hour) => (hour === 14 ? 0.2 : 0),
    wind: 16,
    uv: 4,
  }],
});

export const MISSING_VALUES_FIXTURE = createOpenMeteoFixture({
  profiles: [{ apparent: () => null, precipitation: () => null, wind: () => null }],
});
