export class ServiceRequestError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ServiceRequestError';
    this.code = code;
  }
}

export async function requestJson(url, { fetchImpl = globalThis.fetch, signal } = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new ServiceRequestError('Network requests are unavailable.', 'unavailable');
  }

  let response;
  try {
    response = await fetchImpl(url, { signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ServiceRequestError('The network request failed.', 'network-error');
  }
  if (!response?.ok) {
    throw new ServiceRequestError('The weather service could not complete the request.', 'http-error');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ServiceRequestError('The service returned unreadable data.', 'invalid-response');
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || payload.error === true) {
    throw new ServiceRequestError('The service returned invalid data.', 'invalid-response');
  }

  return payload;
}
