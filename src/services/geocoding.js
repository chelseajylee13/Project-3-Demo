import { requestJson, ServiceRequestError } from './requestJson.js';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

function validCoordinates(result) {
  return Number.isFinite(result.latitude) && Math.abs(result.latitude) <= 90
    && Number.isFinite(result.longitude) && Math.abs(result.longitude) <= 180;
}

export async function searchUsLocations(query, { fetchImpl, signal } = {}) {
  const name = String(query ?? '').trim();
  if (name.length < 2) return [];

  const url = new URL(GEOCODING_URL);
  url.searchParams.set('name', name);
  url.searchParams.set('count', '8');
  url.searchParams.set('language', 'en');
  url.searchParams.set('countryCode', 'US');

  const payload = await requestJson(url, { fetchImpl, signal });
  if (payload.results === undefined) return [];
  if (!Array.isArray(payload.results)) {
    throw new ServiceRequestError('Location search returned invalid results.', 'invalid-response');
  }

  return payload.results
    .filter((result) => result?.country_code === 'US'
      && typeof result.name === 'string' && result.name.trim() && validCoordinates(result))
    .map((result) => Object.freeze({
      label: [result.name.trim(), typeof result.admin1 === 'string' ? result.admin1.trim() : '']
        .filter(Boolean).join(', '),
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: typeof result.timezone === 'string' ? result.timezone : null,
    }));
}
