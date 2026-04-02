# Forme First Slice Gate Checklist

Updated: 2026-04-02

## Gate A (state evidence)
- [x] default
- [x] hover
- [x] focus-visible
- [x] selected
- [x] disabled
- [x] pending/loading
- [x] empty/zero-data

Evidence:
- `src/test/context-toolbar.states.test.tsx`
- `src/test/dashboard.overview.states.test.tsx`

## Gate B (reuse evidence)
- [x] card/header rules on >=2 overview module shapes
- [x] ContextToolbar reused without local rescue classes
- [x] shell/header/action rhythm independent from one demo layout

Evidence:
- `src/modules/dashboard/DashboardHomePage.tsx` now has 2 `ContextToolbar` instantiations by composition.
- `src/test/dashboard.overview.states.test.tsx`
- `src/test/dashboard.layout.test.tsx`

## Gate C (reduction test)
- [x] reduced shadow
- [x] neutralized passive accent
- [x] reduced one border tier

Evidence:
- `:root[data-ui-reduction="true"]` in `src/styles/globals.css`
- `src/test/dashboard.reduction.test.tsx`

## Gate D (no-local-hack)
- [x] no route-local rescue spacing/border/radius overrides
- [x] no dashboard-only primitive variants
- [x] no shell leak into generic primitives

Audit notes:
- Dashboard layout uses shared primitives (`Panel`, `Button`, `ContextToolbar`) directly.
- No local override marker or one-off token escape hatch introduced.
