import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage } from "../utils/httpError";

interface LoginResponse {
  accessToken: string;
  username: string;
  role: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (isAuthenticated) {
    return <Navigate replace to="/members" />;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await client.post<LoginResponse>("/auth/login", {
        username,
        password,
      });
      login(response.data);
      navigate("/members", { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

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
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </div>
  );
}
