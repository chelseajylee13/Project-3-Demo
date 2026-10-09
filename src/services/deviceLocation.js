export class DeviceLocationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'DeviceLocationError';
    this.code = code;
  }
}

export function getDeviceLocation({ geolocation = globalThis.navigator?.geolocation, timeoutMs = 10000 } = {}) {
  if (!geolocation || typeof geolocation.getCurrentPosition !== 'function') {
    return Promise.reject(new DeviceLocationError('Device location is unavailable.', 'unavailable'));
  }

  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!Number.isFinite(coords?.latitude) || Math.abs(coords.latitude) > 90
          || !Number.isFinite(coords?.longitude) || Math.abs(coords.longitude) > 180) {
          reject(new DeviceLocationError('Device location returned invalid coordinates.', 'invalid-response'));
          return;
        }
        resolve(Object.freeze({
          label: 'Current location',
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
      },
      (error) => {
        const code = error?.code === 1 ? 'denied' : error?.code === 3 ? 'timeout' : 'unavailable';
        reject(new DeviceLocationError('Could not get device location.', code));
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 0 },
    );
  });
}
