# Forme Frontend Rebuild Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the corrected frontend rebuild without changing strategy, from shell contract normalization through Todo migration and cleanup.

**Architecture:** Keep migration-in-place and preserve the current route structure while tightening UI boundaries. Treat Tailwind + Radix + shadcn/ui patterns + CVA as foundation mechanics, but keep Forme-owned tokens, naming, shell contract, and visual grammar. Execute in phase order: shell boundary normalization, low-risk route convergence, pattern hardening, Todo migration, then cleanup/deprecation.

**Tech Stack:** React 19, React Router 7, React Query 5, Tailwind CSS v4, CVA, Radix Slot/Label, React Hook Form, Vitest, Testing Library, TypeScript

**Execution Status (2026-04-02):** Executed inline on branch `codex/forme-foundation` through shell normalization, low-risk convergence, pattern hardening, Todo extraction, and cleanup verification.

---

## File Structure Map

### Existing Files To Continue Modifying

- `chidinh_client/src/app/router/AppRouter.tsx` - route ownership and shell boundary
- `chidinh_client/src/modules/auth/RequireAuth.tsx` - auth/loading boundary behavior
- `chidinh_client/src/modules/dashboard/DashboardLayout.tsx` - authenticated shell layout composition
- `chidinh_client/src/modules/dashboard/DashboardHomePage.tsx` - low-risk shell consumer
- `chidinh_client/src/modules/portfolio/PortfolioPage.tsx` - low-risk public consumer
- `chidinh_client/src/modules/auth/LoginPage.tsx` - low-risk form consumer
- `chidinh_client/src/modules/todo/TodoPage.tsx` - late-phase interactive migration target
- `chidinh_client/src/styles/globals.css` - token source of truth and alias sunset
- `docs/superpowers/specs/2026-04-02-forme-ui-primitive-inventory.md` - inventory/taxonomy/freeze record

### Files To Create During Remaining Phases

- `chidinh_client/src/modules/dashboard/shellNav.ts` - config-driven shell nav ownership
- `chidinh_client/src/shared/ui/ShellStatus.tsx` - shared loading/auth shell status surface
- `chidinh_client/src/shared/ui/EmptyState.tsx` - reusable empty-state primitive
- `chidinh_client/src/shared/ui/InlineFeedback.tsx` - reusable message primitive
- `chidinh_client/src/modules/todo/todoDate.ts` - date conversion helpers extracted from page
- `chidinh_client/src/modules/todo/todoTags.ts` - tag parsing/merge helpers extracted from page
- `chidinh_client/src/modules/todo/TodoToolbar.tsx` - filter/search/layout controls
- `chidinh_client/src/modules/todo/TodoForm.tsx` - create/edit form surface
- `chidinh_client/src/modules/todo/TodoMetrics.tsx` - metrics cards composition
- `chidinh_client/src/modules/todo/TodoList.tsx` - list layout renderer
- `chidinh_client/src/modules/todo/TodoBoard.tsx` - board layout renderer

### Tests To Add Or Expand

- `chidinh_client/src/test/dashboard.layout.test.tsx`
- `chidinh_client/src/test/auth.require-auth.test.tsx`
- `chidinh_client/src/test/router.test.tsx`
- `chidinh_client/src/test/auth.login.test.tsx`
- `chidinh_client/src/test/portfolio.page.test.tsx`
- `chidinh_client/src/test/todo.page.test.tsx`
- `chidinh_client/src/test/todo.helpers.test.ts`
- `chidinh_client/src/test/shell.status.test.tsx`
- `chidinh_client/src/test/empty-state.test.tsx`

---

### Task 1: Lock Phase 0/1 Baseline And Commit Foundation Slice

**Files:**
- Modify: `docs/README.md`
- Modify: `docs/superpowers/specs/2026-04-02-forme-ui-primitive-inventory.md`
- Modify: `chidinh_client/package.json`
- Modify: `chidinh_client/package-lock.json`
- Modify: `chidinh_client/src/shared/ui/Button.tsx`
- Modify: `chidinh_client/src/shared/ui/Panel.tsx`
- Modify: `chidinh_client/src/shared/ui/Field.tsx`
- Modify: `chidinh_client/src/shared/ui/Input.tsx`
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
- Modify: `chidinh_client/src/modules/portfolio/PortfolioPage.tsx`
- Modify: `chidinh_client/src/modules/dashboard/DashboardLayout.tsx`
- Modify: `chidinh_client/src/styles/globals.css`
- Test: `chidinh_client/src/test/button.test.tsx`
- Test: `chidinh_client/src/test/panel.test.tsx`

- [ ] **Step 1: Confirm inventory and freeze artifact content is current**

```markdown
Add a "Current Phase Status" section to the inventory spec:
- Phase 0: complete
- Phase 1 (foundation slice): complete
- Frozen prototypes: unchanged and still frozen
```

- [ ] **Step 2: Run targeted phase-gate tests**

Run: `npx vitest run src/test/button.test.tsx src/test/panel.test.tsx src/test/auth.login.test.tsx src/test/portfolio.page.test.tsx src/test/dashboard.layout.test.tsx src/test/tailwind.theme.test.ts`  
Expected: PASS (all listed files green)

- [ ] **Step 3: Run full baseline verification**

Run: `npm test`  
Expected: PASS (all tests green)

Run: `npm run build`  
Expected: PASS (vite build success)

- [ ] **Step 4: Commit phase 0/1 completion checkpoint**

```bash
git add docs/README.md docs/superpowers/specs/2026-04-02-forme-ui-primitive-inventory.md \
  chidinh_client/package.json chidinh_client/package-lock.json \
  chidinh_client/src/shared/ui/Button.tsx chidinh_client/src/shared/ui/Panel.tsx \
  chidinh_client/src/shared/ui/Field.tsx chidinh_client/src/shared/ui/Input.tsx \
  chidinh_client/src/modules/auth/LoginPage.tsx chidinh_client/src/modules/portfolio/PortfolioPage.tsx \
  chidinh_client/src/modules/dashboard/DashboardLayout.tsx chidinh_client/src/styles/globals.css \
  chidinh_client/src/test/button.test.tsx chidinh_client/src/test/panel.test.tsx
git commit -m "feat(ui): complete phase 0/1 primitive foundation checkpoint"
```

---

### Task 2: Build Shell Navigation Contract (Config-Driven Layout Ownership)

**Files:**
- Create: `chidinh_client/src/modules/dashboard/shellNav.ts`
- Modify: `chidinh_client/src/modules/dashboard/DashboardLayout.tsx`
- Modify: `chidinh_client/src/test/dashboard.layout.test.tsx`
- Test: `chidinh_client/src/test/dashboard.layout.test.tsx`

- [ ] **Step 1: Write a failing shell-nav test before changing layout**

```tsx
it("renders shell navigation from shared config", async () => {
  // assert Home, Todo, Public Hub labels exist in order from config
});
```

- [ ] **Step 2: Run the focused test to verify failure**

Run: `npx vitest run src/test/dashboard.layout.test.tsx -t "renders shell navigation from shared config"`  
Expected: FAIL with missing config-driven behavior

- [ ] **Step 3: Implement navigation contract extraction**

```ts
// src/modules/dashboard/shellNav.ts
export type ShellNavItem = { label: string; to: string; end?: boolean };
export const SHELL_NAV_ITEMS: ShellNavItem[] = [
  { label: "Home", to: "/app", end: true },
  { label: "Todo", to: "/app/todo" },
  { label: "Public Hub", to: "/" },
];
```

```tsx
// DashboardLayout.tsx
{SHELL_NAV_ITEMS.map((item) => (
  <NavLink key={item.to} to={item.to} end={item.end} ...>
    {item.label}
  </NavLink>
))}
```

- [ ] **Step 4: Verify focused shell layout tests**

Run: `npx vitest run src/test/dashboard.layout.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit shell nav contract**

```bash
git add chidinh_client/src/modules/dashboard/shellNav.ts \
  chidinh_client/src/modules/dashboard/DashboardLayout.tsx \
  chidinh_client/src/test/dashboard.layout.test.tsx
git commit -m "feat(shell): extract config-driven dashboard nav contract"
```

---

### Task 3: Normalize Route/Auth Boundary As Part Of Shell Contract

**Files:**
- Create: `chidinh_client/src/shared/ui/ShellStatus.tsx`
- Modify: `chidinh_client/src/modules/auth/RequireAuth.tsx`
- Modify: `chidinh_client/src/app/router/AppRouter.tsx`
- Modify: `chidinh_client/src/test/auth.require-auth.test.tsx`
- Modify: `chidinh_client/src/test/router.test.tsx`
- Modify: `chidinh_client/src/test/app-smoke.test.tsx`
- Test: `chidinh_client/src/test/auth.require-auth.test.tsx`
- Test: `chidinh_client/src/test/router.test.tsx`
- Test: `chidinh_client/src/test/app-smoke.test.tsx`

- [ ] **Step 1: Add failing tests for auth loading and route-shell behavior**

```tsx
it("shows shell loading status while session is loading", async () => {
  expect(screen.getByText(/checking session/i)).toBeInTheDocument();
});

it("keeps fallback route anchored to public portfolio entry", () => {
  // assert NotFound keeps "Back to Portfolio" link
});
```

- [ ] **Step 2: Run tests to verify red state**

Run: `npx vitest run src/test/auth.require-auth.test.tsx src/test/router.test.tsx src/test/app-smoke.test.tsx`  
Expected: FAIL on new loading/shell assertions

- [ ] **Step 3: Implement shell boundary normalization**

```tsx
// ShellStatus.tsx
export function ShellStatus({ title, description }: Props) {
  return <Panel className="p-6">...</Panel>;
}
```

```tsx
// RequireAuth.tsx
if (isLoading) return <ShellStatus title="Checking session..." ... />;
if (isError || !data?.user) return <Navigate to="/login" replace />;
```

```tsx
// AppRouter.tsx
const APP_ROUTES = { publicHome: "/", login: "/login", appRoot: "/app", todo: "/app/todo" } as const;
```

- [ ] **Step 4: Verify route/auth tests**

Run: `npx vitest run src/test/auth.require-auth.test.tsx src/test/router.test.tsx src/test/app-smoke.test.tsx src/test/dashboard.layout.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit route/auth normalization**

```bash
git add chidinh_client/src/shared/ui/ShellStatus.tsx \
  chidinh_client/src/modules/auth/RequireAuth.tsx \
  chidinh_client/src/app/router/AppRouter.tsx \
  chidinh_client/src/test/auth.require-auth.test.tsx \
  chidinh_client/src/test/router.test.tsx \
  chidinh_client/src/test/app-smoke.test.tsx
git commit -m "feat(shell): normalize route and auth boundary contract"
```

---

### Task 4: Complete Low-Risk Page Convergence On New Foundation

**Files:**
- Modify: `chidinh_client/src/modules/dashboard/DashboardHomePage.tsx`
- Modify: `chidinh_client/src/modules/portfolio/PortfolioPage.tsx`
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
- Modify: `chidinh_client/src/test/portfolio.page.test.tsx`
- Modify: `chidinh_client/src/test/auth.login.test.tsx`
- Modify: `chidinh_client/src/test/dashboard.layout.test.tsx`
- Test: `chidinh_client/src/test/portfolio.page.test.tsx`
- Test: `chidinh_client/src/test/auth.login.test.tsx`
- Test: `chidinh_client/src/test/dashboard.layout.test.tsx`

- [ ] **Step 1: Add failing assertions for shared primitives usage**

```tsx
// Example: ensure login submit uses button primitive semantics and pending state
expect(screen.getByRole("button", { name: /enter workspace/i })).toHaveAttribute("data-pending", "false");
```

- [ ] **Step 2: Run focused low-risk tests and capture failures**

Run: `npx vitest run src/test/auth.login.test.tsx src/test/portfolio.page.test.tsx src/test/dashboard.layout.test.tsx`  
Expected: FAIL on new primitive usage assertions

- [ ] **Step 3: Implement low-risk convergence**

```tsx
// DashboardHomePage.tsx, PortfolioPage.tsx, LoginPage.tsx
// standardize SectionHeading + Panel variants + Button usage
// remove route-local one-off style drift where still present
```

- [ ] **Step 4: Verify low-risk route tests**

Run: `npx vitest run src/test/auth.login.test.tsx src/test/portfolio.page.test.tsx src/test/dashboard.layout.test.tsx src/test/router.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit low-risk convergence**

```bash
git add chidinh_client/src/modules/dashboard/DashboardHomePage.tsx \
  chidinh_client/src/modules/portfolio/PortfolioPage.tsx \
  chidinh_client/src/modules/auth/LoginPage.tsx \
  chidinh_client/src/test/portfolio.page.test.tsx \
  chidinh_client/src/test/auth.login.test.tsx \
  chidinh_client/src/test/dashboard.layout.test.tsx
git commit -m "feat(ui): converge low-risk routes on foundation primitives"
```

---

### Task 5: Harden Shared Patterns Before Todo Migration

**Files:**
- Create: `chidinh_client/src/shared/ui/EmptyState.tsx`
- Create: `chidinh_client/src/shared/ui/InlineFeedback.tsx`
- Modify: `chidinh_client/src/shared/ui/Field.tsx`
- Modify: `chidinh_client/src/modules/auth/LoginPage.tsx`
- Modify: `chidinh_client/src/test/empty-state.test.tsx`
- Modify: `chidinh_client/src/test/auth.login.test.tsx`
- Test: `chidinh_client/src/test/empty-state.test.tsx`
- Test: `chidinh_client/src/test/auth.login.test.tsx`

- [ ] **Step 1: Write failing tests for reusable empty/feedback primitives**

```tsx
it("renders a consistent empty state title and description", () => {
  expect(screen.getByRole("heading", { name: /no items/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Verify new primitive tests fail first**

Run: `npx vitest run src/test/empty-state.test.tsx src/test/auth.login.test.tsx`  
Expected: FAIL due to missing reusable components

- [ ] **Step 3: Implement pattern-hardening primitives**

```tsx
// EmptyState.tsx
export function EmptyState({ title, description, action }: Props) { ... }

// InlineFeedback.tsx
export function InlineFeedback({ tone = "default", children }: Props) { ... }
```

- [ ] **Step 4: Verify hardened patterns**

Run: `npx vitest run src/test/empty-state.test.tsx src/test/auth.login.test.tsx src/test/auth.require-auth.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit pattern hardening**

```bash
git add chidinh_client/src/shared/ui/EmptyState.tsx \
  chidinh_client/src/shared/ui/InlineFeedback.tsx \
  chidinh_client/src/shared/ui/Field.tsx \
  chidinh_client/src/modules/auth/LoginPage.tsx \
  chidinh_client/src/test/empty-state.test.tsx \
  chidinh_client/src/test/auth.login.test.tsx
git commit -m "feat(ui): add shared empty and feedback patterns before todo migration"
```

---

### Task 6: Migrate TodoPage Last By Extracting State/Views Into Shared Patterns

**Files:**
- Create: `chidinh_client/src/modules/todo/todoDate.ts`
- Create: `chidinh_client/src/modules/todo/todoTags.ts`
- Create: `chidinh_client/src/modules/todo/TodoToolbar.tsx`
- Create: `chidinh_client/src/modules/todo/TodoForm.tsx`
- Create: `chidinh_client/src/modules/todo/TodoMetrics.tsx`
- Create: `chidinh_client/src/modules/todo/TodoList.tsx`
- Create: `chidinh_client/src/modules/todo/TodoBoard.tsx`
- Modify: `chidinh_client/src/modules/todo/TodoPage.tsx`
- Modify: `chidinh_client/src/test/todo.page.test.tsx`
- Create: `chidinh_client/src/test/todo.helpers.test.ts`
- Test: `chidinh_client/src/test/todo.page.test.tsx`
- Test: `chidinh_client/src/test/todo.helpers.test.ts`

- [ ] **Step 1: Add failing helper tests before extraction**

```ts
import { addUniqueTags, parseTagInput, dateInputToIsoInAppZone } from "../modules/todo/todoTags";

it("merges tags without duplicates", () => {
  expect(addUniqueTags(["work"], ["work", "deep"])).toEqual(["work", "deep"]);
});
```

- [ ] **Step 2: Verify helper tests fail first**

Run: `npx vitest run src/test/todo.helpers.test.ts`  
Expected: FAIL with module/function not found

- [ ] **Step 3: Extract helpers and split Todo page render surfaces**

```ts
// todoDate.ts + todoTags.ts
export function formatDateInputInAppZone(...) { ... }
export function dateInputToIsoInAppZone(...) { ... }
export function parseTagInput(...) { ... }
export function addUniqueTags(...) { ... }
```

```tsx
// TodoPage.tsx
// keep query/mutation orchestration
// delegate UI rendering to TodoToolbar, TodoMetrics, TodoForm, TodoList, TodoBoard
```

- [ ] **Step 4: Verify todo migration behavior**

Run: `npx vitest run src/test/todo.helpers.test.ts src/test/todo.page.test.tsx`  
Expected: PASS, with existing Todo behavior preserved

- [ ] **Step 5: Commit Todo late-phase migration**

```bash
git add chidinh_client/src/modules/todo/todoDate.ts \
  chidinh_client/src/modules/todo/todoTags.ts \
  chidinh_client/src/modules/todo/TodoToolbar.tsx \
  chidinh_client/src/modules/todo/TodoForm.tsx \
  chidinh_client/src/modules/todo/TodoMetrics.tsx \
  chidinh_client/src/modules/todo/TodoList.tsx \
  chidinh_client/src/modules/todo/TodoBoard.tsx \
  chidinh_client/src/modules/todo/TodoPage.tsx \
  chidinh_client/src/test/todo.page.test.tsx \
  chidinh_client/src/test/todo.helpers.test.ts
git commit -m "feat(todo): migrate todo onto hardened foundation patterns"
```

---

### Task 7: Cleanup, Deprecation, And Prototype Freeze Enforcement

**Files:**
- Modify: `chidinh_client/src/styles/globals.css`
- Modify: `docs/superpowers/specs/2026-04-02-forme-ui-primitive-inventory.md`
- Modify: `docs/superpowers/plans/2026-04-02-forme-frontend-rebuild-completion.md`
- Test: `chidinh_client/src/test/tailwind.theme.test.ts`

- [ ] **Step 1: Add failing token cleanup assertion**

```ts
it("keeps only approved legacy alias bridge tokens", async () => {
  // assert removed aliases are absent, approved bridge aliases still present
});
```

- [ ] **Step 2: Verify cleanup assertion fails first**

Run: `npx vitest run src/test/tailwind.theme.test.ts`  
Expected: FAIL on outdated alias set

- [ ] **Step 3: Apply deprecation cleanup and docs finalization**

```css
/* globals.css: remove obsolete aliases; keep only approved bridge aliases */
```

```markdown
Update inventory spec with:
- remaining frozen prototypes
- explicit reclassification decisions (if any)
- final deprecation outcomes
```

- [ ] **Step 4: Run full verification gate**

Run: `npm test`  
Expected: PASS (all tests green)

Run: `npm run build`  
Expected: PASS (production build success)

- [ ] **Step 5: Commit cleanup/deprecation**

```bash
git add chidinh_client/src/styles/globals.css \
  docs/superpowers/specs/2026-04-02-forme-ui-primitive-inventory.md \
  docs/superpowers/plans/2026-04-02-forme-frontend-rebuild-completion.md \
  chidinh_client/src/test/tailwind.theme.test.ts
git commit -m "chore(ui): finalize cleanup and deprecation for rebuild completion"
```

---

### Task 8: Final Integration, Regression Gate, And Delivery

**Files:**
- Modify: `docs/README.md`
- Modify: `docs/superpowers/plans/2026-04-02-forme-frontend-rebuild-completion.md`

- [ ] **Step 1: Run final integration suite**

Run: `npm test`  
Expected: PASS

Run: `npm run build`  
Expected: PASS

- [ ] **Step 2: Capture final migration summary in docs**

```markdown
Update docs/README.md with links to:
- inventory spec
- completion plan
- final implementation PR/commit range
```

- [ ] **Step 3: Commit delivery documentation**

```bash
git add docs/README.md docs/superpowers/plans/2026-04-02-forme-frontend-rebuild-completion.md
git commit -m "docs(ui): publish frontend rebuild completion handoff"
```

- [ ] **Step 4: Push and prepare PR**

Run: `git push -u origin codex/forme-foundation`  
Expected: branch published

---

## Plan Self-Review

### 1. Spec Coverage

- Inventory and taxonomy artifact is finalized in Task 1 and Task 7.
- Group B widening (layout + route + auth boundary) is covered in Tasks 2 and 3.
- Low-risk page migration is covered in Task 4.
- Pattern hardening before Todo is covered in Task 5.
- Todo migration last is covered in Task 6.
- Cleanup/deprecation and freeze enforcement is covered in Task 7.
- Phase verification gates are enforced repeatedly in Tasks 1-8.

### 2. Placeholder Scan

- No `TODO`/`TBD` placeholders are used in task steps.
- Every task includes explicit commands and expected outcomes.
- All tasks include concrete file targets.

### 3. Type Consistency

- Shell contract naming is consistently `shellNav` + `ShellStatus`.
- Todo helper extraction uses `todoDate` and `todoTags` consistently.
- Shared feedback primitives stay under `shared/ui` and are referenced with stable names.
