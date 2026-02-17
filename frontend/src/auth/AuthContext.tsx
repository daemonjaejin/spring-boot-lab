"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  AuthSession,
  clearAuthSession,
  getAccessToken,
  getRole,
  getUsername,
  setAuthSession,
} from "./authStorage";

interface AuthState {
  accessToken: string | null;
  username: string | null;
  role: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function buildState(): AuthState {
  return {
    accessToken: getAccessToken(),
    username: getUsername(),
    role: getRole(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => buildState());

  const login = (session: AuthSession) => {
    setAuthSession(session);
    setAuthState({
      accessToken: session.accessToken,
      username: session.username,
      role: session.role,
    });
  };

  const logout = () => {
    clearAuthSession();
    setAuthState({
      accessToken: null,
      username: null,
      role: null,
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      isAuthenticated: Boolean(authState.accessToken),
      login,
      logout,
    }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
