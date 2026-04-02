# Forme UI Primitive Inventory And Taxonomy

## 1. Status

This document is the Phase 0 inventory artifact for the Forme frontend rebuild.

It does not reset the approved strategy.
It locks the initial primitive taxonomy, ownership boundaries, and freeze list
needed before Phase 1 foundation work begins.

The strategy remains:

- migration in place
- Tailwind + Radix + shadcn/ui patterns + CVA as the foundation
- Forme-specific tokens, naming, shell contract, and visual grammar
- `retroui.dev` as inspiration only
- primitive first, shell first, `TodoPage` last

### Current Phase Status

- Phase 0 (inventory and taxonomy artifact): complete
- Phase 1 foundation slice (tokens + button/surface/form primitives): complete
- Frozen prototype shell pieces: unchanged and still frozen (`SidebarNav`,
  `WindowFrame`, `DockNav`, `SystemBar`, `CommandPalette`, `RightPanel`,
  `useWorkspaceStore`)

## 2. Purpose

The current frontend already has enough route and module structure.
The drift is happening in the UI layer, where primitives, shell artifacts, and
page-level compositions are mixed too freely.

This inventory exists to answer four questions before code migration expands:

1. What counts as a primitive?
2. What counts as a shell artifact?
3. What is frozen for now?
4. What current components map to future foundation roles?

## 3. Layer Model

The frontend UI layer should be treated as five distinct layers:

### 3.1 Tokens

Tokens define color, typography, spacing, radius, border, shadow, and focus
semantics.

Rules:

- one semantic token source of truth lives in `src/styles/globals.css`
- legacy aliases may exist temporarily, but only as an explicit sunset bridge
- components consume semantic tokens, not ad hoc literals

### 3.2 Primitives

Primitives are the smallest reusable UI building blocks that are safe to use
across routes.

A primitive must have one clear job and stable semantics.
It should not encode page-specific copy, route ownership, or shell structure.

Initial primitive roles:

- `Action`
- `Navigation action`
- `Input control`
- `Field wrapper`
- `Surface`
- `Section heading`
- `Feedback`

### 3.3 Shell Primitives

Shell primitives support app framing but do not define the entire shell alone.
They can be reused inside the authenticated app shell once the contract is
stable.

Examples:

- navigation list item
- shell frame region
- content well
- shell header block

These are not the same thing as experimental desktop-metaphor components.

### 3.4 Shell Artifacts

Shell artifacts are larger, directional pieces that express a shell concept or
desktop metaphor, but are not yet safe to treat as canonical foundation.

They must not silently become primitives by repeated reuse.

### 3.5 Page Compositions

Page compositions are route-owned assemblies that combine primitives and shell
contract pieces into a screen.

Examples:

- `PortfolioPage`
- `LoginPage`
- `DashboardHomePage`
- `TodoPage`

## 4. Initial Primitive Inventory

### 4.1 Action

Purpose:
- trigger an in-app action such as submit, confirm, cancel, or logout

Initial owner:
- `src/shared/ui/Button.tsx`

Requirements:
- native button semantics by default
- disabled and pending states
- focus-visible treatment
- CVA-owned variants

Out of scope:
- route navigation ownership

### 4.2 Navigation Action

Purpose:
- apply action styling to a navigational element without redefining navigation
  semantics inside the button primitive

Initial owner:
- compose `Button` with Radix `Slot` and `react-router-dom` `Link`

Requirements:
- keep link semantics when navigation is intended
- reuse action styling without mixing `to` props into the core button primitive

### 4.3 Input Control

Purpose:
- provide shared text input styling and focus behavior

Initial owner:
- new shared control under `src/shared/ui/`

Requirements:
- shared text/password styling
- token-driven focus ring
- support native form props

### 4.4 Field Wrapper

Purpose:
- unify label, control, and message structure for simple forms

Initial owner:
- new shared field primitives under `src/shared/ui/`

Requirements:
- label ownership
- optional hint/error message region
- enough structure for `LoginPage`

Out of scope:
- full React Hook Form abstraction layer
- complex composed forms

### 4.5 Surface

Purpose:
- provide reusable content surfaces for cards, sections, and calm workspace
  containers

Initial owner:
- `src/shared/ui/Panel.tsx`

Requirements:
- explicit variants through CVA
- no silent expansion into shell-only responsibilities

Notes:
- `Panel` remains the bridge surface for early migration
- the taxonomy should move it toward a clearer surface role, not keep it as an
  unlimited wrapper

### 4.6 Section Heading

Purpose:
- normalize eyebrow, title, and description composition

Initial owner:
- `src/shared/ui/SectionHeading.tsx`

Requirements:
- stable hierarchy for low-risk pages
- no shell ownership

### 4.7 Feedback

Purpose:
- display inline validation, empty, loading, and simple status messaging

Initial owner:
- starts minimal in shared form/message primitives
- expands in Phase 4

## 5. Current Component Mapping

### 5.1 Keep And Refine In Foundation Path

- `Button` -> action primitive
- `Panel` -> surface primitive
- `SectionHeading` -> heading primitive

### 5.2 Normalize During Shell Contract Work

- `DashboardLayout` -> authenticated app shell composition
- `AppRouter` -> route-shell ownership boundary
- `RequireAuth` -> auth/loading boundary for shell contract

### 5.3 Route-Owned Consumers

- `PortfolioPage` -> early public composition validation
- `LoginPage` -> minimal shared form validation
- `DashboardHomePage` -> low-risk shell composition validation
- `TodoPage` -> late migration target only

## 6. Freeze List

The following pieces are explicitly frozen during Groups A-C unless the shell
contract reclassifies them:

- `SidebarNav`
- `WindowFrame`
- `DockNav`
- `SystemBar`
- `CommandPalette`
- `RightPanel`
- `useWorkspaceStore`

Frozen means:

- no opportunistic reuse as foundation primitives
- no visual migration work just because they exist
- no silent wiring into the canonical shell path

They are directional prototypes, not dead code.

## 7. Immediate Foundation Mappings

Phase 1 should establish only the minimum set needed to unblock safe migration:

1. semantic token source of truth in `src/styles/globals.css`
2. real action primitive in `src/shared/ui/Button.tsx`
3. clarified surface primitive in `src/shared/ui/Panel.tsx`
4. minimal shared input and field primitives for `LoginPage`

This is intentionally smaller than the full future design system.

## 8. Sunset Guidance

Legacy behavior may stay temporarily only when one of these is true:

- it is needed as a bridge during migration
- it has a named replacement already defined in this document
- its removal is blocked by a later phase

Legacy behavior should not keep growing after a replacement exists.

## 9. Verification Anchor

This inventory should stay aligned with the current verification surface in
`src/test/`, especially:

- `tailwind.theme.test.ts`
- `auth.login.test.tsx`
- `portfolio.page.test.tsx`
- `dashboard.layout.test.tsx`
- `auth.require-auth.test.tsx`
- `router.test.tsx`

If a primitive change invalidates one of these assumptions, the test surface
should be updated deliberately rather than bypassed.

## 10. Cleanup Outcomes

Current cleanup and deprecation outcomes:

- legacy alias `--color-surface-alt` is sunset and removed from
  `src/styles/globals.css`
- approved bridge aliases remain `--color-base`, `--color-surface`,
  `--color-surfaceAlt`, and `--color-text`

Current frozen prototype status:

- `SidebarNav`, `WindowFrame`, `DockNav`, `SystemBar`, `CommandPalette`,
  `RightPanel`, and `useWorkspaceStore` remain frozen as directional prototypes
- no prototype shell piece has been reclassified as canonical foundation in
  this cycle
