# Form System Post-Push Follow-Up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining spec-package parity gaps after the `main` push by adding readonly-vs-disabled field states, making `SelectTrigger` a real v1 select primitive used in pilots, and correcting pilot/gate evidence for helper-text and responsive claims.

**Architecture:** Keep the current v1 form-system contracts and tighten them rather than introducing a new subsystem. Extend the primitive layer with missing state behavior, evolve `SelectTrigger` into the actual styled native select shell while keeping the exported v1 name stable, then add pilot coverage and update the rollout gate document so every claim matches evidence.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Tailwind CSS v4, React Router, TanStack Query

---

## File Structure Map

- Modify: `chidinh_client/src/shared/form-system/primitives/InputShell.tsx`
  - Add readonly-specific classes so readonly remains readable and visually distinct from disabled.
- Modify: `chidinh_client/src/shared/form-system/primitives/TextareaShell.tsx`
  - Inherit the same readonly contract as `InputShell` and prove it with tests.
- Modify: `chidinh_client/src/shared/form-system/primitives/SelectTrigger.tsx`
  - Convert the primitive from a button shell into the actual styled native select control while keeping the `SelectTrigger` export name required by the frozen v1 contract.
- Modify: `chidinh_client/src/shared/form-system/primitives/Checkbox.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/Radio.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/Switch.tsx`
  - Align readonly/disabled/selected emphasis rules across interactive controls.
- Modify: `chidinh_client/src/modules/todo/TodoForm.tsx`
  - Replace raw `<select>` usage with the shared select primitive and add one helper-text stress case that intentionally spans multiple lines.
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
  - Add one longer helper-text case so the short-form pilot proves helper rhythm without changing action hierarchy.
- Modify: `chidinh_client/src/test/form-system.primitives.test.tsx`
  - Add failing tests for readonly delta and real select semantics.
- Modify: `chidinh_client/src/test/form-system.pilot-login.test.tsx`
  - Cover long helper text behavior on the short-form pilot.
- Modify: `chidinh_client/src/test/form-system.pilot-todo.test.tsx`
  - Cover long helper text on the complex pilot and prove `TodoForm` is using the shared select primitive path.
- Modify: `chidinh_client/src/test/auth.login.test.tsx`
  - Keep auth expectations aligned with helper/error composition if pilot helper copy changes.
- Modify: `docs/project/forme-first-slice-gates.md`
  - Replace overclaims with evidence-backed language and reopen any item not fully proven.

### Task 1: Add Readonly vs Disabled Contract to Field Primitives

**Files:**
- Modify: `chidinh_client/src/shared/form-system/primitives/InputShell.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/TextareaShell.tsx`
- Modify: `chidinh_client/src/test/form-system.primitives.test.tsx`

- [ ] **Step 1: Write the failing readonly tests for input and textarea**

```tsx
// chidinh_client/src/test/form-system.primitives.test.tsx
test("keeps readonly inputs visually distinct from disabled inputs", () => {
  render(
    <>
      <InputShell aria-label="Readonly title" readOnly value="Visible value" />
      <InputShell aria-label="Disabled title" disabled value="Hidden affordance" />
    </>,
  );

  const readonlyInput = screen.getByRole("textbox", { name: "Readonly title" });
  const disabledInput = screen.getByRole("textbox", { name: "Disabled title" });

  expect(readonlyInput).toHaveClass("read-only:bg-[var(--surface-panel-muted)]");
  expect(readonlyInput).not.toHaveClass("disabled:bg-[var(--form-state-disabled-bg)]");
  expect(disabledInput).toHaveClass("disabled:bg-[var(--form-state-disabled-bg)]");
});

test("keeps readonly textarea distinct from disabled textarea", () => {
  render(
    <>
      <TextareaShell aria-label="Readonly notes" readOnly value="Review only" />
      <TextareaShell aria-label="Disabled notes" disabled value="Blocked" />
    </>,
  );

  expect(screen.getByRole("textbox", { name: "Readonly notes" })).toHaveAttribute("readonly");
  expect(screen.getByRole("textbox", { name: "Disabled notes" })).toBeDisabled();
});
```

- [ ] **Step 2: Run the primitive test file to verify it fails**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.primitives.test.tsx`
Expected: FAIL because `InputShell` does not yet style `readOnly` separately from `disabled`.

- [ ] **Step 3: Implement the readonly state on `InputShell`**

```tsx
// chidinh_client/src/shared/form-system/primitives/InputShell.tsx
const fieldShellBaseClassName = [
  "w-full",
  "rounded-[var(--radius-md)]",
  "border",
  "border-[var(--border-default)]",
  "bg-[var(--surface-panel)]",
  "px-4",
  "py-3",
  "text-sm",
  "text-foreground",
  "outline-none",
  "transition-colors",
  "duration-150",
  "placeholder:text-muted",
  "hover:border-[var(--border-strong)]",
  "focus-visible:border-primary",
  "focus-visible:outline-none",
  "focus-visible:shadow-[var(--focus-ring)]",
  "read-only:border-[var(--border-subtle)]",
  "read-only:bg-[var(--surface-panel-muted)]",
  "read-only:text-foreground",
  "read-only:cursor-default",
  "disabled:cursor-not-allowed",
  "disabled:bg-[var(--form-state-disabled-bg)]",
  "disabled:text-muted-foreground",
  "data-[state=error]:border-[var(--form-state-error-border)]",
  "data-[state=warning]:border-[var(--form-state-warning-border)]",
  "data-[state=success]:border-[var(--form-state-success-border)]",
  "aria-[invalid=true]:border-[var(--form-state-error-border)]",
].join(" ");
```

- [ ] **Step 4: Re-run the primitive test file to verify it passes**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/shared/form-system/primitives/InputShell.tsx \
  chidinh_client/src/shared/form-system/primitives/TextareaShell.tsx \
  chidinh_client/src/test/form-system.primitives.test.tsx
git commit -m "feat(form-system): distinguish readonly from disabled fields"
```

### Task 2: Make `SelectTrigger` the Real Shared Select Primitive

**Files:**
- Modify: `chidinh_client/src/shared/form-system/primitives/SelectTrigger.tsx`
- Modify: `chidinh_client/src/shared/form-system/primitives/index.ts`
- Modify: `chidinh_client/src/modules/todo/TodoForm.tsx`
- Modify: `chidinh_client/src/test/form-system.primitives.test.tsx`
- Modify: `chidinh_client/src/test/form-system.pilot-todo.test.tsx`

- [ ] **Step 1: Write the failing select primitive tests**

```tsx
// chidinh_client/src/test/form-system.primitives.test.tsx
test("renders SelectTrigger as a native combobox primitive", () => {
  render(
    <Label htmlFor="task-status">
      Status
      <SelectTrigger id="task-status" defaultValue="todo">
        <option value="todo">To do</option>
        <option value="done">Done</option>
      </SelectTrigger>
    </Label>,
  );

  const select = screen.getByRole("combobox", { name: "Status" });
  expect(select).toHaveValue("todo");
  expect(select).toHaveClass("appearance-none");
});
```

```tsx
// chidinh_client/src/test/form-system.pilot-todo.test.tsx
test("uses the shared select primitive for status and priority", async () => {
  mockFetchSequence(
    jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    jsonResponse({ items: [] }),
  );

  renderTodoRoute();
  await screen.findByRole("heading", { name: /personal tasks/i });

  expect(screen.getByRole("combobox", { name: /status/i })).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: /priority/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the relevant tests to verify they fail**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.primitives.test.tsx src/test/form-system.pilot-todo.test.tsx`
Expected: FAIL because `SelectTrigger` still renders a button and `TodoForm` still uses raw `<select>`.

- [ ] **Step 3: Implement the native select shell while preserving the exported v1 name**

```tsx
// chidinh_client/src/shared/form-system/primitives/SelectTrigger.tsx
import { forwardRef, type SelectHTMLAttributes } from "react";

import { getFieldShellClassName } from "./InputShell";

export type SelectTriggerProps = SelectHTMLAttributes<HTMLSelectElement>;

export const SelectTrigger = forwardRef<HTMLSelectElement, SelectTriggerProps>(
  function SelectTrigger({ className, ...props }, ref) {
    return (
      <select
        className={getFieldShellClassName(
          "appearance-none bg-[image:linear-gradient(45deg,transparent_50%,var(--foreground)_50%),linear-gradient(135deg,var(--foreground)_50%,transparent_50%)] bg-[length:0.55rem_0.55rem] bg-[position:calc(100%-1rem)_calc(50%-0.12rem),calc(100%-0.72rem)_calc(50%-0.12rem)] bg-no-repeat pr-10",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
```

- [ ] **Step 4: Migrate `TodoForm` to the shared select primitive**

```tsx
// chidinh_client/src/modules/todo/TodoForm.tsx
import { ErrorText, HelperText, Label, SelectTrigger } from "../../shared/form-system/primitives";

<SelectTrigger
  id="todo-status"
  value={formState.status}
  onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
>
  <option value="todo">To do</option>
  <option value="in_progress">In progress</option>
  <option value="done">Done</option>
  <option value="cancelled">Cancelled</option>
</SelectTrigger>

<SelectTrigger
  id="todo-priority"
  value={formState.priority}
  onChange={(event) => onPriorityChange(event.target.value as TaskPriority)}
>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
</SelectTrigger>
```

- [ ] **Step 5: Re-run the select-focused tests to verify they pass**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.primitives.test.tsx src/test/form-system.pilot-todo.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add chidinh_client/src/shared/form-system/primitives/SelectTrigger.tsx \
  chidinh_client/src/shared/form-system/primitives/index.ts \
  chidinh_client/src/modules/todo/TodoForm.tsx \
  chidinh_client/src/test/form-system.primitives.test.tsx \
  chidinh_client/src/test/form-system.pilot-todo.test.tsx
git commit -m "feat(form-system): adopt shared select primitive in pilot forms"
```

### Task 3: Add Real Helper-Text Stress Coverage

**Files:**
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
- Modify: `chidinh_client/src/modules/todo/TodoForm.tsx`
- Modify: `chidinh_client/src/test/form-system.pilot-login.test.tsx`
- Modify: `chidinh_client/src/test/form-system.pilot-todo.test.tsx`
- Modify: `chidinh_client/src/test/auth.login.test.tsx`

- [ ] **Step 1: Write the failing helper-stress tests**

```tsx
// chidinh_client/src/test/form-system.pilot-login.test.tsx
test("keeps a multi-line helper readable without breaking the action area rhythm", () => {
  renderLoginRoute();

  expect(
    screen.getByText(/use your workspace handle, not your public display name, and keep it aligned with the private-side account you authenticate with/i),
  ).toBeInTheDocument();
  expect(screen.getByTestId("form-action-area")).toBeInTheDocument();
});
```

```tsx
// chidinh_client/src/test/form-system.pilot-todo.test.tsx
test("keeps a longer title helper visible when inline validation is active", async () => {
  mockFetchSequence(
    jsonResponse({ user: { id: "user-1", username: "ada", displayName: "Ada Lovelace" } }),
    jsonResponse({ items: [] }),
  );
  const user = userEvent.setup();

  renderTodoRoute();
  await screen.findByRole("heading", { name: /personal tasks/i });

  const helperCopy = /summarize the task in one line, but keep enough context that the card still scans clearly in dense lists and review queues/i;
  expect(screen.getByText(helperCopy)).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /add task/i }));

  expect(screen.getByText(helperCopy)).toBeInTheDocument();
  expect(screen.getByLabelText(/task title/i)).toHaveAttribute(
    "aria-describedby",
    expect.stringContaining("todo-title-helper"),
  );
});
```

- [ ] **Step 2: Run the pilot tests to verify they fail**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.pilot-login.test.tsx src/test/form-system.pilot-todo.test.tsx src/test/auth.login.test.tsx`
Expected: FAIL because the helper copy is still short and auth expectations may need updating.

- [ ] **Step 3: Expand helper copy without changing hierarchy structure**

```tsx
// chidinh_client/src/modules/auth/LoginPage.tsx
<HelperText id={usernameHelperId}>
  Use your workspace handle, not your public display name, and keep it aligned with the private-side account you authenticate with.
</HelperText>
```

```tsx
// chidinh_client/src/modules/todo/TodoForm.tsx
<HelperText id={titleHelperId}>
  Summarize the task in one line, but keep enough context that the card still scans clearly in dense lists and review queues.
</HelperText>
```

- [ ] **Step 4: Re-run the pilot helper tests to verify they pass**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.pilot-login.test.tsx src/test/form-system.pilot-todo.test.tsx src/test/auth.login.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/modules/auth/LoginPage.tsx \
  chidinh_client/src/modules/todo/TodoForm.tsx \
  chidinh_client/src/test/form-system.pilot-login.test.tsx \
  chidinh_client/src/test/form-system.pilot-todo.test.tsx \
  chidinh_client/src/test/auth.login.test.tsx
git commit -m "test(form-system): add helper text stress coverage to pilots"
```

### Task 4: Correct Gate Claims to Match Evidence

**Files:**
- Modify: `docs/project/forme-first-slice-gates.md`
- Modify: `chidinh_client/src/test/form-system.pilot-login.test.tsx`
- Modify: `chidinh_client/src/test/form-system.pilot-todo.test.tsx`
- Modify: `chidinh_client/src/test/todo-form.layout.test.tsx`

- [ ] **Step 1: Reword the gate doc so it no longer overclaims viewport proof**

```md
## Gate C — Layout Foundation (Spec Phase 3)
- [x] Single-column remains the baseline form layout.
- [x] Two-column is only enabled through the eligibility checklist.
- [x] Pilot tests prove responsive class contracts and row metadata for the current desktop/mobile collapse rules.
- [ ] Browser-level viewport evidence is still pending before broad rollout.

## Gate D — Pilot Implementation (Spec Phase 4)
- [x] Pilot coverage proves helper-text stress cases on real pilot forms.
- [x] Pilot coverage proves dark mode baseline.
- [ ] Pilot coverage is still contract-level for responsive behavior; browser evidence remains follow-up work.
```

- [ ] **Step 2: Add one explicit regression assertion that the layout evidence is class-contract only**

```tsx
// chidinh_client/src/test/todo-form.layout.test.tsx
expect(rows[0]).not.toHaveClass("md:grid-cols-2");
expect(rows[1]).toHaveClass("md:grid-cols-2");
```

- [ ] **Step 3: Run the targeted doc-supporting regression pack**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npx vitest run src/test/form-system.pilot-login.test.tsx src/test/form-system.pilot-todo.test.tsx src/test/todo-form.layout.test.tsx`
Expected: PASS

- [ ] **Step 4: Run the full verification set**

Run: `cd /mnt/d/chidinh/.worktrees/codex-form-system-primitives-v1/chidinh_client && npm test && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/project/forme-first-slice-gates.md \
  chidinh_client/src/test/form-system.pilot-login.test.tsx \
  chidinh_client/src/test/form-system.pilot-todo.test.tsx \
  chidinh_client/src/test/todo-form.layout.test.tsx
git commit -m "docs(form-system): align pilot gates with verified evidence"
```

## Self-Review

- Spec coverage:
  - Readonly vs disabled delta: covered by Task 1.
  - Select primitive parity and pilot adoption: covered by Task 2.
  - Helper text short/long pilot coverage: covered by Task 3.
  - Gate-doc overclaim cleanup: covered by Task 4.
- Placeholder scan:
  - No `TODO`, `TBD`, or deferred placeholders remain.
- Type consistency:
  - `SelectTrigger` keeps the exported v1 name while changing implementation to the actual native select shell, so contract naming stays stable across tasks.

## Risks and Execution Notes

- The plan intentionally does not add a new custom popover/select subsystem; it keeps v1 pragmatic by styling the native `<select>` while honoring the frozen `SelectTrigger` contract name.
- Responsive browser-smoke coverage is kept out of this plan to avoid mixing toolchain expansion with the smaller parity fixes above. If the team wants true viewport proof later, spin that into a dedicated Playwright plan.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-03-form-system-post-push-followup.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
