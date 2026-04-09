import { Outlet, useNavigate } from "react-router-dom";

import { Button } from "../../shared/ui/Button";
import { Panel } from "../../shared/ui/Panel";
import { SidebarNav } from "../../shared/ui/SidebarNav";
import { useLogout, useSession } from "../auth/useSession";
import { SHELL_NAV_ITEMS } from "./shellNav";

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
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[280px_1fr]">
        <SidebarNav
          ariaLabel="Dashboard Navigation"
          items={SHELL_NAV_ITEMS}
          operatorName={sessionQuery.data?.user.displayName ?? "Owner"}
          onLogout={handleLogout}
          isLoggingOut={logoutMutation.isPending}
        />

        <div className="space-y-4">
          <Panel className="flex flex-wrap items-center justify-between gap-3 p-5 shadow-[var(--shadow-crisp-md)] lg:p-6" variant="featured">
            <div className="space-y-2">
              <p className="inline-block border-2 border-border bg-card px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-foreground shadow-[var(--shadow-crisp-sm)]">
                Context
              </p>
              <p className="text-base font-black uppercase tracking-[0.08em] text-foreground lg:text-lg">Private Workspace</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Summary-first dashboard framing for active modules and planned surfaces.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" type="button">
                Customize
              </Button>
              <Button size="sm" type="button">
                New Module
              </Button>
            </div>
          </Panel>

          <Panel className="p-5 shadow-[var(--shadow-crisp-md)] lg:p-7" variant="default">
            <Outlet />
          </Panel>
        </div>
      </div>
    </div>
  );
}
