import { jwtDecode } from 'jwt-decode';

export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const { exp } = jwtDecode(token);
    if (!exp) return true;

    const now = Date.now() / 1000;
    return exp < now;
  } catch {
    return true; // token is corrupt or unreadable
  }
}
