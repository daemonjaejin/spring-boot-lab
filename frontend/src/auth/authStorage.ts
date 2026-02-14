export interface AuthSession {
  accessToken: string;
  username: string;
  role: string;
}

const ACCESS_TOKEN_KEY = "accessToken";
const USERNAME_KEY = "username";
const ROLE_KEY = "role";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function getRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function setAuthSession(session: AuthSession): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(USERNAME_KEY, session.username);
  localStorage.setItem(ROLE_KEY, session.role);
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
}
