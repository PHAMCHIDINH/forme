import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { DockNav } from "../../shared/ui/DockNav";
import { SystemBar } from "../../shared/ui/SystemBar";
import { WindowFrame } from "../../shared/ui/WindowFrame";
import { useLogout, useSession } from "../auth/useSession";

const launcherItems = [
  { label: "Home", to: "/app", end: true },
  { label: "Todo", to: "/app/todo" },
  { label: "Public Hub", to: "/" },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const sessionQuery = useSession();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-4 lg:px-6 lg:py-6">
      <SystemBar
        productLabel="Personal Digital Hub"
        contextLabel="Private Workspace"
        indicators={["Authenticated", "Todo Live"]}
      />

      <WindowFrame
        title="Private Workspace"
        subtitle="A calmer operating surface for active tools"
        toolbar={
          <button
            className="desktop-logout inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Closing..." : "Logout"}
          </button>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text">
                {sessionQuery.data?.user.displayName ?? "Owner"}
              </p>
              <p className="text-sm text-muted">
                Workspace launcher and routed applications.
              </p>
            </div>

            <NavLink className="text-sm text-muted underline-offset-4 hover:underline" to="/">
              Return to Public Hub
            </NavLink>
          </div>

          <DockNav ariaLabel="Workspace launcher" items={launcherItems} />
          <Outlet />
        </div>
      </WindowFrame>
    </div>
  );
}
