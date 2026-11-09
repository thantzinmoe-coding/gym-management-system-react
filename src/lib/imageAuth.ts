/**
 * Request options for downloading a picture.
 * Pictures kept on our own backend need the login token; pictures on another host (Cloudinary)
 * are public, and sending our token there would leak it and fail the browser's CORS check.
 */
const API_BASE = String(import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export function imageFetchInit(url: string, token?: string): RequestInit {
  const ownBackend = !!API_BASE && url.startsWith(API_BASE);
  return ownBackend && token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}
