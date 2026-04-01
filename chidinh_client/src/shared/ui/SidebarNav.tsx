import { NavLink } from "react-router-dom";
import { LogOut, LayoutGrid, CheckSquare, Settings } from "lucide-react";

type NavItem = {
  label: string;
  to: string;
  end?: boolean;
  icon: any;
};

type Props = {
  ariaLabel: string;
  items: NavItem[];
  operatorName: string;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export function SidebarNav({ ariaLabel, items, operatorName, onLogout, isLoggingOut }: Props) {
  const initals = operatorName.slice(0, 2).toUpperCase();

  return (
    <aside className="w-20 border-r-4 border-black bg-card z-30 flex flex-col h-screen fixed left-0 top-0 pt-4 pb-4">
      <div className="flex justify-center mb-8">
        <div className="w-12 h-12 bg-primary border-4 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center font-head text-primary-foreground font-bold text-xl uppercase cursor-pointer" title="Personal Workspace">
          PS
        </div>
      </div>

      <nav aria-label={ariaLabel} className="flex-1 overflow-y-auto px-3 flex flex-col gap-4 items-center">
        {items.map((item) => (
          <NavLink
            key={`${item.label}-${item.to}`}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              `p-3 border-4 transition-all flex items-center justify-center w-14 h-14 ${
                isActive
                  ? "bg-primary text-primary-foreground border-black shadow-[4px_4px_0_0_#000] -translate-y-1"
                  : "bg-[#fffdfa] text-muted-foreground border-transparent hover:border-black hover:text-foreground hover:shadow-[4px_4px_0_0_#000] hover:-translate-y-1"
              }`
            }
          >
            <item.icon size={28} strokeWidth={2.5} />
          </NavLink>
        ))}
      </nav>

      <div className="px-3 flex flex-col gap-4 items-center mt-auto">
        <button
          aria-label={`Người dùng ${operatorName}`}
          className="w-14 h-14 bg-muted border-4 border-transparent hover:border-black text-foreground rounded-full flex items-center justify-center font-head font-bold text-xl uppercase transition-all shadow-none hover:shadow-[4px_4px_0_0_#000] hover:-translate-y-1 shrink-0"
          title={`User: ${operatorName}`}
        >
          {initals}
        </button>

        <button
          aria-label="Đăng Xuất"
          className="w-14 h-14 bg-destructive text-destructive-foreground border-4 border-transparent hover:border-black flex items-center justify-center transition-all shadow-none hover:shadow-[4px_4px_0_0_#000] hover:-translate-y-1 disabled:opacity-50 shrink-0"
          title="Đăng Xuất"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          <LogOut size={26} strokeWidth={3} />
        </button>
      </div>
    </aside>
  );
}
