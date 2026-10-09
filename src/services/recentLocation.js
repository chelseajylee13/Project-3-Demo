export const RECENT_LOCATION_KEY = 'pupcast.recentLocation.v1';

function validLocation(location) {
  return typeof location?.label === 'string' && location.label.trim().length > 0
    && Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90
    && Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180;
}

function locationRecord(location) {
  return Object.freeze({
    label: location.label.trim(),
    latitude: location.latitude,
    longitude: location.longitude,
  });
}

export function loadRecentLocation(storage = undefined) {
  try {
    const source = storage === undefined ? globalThis.localStorage : storage;
    const raw = source?.getItem(RECENT_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return validLocation(parsed) ? locationRecord(parsed) : null;
  } catch {
    return null;
  }
}

export function saveRecentLocation(location, storage = undefined) {
  if (!validLocation(location)) {
    throw new TypeError('A valid location is required.');
  }

  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    if (!target) return false;
    target.setItem(RECENT_LOCATION_KEY, JSON.stringify(locationRecord(location)));
    return true;
  } catch {
    return false;
  }
}
