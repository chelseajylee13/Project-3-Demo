function normalizeCoordinate(value) {
  return Number(value).toFixed(4);
}

export function hashString(value) {
  let hash = 0x811c9dc5;

  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

export function selectVariationIndex({ latitude, longitude, date, salt, count }) {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('Variation count must be a positive integer.');
  }

  const key = [
    salt,
    normalizeCoordinate(latitude),
    normalizeCoordinate(longitude),
    date,
  ].join('|');

  return hashString(key) % count;
}
