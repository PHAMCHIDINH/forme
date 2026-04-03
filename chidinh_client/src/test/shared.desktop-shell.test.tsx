import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { DockNav } from "../shared/ui/DockNav";
import { SidebarNav } from "../shared/ui/SidebarNav";
import { SystemBar } from "../shared/ui/SystemBar";
import { WindowFrame } from "../shared/ui/WindowFrame";

describe("desktop shell primitives", () => {
  const renderSidebarNav = (initialEntry = "/app/todo") =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <SidebarNav
          ariaLabel="Dashboard Navigation"
          items={[
            { label: "Home", to: "/app", end: true },
            { label: "Todo", to: "/app/todo" },
            { label: "Public Hub", to: "/" },
          ]}
          operatorName="Ada Lovelace"
          onLogout={() => undefined}
          isLoggingOut={false}
        />
      </MemoryRouter>,
    );

  it("renders a window frame with mac-style controls and title", () => {
    const { container } = render(
      <WindowFrame title="System Archive" subtitle="Public desktop artifact">
        <p>Archive body</p>
      </WindowFrame>,
    );

    const frame = container.firstElementChild;
    const header = screen.getByLabelText(/window controls/i).parentElement;

    expect(screen.getByText("System Archive")).toBeInTheDocument();
    expect(screen.getByText("Public desktop artifact")).toBeInTheDocument();
    expect(screen.getByLabelText(/window controls/i)).toBeInTheDocument();
    expect(frame).toHaveClass("border-2", "bg-card");
    expect(header).toHaveClass("border-b-2", "bg-primary");
  });

  it("renders dock entries and marks the active route", () => {
    render(
      <MemoryRouter initialEntries={["/app/todo"]}>
        <DockNav
          ariaLabel="Workspace launcher"
          items={[
            { label: "Home", to: "/app", end: true },
            { label: "Todo", to: "/app/todo" },
            { label: "Public Hub", to: "/" },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("navigation", { name: /workspace launcher/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /todo/i })).toHaveAttribute("aria-current", "page");
  });

  it("renders a light system bar for desktop framing", () => {
    const { container } = render(
      <SystemBar
        productLabel="Personal Digital Hub"
        contextLabel="Public Desktop"
        indicators={["Live Modules", "Warm macOS"]}
      />,
    );

    const systemBar = container.firstElementChild;

    expect(screen.getByText("Personal Digital Hub")).toBeInTheDocument();
    expect(screen.getByText("Public Desktop")).toBeInTheDocument();
    expect(screen.getByText("Live Modules")).toBeInTheDocument();
    expect(screen.getByText("Warm macOS")).toBeInTheDocument();
    expect(systemBar).toHaveClass("border-4", "bg-card");
    expect(screen.getByText("Live Modules")).toHaveClass("border-2", "bg-accent");
  });

  it("renders the sidebar as a framed shell panel", () => {
    renderSidebarNav("/app/todo");

    const nav = screen.getByRole("navigation", { name: /dashboard navigation/i });
    const shellPanel = nav.parentElement;
    const activeRoute = screen.getByRole("link", { name: /todo/i });

    expect(screen.getByText("Private Hub")).toHaveClass("border-2", "bg-card");
    expect(screen.getByRole("link", { name: /public hub/i })).toBeInTheDocument();
    expect(shellPanel).toHaveClass("bg-secondary");
    expect(activeRoute).toHaveAttribute("aria-current", "page");
    expect(activeRoute).toHaveClass("border-2", "bg-primary");
  });
});
