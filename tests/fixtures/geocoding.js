export const GEOCODING_SUCCESS_FIXTURE = Object.freeze({
  results: Object.freeze([
    Object.freeze({
      id: 4671654,
      name: 'Austin',
      latitude: 30.2672,
      longitude: -97.7431,
      country_code: 'US',
      admin1: 'Texas',
      timezone: 'America/Chicago',
    }),
  ]),
});

export const GEOCODING_NO_RESULTS_FIXTURE = Object.freeze({ results: Object.freeze([]) });

export const GEOCODING_MALFORMED_FIXTURE = Object.freeze({ results: null });
