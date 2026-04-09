# RetroUI App Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the full `chidinh_client` application so the public and private surfaces clearly read as RetroUI-inspired neo-brutalist UI while preserving the current routes, behavior, and content structure.

**Architecture:** Shift the app in layers. First replace the token and base CSS contract, then restyle shared primitives so panels, buttons, fields, labels, and shell elements define the new language, then migrate page-level surfaces to those primitives and remove ad hoc soft styling. Finish by updating tests and verifying the result in browser across light and dark modes.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind v4, React Router, React Query, Vitest, Testing Library

---

### Task 1: Rebuild the global RetroUI token contract

**Files:**
- Modify: `chidinh_client/src/styles/globals.css`
- Test: `chidinh_client/src/test/tailwind.theme.test.ts`

- [ ] **Step 1: Write the failing theme/token assertions**

```ts
it("uses the RetroUI token contract", async () => {
  const cssPath = path.resolve(process.cwd(), "src/styles/globals.css");
  const input = await readFile(cssPath, "utf8");

  expect(input).toContain("--radius: 0.5rem;");
  expect(input).toContain("--background: #FCFFE7;");
  expect(input).toContain("--primary: #EA435F;");
  expect(input).toContain("--secondary: #FFDA5C;");
  expect(input).toContain("--accent: #CEEBFC;");
  expect(input).toContain("--border: #000000;");
  expect(input).toContain("--primary-hover: #D00000;");
  expect(input).toContain(':root[data-theme="dark"]');
  expect(input).toContain(".dark");
});

it("defines hard-edged retro base styling", async () => {
  const cssPath = path.resolve(process.cwd(), "src/styles/globals.css");
  const input = await readFile(cssPath, "utf8");

  expect(input).toContain("border: 2px solid var(--border)");
  expect(input).toContain("box-shadow:");
  expect(input).toContain("background-color: var(--background)");
});
```

- [ ] **Step 2: Run the token test to verify it fails**

Run: `npm run test -- tailwind.theme.test.ts`

Expected: FAIL because the old warm balanced-retro tokens and soft base rules are still present.

- [ ] **Step 3: Replace the token block and base field styles**

```css
:root {
  --radius: 0.5rem;
  --background: #fcffe7;
  --foreground: #000000;
  --muted: #efd0d5;
  --muted-foreground: #a42439;
  --card: #ffffff;
  --card-foreground: #000000;
  --popover: #ffffff;
  --popover-foreground: #000000;
  --border: #000000;
  --input: #ffffff;
  --primary: #ea435f;
  --primary-hover: #d00000;
  --primary-foreground: #ffffff;
  --secondary: #ffda5c;
  --secondary-foreground: #000000;
  --accent: #ceebfc;
  --accent-foreground: #000000;
  --destructive: #d00000;
  --destructive-foreground: #ffffff;
  --ring: #000000;

  --surface-canvas: var(--background);
  --surface-shell: #fffef2;
  --surface-panel: var(--card);
  --surface-panel-muted: #fff3bf;
  --surface-panel-featured: var(--accent);

  --radius-sm: 0.35rem;
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 0.125rem);

  --border-default: var(--border);
  --border-strong: var(--border);
  --border-subtle: var(--border);

  --shadow-crisp-sm: 4px 4px 0 0 rgba(0, 0, 0, 1);
  --shadow-crisp-md: 6px 6px 0 0 rgba(0, 0, 0, 1);
  --shadow-crisp-lg: 8px 8px 0 0 rgba(0, 0, 0, 1);
  --focus-ring: 0 0 0 3px var(--ring);

  --form-state-default-border: var(--border);
  --form-state-hover-border: var(--border);
  --form-state-focus-ring: var(--focus-ring);
  --form-state-error-border: var(--destructive);
  --form-state-error-text: var(--destructive);
  --form-state-disabled-bg: #d9d9d9;
  --form-state-success-border: #1f9d55;
  --form-state-warning-border: #b7791f;
}

:root[data-theme="dark"],
.dark {
  --background: #0f0f0f;
  --foreground: #f5f5f5;
  --muted: #3a1f24;
  --muted-foreground: #f2a7b2;
  --card: #1a1a1a;
  --card-foreground: #ffffff;
  --popover: #1a1a1a;
  --popover-foreground: #ffffff;
  --border: #f5f5f5;
  --input: #2a2a2a;
  --primary: #ea435f;
  --primary-hover: #d00000;
  --primary-foreground: #ffffff;
  --secondary: #ffda5c;
  --secondary-foreground: #000000;
  --accent: #2a3b45;
  --accent-foreground: #ceebfc;
  --destructive: #d00000;
  --destructive-foreground: #ffffff;
  --ring: #ea435f;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  background-image: none;
}

input,
select,
textarea {
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--input);
  box-shadow: var(--shadow-crisp-sm);
}
```

- [ ] **Step 4: Run the token test to verify it passes**

Run: `npm run test -- tailwind.theme.test.ts`

Expected: PASS with the new theme assertions and generated utilities intact.

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/styles/globals.css chidinh_client/src/test/tailwind.theme.test.ts
git commit -m "feat: replace balanced-retro tokens with RetroUI theme"
```

### Task 2: Restyle shared surface and button primitives

**Files:**
- Modify: `chidinh_client/src/shared/ui/Panel.tsx`
- Modify: `chidinh_client/src/shared/ui/Button.tsx`
- Modify: `chidinh_client/src/shared/ui/SectionHeading.tsx`
- Test: `chidinh_client/src/test/panel.test.tsx`
- Test: `chidinh_client/src/test/button.test.tsx`

- [ ] **Step 1: Write failing tests for hard-edged panel and chunky button variants**

```tsx
it("renders panel variants with RetroUI framing", () => {
  render(
    <Panel data-testid="panel" variant="featured">
      Retro block
    </Panel>,
  );

  const panel = screen.getByTestId("panel");
  expect(panel.className).toContain("border-2");
  expect(panel.className).toContain("shadow-[var(--shadow-crisp-md)]");
  expect(panel.className).toContain("bg-[var(--surface-panel-featured)]");
});

it("renders the primary button as a filled RetroUI CTA", () => {
  render(<Button type="button">Open Workspace</Button>);

  const button = screen.getByRole("button", { name: /open workspace/i });
  expect(button.className).toContain("bg-primary");
  expect(button.className).toContain("border-2");
  expect(button.className).toContain("shadow-[var(--shadow-crisp-sm)]");
});
```

- [ ] **Step 2: Run the panel and button tests to verify they fail**

Run: `npm run test -- panel.test.tsx button.test.tsx`

Expected: FAIL because `Panel` and `Button` still use softer borders and subdued shadow behavior.

- [ ] **Step 3: Rebuild `Panel`, `Button`, and `SectionHeading` styling**

```ts
const panelVariants = cva("rounded-[var(--radius-lg)] border-2 shadow-[var(--shadow-crisp-md)]", {
  variants: {
    variant: {
      default: "border-[var(--border)] bg-[var(--surface-panel)] text-card-foreground",
      muted: "border-[var(--border)] bg-secondary text-secondary-foreground",
      featured: "border-[var(--border)] bg-[var(--surface-panel-featured)] text-accent-foreground",
      shell: "border-[var(--border)] bg-[var(--surface-shell)] text-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});
```

```ts
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-[var(--border)] px-4 py-2 text-sm font-black uppercase tracking-[0.08em] transition-transform duration-150 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-55",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-[var(--shadow-crisp-sm)] hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[var(--primary-hover)]",
        secondary: "bg-secondary text-secondary-foreground shadow-[var(--shadow-crisp-sm)] hover:translate-x-[1px] hover:translate-y-[1px]",
        ghost: "bg-card text-foreground shadow-[var(--shadow-crisp-sm)]",
        scope: "justify-start bg-accent text-accent-foreground shadow-[var(--shadow-crisp-sm)]",
        destructive: "bg-destructive text-destructive-foreground shadow-[var(--shadow-crisp-sm)] hover:translate-x-[1px] hover:translate-y-[1px]",
      },
      size: {
        sm: "min-h-9 px-3 text-xs",
        md: "min-h-11 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
```

```tsx
export function SectionHeading({ eyebrow, title, description }: Props) {
  return (
    <header className="max-w-4xl space-y-3">
      <p className="inline-block border-2 border-border bg-secondary px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-secondary-foreground shadow-[var(--shadow-crisp-sm)]">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl uppercase leading-none text-foreground lg:text-5xl">{title}</h2>
      <p className="max-w-2xl text-sm font-medium leading-7 text-foreground/80 lg:text-base">{description}</p>
    </header>
  );
}
```

- [ ] **Step 4: Run the panel and button tests to verify they pass**

Run: `npm run test -- panel.test.tsx button.test.tsx`

Expected: PASS with new primitive expectations.

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/shared/ui/Panel.tsx chidinh_client/src/shared/ui/Button.tsx chidinh_client/src/shared/ui/SectionHeading.tsx chidinh_client/src/test/panel.test.tsx chidinh_client/src/test/button.test.tsx
git commit -m "feat: restyle shared surfaces and buttons for RetroUI"
```

### Task 3: Rebuild form-system primitives around the new field language

**Files:**
- Modify: `chidinh_client/src/shared/form-system/primitives/InputShell.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/SelectTrigger.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/TextareaShell.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/Checkbox.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/Radio.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/Switch.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/Label.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/HelperText.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/ErrorText.tsx`
- Modify: `chidinh_client/src/shared/form-system/patterns/ValidationSummary.tsx`
- Test: `chidinh_client/src/test/form-system.primitives.test.tsx`
- Test: `chidinh_client/src/test/form-system.patterns.test.tsx`
- Test: `chidinh_client/src/test/form-system.dark-mode.test.tsx`

- [ ] **Step 1: Write failing tests for stronger field framing and validation summary treatment**

```tsx
test("styles InputShell as a hard-edged field shell", () => {
  render(<InputShell aria-label="Project name" />);

  const input = screen.getByRole("textbox", { name: "Project name" });
  expect(input).toHaveClass("border-2");
  expect(input).toHaveClass("shadow-[var(--shadow-crisp-sm)]");
});

test("renders ValidationSummary as a framed alert block", () => {
  render(<ValidationSummary errors={[{ fieldId: "title", message: "Title is required" }]} />);

  const summary = screen.getByRole("alert");
  expect(summary).toHaveClass("border-2");
  expect(summary).toHaveClass("shadow-[var(--shadow-crisp-sm)]");
});
```

- [ ] **Step 2: Run the form-system suites to verify they fail**

Run: `npm run test -- form-system.primitives.test.tsx form-system.patterns.test.tsx form-system.dark-mode.test.tsx`

Expected: FAIL because the old softer field shell and summary styles are still encoded.

- [ ] **Step 3: Replace the field shell and messaging styles**

```ts
const fieldShellBaseClassName = [
  "w-full",
  "rounded-[var(--radius-md)]",
  "border-2",
  "border-[var(--border)]",
  "bg-[var(--input)]",
  "px-4",
  "py-3",
  "text-sm",
  "font-medium",
  "text-foreground",
  "shadow-[var(--shadow-crisp-sm)]",
  "outline-none",
  "transition-transform",
  "duration-150",
  "placeholder:text-foreground/50",
  "hover:translate-x-[1px]",
  "hover:translate-y-[1px]",
  "focus-visible:shadow-[var(--focus-ring)]",
  "aria-[invalid=true]:border-[var(--destructive)]",
].join(" ");
```

```tsx
export function Label({ className, ...props }: LabelProps) {
  return (
    <RadixLabel.Root
      className={["block text-xs font-black uppercase tracking-[0.14em] text-foreground", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
```

```tsx
export function ValidationSummary({ className, errors, title, ...props }: ValidationSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div
      className={[
        "rounded-[var(--radius-lg)] border-2 border-[var(--destructive)] bg-[var(--card)] px-5 py-4 text-[var(--destructive)] shadow-[var(--shadow-crisp-sm)]",
        className,
      ].filter(Boolean).join(" ")}
      role="alert"
      {...props}
    >
      <p className="text-sm font-black uppercase tracking-[0.08em]">{title ?? `Please fix the following ${errors.length} ${errors.length === 1 ? "field" : "fields"}:`}</p>
      <ul className="mt-3 space-y-2 text-sm font-medium">
        {errors.map((error) => (
          <li key={`${error.fieldId}:${error.message}`}>
            <a className="underline decoration-2 underline-offset-2" href={`#${error.fieldId}`}>
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Run the form-system suites to verify they pass**

Run: `npm run test -- form-system.primitives.test.tsx form-system.patterns.test.tsx form-system.dark-mode.test.tsx`

Expected: PASS with the updated hard-edged field and alert semantics.

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/shared/form-system/primitives/InputShell.tsx chidinh_client/src/shared/form-system/primitives/SelectTrigger.tsx chidinh_client/src/shared/form-system/primitives/TextareaShell.tsx chidinh_client/src/shared/form-system/primitives/Checkbox.tsx chidinh_client/src/shared/form-system/primitives/Radio.tsx chidinh_client/src/shared/form-system/primitives/Switch.tsx chidinh_client/src/shared/form-system/primitives/Label.tsx chidinh_client/src/shared/form-system/primitives/HelperText.tsx chidinh_client/src/shared/form-system/primitives/ErrorText.tsx chidinh_client/src/shared/form-system/patterns/ValidationSummary.tsx chidinh_client/src/test/form-system.primitives.test.tsx chidinh_client/src/test/form-system.patterns.test.tsx chidinh_client/src/test/form-system.dark-mode.test.tsx
git commit -m "feat: restyle form primitives with RetroUI field language"
```

### Task 4: Reframe the app shell and shared navigation

**Files:**
- Modify: `chidinh_client/src/modules/dashboard/DashboardLayout.tsx`
- Modify: `chidinh_client/src/shared/ui/SidebarNav.tsx`
- Modify: `chidinh_client/src/shared/ui/WindowFrame.tsx`
- Modify: `chidinh_client/src/shared/ui/SystemBar.tsx`
- Test: `chidinh_client/src/test/shared.desktop-shell.test.tsx`
- Test: `chidinh_client/src/test/dashboard.layout.test.tsx`

- [ ] **Step 1: Write failing shell tests for module-board framing**

```tsx
it("renders the sidebar as a framed shell panel", () => {
  renderSidebarNav();

  expect(screen.getByLabelText(/dashboard navigation/i).parentElement?.className).toContain("shadow-[var(--shadow-crisp-md)]");
});

it("renders dashboard layout controls with framed shell surfaces", async () => {
  renderDashboardLayout();

  expect(screen.getByText(/private workspace/i).closest("div")?.className).toContain("shadow-[var(--shadow-crisp-md)]");
});
```

- [ ] **Step 2: Run the shell tests to verify they fail**

Run: `npm run test -- shared.desktop-shell.test.tsx dashboard.layout.test.tsx`

Expected: FAIL because the current shell still uses lighter panel and nav treatments.

- [ ] **Step 3: Rewrite shell framing classes**

```tsx
<Panel className="flex min-h-[calc(100vh-3rem)] flex-col gap-5 bg-secondary p-5 shadow-[var(--shadow-crisp-lg)]" variant="shell">
  <div className="space-y-2 border-b-2 border-border pb-4">
    <p className="inline-block border-2 border-border bg-card px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-foreground shadow-[var(--shadow-crisp-sm)]">Private Hub</p>
    <h1 className="font-display text-3xl uppercase leading-none text-foreground">Workspace</h1>
  </div>
</Panel>
```

```tsx
<NavLink
  className={({ isActive }) =>
    [
      "group rounded-[var(--radius-md)] border-2 px-3 py-3 text-sm font-black uppercase tracking-[0.08em] shadow-[var(--shadow-crisp-sm)] transition-transform",
      isActive ? "border-border bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
    ].join(" ")
  }
>
```

```tsx
<Panel className="flex flex-wrap items-center justify-between gap-3 p-5 shadow-[var(--shadow-crisp-md)]" variant="featured">
  ...
</Panel>
```

- [ ] **Step 4: Run the shell tests to verify they pass**

Run: `npm run test -- shared.desktop-shell.test.tsx dashboard.layout.test.tsx`

Expected: PASS with the stronger shell framing.

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/modules/dashboard/DashboardLayout.tsx chidinh_client/src/shared/ui/SidebarNav.tsx chidinh_client/src/shared/ui/WindowFrame.tsx chidinh_client/src/shared/ui/SystemBar.tsx chidinh_client/src/test/shared.desktop-shell.test.tsx chidinh_client/src/test/dashboard.layout.test.tsx
git commit -m "feat: reframe dashboard shell with RetroUI panels"
```

### Task 5: Restyle the public portfolio and login pages

**Files:**
- Modify: `chidinh_client/src/modules/portfolio/PortfolioPage.tsx`
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
- Test: `chidinh_client/src/test/portfolio.page.test.tsx`
- Test: `chidinh_client/src/test/auth.login.test.tsx`
- Test: `chidinh_client/src/test/form-system.pilot-login.test.tsx`

- [ ] **Step 1: Write failing page tests for poster-like public framing and bold login panels**

```tsx
it("renders the portfolio hero with framed RetroUI blocks", () => {
  renderPortfolioPage();

  expect(screen.getByRole("heading", { name: /personal digital hub/i }).className).toContain("uppercase");
});

it("renders the login shell as two framed panels", () => {
  renderLoginPage();

  expect(screen.getAllByText(/private hub|enter workspace/i).length).toBeGreaterThan(0);
  expect(screen.getByTestId("login-shell-grid").className).toContain("lg:grid-cols");
});
```

- [ ] **Step 2: Run the portfolio and login tests to verify they fail**

Run: `npm run test -- portfolio.page.test.tsx auth.login.test.tsx form-system.pilot-login.test.tsx`

Expected: FAIL where tests assume the softer heading and panel language.

- [ ] **Step 3: Rewrite the portfolio hero and login panel treatments**

```tsx
<main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-8 lg:px-10 lg:py-10">
  <Panel className="overflow-hidden border-2 p-0 shadow-[var(--shadow-crisp-lg)]">
    <div className="grid gap-0 lg:grid-cols-[1.35fr_0.85fr]">
      <div className="bg-secondary px-6 py-8 lg:px-10 lg:py-12">
        ...
      </div>
      <div className="bg-accent px-6 py-8 lg:px-8 lg:py-12">
        ...
      </div>
    </div>
  </Panel>
</main>
```

```tsx
<main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
  <div className="grid w-full gap-6 lg:grid-cols-[1fr_0.92fr]" data-testid="login-shell-grid">
    <Panel className="border-2 bg-secondary p-8 shadow-[var(--shadow-crisp-lg)] lg:p-10">
      ...
    </Panel>
    <Panel className="border-2 bg-card p-8 shadow-[var(--shadow-crisp-lg)] lg:p-10">
      ...
    </Panel>
  </div>
</main>
```

- [ ] **Step 4: Run the portfolio and login tests to verify they pass**

Run: `npm run test -- portfolio.page.test.tsx auth.login.test.tsx form-system.pilot-login.test.tsx`

Expected: PASS with the updated page framing.

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/modules/portfolio/PortfolioPage.tsx chidinh_client/src/modules/auth/LoginPage.tsx chidinh_client/src/test/portfolio.page.test.tsx chidinh_client/src/test/auth.login.test.tsx chidinh_client/src/test/form-system.pilot-login.test.tsx
git commit -m "feat: restyle portfolio and login pages with RetroUI framing"
```

### Task 6: Migrate the todo experience fully onto the new system

**Files:**
- Modify: `chidinh_client/src/modules/todo/TodoPage.tsx`
- Modify: `chidinh_client/src/modules/todo/TodoForm.tsx`
- Modify: `chidinh_client/src/modules/todo/TodoToolbar.tsx`
- Modify: `chidinh_client/src/modules/todo/TodoList.tsx`
- Modify: `chidinh_client/src/modules/todo/TodoMetrics.tsx`
- Test: `chidinh_client/src/test/todo.page.test.tsx`
- Test: `chidinh_client/src/test/todo-form.layout.test.tsx`
- Test: `chidinh_client/src/test/form-system.pilot-todo.test.tsx`

- [ ] **Step 1: Write failing tests for replacing ad hoc todo styling**

```tsx
it("renders todo toolbar with shared field and panel language", async () => {
  renderTodoPage();

  expect(await screen.findByLabelText(/view/i)).toHaveClass("border-2");
  expect(screen.getByLabelText(/search/i)).toHaveClass("shadow-[var(--shadow-crisp-sm)]");
});

it("renders todo item actions with shared button language", async () => {
  renderTodoPageWithItems();

  expect(await screen.findByRole("button", { name: /edit/i })).toHaveClass("border-2");
});
```

- [ ] **Step 2: Run the todo tests to verify they fail**

Run: `npm run test -- todo.page.test.tsx todo-form.layout.test.tsx form-system.pilot-todo.test.tsx`

Expected: FAIL because `TodoToolbar`, `TodoList`, and `TodoForm` still contain generic native controls and rounded-full utility buttons.

- [ ] **Step 3: Replace page-level ad hoc controls with shared primitives and matching variants**

```tsx
<div className="space-y-2">
  <Label htmlFor="todo-view">View</Label>
  <SelectTrigger id="todo-view" value={view} onChange={(event) => onViewChange(event.target.value as TaskListView)}>
    <option value="active">All active</option>
    <option value="today">Today</option>
    <option value="upcoming">Upcoming</option>
    <option value="overdue">Overdue</option>
    <option value="completed">Completed</option>
    <option value="archived">Archived</option>
  </SelectTrigger>
</div>
```

```tsx
<Button type="button" variant="secondary" size="sm" onClick={() => onEdit(todo)}>
  Edit
</Button>
<Button type="button" variant="ghost" size="sm" onClick={() => onToggleArchive(todo)}>
  {todo.archivedAt ? "Unarchive" : "Archive"}
</Button>
<Button type="button" variant="destructive" size="sm" onClick={() => onDelete(todo.id)}>
  Delete
</Button>
```

```tsx
<div
  ref={descriptionEditorRef}
  role="textbox"
  aria-label="Task description"
  contentEditable
  className="min-h-28 rounded-[var(--radius-md)] border-2 border-border bg-input px-4 py-3 text-sm font-medium text-foreground shadow-[var(--shadow-crisp-sm)]"
  onInput={(event) => onDescriptionInput(event.currentTarget.innerHTML)}
/>;
```

- [ ] **Step 4: Run the todo tests to verify they pass**

Run: `npm run test -- todo.page.test.tsx todo-form.layout.test.tsx form-system.pilot-todo.test.tsx`

Expected: PASS with all todo surfaces visually aligned to the shared RetroUI system.

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/modules/todo/TodoPage.tsx chidinh_client/src/modules/todo/TodoForm.tsx chidinh_client/src/modules/todo/TodoToolbar.tsx chidinh_client/src/modules/todo/TodoList.tsx chidinh_client/src/modules/todo/TodoMetrics.tsx chidinh_client/src/test/todo.page.test.tsx chidinh_client/src/test/todo-form.layout.test.tsx chidinh_client/src/test/form-system.pilot-todo.test.tsx
git commit -m "feat: migrate todo surfaces onto RetroUI system"
```

### Task 7: Run full verification and browser checks

**Files:**
- Modify: `chidinh_client/src/test/*.tsx` as needed for final expectation alignment
- Verify: `chidinh_client/src/styles/globals.css`
- Verify: `chidinh_client/src/shared/ui/*`
- Verify: `chidinh_client/src/shared/form-system/*`
- Verify: `chidinh_client/src/modules/*`

- [ ] **Step 1: Run the focused UI suite**

Run: `npm run test -- tailwind.theme.test.ts panel.test.tsx button.test.tsx form-system.primitives.test.tsx form-system.patterns.test.tsx form-system.dark-mode.test.tsx auth.login.test.tsx portfolio.page.test.tsx dashboard.layout.test.tsx shared.desktop-shell.test.tsx todo-form.layout.test.tsx todo.page.test.tsx form-system.pilot-login.test.tsx form-system.pilot-todo.test.tsx`

Expected: PASS with all updated visual-contract tests green.

- [ ] **Step 2: Run the full project test suite**

Run: `npm run test`

Expected: PASS with no regressions outside the restyled surfaces.

- [ ] **Step 3: Build the app**

Run: `npm run build`

Expected: PASS with `vite build` completion and no TypeScript errors.

- [ ] **Step 4: Verify in the browser**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Check manually:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5173/login
http://127.0.0.1:5173/app
http://127.0.0.1:5173/app/todo
```

Expected:

- The app reads immediately as RetroUI-inspired in light mode.
- Dark mode keeps the same framed, graphic, high-contrast attitude.
- No major generic-style outliers remain on todo, login, portfolio, or dashboard shell surfaces.

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src docs/superpowers/plans/2026-04-03-retroui-app-restyle.md
git commit -m "test: verify RetroUI restyle end to end"
```
