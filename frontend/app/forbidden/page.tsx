import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="login-shell">
      <section className="page-card" style={{ textAlign: 'center' }}>
        <h2>403 - Forbidden</h2>
        <p>You do not have permission to access this page.</p>
        <Link className="btn secondary" href="/members">
          Go to Members
        </Link>
      </section>
    </div>
  );
}
