# Forme First Slice Phase 5 Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn tất Phase 5 cho first slice bằng evidence gate đầy đủ (A/B/C/D), sau đó ra quyết định proceed/adjust/pause trước khi chạm forms/todo.

**Architecture:** Dùng chính primitive contract đã có (`globals.css`, `Button`, `Panel`, `SectionHeading`, `ContextToolbar`) để bổ sung bằng chứng trạng thái, reuse, reduction test và no-local-hack review. Không mở rộng feature ngoài dashboard shell + overview + shared toolbar. Kết quả cuối cùng là một checkpoint doc có bằng chứng kiểm thử + kết luận phạm vi đã chứng minh/chưa chứng minh.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Vitest, Testing Library.

---

### Task 1: Baseline Gate Checklist Setup

**Files:**
- Modify: `/mnt/d/chidinh/docs/superpowers/plans/2026-04-02-forme-first-slice-phase5-validation.md`
- Create: `/mnt/d/chidinh/docs/project/forme-first-slice-gates.md`

- [ ] **Step 1: Tạo gate checklist document**

```md
# Forme First Slice Gate Checklist

## Gate A (state evidence)
- default
- hover
- focus-visible
- selected
- disabled
- pending/loading
- empty/zero-data

## Gate B (reuse evidence)
- card/header rules on >=2 overview module shapes
- ContextToolbar reused without local rescue classes
- shell/header/action rhythm independent from one demo layout

## Gate C (reduction test)
- reduced shadow
- neutralized passive accent
- reduced one border tier

## Gate D (no-local-hack)
- no route-local rescue spacing/border/radius overrides
- no dashboard-only primitive variants
- no shell leak into generic primitives
```

- [ ] **Step 2: Commit gate checklist seed**

Run:
```bash
git add /mnt/d/chidinh/docs/project/forme-first-slice-gates.md /mnt/d/chidinh/docs/superpowers/plans/2026-04-02-forme-first-slice-phase5-validation.md
git commit -m "docs: add first-slice phase5 gate checklist"
```

Expected: 1 commit created.

### Task 2: Gate A State Evidence for ContextToolbar

**Files:**
- Create: `/mnt/d/chidinh/chidinh_client/src/test/context-toolbar.states.test.tsx`
- Test: `/mnt/d/chidinh/chidinh_client/src/test/context-toolbar.states.test.tsx`

- [ ] **Step 1: Write failing tests for required toolbar states**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { ContextToolbar } from "../shared/ui/ContextToolbar";

describe("ContextToolbar states", () => {
  test("renders selected scope as strongest non-CTA emphasis", () => {
    render(
      <ContextToolbar
        scopeOptions={[{ value: "all", label: "All" }, { value: "planned", label: "Planned" }]}
        selectedScope="planned"
        onScopeChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Planned" })).toHaveAttribute("data-selected", "true");
  });

  test("supports disabled and pending action states", () => {
    render(
      <ContextToolbar
        scopeOptions={[{ value: "all", label: "All" }]}
        selectedScope="all"
        onScopeChange={vi.fn()}
        secondaryActions={[{ label: "Export", onClick: vi.fn(), disabled: true }]}
        primaryAction={{ label: "Sync", onClick: vi.fn(), pending: true, disabled: true }}
      />,
    );

    expect(screen.getByRole("button", { name: "Export" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sync" })).toHaveAttribute("data-pending", "true");
  });

  test("supports keyboard focus-visible traversal", async () => {
    const user = userEvent.setup();
    render(
      <ContextToolbar
        scopeOptions={[{ value: "all", label: "All" }]}
        selectedScope="all"
        onScopeChange={vi.fn()}
        searchValue=""
        onSearchChange={vi.fn()}
      />,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "All" })).toHaveFocus();
  });
});
```

- [ ] **Step 2: Verify RED**

Run:
```bash
cd /mnt/d/chidinh/chidinh_client
npx vitest run src/test/context-toolbar.states.test.tsx
```

Expected: FAIL trước khi code support đầy đủ trạng thái.

- [ ] **Step 3: Implement minimal updates (if test fails)**

Files to update (only if required by test failures):
- `/mnt/d/chidinh/chidinh_client/src/shared/ui/ContextToolbar.tsx`
- `/mnt/d/chidinh/chidinh_client/src/shared/ui/Button.tsx`

Implementation constraint:
- Không thêm dashboard-only classes.
- Chỉ sửa shared primitives/pattern.

- [ ] **Step 4: Verify GREEN**

Run:
```bash
cd /mnt/d/chidinh/chidinh_client
npx vitest run src/test/context-toolbar.states.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add /mnt/d/chidinh/chidinh_client/src/test/context-toolbar.states.test.tsx \
  /mnt/d/chidinh/chidinh_client/src/shared/ui/ContextToolbar.tsx \
  /mnt/d/chidinh/chidinh_client/src/shared/ui/Button.tsx
git commit -m "test(ui): add context toolbar state evidence"
```

### Task 3: Gate A Empty/Zero-data Evidence on Overview

**Files:**
- Create: `/mnt/d/chidinh/chidinh_client/src/test/dashboard.overview.states.test.tsx`
- Modify (only if needed): `/mnt/d/chidinh/chidinh_client/src/modules/dashboard/DashboardHomePage.tsx`

- [ ] **Step 1: Write failing test for empty path**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { DashboardHomePage } from "../modules/dashboard/DashboardHomePage";

describe("Dashboard overview empty-state", () => {
  test("shows empty state when filters return zero modules", async () => {
    const user = userEvent.setup();
    render(<DashboardHomePage />);

    await user.click(screen.getByRole("button", { name: /planned next-cycle surfaces/i }));
    await user.selectOptions(screen.getByLabelText(/module state/i), "live");

    expect(screen.getByText(/No modules match this context/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify RED**

Run:
```bash
cd /mnt/d/chidinh/chidinh_client
npx vitest run src/test/dashboard.overview.states.test.tsx
```

Expected: FAIL initially if query path/labels mismatch.

- [ ] **Step 3: Minimal implementation fix**

Adjust only semantic labels/controls in:
- `/mnt/d/chidinh/chidinh_client/src/modules/dashboard/DashboardHomePage.tsx`

- [ ] **Step 4: Verify GREEN**

Run:
```bash
cd /mnt/d/chidinh/chidinh_client
npx vitest run src/test/dashboard.overview.states.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add /mnt/d/chidinh/chidinh_client/src/test/dashboard.overview.states.test.tsx \
  /mnt/d/chidinh/chidinh_client/src/modules/dashboard/DashboardHomePage.tsx
git commit -m "test(dashboard): add empty-state evidence for overview"
```

### Task 4: Gate B Reuse Evidence (Second ContextToolbar Instantiation)

**Files:**
- Modify: `/mnt/d/chidinh/chidinh_client/src/modules/dashboard/DashboardHomePage.tsx`
- Test: `/mnt/d/chidinh/chidinh_client/src/test/dashboard.layout.test.tsx`

- [ ] **Step 1: Add second non-page-header ContextToolbar usage by composition**

Implementation rules:
- Dùng lại `ContextToolbar` component trực tiếp.
- Không thêm CSS override cục bộ để “rescue” layout.
- Giữ đúng left context / right actions semantics.

- [ ] **Step 2: Add/adjust test assertion for reuse without local overrides**

```tsx
expect(screen.getAllByText(/Sync Overview|Primary Action/i).length).toBeGreaterThanOrEqual(1);
expect(document.querySelectorAll("[data-toolbar-local-override]").length).toBe(0);
```

- [ ] **Step 3: Verify tests**

Run:
```bash
cd /mnt/d/chidinh/chidinh_client
npx vitest run src/test/dashboard.layout.test.tsx src/test/dashboard.overview.states.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add /mnt/d/chidinh/chidinh_client/src/modules/dashboard/DashboardHomePage.tsx \
  /mnt/d/chidinh/chidinh_client/src/test/dashboard.layout.test.tsx \
  /mnt/d/chidinh/chidinh_client/src/test/dashboard.overview.states.test.tsx
git commit -m "feat(ui): prove context toolbar reuse in second dashboard composition"
```

### Task 5: Gate C Reduction Test

**Files:**
- Modify: `/mnt/d/chidinh/chidinh_client/src/styles/globals.css`
- Create: `/mnt/d/chidinh/chidinh_client/src/test/dashboard.reduction.test.tsx`

- [ ] **Step 1: Introduce reduction-mode token toggles**

```css
:root[data-ui-reduction="true"] {
  --shadow-crisp-sm: 0 1px 0 0 rgba(30, 37, 44, 0.12);
  --shadow-crisp-md: 0 1px 0 0 rgba(30, 37, 44, 0.14);
  --surface-panel-muted: #f6f0e6;
  --border-default: #d5cdc0;
}
```

- [ ] **Step 2: Add test proving hierarchy still legible under reduction mode**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { DashboardHomePage } from "../modules/dashboard/DashboardHomePage";

describe("Dashboard reduction mode", () => {
  test("keeps featured and passive hierarchy in reduction mode", () => {
    document.documentElement.setAttribute("data-ui-reduction", "true");
    render(<DashboardHomePage />);

    expect(screen.getByText(/Featured summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Planned Module/i)).toBeInTheDocument();

    document.documentElement.removeAttribute("data-ui-reduction");
  });
});
```

- [ ] **Step 3: Verify RED/GREEN**

Run:
```bash
cd /mnt/d/chidinh/chidinh_client
npx vitest run src/test/dashboard.reduction.test.tsx
```

Expected: PASS sau khi có reduction tokens.

- [ ] **Step 4: Commit**

```bash
git add /mnt/d/chidinh/chidinh_client/src/styles/globals.css \
  /mnt/d/chidinh/chidinh_client/src/test/dashboard.reduction.test.tsx
git commit -m "test(ui): add reduction-mode hierarchy evidence"
```

### Task 6: Gate D Audit + Success Checkpoint Document

**Files:**
- Create: `/mnt/d/chidinh/docs/project/forme-first-slice-checkpoint.md`
- Modify: `/mnt/d/chidinh/docs/project/forme-first-slice-gates.md`

- [ ] **Step 1: Run no-local-hack audit checklist**

Checklist:
- route-local spacing/border/radius rescue classes introduced?
- dashboard-only variant introduced without shared reuse?
- shell assumptions leaked into base primitive?

Record findings in `forme-first-slice-gates.md`.

- [ ] **Step 2: Write checkpoint doc with explicit proved vs not-proved scope**

```md
## Proved
- shell hierarchy contract
- overview featured/passive hierarchy
- shared context-toolbar pattern + state matrix

## Not Proved
- forms/validation-heavy readiness
- todo dense interactions
- mutation-heavy operational UI

## Recommendation
- proceed / adjust / pause (one selected with rationale)
```

- [ ] **Step 3: Verify full suite and build before completion claim**

Run:
```bash
cd /mnt/d/chidinh/chidinh_client
npm test
npm run build
```

Expected:
- All tests pass
- Build succeeds (tsc + vite)

- [ ] **Step 4: Commit docs + gate results**

```bash
git add /mnt/d/chidinh/docs/project/forme-first-slice-gates.md \
  /mnt/d/chidinh/docs/project/forme-first-slice-checkpoint.md
git commit -m "docs: record first-slice validation gates and readiness checkpoint"
```

---

## Spec Coverage Self-Review
- Covers Gate A/B/C/D from handoff acceptance doc.
- Keeps fixed scope (authenticated shell + overview + shared toolbar), không mở rộng login/todo redesign.
- Includes explicit non-proof warning in checkpoint output.
- Includes verification-before-completion (`npm test`, `npm run build`) before any completion claim.

## Execution Notes
- Thực thi trên branch riêng (prefix `codex/`) theo `using-git-worktrees` nếu cần isolation.
- Nếu gặp blocker (test architecture mismatch), dừng và raise issue ngay, không đoán.
