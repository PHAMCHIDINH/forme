import { Outlet, useNavigate } from "react-router-dom";
import { CopySlash, LayoutGrid, CheckSquare, Globe } from "lucide-react";

import { SidebarNav } from "../../shared/ui/SidebarNav";
import { RightPanel } from "../../shared/ui/RightPanel";
import { CommandPalette } from "../../shared/ui/CommandPalette";
import { useLogout, useSession } from "../auth/useSession";

const launcherItems = [
  { label: "Trang Chủ", to: "/app", icon: LayoutGrid, end: true },
  { label: "Công Việc", to: "/app/todo", icon: CheckSquare },
  { label: "Hub Công Khai", to: "/", icon: Globe },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const sessionQuery = useSession();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login");
  };

  const userName = sessionQuery.data?.user.displayName ?? "OPERATOR";

  return (
    <div className="flex h-screen w-full bg-[#f4e4d6] overflow-hidden relative">
      <SidebarNav 
        ariaLabel="Điều hướng Workspace IDE" 
        items={launcherItems} 
        operatorName={userName} 
        onLogout={handleLogout} 
        isLoggingOut={logoutMutation.isPending} 
      />

      <main className="flex-1 ml-20 h-full overflow-y-auto p-4 lg:p-8">
        <div className="w-full max-w-6xl mx-auto min-h-full flex flex-col relative animate-in fade-in duration-300">
          <Outlet />
        </div>
      </main>

      <RightPanel />
      <CommandPalette />
    </div>
  );
}
