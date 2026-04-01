import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TerminalSquare, LayoutGrid, CheckSquare } from "lucide-react";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

const COMMANDS = [
  { id: "todo", title: "Đi tới: Công Việc (Todo)", action: "/app/todo", icon: CheckSquare },
  { id: "home", title: "Đi tới: Trang Chủ", action: "/app", icon: LayoutGrid },
  { id: "portfolio", title: "Đi tới: Hub Công Khai", action: "/", icon: TerminalSquare },
];

export function CommandPalette() {
  const { isCommandPaletteOpen, closeCommandPalette, toggleCommandPalette } = useWorkspaceStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        closeCommandPalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, toggleCommandPalette, closeCommandPalette]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (action: string) => {
    navigate(action);
    closeCommandPalette();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={closeCommandPalette} />
      
      <div className="relative w-full max-w-2xl bg-card border-4 border-black shadow-[12px_12px_0_0_#000] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-4 border-b-4 border-black bg-[#fffdfa]">
          <Search className="mr-3 opacity-50" size={28} strokeWidth={3} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-2xl font-head uppercase placeholder:text-muted-foreground focus:outline-none"
            placeholder="Tìm kiếm lệnh (> Todo, > Dịch...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 font-sans text-xs font-bold border-2 border-black bg-muted px-2 py-1 uppercase shadow-[2px_2px_0_0_#000]">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 bg-card">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-medium uppercase font-head">
              Không tìm thấy lệnh nào phù hợp.
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {filteredCommands.map((cmd) => (
                <li key={cmd.id}>
                  <button
                    onClick={() => handleSelect(cmd.action)}
                    className="w-full flex items-center px-4 py-4 hover:bg-primary hover:text-primary-foreground border-2 border-transparent hover:border-black transition-colors focus:bg-primary focus:text-primary-foreground focus:outline-none outline-none group text-left cursor-pointer"
                  >
                    <cmd.icon className="mr-4 opacity-70 group-hover:opacity-100" size={24} />
                    <span className="font-head text-lg uppercase tracking-wider">{cmd.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t-4 border-black bg-muted p-2 text-xs font-bold tracking-widest text-[#5a5a5a] uppercase flex justify-between">
          <span>Tìm kiếm Toàn cục / Điều hướng</span>
          <span>Workspace Command Center</span>
        </div>
      </div>
    </div>
  );
}
