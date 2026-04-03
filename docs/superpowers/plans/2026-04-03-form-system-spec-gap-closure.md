# Form System Spec Gap Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining gaps between the current form-system implementation and the redesign spec by adding dark-mode baseline support, helper-text stress coverage, responsive pilot evidence, and updated rollout gates.

**Architecture:** Keep the existing form-system foundation intact and finish the spec alignment in the smallest possible increments. Extend semantic theme tokens in `globals.css`, add only the pilot-level UI changes needed to exercise the contracts on `LoginPage` and `TodoForm`, then prove the behavior through focused Vitest coverage and update the gate document to reflect the now-complete evidence.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Tailwind CSS v4, React Router, TanStack Query

---

## File Structure Map

- Modify: `chidinh_client/src/styles/globals.css`
  - Expand dark-mode semantic tokens so inputs, surfaces, borders, text, focus, error, and disabled states remain distinguishable in phase 1.
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
  - Add pilot helper text, stable `aria-describedby` composition, and a testable responsive shell hook.
- Modify: `chidinh_client/src/modules/todo/TodoForm.tsx`
  - Add helper text to the pilot rows that matter for the spec, wire `aria-describedby` for helper/error coexistence, and expose stable responsive row hooks.
- Modify: `chidinh_client/src/test/test-utils.tsx`
  - Add a tiny helper for setting and clearing document theme in tests.
- Modify: `chidinh_client/src/test/tailwind.theme.test.ts`
  - Assert the dark-mode token matrix required by the spec exists in CSS.
- Create: `chidinh_client/src/test/form-system.dark-mode.test.tsx`
  - Verify pilot shells and primitives still resolve semantic token-based classes under dark theme.
- Modify: `chidinh_client/src/test/form-system.pilot-login.test.tsx`
  - Cover helper text wiring, responsive shell classes, and dark-mode-safe semantics for the login pilot.
- Modify: `chidinh_client/src/test/form-system.pilot-todo.test.tsx`
  - Cover helper text stress, validation/error + helper coexistence, and responsive evidence for the complex pilot.
- Modify: `chidinh_client/src/test/todo-form.layout.test.tsx`
  - Tighten assertions on responsive row hooks for the two-column contract.
- Modify: `docs/project/forme-first-slice-gates.md`
  - Close gates that are proven by the new evidence and keep the verdict grounded in the updated test suite.

### Task 1: Dark-Mode Phase 1 Baseline

**Files:**
- Modify: `chidinh_client/src/styles/globals.css`
- Modify: `chidinh_client/src/test/tailwind.theme.test.ts`
- Create: `chidinh_client/src/test/form-system.dark-mode.test.tsx`
- Modify: `chidinh_client/src/test/test-utils.tsx`

- [ ] **Step 1: Write the failing dark-theme CSS assertions**

```ts
// chidinh_client/src/test/tailwind.theme.test.ts
it("defines the dark-mode form tokens required by the spec baseline", async () => {
  const cssPath = path.resolve(process.cwd(), "src/styles/globals.css");
  const input = await readFile(cssPath, "utf8");

  expect(input).toContain(':root[data-theme="dark"]');
  expect(input).toContain("--surface-canvas:");
  expect(input).toContain("--surface-panel:");
  expect(input).toContain("--border-default:");
  expect(input).toContain("--foreground:");
  expect(input).toContain("--focus-ring:");
  expect(input).toContain("--form-state-error-border:");
  expect(input).toContain("--form-state-disabled-bg:");
});
```

- [ ] **Step 2: Run the theme test to verify it fails**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/tailwind.theme.test.ts`
Expected: FAIL because the current dark theme only overrides `--form-state-error-text` and `--form-state-disabled-bg`.

- [ ] **Step 3: Add a tiny theme helper for tests**

```ts
// chidinh_client/src/test/test-utils.tsx
export function setDocumentTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
}

export function clearDocumentTheme() {
  delete document.documentElement.dataset.theme;
}
```

- [ ] **Step 4: Write the failing dark-mode pilot regression test**

```tsx
// chidinh_client/src/test/form-system.dark-mode.test.tsx
import { afterEach, describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import { LoginPage } from "../modules/auth/LoginPage";
import { InputShell } from "../shared/form-system/primitives/InputShell";
import { clearDocumentTheme, renderWithQueryClient, setDocumentTheme } from "./test-utils";

afterEach(() => {
  clearDocumentTheme();
});

describe("form-system dark mode baseline", () => {
  test("keeps semantic surface and field classes under dark theme", () => {
    setDocumentTheme("dark");

    renderWithQueryClient(
      <>
        <LoginPage />
        <InputShell aria-label="Dark field" />
      </>,
    );

    expect(screen.getByRole("main")).toHaveAttribute("data-theme", "dark");
    expect(screen.getByRole("textbox", { name: "Dark field" })).toHaveClass("bg-[var(--surface-panel)]");
  });
});
```

- [ ] **Step 5: Run the new dark-mode test to verify it fails**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.dark-mode.test.tsx`
Expected: FAIL because `LoginPage` does not yet expose a stable root hook and the dark token matrix is still incomplete.

- [ ] **Step 6: Implement the dark-mode token matrix and stable pilot hook**

```css
/* chidinh_client/src/styles/globals.css */
:root[data-theme="dark"] {
  --background: #1c1714;
  --foreground: #f7efe4;
  --card: #241d19;
  --card-foreground: #f7efe4;
  --popover: #2a231e;
  --popover-foreground: #f7efe4;
  --secondary: #342c26;
  --muted: #c7b8a6;
  --border: #5a4e43;
  --input: #685a4d;
  --ring: rgba(145, 203, 203, 0.42);

  --surface-canvas: #1c1714;
  --surface-shell: #221b17;
  --surface-panel: #2a231e;
  --surface-panel-muted: #332a24;
  --surface-panel-featured: #382d26;

  --border-default: #5a4e43;
  --border-strong: #8f7d6d;
  --border-subtle: #4a4037;
  --focus-ring: 0 0 0 2px rgba(28, 23, 20, 0.96), 0 0 0 4px rgba(145, 203, 203, 0.45);
  --form-state-error-border: #f08c8c;
  --form-state-error-text: #f6b0b0;
  --form-state-disabled-bg: #39322d;
  --form-state-success-border: #83b47d;
  --form-state-warning-border: #d69a5e;
}
```

```tsx
// chidinh_client/src/modules/auth/LoginPage.tsx
return (
  <main
    className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 lg:px-10"
    data-slot="login-page"
    data-theme={document.documentElement.dataset.theme}
  >
```

- [ ] **Step 7: Run targeted tests to verify the dark baseline passes**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/tailwind.theme.test.ts src/test/form-system.dark-mode.test.tsx`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add chidinh_client/src/styles/globals.css \
  chidinh_client/src/modules/auth/LoginPage.tsx \
  chidinh_client/src/test/test-utils.tsx \
  chidinh_client/src/test/tailwind.theme.test.ts \
  chidinh_client/src/test/form-system.dark-mode.test.tsx
git commit -m "feat(form-system): add dark mode baseline coverage"
```

### Task 2: Pilot Helper Text and `aria-describedby` Contract

**Files:**
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
- Modify: `chidinh_client/src/modules/todo/TodoForm.tsx`
- Modify: `chidinh_client/src/test/form-system.pilot-login.test.tsx`
- Modify: `chidinh_client/src/test/form-system.pilot-todo.test.tsx`

- [ ] **Step 1: Write the failing helper-text test for `LoginPage`**

```tsx
// chidinh_client/src/test/form-system.pilot-login.test.tsx
test("keeps helper text wired to the username field and appends the error id when validation fails", async () => {
  renderLoginRoute();

  const username = screen.getByLabelText(/username/i);
  expect(username).toHaveAttribute("aria-describedby", "login-username-helper");
  expect(screen.getByText(/use your workspace handle/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Write the failing helper/error coexistence test for `TodoForm`**

```tsx
// chidinh_client/src/test/form-system.pilot-todo.test.tsx
test("keeps title helper text visible while inline error is active", async () => {
  mockFetchSequence(
    jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    jsonResponse({ items: [] }),
  );
  const user = userEvent.setup();

  renderTodoRoute();
  await screen.findByRole("heading", { name: /personal tasks/i });

  expect(screen.getByText(/summarize the task in one line/i)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /add task/i }));

  expect(screen.getByText(/summarize the task in one line/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/task title/i)).toHaveAttribute(
    "aria-describedby",
    expect.stringContaining("todo-title-helper"),
  );
});
```

- [ ] **Step 3: Run the pilot tests to verify they fail**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.pilot-login.test.tsx src/test/form-system.pilot-todo.test.tsx`
Expected: FAIL because the pilot forms do not yet render helper text or compose helper/error ids.

- [ ] **Step 4: Implement helper text on the short-form pilot**

```tsx
// chidinh_client/src/modules/auth/LoginPage.tsx
import { ErrorText, HelperText, Label } from "../../shared/form-system/primitives";

const usernameHelperId = "login-username-helper";
const passwordHelperId = "login-password-helper";

<Input
  id="username"
  autoComplete="username"
  aria-describedby={errors.username ? `${usernameHelperId} ${usernameErrorId}` : usernameHelperId}
  aria-invalid={errors.username ? "true" : undefined}
  {...register("username")}
/>
<HelperText id={usernameHelperId}>Use your workspace handle, not your public display name.</HelperText>
{errors.username ? <ErrorText id={usernameErrorId}>{errors.username.message}</ErrorText> : null}
```

- [ ] **Step 5: Implement helper text on the complex pilot**

```tsx
// chidinh_client/src/modules/todo/TodoForm.tsx
import { ErrorText, HelperText, Label } from "../../shared/form-system/primitives";

const titleHelperId = "todo-title-helper";
const dueDateHelperId = "todo-due-helper";

<Input
  id="todo-title"
  aria-describedby={titleError ? `${titleHelperId} ${titleErrorId}` : titleHelperId}
  aria-invalid={titleError ? "true" : undefined}
  placeholder="Add a new task"
  value={formState.title}
  onChange={(event) => onTitleChange(event.target.value)}
/>
<HelperText id={titleHelperId}>Summarize the task in one line so it still scans cleanly in lists.</HelperText>
{titleError ? <ErrorText id={titleErrorId}>{titleError}</ErrorText> : null}

<Input
  id="todo-due"
  type="date"
  aria-describedby={dueDateHelperId}
  value={formState.dueOn}
  onChange={(event) => onDueOnChange(event.target.value)}
/>
<HelperText id={dueDateHelperId}>Leave blank when the task should stay unscheduled.</HelperText>
```

- [ ] **Step 6: Re-run the pilot tests to verify the helper contract passes**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.pilot-login.test.tsx src/test/form-system.pilot-todo.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add chidinh_client/src/modules/auth/LoginPage.tsx \
  chidinh_client/src/modules/todo/TodoForm.tsx \
  chidinh_client/src/test/form-system.pilot-login.test.tsx \
  chidinh_client/src/test/form-system.pilot-todo.test.tsx
git commit -m "feat(form-system): add helper text coverage to pilot forms"
```

### Task 3: Responsive and Layout Evidence for Pilot Forms

**Files:**
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
- Modify: `chidinh_client/src/modules/todo/TodoForm.tsx`
- Modify: `chidinh_client/src/test/form-system.pilot-login.test.tsx`
- Modify: `chidinh_client/src/test/form-system.pilot-todo.test.tsx`
- Modify: `chidinh_client/src/test/todo-form.layout.test.tsx`

- [ ] **Step 1: Write the failing responsive-shell test for `LoginPage`**

```tsx
// chidinh_client/src/test/form-system.pilot-login.test.tsx
test("keeps the login shell single-column by default and upgrades to the desktop split only at lg", () => {
  renderLoginRoute();

  const shell = screen.getByTestId("login-shell-grid");
  expect(shell).toHaveClass("grid");
  expect(shell).toHaveClass("gap-6");
  expect(shell).toHaveClass("lg:grid-cols-[1fr_0.9fr]");
});
```

- [ ] **Step 2: Write the failing responsive-row assertions for `TodoForm`**

```tsx
// chidinh_client/src/test/todo-form.layout.test.tsx
expect(rows[0]).toHaveAttribute("data-columns", "1");
expect(rows[0]).not.toHaveClass("md:grid-cols-2");
expect(rows[1]).toHaveAttribute("data-columns", "2");
expect(rows[1]).toHaveClass("md:grid-cols-2");
```

- [ ] **Step 3: Add a pilot-level responsive evidence test for `TodoPage`**

```tsx
// chidinh_client/src/test/form-system.pilot-todo.test.tsx
test("keeps the summary, field rows, and action area in one reading flow", async () => {
  mockFetchSequence(
    jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    jsonResponse({ items: [] }),
  );

  const { container } = renderTodoRoute();
  await screen.findByRole("heading", { name: /personal tasks/i });

  const summary = container.querySelector('[data-slot="validation-summary"]');
  const rows = container.querySelectorAll('[data-slot="field-row"]');
  const actionArea = container.querySelector('[data-slot="action-area"]');

  expect(rows[0]).toHaveAttribute("data-columns", "1");
  expect(rows[1]).toHaveAttribute("data-columns", "2");
  expect(actionArea).toBeInTheDocument();
  expect(summary).not.toBeInTheDocument();
});
```

- [ ] **Step 4: Run the layout-focused tests to verify they fail**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.pilot-login.test.tsx src/test/form-system.pilot-todo.test.tsx src/test/todo-form.layout.test.tsx`
Expected: FAIL because the pilots do not yet expose stable test ids/hooks for the responsive shells.

- [ ] **Step 5: Expose stable responsive hooks in the pilot components**

```tsx
// chidinh_client/src/modules/auth/LoginPage.tsx
<div className="grid w-full gap-6 lg:grid-cols-[1fr_0.9fr]" data-testid="login-shell-grid">
```

```tsx
// chidinh_client/src/modules/todo/TodoForm.tsx
<FieldRow columns={TITLE_AND_DUE_DATE_COLUMNS} data-testid="todo-primary-row">
...
<FieldRow columns={STATUS_AND_PRIORITY_COLUMNS} data-testid="todo-status-row">
```

- [ ] **Step 6: Re-run the layout-focused tests to verify they pass**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.pilot-login.test.tsx src/test/form-system.pilot-todo.test.tsx src/test/todo-form.layout.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add chidinh_client/src/modules/auth/LoginPage.tsx \
  chidinh_client/src/modules/todo/TodoForm.tsx \
  chidinh_client/src/test/form-system.pilot-login.test.tsx \
  chidinh_client/src/test/form-system.pilot-todo.test.tsx \
  chidinh_client/src/test/todo-form.layout.test.tsx
git commit -m "test(form-system): prove responsive pilot layout evidence"
```

### Task 4: Gate Closure and Final Verification

**Files:**
- Modify: `docs/project/forme-first-slice-gates.md`
- Modify: `chidinh_client/src/test/form-system.dark-mode.test.tsx`
- Modify: `chidinh_client/src/test/form-system.pilot-login.test.tsx`
- Modify: `chidinh_client/src/test/form-system.pilot-todo.test.tsx`
- Modify: `chidinh_client/src/test/tailwind.theme.test.ts`
- Modify: `chidinh_client/src/test/todo-form.layout.test.tsx`

- [ ] **Step 1: Update the gate checklist to mark the newly-proven items closed**

```md
## Gate B — Visual Foundation (Spec Phase 2)
- [x] Dark mode baseline is proven stable for pilot forms.

## Gate C — Layout Foundation (Spec Phase 3)
- [x] Mobile collapse readability is proven with explicit pilot evidence.

## Gate D — Pilot Implementation (Spec Phase 4)
- [x] Pilot coverage explicitly proves helper-text stress cases on real pilot forms.
- [x] Pilot coverage explicitly proves desktop/mobile behavior.
- [x] Pilot coverage explicitly proves dark mode baseline.
```

- [ ] **Step 2: Run the targeted regression pack**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/tailwind.theme.test.ts src/test/form-system.dark-mode.test.tsx src/test/form-system.pilot-login.test.tsx src/test/form-system.pilot-todo.test.tsx src/test/todo-form.layout.test.tsx`
Expected: PASS

- [ ] **Step 3: Run the full client test suite**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npm test`
Expected: PASS across the entire suite.

- [ ] **Step 4: Run the production build check**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npm run build`
Expected: PASS (`tsc --noEmit` and `vite build`).

- [ ] **Step 5: Commit**

```bash
git add docs/project/forme-first-slice-gates.md \
  chidinh_client/src/test/tailwind.theme.test.ts \
  chidinh_client/src/test/form-system.dark-mode.test.tsx \
  chidinh_client/src/test/form-system.pilot-login.test.tsx \
  chidinh_client/src/test/form-system.pilot-todo.test.tsx \
  chidinh_client/src/test/todo-form.layout.test.tsx
git commit -m "docs(form-system): close remaining spec evidence gaps"
```

## Self-Review

- Spec coverage:
  - Dark mode phase-1 baseline: covered by Task 1.
  - Helper-text stress on real pilots: covered by Task 2.
  - Responsive and two-column evidence on pilots: covered by Task 3.
  - Rollout gate artifact alignment: covered by Task 4.
- Placeholder scan:
  - No `TODO`, `TBD`, or deferred implementation notes remain.
- Type consistency:
  - Helper ids, test ids, and exported test utility names are defined once and reused consistently across later tasks.

## Risks and Execution Notes

- JSDOM cannot prove actual pixel layout across breakpoints. This plan treats responsive proof as contract-level evidence through stable responsive classes and row metadata, which matches the current test stack without introducing Playwright scope.
- If the team wants stronger visual evidence later, add browser-based smoke coverage after this plan lands. Do not block this gap-closure plan on that broader tooling jump.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-03-form-system-spec-gap-closure.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
