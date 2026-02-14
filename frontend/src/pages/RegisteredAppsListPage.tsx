import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage } from "../utils/httpError";

interface RegisteredApp {
  id: number;
  name: string;
  description: string;
  version: string;
}

type ViewState = "loading" | "success" | "empty" | "error";

export default function RegisteredAppsListPage() {
  const { role } = useAuth();
  const [apps, setApps] = useState<RegisteredApp[]>([]);
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const isAdmin = role === "ADMIN";

  const loadApps = async () => {
    setViewState("loading");
    setErrorMessage("");
    try {
      const response = await client.get<RegisteredApp[]>("/apps");
      setApps(response.data);
      setViewState(response.data.length === 0 ? "empty" : "success");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to load apps"));
      setViewState("error");
    }
  };

  useEffect(() => {
    void loadApps();
  }, []);

  const handleDelete = async (appId: number) => {
    if (!isAdmin) {
      return;
    }

    try {
      await client.delete(`/apps/${appId}`);
      const nextApps = apps.filter((app) => app.id !== appId);
      setApps(nextApps);
      setViewState(nextApps.length === 0 ? "empty" : "success");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to delete app"));
      setViewState("error");
    }
  };

  const renderStatePanel = () => {
    if (viewState === "loading") {
      return <p className="state-loading">Loading...</p>;
    }
    if (viewState === "empty") {
      return <p className="state-empty">No data</p>;
    }
    if (viewState === "error") {
      return (
        <div className="state-error-box">
          <p className="state-error">{errorMessage}</p>
          <button className="btn secondary" onClick={loadApps} type="button">
            Retry
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <h2>Registered Apps</h2>
        {isAdmin && (
          <Link className="btn primary" to="/apps/new">
            Create App
          </Link>
        )}
      </div>

      {viewState !== "success" ? (
        renderStatePanel()
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Version</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.name || "-"}</td>
                  <td>{app.description || "-"}</td>
                  <td>{app.version || "-"}</td>
                  <td>
                    <div className="action-group">
                      <Link className="btn secondary small" to={`/apps/${app.id}`}>
                        Detail
                      </Link>
                      {isAdmin && (
                        <>
                          <Link
                            className="btn secondary small"
                            to={`/apps/${app.id}?mode=edit`}
                          >
                            Edit
                          </Link>
                          <button
                            className="btn danger small"
                            onClick={() => void handleDelete(app.id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
