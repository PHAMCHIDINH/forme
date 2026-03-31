import { NavLink, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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
    <div>
      <aside>
        <h1>Dashboard</h1>
        <nav aria-label="Dashboard Navigation">
          <ul>
            <li>
              <NavLink to="/app">Home</NavLink>
            </li>
            <li>
              <NavLink to="/app/todo">Todo</NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      <div>
        <header>
          <strong>Private Workspace</strong>
          <span>{sessionQuery.data?.user.displayName ?? "Owner"}</span>
          <button type="button" onClick={handleLogout} disabled={logoutMutation.isPending}>
            Logout
          </button>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
