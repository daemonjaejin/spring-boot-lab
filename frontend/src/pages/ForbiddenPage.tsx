import React from "react";
import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <section className="page-card">
      <h2>403 - Forbidden</h2>
      <p>You do not have permission to access this page.</p>
      <Link className="btn secondary" to="/members">
        Go to Members
      </Link>
    </section>
  );
}
