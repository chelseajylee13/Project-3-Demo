import { requestJson, ServiceRequestError } from './requestJson.js';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_FIELDS = 'temperature_2m,apparent_temperature,weather_code';
const HOURLY_FIELDS = 'apparent_temperature,precipitation_probability,snowfall,weather_code,wind_speed_10m';
const DAILY_FIELDS = 'temperature_2m_max,temperature_2m_min,weather_code,uv_index_max';

function validCoordinates(location) {
  return Number.isFinite(location?.latitude) && Math.abs(location.latitude) <= 90
    && Number.isFinite(location?.longitude) && Math.abs(location.longitude) <= 180;
}

function hasSevenConsecutiveDates(dates) {
  if (!Array.isArray(dates) || dates.length !== 7) return false;
  return dates.every((date, index) => {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const timestamp = Date.parse(`${date}T00:00:00Z`);
    if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) return false;
    if (index === 0) return true;
    return timestamp - Date.parse(`${dates[index - 1]}T00:00:00Z`) === 86400000;
  });
}

export function createForecastUrl(location) {
  if (!validCoordinates(location)) {
    throw new TypeError('Forecast location requires valid numeric coordinates.');
  }

  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('current', CURRENT_FIELDS);
  url.searchParams.set('hourly', HOURLY_FIELDS);
  url.searchParams.set('daily', DAILY_FIELDS);
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('wind_speed_unit', 'mph');
  url.searchParams.set('precipitation_unit', 'inch');
  url.searchParams.set('timezone', typeof location.timezone === 'string' && location.timezone
    ? location.timezone : 'auto');
  url.searchParams.set('forecast_days', '7');
  return url;
}

export async function fetchForecast(location, { fetchImpl, signal } = {}) {
  const payload = await requestJson(createForecastUrl(location), { fetchImpl, signal });
  if (!hasSevenConsecutiveDates(payload.daily?.time) || !Array.isArray(payload.hourly?.time)
    || typeof payload.current?.time !== 'string' || typeof payload.timezone !== 'string') {
    throw new ServiceRequestError('Forecast data is incomplete.', 'invalid-response');
  }
  return payload;
}
