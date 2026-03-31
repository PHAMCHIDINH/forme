import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { Panel } from "../../shared/ui/Panel";
import { useLogout, useSession } from "../auth/useSession";

export function DashboardLayout() {
  const navigate = useNavigate();
  const sessionQuery = useSession();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-base px-4 py-4 lg:px-6 lg:py-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <Panel className="flex flex-col gap-8 p-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-accent">Private Hub</p>
            <h1 className="font-display text-3xl text-text">Workspace</h1>
          </div>

          <nav aria-label="Dashboard Navigation" className="space-y-2">
            <NavLink className="block rounded-full px-4 py-3 hover:bg-surfaceAlt" to="/app">
              Home
            </NavLink>
            <NavLink className="block rounded-full px-4 py-3 hover:bg-surfaceAlt" to="/app/todo">
              Todo
            </NavLink>
            <NavLink className="block rounded-full px-4 py-3 hover:bg-surfaceAlt" to="/">
              Public Hub
            </NavLink>
          </nav>

          <div className="mt-auto space-y-3 border-t border-border pt-6">
            <p className="text-sm text-muted">{sessionQuery.data?.user.displayName ?? "Owner"}</p>
            <button
              className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium text-text transition hover:bg-surfaceAlt disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Closing..." : "Logout"}
            </button>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="flex items-center justify-between gap-4 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-accent">Context</p>
              <p className="mt-2 text-lg text-text">Private Workspace</p>
              <p className="mt-1 text-sm text-muted">
                A calm operating surface for active tools and future modules.
              </p>
            </div>
          </Panel>

          <Panel className="p-6 lg:p-8">
            <Outlet />
          </Panel>
        </div>
      </div>
    </div>
  );
}
