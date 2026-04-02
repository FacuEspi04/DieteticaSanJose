import { globalSetBlocked, globalSetSuspended, globalSetWarning } from '../context/LicenseContext';

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(input, init);
    
    // Check for warning header
    if (response.headers.get('X-License-Warning') === 'true') {
      if (globalSetWarning) {
        globalSetWarning(true);
      }
    }

    // Check for 403 Offline Expired
    if (response.status === 403) {
      const clone = response.clone();
      try {
        const errorData = await clone.json();
        if (errorData?.error === 'LICENSE_OFFLINE_EXPIRED') {
          if (globalSetSuspended) {
            globalSetSuspended(false);
          }
          if (globalSetBlocked) {
            globalSetBlocked(true);
          }
        } else if (errorData?.error === 'LICENSE_SUSPENDED') {
          if (globalSetBlocked) {
            globalSetBlocked(false);
          }
          if (globalSetSuspended) {
            globalSetSuspended(true);
          }
        }
      } catch (e) {
        // Not a JSON response or couldn't parse
      }
    }

    return response;
  } catch (error) {
    // Re-throw any network errors
    throw error;
  }
}
