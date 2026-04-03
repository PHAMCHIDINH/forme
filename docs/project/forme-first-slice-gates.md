# Form System Pilot Gate Checklist

Updated: 2026-04-03
Status: Ready with caveats
Scope: form-system foundation + pilot rollout for `LoginPage` and `TodoForm`

Note: this document keeps the historical file path, but it now serves as the form-system review gate described in the redesign spec rather than the earlier dashboard-only slice.

Governance references:
- Kickoff locks: `docs/project/2026-04-02-form-system-v1-kickoff-locks.md`
- Exception log: `docs/project/2026-04-02-form-system-exception-log.md`
- Deprecation plan: `docs/project/2026-04-02-form-system-deprecation-plan.md`

## Gate A — Alignment & Guardrails (Spec Phase 1)

- [x] Primitive v1 list is frozen.
- [x] UI rule layer vs domain validation layer boundary is frozen.
- [x] Pilot forms are explicitly named.
- [x] Two-column eligibility is expressed as the same 7-condition contract used in the spec.
- [x] Hidden dependent-field reset behavior is codified as a reusable rule.

Evidence:
- `docs/project/2026-04-02-form-system-v1-kickoff-locks.md`
- `chidinh_client/src/shared/form-system/contracts/formContracts.ts`
- `chidinh_client/src/shared/form-system/contracts/twoColumnEligibility.ts`
- `chidinh_client/src/shared/form-system/contracts/dependentFieldState.ts`
- `chidinh_client/src/test/form-system.contracts.test.ts`

## Gate B — Visual Foundation (Spec Phase 2)

- [x] Primitive inventory matches the v1 list frozen in the spec.
- [x] Primitive semantics and state hooks are covered by tests.
- [x] Pattern-level components exist for grouping, section structure, validation summary, actions, and conditional blocks.
- [x] Dark mode baseline is proven stable for pilot forms.

Evidence:
- `chidinh_client/src/shared/form-system/primitives/index.ts`
- `chidinh_client/src/shared/form-system/primitives/Button.tsx`
- `chidinh_client/src/shared/form-system/primitives/Checkbox.tsx`
- `chidinh_client/src/shared/form-system/primitives/Radio.tsx`
- `chidinh_client/src/shared/form-system/primitives/Switch.tsx`
- `chidinh_client/src/shared/form-system/primitives/Surface.tsx`
- `chidinh_client/src/shared/form-system/patterns/FieldRow.tsx`
- `chidinh_client/src/shared/form-system/patterns/FormSection.tsx`
- `chidinh_client/src/shared/form-system/patterns/ValidationSummary.tsx`
- `chidinh_client/src/shared/form-system/patterns/ActionArea.tsx`
- `chidinh_client/src/shared/form-system/patterns/ConditionalFieldBlock.tsx`
- `chidinh_client/src/test/form-system.primitives.test.tsx`
- `chidinh_client/src/test/form-system.patterns.test.tsx`
- `chidinh_client/src/test/form-system.dark-mode.test.tsx`
- `chidinh_client/src/test/tailwind.theme.test.ts`

## Gate C — Layout Foundation (Spec Phase 3)

- [x] Single-column remains the baseline form layout.
- [x] Two-column is only enabled through the eligibility checklist.
- [x] `TodoForm` falls back to one column for the `title + due date` row because that row fails the checklist.
- [x] `TodoForm` keeps two columns for the `status + priority` row because that row passes the checklist.
- [x] Validation summary and action area remain inside the natural reading flow.
- [x] Mobile collapse readability is proven with explicit pilot evidence.

Evidence:
- `chidinh_client/src/modules/todo/TodoForm.tsx`
- `chidinh_client/src/shared/form-system/contracts/twoColumnEligibility.ts`
- `chidinh_client/src/shared/form-system/patterns/FieldRow.tsx`
- `chidinh_client/src/test/form-system.contracts.test.ts`
- `chidinh_client/src/test/form-system.patterns.test.tsx`
- `chidinh_client/src/test/todo-form.layout.test.tsx`
- `chidinh_client/src/test/form-system.pilot-todo.test.tsx`

## Gate D — Pilot Implementation (Spec Phase 4)

- [x] Pilot set includes one shorter form (`LoginPage`) and one more complex conditional form (`TodoForm`).
- [x] Inline error and validation summary behavior are covered.
- [x] Conditional reveal and hidden-state cleanup are covered.
- [x] Action hierarchy is stable in both pilots.
- [x] Pilot composition uses shared form-system primitives/patterns instead of route-local rescue components.
- [x] Pilot coverage explicitly proves helper-text stress cases on real pilot forms.
- [x] Pilot coverage explicitly proves desktop/mobile behavior.
- [x] Pilot coverage explicitly proves dark mode baseline.

Evidence:
- `docs/project/2026-04-02-form-system-v1-kickoff-locks.md`
- `chidinh_client/src/modules/auth/LoginPage.tsx`
- `chidinh_client/src/modules/todo/TodoForm.tsx`
- `chidinh_client/src/test/form-system.pilot-login.test.tsx`
- `chidinh_client/src/test/form-system.pilot-todo.test.tsx`
- `chidinh_client/src/test/todo-form.layout.test.tsx`
- `chidinh_client/src/test/form-system.dark-mode.test.tsx`

## Gate E — Controlled Rollout (Spec Phase 5)

- [x] Exception governance exists and requires owner, review date, and sunset date.
- [x] Deprecation milestones exist for R+1, R+2, and R+3.
- [x] New forms are expected to use the current form-system path by default.
- [x] Legacy patterns for new forms require an approved exception.
- [x] Rollout decisions can be audited against frozen kickoff locks plus the exception/deprecation records.

Evidence:
- `docs/project/2026-04-02-form-system-exception-log.md`
- `docs/project/2026-04-02-form-system-deprecation-plan.md`
- `docs/project/2026-04-02-form-system-v1-kickoff-locks.md`

## Current Verdict

Proceed with controlled pilot iteration, not broad rollout.

Rationale:
- Core contracts, primitive inventory, pattern layer, and pilot behavior now map to the system rules in the spec.
- Rollout governance exists and is reviewable.
- The remaining caution is rollout posture, not missing pilot evidence: the foundation is proven on two pilots, but the spec still calls for controlled expansion rather than broad migration by default.
