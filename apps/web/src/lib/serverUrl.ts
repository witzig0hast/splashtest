import { Capacitor } from '@capacitor/core';

const STORAGE_KEY = 'splash_server_url';

// In the packaged Android/iOS app the page is loaded from a bundled origin
// (no matching backend on that origin), so there is no same-origin server
// to talk to. Fall back to a build-time constant there; everywhere else
// (the plain website) same-origin just works out of the box.
const NATIVE_DEFAULT = import.meta.env.VITE_DEFAULT_SERVER_URL || 'https://splash.example.com';

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function getServerUrl(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  return isNative() ? NATIVE_DEFAULT : window.location.origin;
}

export function setServerUrl(url: string) {
  const trimmed = url.trim().replace(/\/$/, '');
  if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed);
  else localStorage.removeItem(STORAGE_KEY);
}

export function isCustomServerRelevant(): boolean {
  return isNative();
}
