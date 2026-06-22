import { User } from "./types";

const ACCESS_TOKEN_KEY = "rr_access_token";
const REFRESH_TOKEN_KEY = "rr_refresh_token";
const USER_KEY = "rr_user";
const AUTH_CHANGE_EVENT = "rr-auth-change";

let cachedUserJson: string | null | undefined;
let cachedUser: User | null = null;

function updateUserCache(raw: string | null) {
  cachedUserJson = raw;

  if (!raw) {
    cachedUser = null;
    return;
  }

  try {
    cachedUser = JSON.parse(raw) as User;
  } catch {
    cachedUser = null;
  }
}

export function subscribeAuth(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAuthSnapshot(): User | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);

  if (raw === cachedUserJson) {
    return cachedUser;
  }

  updateUserCache(raw);
  return cachedUser;
}

export function getStoredUser(): User | null {
  return getAuthSnapshot();
}

export function saveAuth(user: User, accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  const raw = JSON.stringify(user);
  localStorage.setItem(USER_KEY, raw);
  updateUserCache(raw);
  notifyAuthChange();
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  updateUserCache(null);
  notifyAuthChange();
}
