import { X } from "lucide-react";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

export function RightPanel() {
  const { isRightPanelOpen, rightPanelContent, rightPanelTitle, closeRightPanel } = useWorkspaceStore();

  if (!isRightPanelOpen) return null;

  return (
    <aside className="w-full sm:w-96 h-[calc(100vh-2rem)] bg-card border-4 border-black shadow-[-8px_8px_0_0_#000] flex flex-col fixed right-4 top-4 z-40 transform transition-transform animate-in slide-in-from-right-full">
      <header className="flex items-center justify-between p-4 border-b-4 border-black bg-primary">
        <h2 className="font-head text-lg font-bold uppercase text-primary-foreground tracking-widest truncate">{rightPanelTitle}</h2>
        <button
          onClick={closeRightPanel}
          className="p-1 hover:bg-black/20 text-primary-foreground border-2 border-transparent hover:border-black transition-colors"
          title="Đóng Bảng Điều Khiển"
        >
          <X size={24} strokeWidth={3} />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-6 bg-[#fffdfa]">
        {rightPanelContent}
      </div>
    </aside>
  );
}
