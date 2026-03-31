# Personal Digital Hub UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the existing frontend into a calm premium public hub and private workspace shell that better communicates system architecture capability while preserving the current auth and todo flows.

**Architecture:** Keep the current single React application with public and private route areas. Introduce a lightweight design system, Tailwind-based styling foundation, form validation for auth and todo entry, and more structured page modules without changing the backend contract.

**Tech Stack:** React, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS, React Hook Form, Zod, Testing Library, Vitest

---

## Planned Repository Structure

```text
/mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/
  docs/
    superpowers/
      specs/
      plans/
  chidinh_client/
    package.json
    package-lock.json
    postcss.config.cjs
    tailwind.config.ts
    src/
      main.tsx
      styles/
        globals.css
      app/
        App.tsx
        router/
          AppRouter.tsx
        providers/
          AppProviders.tsx
      modules/
        auth/
          LoginPage.tsx
          loginSchema.ts
        dashboard/
          DashboardLayout.tsx
          DashboardHomePage.tsx
        portfolio/
          PortfolioPage.tsx
          data.ts
        todo/
          TodoPage.tsx
      shared/
        api/
          client.ts
        ui/
          Button.tsx
          Panel.tsx
          SectionHeading.tsx
      test/
        app-smoke.test.tsx
        auth.login.test.tsx
        dashboard.layout.test.tsx
        portfolio.page.test.tsx
        router.test.tsx
        todo.page.test.tsx
```

## File Responsibility Map

- `chidinh_client/postcss.config.cjs`: Tailwind + autoprefixer pipeline for Vite.
- `chidinh_client/tailwind.config.ts`: content scan paths and theme extension hooks.
- `chidinh_client/src/styles/globals.css`: design tokens, Tailwind layers, and base page styling.
- `chidinh_client/src/shared/ui/Button.tsx`: shared CTA/button primitive for public and private surfaces.
- `chidinh_client/src/shared/ui/Panel.tsx`: reusable surface wrapper for cards, panels, and module containers.
- `chidinh_client/src/shared/ui/SectionHeading.tsx`: shared section heading block for editorial sections and module headers.
- `chidinh_client/src/modules/portfolio/data.ts`: structured portfolio content for principles, systems, capabilities, and architecture signals.
- `chidinh_client/src/modules/portfolio/PortfolioPage.tsx`: public hub route assembled from the shared UI primitives.
- `chidinh_client/src/modules/auth/loginSchema.ts`: form schema for validated auth submission.
- `chidinh_client/src/modules/auth/LoginPage.tsx`: redesigned workspace entry route using React Hook Form and Zod.
- `chidinh_client/src/modules/dashboard/DashboardLayout.tsx`: private shell with sidebar, context bar, and routed canvas.
- `chidinh_client/src/modules/dashboard/DashboardHomePage.tsx`: home surface inside the private shell.
- `chidinh_client/src/modules/todo/TodoPage.tsx`: redesigned todo module with metrics, composer, and explicit state surfaces.
- `chidinh_client/src/test/*.test.tsx`: route-level and module-level verification for the redesigned UI.

## Task 1: Add Styling Foundation and Redesign the Public Hub

**Files:**
- Create: `chidinh_client/postcss.config.cjs`
- Create: `chidinh_client/tailwind.config.ts`
- Create: `chidinh_client/src/styles/globals.css`
- Create: `chidinh_client/src/shared/ui/Button.tsx`
- Create: `chidinh_client/src/shared/ui/Panel.tsx`
- Create: `chidinh_client/src/shared/ui/SectionHeading.tsx`
- Create: `chidinh_client/src/test/portfolio.page.test.tsx`
- Modify: `chidinh_client/package.json`
- Modify: `chidinh_client/package-lock.json`
- Modify: `chidinh_client/src/main.tsx`
- Modify: `chidinh_client/src/modules/portfolio/data.ts`
- Modify: `chidinh_client/src/modules/portfolio/PortfolioPage.tsx`
- Modify: `chidinh_client/src/test/app-smoke.test.tsx`
- Modify: `chidinh_client/src/test/router.test.tsx`

- [ ] **Step 1: Write the failing public hub tests**

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";

describe("PortfolioPage", () => {
  it("renders the public hub sections and workspace entry points", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: /personal digital hub/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore systems/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /enter workspace/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /operating principles/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /selected systems/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /live capabilities/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /architecture signal/i })).toBeInTheDocument();
  });
});
```

```tsx
import { render, screen } from "@testing-library/react";

import App from "../app/App";

describe("App", () => {
  it("renders the redesigned public hub headline", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: /personal digital hub/i })).toBeInTheDocument();
    expect(screen.getByText(/modular architecture/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client && npm test -- src/test/portfolio.page.test.tsx src/test/app-smoke.test.tsx src/test/router.test.tsx`
Expected: FAIL because the current portfolio page only renders `Selected Projects` and does not expose the new editorial sections or CTA labels.

- [ ] **Step 3: Install the styling and form dependencies**

Run:

```bash
cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client
npm install react-hook-form zod @hookform/resolvers
npm install -D tailwindcss postcss autoprefixer
```

Expected: `package.json` and `package-lock.json` include the new dependencies with no audit failures.

- [ ] **Step 4: Add Tailwind configuration and global design tokens**

`postcss.config.cjs`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        surface: "var(--color-surface)",
        surfaceAlt: "var(--color-surface-alt)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        accent: "var(--color-accent)",
        border: "var(--color-border)",
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "\"Times New Roman\"", "serif"],
        sans: ["\"Segoe UI\"", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

`src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-base: #f5f1ea;
  --color-surface: #fffdfa;
  --color-surface-alt: #ebe5da;
  --color-text: #1f2933;
  --color-muted: #52606d;
  --color-accent: #365f63;
  --color-border: rgba(31, 41, 51, 0.12);
}

@layer base {
  * {
    @apply box-border;
  }

  body {
    @apply m-0 bg-base text-text font-sans antialiased;
    background-image:
      radial-gradient(circle at top left, rgba(54, 95, 99, 0.08), transparent 35%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 253, 250, 0.92));
  }

  a {
    @apply text-inherit no-underline;
  }
}
```

`src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./app/App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 5: Add shared UI primitives and redesign the portfolio content model**

`src/shared/ui/Button.tsx`

```tsx
import { Link, type LinkProps } from "react-router-dom";

type Props = LinkProps & {
  variant?: "primary" | "secondary";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition";
  const variants = {
    primary: "bg-accent text-white hover:opacity-90",
    secondary: "border border-border bg-surface text-text hover:bg-surfaceAlt",
  };

  return <Link className={`${base} ${variants[variant]} ${className}`.trim()} {...props} />;
}
```

`src/shared/ui/Panel.tsx`

```tsx
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
}>;

export function Panel({ children, className = "" }: Props) {
  return (
    <div className={`rounded-[28px] border border-border bg-surface shadow-panel ${className}`.trim()}>
      {children}
    </div>
  );
}
```

`src/shared/ui/SectionHeading.tsx`

```tsx
type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <header className="max-w-2xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
      <h2 className="font-display text-3xl text-text">{title}</h2>
      <p className="text-base leading-7 text-muted">{description}</p>
    </header>
  );
}
```

`src/modules/portfolio/data.ts`

```ts
export type PortfolioPrinciple = {
  title: string;
  description: string;
};

export type PortfolioProject = {
  name: string;
  domain: string;
  summary: string;
};

export type PortfolioCapability = {
  name: string;
  status: "Live" | "Planned" | "Evolving";
};

export type PortfolioData = {
  displayName: string;
  title: string;
  intro: string;
  githubUrl: string;
  contactEmail: string;
  principles: PortfolioPrinciple[];
  projects: PortfolioProject[];
  capabilities: PortfolioCapability[];
  architectureSignals: string[];
};

export const portfolioData: PortfolioData = {
  displayName: "Pham Chi Dinh",
  title: "System Architect and Personal Digital Hub Builder",
  intro:
    "I design practical digital systems with modular architecture, calm operational surfaces, and resilient delivery workflows.",
  githubUrl: "https://github.com/PHAMCHIDINH",
  contactEmail: "contact@example.com",
  principles: [
    {
      title: "System Thinking",
      description: "Shape tools as connected systems instead of isolated screens or one-off utilities.",
    },
    {
      title: "Modular Integration",
      description: "Keep interfaces composable so new modules can enter the hub without destabilizing it.",
    },
    {
      title: "Operational Clarity",
      description: "Use calm hierarchy and explicit states so the product stays understandable under growth.",
    },
  ],
  projects: [
    {
      name: "AI Service Hub",
      domain: "Internal Tooling",
      summary: "A modular platform for AI-powered operations with clean service boundaries and reusable workflows.",
    },
    {
      name: "E-commerce Marketplace",
      domain: "Digital Commerce",
      summary: "A marketplace architecture focused on extensible product modules and operational reliability.",
    },
  ],
  capabilities: [
    { name: "Todo", status: "Live" },
    { name: "File Manager", status: "Planned" },
    { name: "Knowledge Base", status: "Planned" },
    { name: "Automation", status: "Evolving" },
  ],
  architectureSignals: [
    "API Design",
    "Deployment Workflow",
    "Secure Access",
    "Data Modeling",
    "Modular Boundaries",
  ],
};
```

`src/modules/portfolio/PortfolioPage.tsx`

```tsx
import { Button } from "../../shared/ui/Button";
import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { portfolioData } from "./data";

export function PortfolioPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-8 lg:px-10 lg:py-10">
      <Panel className="overflow-hidden px-6 py-8 lg:px-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.24em] text-accent">{portfolioData.displayName}</p>
            <h1 className="max-w-3xl font-display text-5xl leading-tight text-text">
              Personal Digital Hub
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">{portfolioData.intro}</p>
            <div className="flex flex-wrap gap-3">
              <Button to="#systems">Explore Systems</Button>
              <Button to="/login" variant="secondary">
                Enter Workspace
              </Button>
            </div>
          </div>
          <Panel className="bg-surfaceAlt p-6">
            <p className="text-sm text-muted">Role</p>
            <p className="mt-3 text-2xl font-display text-text">{portfolioData.title}</p>
            <p className="mt-4 text-sm leading-7 text-muted">
              Building integrated digital systems with modular interfaces, stable APIs, and
              production-ready workflows.
            </p>
          </Panel>
        </div>
      </Panel>
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Framework"
          title="Operating Principles"
          description="A calm system only scales when the boundaries, rituals, and interfaces stay clear."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {portfolioData.principles.map((principle) => (
            <Panel className="p-6" key={principle.title}>
              <h3 className="font-display text-2xl text-text">{principle.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{principle.description}</p>
            </Panel>
          ))}
        </div>
      </section>
      <section id="systems" className="space-y-6">
        <SectionHeading
          eyebrow="Portfolio"
          title="Selected Systems"
          description="Project highlights framed as operational systems instead of static case studies."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {portfolioData.projects.map((project) => (
            <Panel className="p-6" key={project.name}>
              <p className="text-xs uppercase tracking-[0.24em] text-accent">{project.domain}</p>
              <h3 className="mt-3 font-display text-2xl text-text">{project.name}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{project.summary}</p>
            </Panel>
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Hub"
          title="Live Capabilities"
          description="Current and near-future modules that define the product as a living digital workspace."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {portfolioData.capabilities.map((capability) => (
            <Panel className="p-5" key={capability.name}>
              <p className="text-sm text-muted">{capability.status}</p>
              <p className="mt-3 text-lg text-text">{capability.name}</p>
            </Panel>
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Architecture"
          title="Architecture Signal"
          description="A focused view into the technical decisions that shape the system."
        />
        <div className="flex flex-wrap gap-3">
          {portfolioData.architectureSignals.map((signal) => (
            <Panel className="px-4 py-3" key={signal}>
              <p className="text-sm text-text">{signal}</p>
            </Panel>
          ))}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client && npm test -- src/test/portfolio.page.test.tsx src/test/app-smoke.test.tsx src/test/router.test.tsx`
Expected: PASS with the new portfolio test, route test, and app smoke test all green.

- [ ] **Step 7: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design
git add chidinh_client/package.json chidinh_client/package-lock.json chidinh_client/postcss.config.cjs chidinh_client/tailwind.config.ts chidinh_client/src/main.tsx chidinh_client/src/styles/globals.css chidinh_client/src/shared/ui/Button.tsx chidinh_client/src/shared/ui/Panel.tsx chidinh_client/src/shared/ui/SectionHeading.tsx chidinh_client/src/modules/portfolio/data.ts chidinh_client/src/modules/portfolio/PortfolioPage.tsx chidinh_client/src/test/portfolio.page.test.tsx chidinh_client/src/test/app-smoke.test.tsx chidinh_client/src/test/router.test.tsx
git commit -m "feat: redesign public hub foundation"
```

## Task 2: Redesign the Login Route with Validated Form Handling

**Files:**
- Create: `chidinh_client/src/modules/auth/loginSchema.ts`
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
- Modify: `chidinh_client/src/test/auth.login.test.tsx`

- [ ] **Step 1: Extend the login tests to cover validation and the redesigned route copy**

```tsx
describe("LoginPage", () => {
  it("shows validation messages before submission", async () => {
    const user = userEvent.setup();

    renderLoginRoute();
    await user.click(screen.getByRole("button", { name: /enter workspace/i }));

    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it("submits credentials and navigates to the private app", async () => {
    const fetchMock = mockFetchSequence(
      jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    );
    const user = userEvent.setup();

    renderLoginRoute();

    await user.type(screen.getByLabelText(/username/i), "ada");
    await user.type(screen.getByLabelText(/password/i), "swordfish");
    await user.click(screen.getByRole("button", { name: /enter workspace/i }));

    expect(await screen.findByText("Private dashboard")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the login tests to verify they fail**

Run: `cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client && npm test -- src/test/auth.login.test.tsx`
Expected: FAIL because the current form has no schema validation and the submit button label remains `Sign In`.

- [ ] **Step 3: Add the login schema and refactor the page to use React Hook Form**

`src/modules/auth/loginSchema.ts`

```ts
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

`src/modules/auth/LoginPage.tsx`

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Panel } from "../../shared/ui/Panel";
import { loginSchema, type LoginFormValues } from "./loginSchema";
import { useLogin } from "./useSession";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values);
    navigate("/app");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 lg:px-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Panel className="p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Private Hub</p>
          <h1 className="mt-4 font-display text-4xl text-text">Enter Workspace</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            Sign in to access the operational side of the hub and manage active workflows.
          </p>
          <Link className="mt-6 inline-flex text-sm text-accent underline-offset-4 hover:underline" to="/">
            Back to Public Hub
          </Link>
        </Panel>
        <Panel className="p-8 lg:p-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label htmlFor="username">Username</label>
              <input id="username" autoComplete="username" {...register("username")} />
              {errors.username ? <p>{errors.username.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password ? <p>{errors.password.message}</p> : null}
            </div>
            {loginMutation.isError ? <p>Invalid credentials. Please try again.</p> : null}
            <button type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Opening Workspace..." : "Enter Workspace"}
            </button>
          </form>
        </Panel>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run the login tests to verify they pass**

Run: `cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client && npm test -- src/test/auth.login.test.tsx`
Expected: PASS with validation feedback and successful auth submission both green.

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design
git add chidinh_client/src/modules/auth/loginSchema.ts chidinh_client/src/modules/auth/LoginPage.tsx chidinh_client/src/test/auth.login.test.tsx
git commit -m "feat: redesign login entry flow"
```

## Task 3: Build the Private Workspace Shell and Dashboard Home

**Files:**
- Create: `chidinh_client/src/modules/dashboard/DashboardHomePage.tsx`
- Create: `chidinh_client/src/test/dashboard.layout.test.tsx`
- Modify: `chidinh_client/src/app/router/AppRouter.tsx`
- Modify: `chidinh_client/src/modules/dashboard/DashboardLayout.tsx`
- Modify: `chidinh_client/src/test/auth.require-auth.test.tsx`

- [ ] **Step 1: Write the failing dashboard shell test**

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AppRoutes } from "../app/router/AppRouter";
import { createTestQueryClient, jsonResponse, mockFetchSequence } from "./test-utils";

it("renders the private shell with context and navigation", async () => {
  mockFetchSequence(
    jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    jsonResponse({ items: [] }),
  );

  const queryClient = createTestQueryClient();

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/app"]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  expect(await screen.findByRole("heading", { name: /workspace overview/i })).toBeInTheDocument();
  expect(screen.getByRole("navigation", { name: /dashboard navigation/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /public hub/i })).toBeInTheDocument();
  expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the dashboard tests to verify they fail**

Run: `cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client && npm test -- src/test/dashboard.layout.test.tsx src/test/auth.require-auth.test.tsx`
Expected: FAIL because `/app` currently renders a paragraph only and the shell has no workspace overview or return link.

- [ ] **Step 3: Extract the dashboard home page and redesign the shell**

`src/modules/dashboard/DashboardHomePage.tsx`

```tsx
import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";

export function DashboardHomePage() {
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Workspace"
        title="Workspace Overview"
        description="A focused operating surface for the tools that power the personal digital hub."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-6">
          <p className="text-sm text-muted">Live Module</p>
          <h3 className="mt-3 text-xl font-display text-text">Todo</h3>
          <p className="mt-3 text-sm leading-6 text-muted">Track current execution items and short-term delivery tasks.</p>
        </Panel>
        <Panel className="p-6">
          <p className="text-sm text-muted">Planned Module</p>
          <h3 className="mt-3 text-xl font-display text-text">Files</h3>
          <p className="mt-3 text-sm leading-6 text-muted">Reserve space for asset organization and operational references.</p>
        </Panel>
        <Panel className="p-6">
          <p className="text-sm text-muted">Planned Module</p>
          <h3 className="mt-3 text-xl font-display text-text">Automation</h3>
          <p className="mt-3 text-sm leading-6 text-muted">Prepare the shell for recurring workflows and assistant-driven tasks.</p>
        </Panel>
      </div>
    </section>
  );
}
```

`src/modules/dashboard/DashboardLayout.tsx`

```tsx
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
            <NavLink to="/app">Home</NavLink>
            <NavLink to="/app/todo">Todo</NavLink>
            <NavLink to="/">Public Hub</NavLink>
          </nav>
          <div className="mt-auto space-y-3 border-t border-border pt-6">
            <p className="text-sm text-muted">{sessionQuery.data?.user.displayName ?? "Owner"}</p>
            <button type="button" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? "Closing..." : "Logout"}
            </button>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel className="flex items-center justify-between gap-4 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-accent">Context</p>
              <p className="mt-2 text-lg text-text">Private Workspace</p>
              <p className="mt-1 text-sm text-muted">A calm operating surface for active tools and future modules.</p>
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
```

`src/app/router/AppRouter.tsx`

```tsx
import { DashboardHomePage } from "../../modules/dashboard/DashboardHomePage";

// inside AppRoutes
<Route element={<RequireAuth />}>
  <Route path="/app" element={<DashboardLayout />}>
    <Route index element={<DashboardHomePage />} />
    <Route path="todo" element={<TodoPage />} />
  </Route>
</Route>
```

- [ ] **Step 4: Run the dashboard tests to verify they pass**

Run: `cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client && npm test -- src/test/dashboard.layout.test.tsx src/test/auth.require-auth.test.tsx`
Expected: PASS with the new shell test green and the auth guard still redirecting unauthenticated access.

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design
git add chidinh_client/src/modules/dashboard/DashboardHomePage.tsx chidinh_client/src/modules/dashboard/DashboardLayout.tsx chidinh_client/src/app/router/AppRouter.tsx chidinh_client/src/test/dashboard.layout.test.tsx chidinh_client/src/test/auth.require-auth.test.tsx
git commit -m "feat: add private workspace shell"
```

## Task 4: Redesign the Todo Module as a Workspace Tool

**Files:**
- Modify: `chidinh_client/src/modules/todo/TodoPage.tsx`
- Modify: `chidinh_client/src/test/todo.page.test.tsx`

- [ ] **Step 1: Extend the todo tests to cover metrics and empty state**

```tsx
it("shows an empty state when there are no todos", async () => {
  mockFetchSequence(
    jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    jsonResponse({ items: [] }),
  );

  renderTodoRoute();

  expect(await screen.findByRole("heading", { name: /todo operations/i })).toBeInTheDocument();
  expect(screen.getByText(/no active tasks yet/i)).toBeInTheDocument();
  expect(screen.getByText("0")).toBeInTheDocument();
});

it("shows summary metrics for the loaded list", async () => {
  mockFetchSequence(
    jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    jsonResponse({
      items: [
        {
          id: "todo-1",
          title: "Ship the first release",
          completed: false,
          createdAt: "2026-03-31T00:00:00.000Z",
          updatedAt: "2026-03-31T00:00:00.000Z",
        },
        {
          id: "todo-2",
          title: "Archive release notes",
          completed: true,
          createdAt: "2026-03-31T00:00:00.000Z",
          updatedAt: "2026-03-31T00:00:00.000Z",
        },
      ],
    }),
  );

  renderTodoRoute();

  expect(await screen.findByText(/2 total/i)).toBeInTheDocument();
  expect(screen.getByText(/1 open/i)).toBeInTheDocument();
  expect(screen.getByText(/1 complete/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the todo tests to verify they fail**

Run: `cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client && npm test -- src/test/todo.page.test.tsx`
Expected: FAIL because the current page does not render metrics, module framing, or an explicit empty-state message.

- [ ] **Step 3: Refactor the todo page into a structured module surface**

`src/modules/todo/TodoPage.tsx`

```tsx
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  const items = todosQuery.data?.items ?? [];
  const metrics = useMemo(() => {
    const total = items.length;
    const completed = items.filter((item) => item.completed).length;
    return { total, completed, open: total - completed };
  }, [items]);
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: { title: "" },
  });

  const createMutation = useMutation({
    mutationFn: (newTitle: string) => createTodo(newTitle),
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
        eyebrow="Operations"
        title="Todo Operations"
        description="Track active execution tasks inside the private workspace."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Panel className="p-5"><p>{metrics.total} total</p></Panel>
        <Panel className="p-5"><p>{metrics.open} open</p></Panel>
        <Panel className="p-5"><p>{metrics.completed} complete</p></Panel>
      </div>
      <Panel className="p-6">
        <form className="flex flex-col gap-3 md:flex-row" onSubmit={form.handleSubmit(({ title }) => createMutation.mutate(title))}>
          <div className="flex-1">
            <label htmlFor="todo-title">Task Title</label>
            <input id="todo-title" placeholder="Add a new task" {...form.register("title")} />
            {form.formState.errors.title ? <p>{form.formState.errors.title.message}</p> : null}
          </div>
          <button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Adding..." : "Add Task"}
          </button>
        </form>
      </Panel>
      {todosQuery.isLoading ? <Panel className="p-6"><p>Loading todos...</p></Panel> : null}
      {todosQuery.isError ? <Panel className="p-6"><p>Failed to load todos.</p></Panel> : null}
      {!todosQuery.isLoading && !todosQuery.isError && items.length === 0 ? (
        <Panel className="p-8 text-center">
          <p className="font-display text-2xl text-text">No active tasks yet.</p>
          <p className="mt-2 text-sm text-muted">Add your first item to start shaping the workspace rhythm.</p>
        </Panel>
      ) : null}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((todo) => (
            <Panel className="flex items-center justify-between gap-4 p-5" key={todo.id}>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(event) => updateMutation.mutate({ id: todo.id, completed: event.target.checked })}
                />
                <span>{todo.title}</span>
              </label>
              <button type="button" onClick={() => deleteMutation.mutate(todo.id)}>
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

Run: `cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client && npm test -- src/test/todo.page.test.tsx`
Expected: PASS with metrics, empty state, create, toggle, and delete flows all green.

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design
git add chidinh_client/src/modules/todo/TodoPage.tsx chidinh_client/src/test/todo.page.test.tsx
git commit -m "feat: redesign todo workspace module"
```

## Task 5: Run Full Frontend Verification and Build

**Files:**
- Modify only if verification exposes a mismatch in copy, imports, or route wiring.
- Test: `chidinh_client/src/test/app-smoke.test.tsx`
- Test: `chidinh_client/src/test/auth.login.test.tsx`
- Test: `chidinh_client/src/test/auth.require-auth.test.tsx`
- Test: `chidinh_client/src/test/dashboard.layout.test.tsx`
- Test: `chidinh_client/src/test/portfolio.page.test.tsx`
- Test: `chidinh_client/src/test/router.test.tsx`
- Test: `chidinh_client/src/test/todo.page.test.tsx`

- [ ] **Step 1: Run the complete frontend test suite**

Run: `cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client && npm test`
Expected: PASS with all route, auth, shell, and todo tests green.

- [ ] **Step 2: Run the production build**

Run: `cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client && npm run build`
Expected: PASS with `tsc --noEmit && vite build` completing successfully and generating the Vite production bundle.

- [ ] **Step 3: Fix any surfaced regressions immediately**

If a test or build fails, limit the fix to the file implicated by the failure before re-running the same command. Typical examples:

```tsx
// If a route assertion fails because copy changed, update the assertion to match the approved spec.
expect(screen.getByRole("heading", { name: /workspace overview/i })).toBeInTheDocument();
```

```tsx
// If a Link import mismatch appears after refactoring shared UI, keep router-aware links inside route components.
import { Link } from "react-router-dom";
```

- [ ] **Step 4: Re-run verification**

Run:

```bash
cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design/chidinh_client
npm test
npm run build
```

Expected: PASS twice in a row with no warnings that imply broken route wiring or missing CSS imports.

- [ ] **Step 5: Commit the verification fix only if files changed**

```bash
cd /mnt/d/chidinh/.worktrees/codex/personal-digital-hub-ui-design
git status --short
git add chidinh_client
git commit -m "test: finalize ui redesign verification"
```
