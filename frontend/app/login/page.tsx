'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import client from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthContext';
import { getErrorMessage } from '../../src/utils/httpError';

interface LoginResponse {
  accessToken: string;
  username: string;
  role: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/members');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await client.post<LoginResponse>('/auth/login', {
        username,
        password,
      });
      login(response.data);
      // AuthProvider calculates isAuthenticated derived from state.
      // We'll rely on the useEffect to redirect when isAuthenticated becomes true.
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Login failed'));
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="login-shell">
      <section className="login-card">
        <h2>Sign In</h2>
        <p className="muted">Use your member account to continue.</p>
        <form className="form-grid" onSubmit={onSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              required
              value={username}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {errorMessage && <p className="state-error">{errorMessage}</p>}
          <button className="btn primary" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </div>
  );
}
