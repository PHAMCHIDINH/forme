import { Navigate, Outlet } from "react-router-dom";

import { useSession } from "./useSession";

export function RequireAuth() {
  const { isLoading, data, isError } = useSession();

  if (isLoading) {
    return <p>Checking session...</p>;
  }

  if (isError || !data?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
