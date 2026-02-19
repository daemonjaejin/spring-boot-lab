export interface AuthSession {
  accessToken: string;
  username: string;
  role: string;
}

const ACCESS_TOKEN_KEY = "accessToken";
const USERNAME_KEY = "username";
const ROLE_KEY = "role";

function isServer() {
  return typeof window === 'undefined';
}

export function getAccessToken(): string | null {
  if (isServer()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getUsername(): string | null {
  if (isServer()) return null;
  return localStorage.getItem(USERNAME_KEY);
}

export function getRole(): string | null {
  if (isServer()) return null;
  return localStorage.getItem(ROLE_KEY);
}

export function setAuthSession(session: AuthSession): void {
  if (isServer()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(USERNAME_KEY, session.username);
  localStorage.setItem(ROLE_KEY, session.role);
}

export function clearAuthSession(): void {
  if (isServer()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
}
