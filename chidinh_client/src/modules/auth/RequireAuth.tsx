import { Navigate, Outlet } from "react-router-dom";

import { APP_ROUTES } from "../../app/router/routes";
import { ShellStatus } from "../../shared/ui/ShellStatus";
import { useSession } from "./useSession";

export function RequireAuth() {
  const { isLoading, data, isError } = useSession();

  if (isLoading) {
    return (
      <ShellStatus
        title="Checking session..."
        description="Verifying access before loading the private workspace."
      />
    );
  }

  if (isError || !data?.user) {
    return <Navigate to={APP_ROUTES.login} replace />;
  }

  return <Outlet />;
}
