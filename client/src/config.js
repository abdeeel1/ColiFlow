// Central place for the backend base URL.
// In production, set VITE_API_URL in your host's env vars
// (e.g. https://your-backend.up.railway.app). Falls back to local dev.
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

// Full URL to a file stored on the backend's public disk.
export const storageUrl = (path) => `${API_URL}/storage/${path}`

// Where the browser is sent to start the Google OAuth flow.
export const googleAuthUrl = `${API_URL}/auth/google`
