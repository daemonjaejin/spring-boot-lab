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

// Native cookie helpers
function getCookie(name: string): string | null {
  if (isServer()) return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function setCookie(name: string, value: string, days: number) {
  if (isServer()) return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function removeCookie(name: string) {
  if (isServer()) return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
}

export function getAccessToken(): string | null {
  if (isServer()) return null;
  return getCookie(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
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
  
  // Middleware에서 접근 가능하도록 쿠키 저장
  setCookie(ACCESS_TOKEN_KEY, session.accessToken, 7);
}

export function clearAuthSession(): void {
  if (isServer()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
  removeCookie(ACCESS_TOKEN_KEY);
}
