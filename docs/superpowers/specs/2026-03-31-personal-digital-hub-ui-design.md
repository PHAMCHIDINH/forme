# Personal Digital Hub UI Design Spec

## 1. Purpose

This spec defines the UI redesign for MVP 1 of Personal Digital Hub. The goal is
to turn the current functional frontend into a coherent product surface that
works as both:

- a public-facing portfolio that signals system architecture capability
- a private workspace that feels like the beginning of a personal operating system

The redesign must stay within the current MVP 1 product boundaries. It should
improve presentation, hierarchy, and extensibility without expanding the backend
scope or introducing unrelated product features.

## 2. Product Positioning

The chosen design direction is:

- hybrid between public portfolio and private workspace
- calm premium visual tone
- strong emphasis on system architect identity

This product should not feel like a generic developer portfolio, a SaaS admin
dashboard, or a concept-heavy futuristic control panel. It should feel like a
quiet, intentional digital studio that demonstrates architectural thinking
through both content and interface structure.

## 3. Experience Architecture

### 3.1 Top-Level Experience Model

The frontend is one product with two connected surfaces:

- `Public Hub` at `/`
- `Private Hub` at `/app`

The public hub communicates identity, design principles, selected systems, and
technical depth. The private hub focuses on utility, concentration, and modular
growth for internal tools.

These surfaces must share one design language. They may differ in density and
purpose, but they must not feel like separate products.

### 3.2 Route Roles

- `/`: editorial public landing page
- `/login`: low-friction access gate into the private workspace
- `/app`: authenticated dashboard home
- `/app/todo`: first internal productivity module

The shell must also leave visible room for future modules such as files, notes,
search, and automation, but those modules remain out of implementation scope for
this redesign.

## 4. Public Hub Design

### 4.1 Goals

The public page must:

- present the owner as a system architect, not only a software implementer
- show that the product is a living digital hub rather than a static brochure
- create a clean bridge into the private workspace

### 4.2 Public Page Structure

The public page is composed of these sections in order:

1. `Hero`
2. `Operating Principles`
3. `Selected Systems`
4. `Live Capabilities`
5. `Architecture Signal`
6. `Contact / Identity`

### 4.3 Section Definitions

#### Hero

The hero introduces the product and the owner in a concise editorial tone. It
must establish that this is a personal digital hub built around integrated
tools, architectural clarity, and evolving systems.

Primary CTA:

- `Explore Systems`

Secondary CTA:

- `Enter Workspace`

#### Operating Principles

This section presents three or four short principles that express how the system
is designed. Examples include:

- system thinking
- modular integration
- operational clarity
- human-centered workflows

#### Selected Systems

This section replaces a generic "projects" list. Each item must read like a
system case study with emphasis on:

- problem or domain
- architectural or integration challenge
- outcome or capability delivered

#### Live Capabilities

This section signals that the hub is active and expandable. It should present
current and near-future module categories such as:

- todo
- file manager
- knowledge base
- search
- automation

The presentation may indicate module status such as live, planned, or evolving,
but it must remain honest about what is implemented in MVP 1.

#### Architecture Signal

This section explicitly reinforces system architect positioning. It should call
out technical capability areas such as:

- API design
- deployment workflow
- secure access
- data modeling
- modular system boundaries

#### Contact / Identity

This section contains GitHub, email, and a restrained invitation to connect. The
tone should remain calm and precise, not promotional.

## 5. Private Hub Design

### 5.1 Goals

The private hub must feel like the operational side of the same product. It
should prioritize focus and clarity over visual spectacle.

### 5.2 Shell Structure

The authenticated shell is organized into:

- `Sidebar`
- `Context Bar`
- `Main Canvas`
- optional future `Utility Rail`

#### Sidebar

The sidebar should contain:

- compact brand or product label
- core navigation
- module links
- profile/logout area

It must feel more like studio navigation than an admin dashboard menu.

#### Context Bar

The context bar should show:

- current page title
- a short description of the current context
- page-level actions when relevant

It must stay quiet and avoid unnecessary controls.

#### Main Canvas

The canvas is the primary content area for each internal tool. It must provide
enough spacing and structure so that future modules can adopt the same shell
without redesign.

#### Utility Rail

The utility rail is reserved for future additions such as quick notes, pinned
items, or activity. It is not required to be fully active in MVP 1.

## 6. Todo Module Design

### 6.1 Goals

The todo module must move from a CRUD proof-of-concept presentation to a
polished operational module that still stays within MVP 1 scope.

### 6.2 Module Structure

The module should include:

- `Module Header`
- `Composer Panel`
- `Metrics Summary`
- `Task List Surface`
- explicit `Empty`, `Loading`, and `Error` states

### 6.3 Behavior

The todo module continues to use the existing API contract:

- list items
- create item
- toggle completion
- delete item

No new backend features are required for the redesign. The UI should improve:

- information hierarchy
- state feedback
- interaction clarity
- consistency with the shared workspace shell

## 7. Visual Language

### 7.1 Design Tone

The visual direction is calm premium with technical precision.

It must avoid:

- generic SaaS dashboard aesthetics
- loud cyber or neon motifs
- flat white portfolio-template styling

### 7.2 Color Strategy

The palette uses:

- warm, light neutral backgrounds
- deep slate or charcoal for text
- subtle surface variation for panels and cards
- one restrained accent in a cool, technical family

Status colors may be used in the private workspace where needed, but they should
support meaning rather than decoration.

### 7.3 Typography

The type system should combine:

- a more expressive heading face for editorial authority
- a clean sans-serif for body text and UI controls

The result should balance authored presence with usability.

### 7.4 Layout Rhythm

The interface should rely on:

- generous spacing
- clear content containers
- measured grid usage
- strong hierarchy through type and layout rather than heavy decoration

### 7.5 Surface Style

Cards and panels should use:

- restrained corner radius
- fine borders
- minimal shadows
- layering through spacing and tonal contrast

The system should feel crafted and quiet instead of glossy.

## 8. UI Grammar

### 8.1 Shared Primitives

The redesign should introduce a shared UI grammar used across both public and
private surfaces. The base primitives should include:

- page containers
- section wrappers
- panel and card surfaces
- buttons and action links
- tags or status pills
- typography utilities

These primitives should live in shared frontend code so the design language is
implemented once and reused consistently.

### 8.2 Public Grammar

The public side should use:

- large editorial hero composition
- modular narrative sections
- showcase cards for selected systems
- capability strips or grouped cards
- quiet calls to action

### 8.3 Private Grammar

The private side should use:

- restrained navigation panels
- contextual headers
- tool-specific surfaces
- compact action areas
- consistent state messaging

### 8.4 Navigation Relationship

The relationship between public and private views must remain legible:

- public view offers entry into the workspace
- login view offers return to the public hub
- private shell may include a subtle route back to public identity

This maintains the "one product, two surfaces" model.

## 9. Stack Alignment

The redesign must fit the documented MVP 1 stack and current codebase.

### 9.1 Keep

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- existing auth/session flow
- existing todo API contract

### 9.2 Add

- Tailwind CSS for layout and visual composition
- CSS custom properties for design tokens
- React Hook Form and Zod for user-facing forms

### 9.3 Use Selectively

- Radix UI primitives only where accessibility or overlay behavior materially
  benefits implementation

The redesign must not depend on a large opinionated component framework.

## 10. Implementation Scope

### 10.1 In Scope

- add styling foundation and design tokens
- redesign public portfolio page
- redesign login page
- redesign dashboard shell
- redesign todo module presentation
- update frontend tests where UI text or structure changes require it

### 10.2 Out of Scope

- real file manager implementation
- notes module
- search module
- automation module
- command palette
- portfolio CMS
- new backend capabilities unrelated to existing auth and todo flows

## 11. File and Module Direction

Implementation should continue following the documented frontend boundaries:

- `modules/portfolio` for public hub sections and content-driven UI
- `modules/dashboard` for private shell layout
- `modules/todo` for todo-specific UI
- `modules/auth` for login experience
- `shared/ui` for reusable design primitives
- `shared/lib`, `shared/constants`, or equivalent for tokens and shared helpers

The redesign should improve modularity rather than centralize everything in a
single page-level file.

## 12. Data Flow and Error Handling

### 12.1 Data Flow

Server-state responsibilities stay unchanged:

- session inspection via `GET /api/v1/auth/me`
- todo fetching via `GET /api/v1/todos`
- mutations for create, update, and delete

TanStack Query remains the owner of API-backed state. Local UI state is limited
to transient interface concerns such as inputs, simple visibility toggles, or
light presentation state.

### 12.2 Error Handling

The redesign must present clear error feedback for:

- login failures
- todo fetch failures
- todo mutation failures

Error messages should remain direct and calm. The interface should not obscure
failure states behind decorative components.

## 13. Testing Expectations

The redesign should preserve and extend frontend confidence through:

- route-level test coverage
- login interaction tests
- todo interaction tests
- smoke verification of the redesigned app shell

Tests should verify behavior and critical rendering expectations, not only class
names or visual details.

## 14. Success Criteria

The redesign is successful when:

- the public landing page clearly communicates Personal Digital Hub as a living
  portfolio and workspace system
- the product signals system architect capability through both content and UI
- the private shell feels coherent and extensible
- the todo module looks like an intentional workspace tool, not a demo list
- the frontend remains buildable and testable within the current MVP 1 stack

## 15. Delivery Recommendation

Implementation should proceed in this order:

1. styling foundation and tokens
2. shared UI primitives
3. public hub redesign
4. login redesign
5. dashboard shell redesign
6. todo module redesign
7. test updates and verification

This order keeps platform risk low while delivering visible product value early.
