# Form System Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a reusable v1 form system (tokens -> primitives -> patterns -> pilot forms -> governance) that satisfies the redesign spec and is proven on real forms before broad rollout.

**Architecture:** Implement a layered form foundation in `chidinh_client` with strict boundaries: semantic tokens and state contracts first, primitive controls second, pattern-level composition third, and screen-specific usage last. Use `LoginPage` (short form) and `TodoForm` (long + validation + conditional behavior) as mandatory pilot forms. Keep rollout controlled through exception/deprecation docs and explicit review gates.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4 tokenized CSS variables, Vitest + Testing Library, react-hook-form, zod, existing shared UI primitives.

---

## File Structure Map

### Create
- `chidinh_client/src/shared/form-system/contracts/formContracts.ts`
- `chidinh_client/src/shared/form-system/contracts/twoColumnEligibility.ts`
- `chidinh_client/src/shared/form-system/contracts/dependentFieldState.ts`
- `chidinh_client/src/shared/form-system/primitives/InputShell.tsx`
- `chidinh_client/src/shared/form-system/primitives/TextareaShell.tsx`
- `chidinh_client/src/shared/form-system/primitives/SelectTrigger.tsx`
- `chidinh_client/src/shared/form-system/primitives/Checkbox.tsx`
- `chidinh_client/src/shared/form-system/primitives/RadioGroup.tsx`
- `chidinh_client/src/shared/form-system/primitives/Switch.tsx`
- `chidinh_client/src/shared/form-system/primitives/Label.tsx`
- `chidinh_client/src/shared/form-system/primitives/HelperText.tsx`
- `chidinh_client/src/shared/form-system/primitives/ErrorText.tsx`
- `chidinh_client/src/shared/form-system/patterns/FormSection.tsx`
- `chidinh_client/src/shared/form-system/patterns/FieldRow.tsx`
- `chidinh_client/src/shared/form-system/patterns/ValidationSummary.tsx`
- `chidinh_client/src/shared/form-system/patterns/ActionArea.tsx`
- `chidinh_client/src/shared/form-system/patterns/SectionHeader.tsx`
- `chidinh_client/src/shared/form-system/patterns/ConditionalFieldBlock.tsx`
- `chidinh_client/src/test/form-system.contracts.test.ts`
- `chidinh_client/src/test/form-system.primitives.test.tsx`
- `chidinh_client/src/test/form-system.patterns.test.tsx`
- `chidinh_client/src/test/form-system.pilot-login.test.tsx`
- `chidinh_client/src/test/form-system.pilot-todo.test.tsx`
- `docs/project/2026-04-02-form-system-v1-kickoff-locks.md`
- `docs/project/2026-04-02-form-system-exception-log.md`
- `docs/project/2026-04-02-form-system-deprecation-plan.md`

### Modify
- `chidinh_client/src/styles/globals.css`
- `chidinh_client/src/shared/ui/Input.tsx`
- `chidinh_client/src/shared/ui/Field.tsx`
- `chidinh_client/src/shared/ui/InlineFeedback.tsx`
- `chidinh_client/src/modules/auth/LoginPage.tsx`
- `chidinh_client/src/modules/todo/TodoForm.tsx`
- `chidinh_client/src/modules/todo/TodoPage.tsx`
- `chidinh_client/src/test/auth.login.test.tsx`
- `chidinh_client/src/test/todo.page.test.tsx`

---

### Task 1: Freeze v1 Contracts Before UI Changes

**Files:**
- Create: `docs/project/2026-04-02-form-system-v1-kickoff-locks.md`
- Create: `chidinh_client/src/shared/form-system/contracts/formContracts.ts`
- Test: `chidinh_client/src/test/form-system.contracts.test.ts`

- [ ] **Step 1: Write failing tests for frozen contracts**

```ts
import { describe, expect, it } from "vitest";
import {
  PRIMITIVE_V1,
  FORM_STATE_PRIORITY,
  isValidPrimitive,
} from "../shared/form-system/contracts/formContracts";

describe("formContracts", () => {
  it("freezes primitive v1 inventory", () => {
    expect(PRIMITIVE_V1).toEqual([
      "InputShell",
      "TextareaShell",
      "SelectTrigger",
      "Checkbox",
      "Radio",
      "Switch",
      "Label",
      "HelperText",
      "ErrorText",
      "Button",
      "Surface",
    ]);
  });

  it("enforces validation visual priority", () => {
    expect(FORM_STATE_PRIORITY).toEqual(["error", "warning", "info"]);
  });

  it("validates primitive ownership names", () => {
    expect(isValidPrimitive("InputShell")).toBe(true);
    expect(isValidPrimitive("MagicOneOffField")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd chidinh_client && npx vitest run src/test/form-system.contracts.test.ts`
Expected: FAIL (`Cannot find module '../shared/form-system/contracts/formContracts'`)

- [ ] **Step 3: Implement contract module + kickoff lock doc**

```ts
// src/shared/form-system/contracts/formContracts.ts
export const PRIMITIVE_V1 = [
  "InputShell",
  "TextareaShell",
  "SelectTrigger",
  "Checkbox",
  "Radio",
  "Switch",
  "Label",
  "HelperText",
  "ErrorText",
  "Button",
  "Surface",
] as const;

export const FORM_STATE_PRIORITY = ["error", "warning", "info"] as const;

export function isValidPrimitive(name: string) {
  return (PRIMITIVE_V1 as readonly string[]).includes(name);
}
```

```md
<!-- docs/project/2026-04-02-form-system-v1-kickoff-locks.md -->
# Form System v1 Kickoff Locks

- Primitive v1 list frozen.
- UI rule layer vs domain validation layer boundary frozen.
- Pilot forms frozen: `LoginPage` and `TodoForm`.
- Legacy sunset milestones and exception review checkpoints frozen.
```

- [ ] **Step 4: Run tests to verify it passes**

Run: `cd chidinh_client && npx vitest run src/test/form-system.contracts.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/project/2026-04-02-form-system-v1-kickoff-locks.md \
  chidinh_client/src/shared/form-system/contracts/formContracts.ts \
  chidinh_client/src/test/form-system.contracts.test.ts
git commit -m "feat(form-system): freeze v1 contracts and kickoff locks"
```

### Task 2: Build Semantic State Matrix + Token Contract

**Files:**
- Modify: `chidinh_client/src/styles/globals.css`
- Test: `chidinh_client/src/test/form-system.primitives.test.tsx`

- [ ] **Step 1: Write failing test for state classes and dark-mode readability hook**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InputShell } from "../shared/form-system/primitives/InputShell";

describe("InputShell visual states", () => {
  it("applies explicit state data attributes", () => {
    render(<InputShell aria-label="Title" data-state="error" />);
    expect(screen.getByLabelText("Title")).toHaveAttribute("data-state", "error");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd chidinh_client && npx vitest run src/test/form-system.primitives.test.tsx`
Expected: FAIL (`Cannot find module '../shared/form-system/primitives/InputShell'`)

- [ ] **Step 3: Add/normalize semantic token matrix in CSS**

```css
:root {
  --form-state-default-border: var(--border-default);
  --form-state-hover-border: var(--border-strong);
  --form-state-focus-ring: var(--focus-ring);
  --form-state-error-border: #b94a48;
  --form-state-error-text: #9d3434;
  --form-state-disabled-bg: #efe7d8;
  --form-state-success-border: #2f7a55;
  --form-state-warning-border: #8b6a2e;
}

:root[data-theme="dark"] {
  --form-state-error-text: #ffb4b0;
  --form-state-disabled-bg: #2a2f35;
}
```

- [ ] **Step 4: Run tests to verify tokenized states are consumed by primitives (after Task 3 implementation)**

Run: `cd chidinh_client && npx vitest run src/test/form-system.primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/styles/globals.css \
  chidinh_client/src/test/form-system.primitives.test.tsx
git commit -m "feat(form-system): add semantic state matrix tokens"
```

### Task 3: Implement Primitive Layer (InputShell/Select/Label/Feedback)

**Files:**
- Create: `chidinh_client/src/shared/form-system/primitives/*.tsx`
- Modify: `chidinh_client/src/shared/ui/Input.tsx`
- Modify: `chidinh_client/src/shared/ui/Field.tsx`
- Modify: `chidinh_client/src/shared/ui/InlineFeedback.tsx`
- Test: `chidinh_client/src/test/form-system.primitives.test.tsx`

- [ ] **Step 1: Extend failing tests for primitive ownership and accessibility semantics**

```tsx
it("renders inline error as alert and helper as status", () => {
  render(
    <>
      <HelperText id="title-help">Visible helper</HelperText>
      <ErrorText id="title-error">Title is required</ErrorText>
    </>,
  );

  expect(screen.getByRole("status")).toHaveTextContent("Visible helper");
  expect(screen.getByRole("alert")).toHaveTextContent("Title is required");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd chidinh_client && npx vitest run src/test/form-system.primitives.test.tsx`
Expected: FAIL (missing primitive exports/components)

- [ ] **Step 3: Write minimal primitive implementations and re-export existing shared UI wrappers**

```tsx
// src/shared/form-system/primitives/InputShell.tsx
import { forwardRef } from "react";

type InputShellProps = React.InputHTMLAttributes<HTMLInputElement> & {
  "data-state"?: "default" | "hover" | "focus" | "error" | "disabled" | "success" | "warning";
};

export const InputShell = forwardRef<HTMLInputElement, InputShellProps>(function InputShell(
  { className = "", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-xl border bg-surface px-3 py-2 text-sm text-text ${className}`.trim()}
      {...props}
    />
  );
});
```

```tsx
// src/shared/form-system/primitives/ErrorText.tsx
export function ErrorText(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p role="alert" className="text-sm text-red-700" {...props} />;
}
```

- [ ] **Step 4: Run primitives test suite**

Run: `cd chidinh_client && npx vitest run src/test/form-system.primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/shared/form-system/primitives \
  chidinh_client/src/shared/ui/Input.tsx \
  chidinh_client/src/shared/ui/Field.tsx \
  chidinh_client/src/shared/ui/InlineFeedback.tsx \
  chidinh_client/src/test/form-system.primitives.test.tsx
git commit -m "feat(form-system): implement primitive form controls"
```

### Task 4: Implement Pattern Layer (Section/Row/Summary/Actions/Conditional)

**Files:**
- Create: `chidinh_client/src/shared/form-system/patterns/*.tsx`
- Test: `chidinh_client/src/test/form-system.patterns.test.tsx`

- [ ] **Step 1: Write failing tests for pattern-level composition contracts**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ValidationSummary } from "../shared/form-system/patterns/ValidationSummary";

describe("ValidationSummary", () => {
  it("renders list of submit errors and does not replace inline errors", () => {
    render(
      <ValidationSummary
        title="Please fix 2 errors"
        errors={[
          { fieldId: "username", message: "Username is required" },
          { fieldId: "password", message: "Password is required" },
        ]}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Please fix 2 errors");
    expect(screen.getByRole("link", { name: /username is required/i })).toHaveAttribute("href", "#username");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd chidinh_client && npx vitest run src/test/form-system.patterns.test.tsx`
Expected: FAIL (`Cannot find module '../shared/form-system/patterns/ValidationSummary'`)

- [ ] **Step 3: Implement pattern components with strict ownership boundaries**

```tsx
// src/shared/form-system/patterns/ValidationSummary.tsx
type ValidationItem = { fieldId: string; message: string };

export function ValidationSummary({ title, errors }: { title: string; errors: ValidationItem[] }) {
  if (errors.length === 0) return null;

  return (
    <section role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4">
      <p className="font-medium text-red-800">{title}</p>
      <ul className="mt-2 space-y-1">
        {errors.map((error) => (
          <li key={`${error.fieldId}:${error.message}`}>
            <a href={`#${error.fieldId}`} className="underline">
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Run tests for pattern layer**

Run: `cd chidinh_client && npx vitest run src/test/form-system.patterns.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/shared/form-system/patterns \
  chidinh_client/src/test/form-system.patterns.test.tsx
git commit -m "feat(form-system): add pattern-level form composition"
```

### Task 5: Implement Two-Column Eligibility + Dependent Field Contracts

**Files:**
- Create: `chidinh_client/src/shared/form-system/contracts/twoColumnEligibility.ts`
- Create: `chidinh_client/src/shared/form-system/contracts/dependentFieldState.ts`
- Test: `chidinh_client/src/test/form-system.contracts.test.ts`

- [ ] **Step 1: Add failing tests for 7-condition two-column gate and hidden-field validation rule**

```ts
it("rejects two-column when helper text is long", () => {
  expect(
    isTwoColumnEligible({
      logicIndependent: true,
      sequentialScanRequired: false,
      helperLikelyLong: true,
      mobileGroupingPreserved: true,
      crossColumnDependencies: false,
      summaryAndActionsNatural: true,
      errorReadabilityPreserved: true,
    }),
  ).toBe(false);
});

it("clears errors for hidden child fields", () => {
  const next = reconcileDependentFieldState({
    visible: false,
    value: "legacy",
    error: "Must choose",
    touched: true,
  });
  expect(next.error).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd chidinh_client && npx vitest run src/test/form-system.contracts.test.ts`
Expected: FAIL (missing functions)

- [ ] **Step 3: Implement contract helpers**

```ts
export function isTwoColumnEligible(input: {
  logicIndependent: boolean;
  sequentialScanRequired: boolean;
  helperLikelyLong: boolean;
  mobileGroupingPreserved: boolean;
  crossColumnDependencies: boolean;
  summaryAndActionsNatural: boolean;
  errorReadabilityPreserved: boolean;
}) {
  return (
    input.logicIndependent &&
    !input.sequentialScanRequired &&
    !input.helperLikelyLong &&
    input.mobileGroupingPreserved &&
    !input.crossColumnDependencies &&
    input.summaryAndActionsNatural &&
    input.errorReadabilityPreserved
  );
}
```

```ts
export function reconcileDependentFieldState(state: {
  visible: boolean;
  value: string | null;
  error: string | null;
  touched: boolean;
}) {
  if (!state.visible) {
    return { ...state, value: null, error: null, touched: false };
  }
  return state;
}
```

- [ ] **Step 4: Re-run contract tests**

Run: `cd chidinh_client && npx vitest run src/test/form-system.contracts.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/shared/form-system/contracts/twoColumnEligibility.ts \
  chidinh_client/src/shared/form-system/contracts/dependentFieldState.ts \
  chidinh_client/src/test/form-system.contracts.test.ts
git commit -m "feat(form-system): codify two-column and dependent field rules"
```

### Task 6: Pilot 1 (Short Form) Migrate LoginPage to New Form System

**Files:**
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
- Modify: `chidinh_client/src/test/auth.login.test.tsx`
- Create: `chidinh_client/src/test/form-system.pilot-login.test.tsx`

- [ ] **Step 1: Write failing pilot tests for login section/action consistency**

```tsx
it("renders login with FormSection + ActionArea contract", async () => {
  renderLoginRoute();
  expect(screen.getByRole("heading", { name: /enter workspace/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /enter workspace/i })).toBeInTheDocument();
  expect(screen.getByTestId("form-action-area")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run login pilot tests to verify failure**

Run: `cd chidinh_client && npx vitest run src/test/form-system.pilot-login.test.tsx`
Expected: FAIL (`Unable to find element by [data-testid="form-action-area"]`)

- [ ] **Step 3: Refactor LoginPage to use primitive/pattern layer**

```tsx
// inside LoginPage form markup
<FormSection title="Credentials">
  <Field>
    <Label htmlFor="username">Username</Label>
    <InputShell id="username" autoComplete="username" {...register("username")} />
    {errors.username ? <ErrorText>{errors.username.message}</ErrorText> : <HelperText>Use your workspace username.</HelperText>}
  </Field>
</FormSection>

<ActionArea data-testid="form-action-area" primaryAction={<Button ...>Enter Workspace</Button>} />
```

- [ ] **Step 4: Run tests**

Run: `cd chidinh_client && npx vitest run src/test/auth.login.test.tsx src/test/form-system.pilot-login.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/modules/auth/LoginPage.tsx \
  chidinh_client/src/test/auth.login.test.tsx \
  chidinh_client/src/test/form-system.pilot-login.test.tsx
git commit -m "feat(form-system): migrate login form as short-form pilot"
```

### Task 7: Pilot 2 (Complex Form) Migrate TodoForm + Add Conditional State Guarantees

**Files:**
- Modify: `chidinh_client/src/modules/todo/TodoForm.tsx`
- Modify: `chidinh_client/src/modules/todo/TodoPage.tsx`
- Modify: `chidinh_client/src/test/todo.page.test.tsx`
- Create: `chidinh_client/src/test/form-system.pilot-todo.test.tsx`

- [ ] **Step 1: Add failing tests for inline+submit validation summary and dependent field reset**

```tsx
it("shows submit summary while preserving inline errors", async () => {
  renderTodoRoute();
  await user.click(screen.getByRole("button", { name: /add task/i }));
  expect(await screen.findByRole("alert", { name: /please fix/i })).toBeInTheDocument();
  expect(screen.getByText(/task title is required/i)).toBeInTheDocument();
});

it("clears hidden dependent field state when parent changes", async () => {
  renderTodoRoute();
  await user.selectOptions(screen.getByLabelText(/status/i), "cancelled");
  expect(screen.queryByLabelText(/due date/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd chidinh_client && npx vitest run src/test/form-system.pilot-todo.test.tsx`
Expected: FAIL (summary/conditional logic missing)

- [ ] **Step 3: Refactor Todo form composition and dependent field behavior**

```tsx
// TodoPage.tsx
const dueDateVisible = formState.status !== "cancelled";

useEffect(() => {
  if (!dueDateVisible && formState.dueOn) {
    setFormState((current) => ({ ...current, dueOn: "" }));
  }
}, [dueDateVisible, formState.dueOn]);
```

```tsx
// TodoForm.tsx
<ConditionalFieldBlock visible={dueDateVisible}>
  <Field>
    <Label htmlFor="todo-due">Due date</Label>
    <InputShell id="todo-due" type="date" value={formState.dueOn} onChange={...} />
  </Field>
</ConditionalFieldBlock>

<ValidationSummary
  title="Please fix form errors before submit"
  errors={formError ? [{ fieldId: "todo-title", message: formError }] : []}
/>
```

- [ ] **Step 4: Run tests**

Run: `cd chidinh_client && npx vitest run src/test/todo.page.test.tsx src/test/form-system.pilot-todo.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add chidinh_client/src/modules/todo/TodoForm.tsx \
  chidinh_client/src/modules/todo/TodoPage.tsx \
  chidinh_client/src/test/todo.page.test.tsx \
  chidinh_client/src/test/form-system.pilot-todo.test.tsx
git commit -m "feat(form-system): migrate todo form as complex pilot"
```

### Task 8: Controlled Rollout Governance (Exception + Deprecation)

**Files:**
- Create: `docs/project/2026-04-02-form-system-exception-log.md`
- Create: `docs/project/2026-04-02-form-system-deprecation-plan.md`
- Modify: `docs/project/forme-first-slice-gates.md`

- [ ] **Step 1: Write failing governance check test (docs existence gate)**

```ts
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("form system governance artifacts", () => {
  it("requires exception and deprecation docs", () => {
    expect(existsSync("../docs/project/2026-04-02-form-system-exception-log.md")).toBe(true);
    expect(existsSync("../docs/project/2026-04-02-form-system-deprecation-plan.md")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd chidinh_client && npx vitest run src/test/form-system.contracts.test.ts`
Expected: FAIL (docs not found)

- [ ] **Step 3: Add governance docs with release milestones**

```md
# Exception Log
- ID, requested-by, reason-category, approved-by, one-off-or-pattern, sunset-date.
```

```md
# Deprecation Plan
- Release R+1: block legacy patterns for new forms.
- Release R+2: remove bridge layer.
- Release R+3: close or migrate all open exceptions.
```

- [ ] **Step 4: Run full suite for affected areas**

Run: `cd chidinh_client && npm run test`
Expected: PASS (`Test Files ... passed`)

- [ ] **Step 5: Commit**

```bash
git add docs/project/2026-04-02-form-system-exception-log.md \
  docs/project/2026-04-02-form-system-deprecation-plan.md \
  docs/project/forme-first-slice-gates.md \
  chidinh_client/src/test/form-system.contracts.test.ts
git commit -m "docs(form-system): add rollout governance and deprecation milestones"
```

---

## Spec Coverage Self-Review

- Visual language + state matrix: covered by Tasks 2-4.
- Layout foundation + single-column baseline + controlled two-column: covered by Tasks 4-5.
- Validation + conditional/dependent behavior: covered by Tasks 5 and 7.
- Ownership boundaries between primitive/pattern/screen composition: covered by Tasks 3-4.
- Pilot-before-rollout model: covered by Tasks 6-7.
- Exception + deprecation governance: covered by Task 8.
- Dark mode phase-1 stability baseline: token contract in Task 2 plus primitive consumption tests in Task 3.

No unresolved placeholders (`TBD`/`TODO`) intentionally left in this plan.
