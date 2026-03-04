import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../auth/AuthContext";
import ForbiddenPage from "../pages/ForbiddenPage";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: React.ReactElement;
}

export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by returning null on server
  if (!mounted) {
    return null;
  }

  if (!isAuthenticated) {
    // In Next.js, we should use router.push, but returning null while redirecting is common
    // useEffect is better for navigation, but for simple protection this works if we want to block rendering
    router.replace('/login');
    return null;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <ForbiddenPage />;
  }

  return children;
}
