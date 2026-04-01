import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { DockNav } from "../shared/ui/DockNav";
import { SystemBar } from "../shared/ui/SystemBar";
import { WindowFrame } from "../shared/ui/WindowFrame";

describe("desktop shell primitives", () => {
  it("renders a window frame with mac-style controls and title", () => {
    render(
      <WindowFrame title="System Archive" subtitle="Public desktop artifact">
        <p>Archive body</p>
      </WindowFrame>,
    );

    expect(screen.getByText("System Archive")).toBeInTheDocument();
    expect(screen.getByText("Public desktop artifact")).toBeInTheDocument();
    expect(screen.getByLabelText(/window controls/i)).toBeInTheDocument();
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
    render(
      <SystemBar
        productLabel="Personal Digital Hub"
        contextLabel="Public Desktop"
        indicators={["Live Modules", "Warm macOS"]}
      />,
    );

    expect(screen.getByText("Personal Digital Hub")).toBeInTheDocument();
    expect(screen.getByText("Public Desktop")).toBeInTheDocument();
    expect(screen.getByText("Live Modules")).toBeInTheDocument();
    expect(screen.getByText("Warm macOS")).toBeInTheDocument();
  });
});
