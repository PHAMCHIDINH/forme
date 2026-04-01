# Personal Digital Hub macOS Desktop Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the frontend into a warm macOS-inspired desktop experience where the public site feels like a curated personal machine and the private app remains efficient for real work.

**Architecture:** Keep the current React routes and data contracts, but introduce a small shared desktop UI layer for window chrome, system framing, and dock navigation. Use those primitives to reshape the public portal, login bridge, private workspace shell, and todo app while preserving existing auth and todo API behavior.

**Tech Stack:** React 19, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS 4, Testing Library, Vitest

---

## Planned File Structure

```text
chidinh_client/
  src/
    modules/
      auth/
        LoginPage.tsx
      dashboard/
        DashboardHomePage.tsx
        DashboardLayout.tsx
      portfolio/
        PortfolioPage.tsx
        data.ts
      todo/
        TodoPage.tsx
    shared/
      ui/
        Button.tsx
        DockNav.tsx
        Panel.tsx
        SectionHeading.tsx
        SystemBar.tsx
        WindowFrame.tsx
    styles/
      globals.css
    test/
      app-smoke.test.tsx
      auth.login.test.tsx
      dashboard.layout.test.tsx
      portfolio.page.test.tsx
      shared.desktop-shell.test.tsx
      tailwind.theme.test.ts
      todo.page.test.tsx
```

## File Responsibility Map

- `chidinh_client/src/styles/globals.css`: theme tokens, wallpaper layers, glass surfaces, window chrome, dock styling, and mobile collapse behavior.
- `chidinh_client/src/shared/ui/WindowFrame.tsx`: reusable window shell with traffic-light controls, title row, and content container.
- `chidinh_client/src/shared/ui/SystemBar.tsx`: light desktop top bar shared across public and private surfaces.
- `chidinh_client/src/shared/ui/DockNav.tsx`: compact dock launcher with active-route state and responsive bottom-nav fallback.
- `chidinh_client/src/shared/ui/Button.tsx`: CTA primitive updated to fit the new desktop chrome and route usage.
- `chidinh_client/src/shared/ui/Panel.tsx`: inner content panel for cards inside window surfaces.
- `chidinh_client/src/shared/ui/SectionHeading.tsx`: reusable heading block aligned with the calmer workspace typography.
- `chidinh_client/src/modules/portfolio/data.ts`: public copy, window labels, dock labels, and artifact content for the desktop portal.
- `chidinh_client/src/modules/portfolio/PortfolioPage.tsx`: desktop-style public route with system bar, staggered windows, and dock.
- `chidinh_client/src/modules/auth/LoginPage.tsx`: centered access window over shared desktop wallpaper.
- `chidinh_client/src/modules/dashboard/DashboardLayout.tsx`: private workspace shell with system bar, single main window, dock-like launcher, and logout area.
- `chidinh_client/src/modules/dashboard/DashboardHomePage.tsx`: calmer workspace overview inside the private shell window.
- `chidinh_client/src/modules/todo/TodoPage.tsx`: productivity-app window content with header, metrics strip, composer, and explicit states.
- `chidinh_client/src/test/shared.desktop-shell.test.tsx`: shared window and dock primitives verification.
- `chidinh_client/src/test/tailwind.theme.test.ts`: token and responsive desktop utility coverage.
- `chidinh_client/src/test/portfolio.page.test.tsx`: public desktop naming, dock entries, and route CTA coverage.
- `chidinh_client/src/test/auth.login.test.tsx`: access window behavior and login submission coverage.
- `chidinh_client/src/test/dashboard.layout.test.tsx`: private shell framing, launcher, and user context coverage.
- `chidinh_client/src/test/todo.page.test.tsx`: todo app structure and CRUD flow coverage within the new shell.

### Task 1: Build the Shared Desktop Visual System

**Files:**
- Create: `chidinh_client/src/shared/ui/WindowFrame.tsx`
- Create: `chidinh_client/src/shared/ui/SystemBar.tsx`
- Create: `chidinh_client/src/shared/ui/DockNav.tsx`
- Create: `chidinh_client/src/test/shared.desktop-shell.test.tsx`
- Modify: `chidinh_client/src/shared/ui/Button.tsx`
- Modify: `chidinh_client/src/shared/ui/Panel.tsx`
- Modify: `chidinh_client/src/shared/ui/SectionHeading.tsx`
- Modify: `chidinh_client/src/styles/globals.css`
- Modify: `chidinh_client/src/test/tailwind.theme.test.ts`

- [ ] **Step 1: Write failing tests for the shared desktop shell**

```tsx
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
            { label: "Home", to: "/app" },
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
    expect(screen.getByText("Warm macOS")).toBeInTheDocument();
  });
});
```

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("desktop theme tokens", () => {
  it("defines wallpaper, glass, and dock tokens", () => {
    const css = readFileSync(resolve(__dirname, "../styles/globals.css"), "utf8");

    expect(css).toContain("--wallpaper-start");
    expect(css).toContain("--glass-surface");
    expect(css).toContain("--dock-surface");
    expect(css).toContain(".desktop-dock");
    expect(css).toContain("@media (max-width: 768px)");
  });
});
```

- [ ] **Step 2: Run the shared-shell tests to verify they fail**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/shared.desktop-shell.test.tsx src/test/tailwind.theme.test.ts`

Expected: FAIL because `WindowFrame`, `SystemBar`, and `DockNav` do not exist yet and `globals.css` does not expose the new desktop tokens.

- [ ] **Step 3: Implement the shared desktop primitives**

`chidinh_client/src/shared/ui/WindowFrame.tsx`

```tsx
import type { PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  toolbar?: ReactNode;
  className?: string;
  contentClassName?: string;
}>;

export function WindowFrame({
  title,
  subtitle,
  toolbar,
  className = "",
  contentClassName = "",
  children,
}: Props) {
  return (
    <section className={`window-frame ${className}`.trim()}>
      <header className="window-frame__header">
        <div aria-label="Window controls" className="window-frame__traffic">
          <span className="window-frame__dot window-frame__dot--close" />
          <span className="window-frame__dot window-frame__dot--minimize" />
          <span className="window-frame__dot window-frame__dot--zoom" />
        </div>
        <div className="min-w-0 flex-1 text-center">
          <p className="window-frame__title">{title}</p>
          {subtitle ? <p className="window-frame__subtitle">{subtitle}</p> : null}
        </div>
        <div className="flex min-w-24 justify-end">{toolbar}</div>
      </header>
      <div className={`window-frame__body ${contentClassName}`.trim()}>{children}</div>
    </section>
  );
}
```

`chidinh_client/src/shared/ui/SystemBar.tsx`

```tsx
type Props = {
  productLabel: string;
  contextLabel: string;
  indicators?: string[];
};

export function SystemBar({ productLabel, contextLabel, indicators = [] }: Props) {
  return (
    <div className="system-bar">
      <div>
        <p className="system-bar__product">{productLabel}</p>
        <p className="system-bar__context">{contextLabel}</p>
      </div>
      <div className="system-bar__indicators">
        {indicators.map((indicator) => (
          <span className="system-pill" key={indicator}>
            {indicator}
          </span>
        ))}
      </div>
    </div>
  );
}
```

`chidinh_client/src/shared/ui/DockNav.tsx`

```tsx
import { NavLink } from "react-router-dom";

type DockItem = {
  label: string;
  to: string;
  end?: boolean;
};

type Props = {
  ariaLabel: string;
  items: DockItem[];
};

export function DockNav({ ariaLabel, items }: Props) {
  return (
    <nav aria-label={ariaLabel} className="desktop-dock">
      {items.map((item) => (
        <NavLink
          key={item.to}
          end={item.end}
          to={item.to}
          className={({ isActive }) =>
            `desktop-dock__item ${isActive ? "desktop-dock__item--active" : ""}`.trim()
          }
        >
          <span className="desktop-dock__icon" aria-hidden="true" />
          <span className="desktop-dock__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

`chidinh_client/src/shared/ui/Button.tsx`

```tsx
import { Link, type LinkProps } from "react-router-dom";

type Props = LinkProps & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base = "desktop-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium";
  const variants = {
    primary: "desktop-button--primary",
    secondary: "desktop-button--secondary",
    ghost: "desktop-button--ghost",
  };

  return <Link className={`${base} ${variants[variant]} ${className}`.trim()} {...props} />;
}
```

`chidinh_client/src/shared/ui/Panel.tsx`

```tsx
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ className?: string }>;

export function Panel({ children, className = "" }: Props) {
  return <div className={`desktop-panel ${className}`.trim()}>{children}</div>;
}
```

`chidinh_client/src/shared/ui/SectionHeading.tsx`

```tsx
type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <header className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-text">{title}</h2>
      <p className="max-w-2xl text-base leading-7 text-muted">{description}</p>
    </header>
  );
}
```

`chidinh_client/src/styles/globals.css`

```css
:root {
  --wallpaper-start: #f4e4d6;
  --wallpaper-end: #dcc5b6;
  --glass-surface: rgba(255, 248, 242, 0.62);
  --glass-strong: rgba(255, 252, 248, 0.82);
  --dock-surface: rgba(255, 248, 242, 0.72);
  --color-text: #2b211c;
  --color-muted: rgba(43, 33, 28, 0.72);
  --color-border: rgba(91, 71, 57, 0.12);
  --color-accent: #7ea0c6;
}

body {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.72), transparent 22%),
    radial-gradient(circle at bottom right, rgba(126, 160, 198, 0.18), transparent 28%),
    linear-gradient(135deg, var(--wallpaper-start), var(--wallpaper-end));
  color: var(--color-text);
}

.system-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 1.25rem;
  background: var(--glass-surface);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 56px rgba(73, 46, 31, 0.12);
}

.system-bar__product {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.system-bar__context {
  margin: 0.25rem 0 0;
  font-size: 0.95rem;
  color: var(--color-muted);
}

.system-bar__indicators {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.system-pill {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  color: var(--color-muted);
}

.window-frame {
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: var(--glass-strong);
  backdrop-filter: blur(18px);
  border-radius: 1.75rem;
  box-shadow: 0 24px 80px rgba(73, 46, 31, 0.18);
  overflow: hidden;
}

.window-frame__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.38);
}

.window-frame__traffic {
  display: flex;
  gap: 0.5rem;
}

.window-frame__dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 999px;
}

.window-frame__dot--close { background: #ff5f57; }
.window-frame__dot--minimize { background: #ffbd2f; }
.window-frame__dot--zoom { background: #28c840; }

.window-frame__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.window-frame__subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.window-frame__body {
  padding: 1.25rem;
}

.desktop-panel {
  border: 1px solid var(--color-border);
  border-radius: 1.25rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.66);
}

.desktop-button {
  transition: transform 160ms ease, background-color 160ms ease, box-shadow 160ms ease;
}

.desktop-button:hover {
  transform: translateY(-1px);
}

.desktop-button--primary,
.desktop-submit {
  border: 1px solid rgba(126, 160, 198, 0.3);
  background: linear-gradient(180deg, #8fb0d4, #789cc3);
  color: white;
  box-shadow: 0 10px 24px rgba(77, 111, 148, 0.24);
}

.desktop-button--secondary,
.desktop-logout,
.desktop-inline-action {
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.62);
  color: var(--color-text);
}

.desktop-button--ghost {
  background: transparent;
  color: var(--color-text);
}

.desktop-dock {
  display: flex;
  gap: 0.75rem;
  width: fit-content;
  margin: 0 auto;
  padding: 0.75rem;
  border-radius: 1.5rem;
  background: var(--dock-surface);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 48px rgba(73, 46, 31, 0.14);
}

.desktop-dock__item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  min-width: 4.5rem;
  padding: 0.55rem 0.7rem;
  border-radius: 1rem;
  color: var(--color-text);
}

.desktop-dock__item--active {
  background: rgba(255, 255, 255, 0.62);
}

.desktop-dock__icon {
  display: block;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.9rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.45));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.desktop-dock__label {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .system-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .system-bar__indicators {
    justify-content: flex-start;
  }

  .desktop-dock {
    width: 100%;
    justify-content: space-between;
    border-radius: 1.25rem 1.25rem 0 0;
  }
}
```

- [ ] **Step 4: Run the shared-shell tests to verify they pass**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/shared.desktop-shell.test.tsx src/test/tailwind.theme.test.ts`

Expected: PASS with all shared-shell and theme-token assertions green.

- [ ] **Step 5: Commit the shared desktop foundation**

```bash
cd /mnt/d/chidinh
git add chidinh_client/src/shared/ui/WindowFrame.tsx chidinh_client/src/shared/ui/SystemBar.tsx chidinh_client/src/shared/ui/DockNav.tsx chidinh_client/src/shared/ui/Button.tsx chidinh_client/src/shared/ui/Panel.tsx chidinh_client/src/shared/ui/SectionHeading.tsx chidinh_client/src/styles/globals.css chidinh_client/src/test/shared.desktop-shell.test.tsx chidinh_client/src/test/tailwind.theme.test.ts
git commit -m "feat: add desktop shell primitives"
```

### Task 2: Redesign the Public Desktop Portal

**Files:**
- Modify: `chidinh_client/src/modules/portfolio/data.ts`
- Modify: `chidinh_client/src/modules/portfolio/PortfolioPage.tsx`
- Modify: `chidinh_client/src/test/portfolio.page.test.tsx`
- Modify: `chidinh_client/src/test/app-smoke.test.tsx`

- [ ] **Step 1: Write failing tests for the public desktop route**

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";

describe("PortfolioPage", () => {
  it("renders the desktop portal windows and dock actions", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText(/public desktop/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /personal digital hub/i })).toBeInTheDocument();
    expect(screen.getByText(/system archive/i)).toBeInTheDocument();
    expect(screen.getByText(/module registry/i)).toBeInTheDocument();
    expect(screen.getByText(/architecture notes/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /desktop dock/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /workspace/i })).toBeInTheDocument();
  });
});
```

```tsx
import { render, screen } from "@testing-library/react";

import App from "../app/App";

describe("App", () => {
  it("renders the public desktop portal headline", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: /personal digital hub/i })).toBeInTheDocument();
    expect(screen.getByText(/curated desktop scene/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the public-route tests to verify they fail**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/portfolio.page.test.tsx src/test/app-smoke.test.tsx`

Expected: FAIL because the current route still renders the older calm-premium sections and has no system bar or desktop dock.

- [ ] **Step 3: Implement the desktop portal content and layout**

`chidinh_client/src/modules/portfolio/data.ts`

```ts
export const portfolioData = {
  displayName: "Chidi N.",
  title: "System Architect",
  intro:
    "A personal digital hub presented as a living desktop for system design, active modules, and architecture artifacts.",
  desktopIndicators: ["Public Desktop", "Live Modules", "Warm macOS"],
  dockItems: [
    { label: "Portfolio", to: "/", end: true },
    { label: "Systems", to: "/#archive" },
    { label: "Workspace", to: "/login" },
    { label: "Contact", to: "/#contact" },
  ],
  windows: {
    identity: {
      title: "About / Identity",
      subtitle: "Curated desktop scene",
    },
    archive: {
      title: "System Archive",
      subtitle: "Selected systems and dossiers",
    },
    operatingModel: {
      title: "Operating Model",
      subtitle: "Principles behind the machine",
    },
    registry: {
      title: "Module Registry",
      subtitle: "Live and near-future modules",
    },
    notes: {
      title: "Architecture Notes",
      subtitle: "Signals from the technical stack",
    },
  },
  principles: [
    "Modular boundaries over sprawling complexity.",
    "Interfaces should feel calm even when systems are dense.",
    "Products should expose structure, not hide it behind marketing gloss.",
  ],
};
```

`chidinh_client/src/modules/portfolio/PortfolioPage.tsx`

```tsx
import { Button } from "../../shared/ui/Button";
import { DockNav } from "../../shared/ui/DockNav";
import { Panel } from "../../shared/ui/Panel";
import { SystemBar } from "../../shared/ui/SystemBar";
import { WindowFrame } from "../../shared/ui/WindowFrame";
import { portfolioData } from "./data";

export function PortfolioPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-4 lg:px-6 lg:py-6">
      <SystemBar
        productLabel="Personal Digital Hub"
        contextLabel="Public Desktop"
        indicators={portfolioData.desktopIndicators}
      />

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <WindowFrame
          title={portfolioData.windows.identity.title}
          subtitle={portfolioData.windows.identity.subtitle}
          className="lg:translate-y-2"
        >
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.24em] text-muted">{portfolioData.displayName}</p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-text">
              Personal Digital Hub
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">{portfolioData.intro}</p>
            <div className="flex flex-wrap gap-3">
              <Button to="/#archive">Open Archive</Button>
              <Button to="/login" variant="secondary">
                Enter Workspace
              </Button>
            </div>
          </div>
        </WindowFrame>

        <WindowFrame
          title={portfolioData.windows.registry.title}
          subtitle={portfolioData.windows.registry.subtitle}
          className="lg:translate-y-10"
        >
          <div className="grid gap-3">
            <Panel><p>Todo.app is live inside the private workspace.</p></Panel>
            <Panel><p>Files and Automation remain registered as planned modules.</p></Panel>
          </div>
        </WindowFrame>
      </section>

      <section id="archive" className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <WindowFrame title={portfolioData.windows.operatingModel.title} subtitle={portfolioData.windows.operatingModel.subtitle}>
          <div className="grid gap-3">
            {portfolioData.principles.map((principle) => (
              <Panel key={principle}>
                <p className="leading-7 text-muted">{principle}</p>
              </Panel>
            ))}
          </div>
        </WindowFrame>

        <WindowFrame title={portfolioData.windows.archive.title} subtitle={portfolioData.windows.archive.subtitle}>
          <div className="grid gap-3 md:grid-cols-2">
            <Panel><p className="font-medium text-text">Integration Systems</p><p className="mt-2 text-sm text-muted">Projects framed as dossiers, not marketing cards.</p></Panel>
            <Panel><p className="font-medium text-text">Delivery Artifacts</p><p className="mt-2 text-sm text-muted">Architecture, deployment, and product notes surfaced as desktop documents.</p></Panel>
          </div>
        </WindowFrame>
      </section>

      <WindowFrame title={portfolioData.windows.notes.title} subtitle={portfolioData.windows.notes.subtitle}>
        <div className="flex flex-wrap gap-3">
          {["API design", "Secure access", "Data modeling", "Deployment workflow"].map((note) => (
            <Panel className="px-4 py-3" key={note}>
              <p className="text-sm text-text">{note}</p>
            </Panel>
          ))}
        </div>
      </WindowFrame>

      <DockNav ariaLabel="Desktop dock" items={portfolioData.dockItems} />
    </main>
  );
}
```

- [ ] **Step 4: Run the public desktop tests to verify they pass**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/portfolio.page.test.tsx src/test/app-smoke.test.tsx`

Expected: PASS with the public desktop windows, labels, and dock navigation rendered.

- [ ] **Step 5: Commit the public portal redesign**

```bash
cd /mnt/d/chidinh
git add chidinh_client/src/modules/portfolio/data.ts chidinh_client/src/modules/portfolio/PortfolioPage.tsx chidinh_client/src/test/portfolio.page.test.tsx chidinh_client/src/test/app-smoke.test.tsx
git commit -m "feat: redesign public desktop portal"
```

### Task 3: Rebuild the Login Flow and Private Workspace Shell

**Files:**
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
- Modify: `chidinh_client/src/modules/dashboard/DashboardLayout.tsx`
- Modify: `chidinh_client/src/modules/dashboard/DashboardHomePage.tsx`
- Modify: `chidinh_client/src/test/auth.login.test.tsx`
- Modify: `chidinh_client/src/test/dashboard.layout.test.tsx`

- [ ] **Step 1: Write failing tests for the login window and workspace shell**

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { LoginPage } from "../modules/auth/LoginPage";
import { createTestQueryClient, jsonResponse, mockFetchSequence } from "./test-utils";

describe("LoginPage", () => {
  it("renders an access window that bridges into the workspace", () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/workspace access/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enter workspace/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to public desktop/i })).toBeInTheDocument();
  });

  it("submits credentials and lands in the private workspace", async () => {
    mockFetchSequence(jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }));
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app" element={<p>Private workspace</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await user.type(screen.getByLabelText(/username/i), "ada");
    await user.type(screen.getByLabelText(/password/i), "swordfish");
    await user.click(screen.getByRole("button", { name: /enter workspace/i }));

    expect(await screen.findByText("Private workspace")).toBeInTheDocument();
  });
});
```

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient, jsonResponse, mockFetchSequence } from "./test-utils";

describe("DashboardLayout", () => {
  it("renders the private desktop shell with launcher and user context", async () => {
    mockFetchSequence(jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/private workspace/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /workspace launcher/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /todo/i })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the auth and dashboard tests to verify they fail**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/auth.login.test.tsx src/test/dashboard.layout.test.tsx`

Expected: FAIL because the current pages still use the older rounded-panel layout and lack the new workspace access and launcher framing.

- [ ] **Step 3: Implement the login bridge and private desktop shell**

`chidinh_client/src/modules/auth/LoginPage.tsx`

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { SystemBar } from "../../shared/ui/SystemBar";
import { WindowFrame } from "../../shared/ui/WindowFrame";
import { loginSchema, type LoginFormValues } from "./loginSchema";
import { useLogin } from "./useSession";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values);
    navigate("/app");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-4 lg:px-6 lg:py-6">
      <SystemBar
        productLabel="Personal Digital Hub"
        contextLabel="Workspace Access"
        indicators={["Private System", "Warm macOS"]}
      />
      <div className="flex flex-1 items-center justify-center">
        <WindowFrame title="Workspace Access" subtitle="Bridge into the private machine" className="w-full max-w-2xl">
          <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label htmlFor="username">Username</label>
              <input id="username" autoComplete="username" {...register("username")} />
              {errors.username ? <p className="text-sm text-red-700">{errors.username.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password ? <p className="text-sm text-red-700">{errors.password.message}</p> : null}
            </div>
            <button className="desktop-submit w-full" type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Opening Workspace..." : "Enter Workspace"}
            </button>
            <Link className="inline-flex text-sm text-muted underline-offset-4 hover:underline" to="/">
              Back to Public Desktop
            </Link>
          </form>
        </WindowFrame>
      </div>
    </main>
  );
}
```

`chidinh_client/src/modules/dashboard/DashboardLayout.tsx`

```tsx
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
          <button className="desktop-logout" type="button" onClick={handleLogout} disabled={logoutMutation.isPending}>
            {logoutMutation.isPending ? "Closing..." : "Logout"}
          </button>
        }
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text">{sessionQuery.data?.user.displayName ?? "Owner"}</p>
              <p className="text-sm text-muted">Workspace launcher and routed applications.</p>
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
```

`chidinh_client/src/modules/dashboard/DashboardHomePage.tsx`

```tsx
import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";

export function DashboardHomePage() {
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Workspace"
        title="Private Workspace"
        description="A calmer desktop surface for live modules, operational notes, and upcoming tools."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <p className="text-sm text-muted">Live App</p>
          <h3 className="mt-3 text-xl font-semibold text-text">Todo</h3>
          <p className="mt-2 text-sm leading-6 text-muted">Capture and complete active execution items.</p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted">Registered</p>
          <h3 className="mt-3 text-xl font-semibold text-text">Files</h3>
          <p className="mt-2 text-sm leading-6 text-muted">Reserved for future asset and reference storage.</p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted">Registered</p>
          <h3 className="mt-3 text-xl font-semibold text-text">Automation</h3>
          <p className="mt-2 text-sm leading-6 text-muted">Reserved for recurring workflows and assistant actions.</p>
        </Panel>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the auth and dashboard tests to verify they pass**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/auth.login.test.tsx src/test/dashboard.layout.test.tsx`

Expected: PASS with the access window, workspace launcher, and user context all rendered correctly.

- [ ] **Step 5: Commit the login and workspace shell redesign**

```bash
cd /mnt/d/chidinh
git add chidinh_client/src/modules/auth/LoginPage.tsx chidinh_client/src/modules/dashboard/DashboardLayout.tsx chidinh_client/src/modules/dashboard/DashboardHomePage.tsx chidinh_client/src/test/auth.login.test.tsx chidinh_client/src/test/dashboard.layout.test.tsx
git commit -m "feat: redesign private workspace shell"
```

### Task 4: Rebuild the Todo Route as a Productivity App Window

**Files:**
- Modify: `chidinh_client/src/modules/todo/TodoPage.tsx`
- Modify: `chidinh_client/src/test/todo.page.test.tsx`

- [ ] **Step 1: Write failing tests for the redesigned todo application**

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient, jsonResponse, mockFetchSequence } from "./test-utils";

describe("TodoPage", () => {
  it("renders the productivity app header and metrics strip", async () => {
    mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
      jsonResponse({ items: [] }),
    );

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app/todo"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole("heading", { name: /todo app/i })).toBeInTheDocument();
    expect(screen.getByText(/task composer/i)).toBeInTheDocument();
    expect(screen.getByText(/0 total/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the todo-route test suite to verify it fails**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/todo.page.test.tsx`

Expected: FAIL because the route still exposes the older "Todo Operations" layout and lacks the new app-window naming and structure.

- [ ] **Step 3: Implement the productivity app layout without changing API behavior**

`chidinh_client/src/modules/todo/TodoPage.tsx`

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { createTodo, deleteTodo, listTodos, updateTodo } from "./api";

const todoSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200, "Task title is too long"),
});

type TodoFormValues = z.infer<typeof todoSchema>;

export function TodoPage() {
  const queryClient = useQueryClient();
  const todosQuery = useQuery({ queryKey: ["todos"], queryFn: listTodos });
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: { title: "" },
  });

  const items = todosQuery.data?.items ?? [];
  const metrics = useMemo(() => {
    const total = items.length;
    const completed = items.filter((item) => item.completed).length;
    return { total, completed, open: total - completed };
  }, [items]);

  const createMutation = useMutation({
    mutationFn: (title: string) => createTodo(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => updateTodo(id, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Application"
        title="Todo App"
        description="The first live productivity application inside the private desktop."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Panel><p className="text-sm text-muted">Tasks</p><p className="mt-3 text-2xl font-semibold text-text">{metrics.total} total</p></Panel>
        <Panel><p className="text-sm text-muted">Open</p><p className="mt-3 text-2xl font-semibold text-text">{metrics.open} open</p></Panel>
        <Panel><p className="text-sm text-muted">Completed</p><p className="mt-3 text-2xl font-semibold text-text">{metrics.completed} complete</p></Panel>
      </div>

      <Panel className="space-y-4">
        <div>
          <p className="text-sm font-medium text-text">Task Composer</p>
          <p className="mt-1 text-sm text-muted">Add the next execution item without leaving the app window.</p>
        </div>
        <form className="flex flex-col gap-3 md:flex-row md:items-end" onSubmit={form.handleSubmit(async ({ title }) => createMutation.mutateAsync(title))}>
          <div className="flex-1 space-y-2">
            <label htmlFor="todo-title">Task Title</label>
            <input id="todo-title" placeholder="Add a new task" {...form.register("title")} />
            {form.formState.errors.title ? <p className="text-sm text-red-700">{form.formState.errors.title.message}</p> : null}
          </div>
          <button className="desktop-submit md:w-auto" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Adding..." : "Add Task"}
          </button>
        </form>
      </Panel>

      {todosQuery.isLoading ? <Panel><p>Loading todos...</p></Panel> : null}
      {todosQuery.isError ? <Panel><p>Failed to load todos.</p></Panel> : null}

      {!todosQuery.isLoading && !todosQuery.isError && items.length === 0 ? (
        <Panel>
          <p className="text-xl font-semibold text-text">No active tasks yet.</p>
          <p className="mt-2 text-sm text-muted">Add your first item to start shaping the workspace rhythm.</p>
        </Panel>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((todo) => (
            <Panel className="flex items-center justify-between gap-4" key={todo.id}>
              <label className="flex items-center gap-3">
                <input
                  className="h-4 w-4"
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(event) => updateMutation.mutate({ id: todo.id, completed: event.target.checked })}
                />
                <span>{todo.title}</span>
              </label>

              <button className="desktop-inline-action" type="button" onClick={() => deleteMutation.mutate(todo.id)}>
                Delete
              </button>
            </Panel>
          ))}
        </div>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 4: Run the todo tests to verify they pass**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/todo.page.test.tsx`

Expected: PASS with the renamed heading, composer strip, metrics cards, and CRUD interactions intact.

- [ ] **Step 5: Commit the todo app redesign**

```bash
cd /mnt/d/chidinh
git add chidinh_client/src/modules/todo/TodoPage.tsx chidinh_client/src/test/todo.page.test.tsx
git commit -m "feat: redesign todo app window"
```

### Task 5: Run Full Verification and Responsive Checks

**Files:**
- Modify: `chidinh_client/src/test/router.test.tsx`
- Modify: `chidinh_client/src/test/auth.require-auth.test.tsx`

- [ ] **Step 1: Expand route smoke coverage for the final route names**

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";

describe("AppRoutes", () => {
  it("renders the desktop portal on the public route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText(/public desktop/i)).toBeInTheDocument();
  });

  it("renders the access window on the login route", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText(/workspace access/i)).toBeInTheDocument();
  });
});
```

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient, jsonResponse, mockFetchSequence } from "./test-utils";

describe("RequireAuth", () => {
  it("redirects unauthenticated users to the login access window", async () => {
    mockFetchSequence(new Response(JSON.stringify({ message: "unauthorized" }), { status: 401 }));
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app"]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/workspace access/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the route safety tests to verify they fail or need updates**

Run: `cd /mnt/d/chidinh/chidinh_client && npm test -- src/test/router.test.tsx src/test/auth.require-auth.test.tsx`

Expected: FAIL or assertion mismatch until the renamed route labels and access-window text are fully aligned.

- [ ] **Step 3: Update route tests and perform the full automated verification**

Run:

```bash
cd /mnt/d/chidinh/chidinh_client
npm test
npm run build
```

Expected:

- `npm test` passes with all route, auth, dashboard, theme, and todo tests green
- `npm run build` passes with `vite build` output and no TypeScript errors

- [ ] **Step 4: Perform manual responsive verification**

Check in the browser:

```text
1. Visit `/` at desktop width and confirm staggered windows plus floating dock.
2. Shrink to mobile width and confirm windows collapse to a readable stack.
3. Confirm the dock becomes a bottom tray on mobile.
4. Visit `/login` and confirm the access window remains centered and readable.
5. Visit `/app` and `/app/todo` and confirm the launcher remains usable at narrow widths.
```

Expected: No unreadable overlaps, clipped dock items, or inaccessible form controls.

- [ ] **Step 5: Commit the route verification updates**

```bash
cd /mnt/d/chidinh
git add chidinh_client/src/test/router.test.tsx chidinh_client/src/test/auth.require-auth.test.tsx
git commit -m "test: align route coverage with desktop redesign"
```
