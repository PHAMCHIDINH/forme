# Personal Digital Hub macOS Desktop Design Spec

## 1. Status

This spec defines the approved UI redesign direction for the Personal Digital
Hub frontend as of April 1, 2026.

It supersedes the earlier calm-premium direction in
`docs/superpowers/specs/2026-03-31-personal-digital-hub-ui-design.md` for this
redesign effort.

The approved direction is:

- strong desktop metaphor
- inspired by warm modern macOS, not Windows nostalgia
- public surface is more expressive than private surface
- private workspace keeps the same visual universe but prioritizes usability

## 2. Purpose

The goal is to redesign the frontend so it feels like a personal computer
desktop on the web rather than a standard portfolio or dashboard application.

The product must communicate two things at once:

- this is a personal digital environment with live modules and system artifacts
- this is still a practical web app with clear navigation, readable content,
  and efficient workflows

The redesign must preserve the current route and backend boundaries for MVP 1.
No new backend capability is required.

## 3. Product Model

The frontend is one connected desktop-like product with four route roles:

- `/` is the public desktop portal
- `/login` is the access window into the private system
- `/app` is the private desktop workspace shell
- `/app/todo` is the first operational application inside that shell

These routes must feel like different states of the same machine, not separate
products.

## 4. Experience Architecture

### 4.1 Core Experience

The frontend will be designed as a personal desktop environment inspired by
modern macOS:

- warm layered backgrounds
- rounded windows
- soft glass or translucent surfaces
- traffic-light window controls
- dock-like navigation framing
- subtle depth through blur and shadow

This must not become a literal OS simulator. The desktop metaphor comes from
composition, framing, naming, and motion cues, while navigation and page
behavior remain standard web interactions.

### 4.2 Experience Split

The product is intentionally asymmetric:

- the public side is the expressive showpiece
- the private side is the practical workstation

This asymmetry is required. The public surface can carry more scene-setting,
editorial copy, and visual drama. The private workspace must keep stronger
clarity, hierarchy, and task efficiency.

## 5. Public Desktop Portal

### 5.1 Intent

The public home at `/` should feel like opening a personal machine that has
been carefully arranged by a system architect.

It should not read like a conventional landing page with stacked marketing
sections. It should read like a curated desktop scene where windows and
documents reveal identity, systems, and active modules.

### 5.2 Desktop Composition

The public page is built from four visual layers:

1. `Desktop Wallpaper`
2. `Top System Bar`
3. `Primary Windows`
4. `Dock`

#### Desktop Wallpaper

The wallpaper provides the atmosphere of the machine:

- warm gradient or photographic-abstraction feel
- enough contrast to make windows float cleanly
- no busy textures that hurt readability

#### Top System Bar

The top system bar provides light desktop framing:

- product or machine label
- current context label
- lightweight system indicators that do not introduce interactive complexity

It exists to establish the desktop metaphor, not to introduce dense controls.

#### Primary Windows

The core content is presented as a set of overlapping or clearly separated
windows that appear to live on the desktop.

Required windows:

- `About / Identity`
- `System Archive`
- `Operating Model`
- `Module Registry`
- `Architecture Notes`

The `About / Identity` window is the main hero. The rest act like applications,
documents, or dossiers.

On desktop widths, the windows should use a staggered composition with light
overlap to preserve the desktop illusion. On smaller widths, they must collapse
into a clear vertical stack in the same reading order.

#### Dock

The dock anchors the scene and provides memorable navigation entry points.

Recommended dock targets:

- `Portfolio`
- `Systems`
- `Workspace`
- `Contact`

Dock interactions still perform normal route changes or anchor navigation. On mobile widths, the floating desktop dock must collapse into a clear, translucent bottom navigation bar (acting like a system tray) to preserve readable screen real estate.

### 5.3 Public Content Naming

The public page should use desktop-aware names rather than plain portfolio
labels.

Preferred naming direction:

- `Selected Systems` becomes `System Archive`
- `Live Capabilities` becomes `Module Registry`
- `Architecture Signal` becomes `Architecture Notes`
- `Enter Workspace` remains the clearest private entry CTA

The exact wording can vary slightly in implementation, but the tone must feel
like a machine interface curated by a person, not a SaaS homepage.

### 5.4 Public Tone

Copy should feel:

- precise
- authored
- quietly confident
- less like promotion and more like interface labeling

It should not become fake terminal jargon, ironic nostalgia, or parody desktop
copy.

## 6. Login Window

### 6.1 Role

The login route at `/login` acts as the bridge between the public desktop and
the private machine state.

### 6.2 Structure

The route should be a single centered access window over the same general
desktop atmosphere:

- clear window header
- concise explanation of what the private space is
- username and password form
- low-friction link back to the public desktop

### 6.3 Tone

The login page should feel intentional and elegant, not theatrical. It is a
transition state, not a second hero page.

## 7. Private Workspace

### 7.1 Intent

The private routes must feel like working inside the same machine, but with
less spectacle and more discipline.

The private workspace should read as a practical desktop application surface,
not an admin dashboard and not a playful concept demo.

### 7.2 Shell Model

The authenticated shell at `/app` uses:

- a light desktop or top-bar frame
- a primary workspace window
- compact navigation for switching modules
- a stable content canvas for routed pages

The visual language stays consistent with the public side, but:

- fewer overlapping windows
- less decorative layering
- calmer backgrounds
- more direct content hierarchy

### 7.3 Navigation

Navigation should feel closer to application switching than sidebar-heavy admin
navigation.

The shell uses a compact dock-like launcher anchored to the main workspace
window instead of a heavy admin-style sidebar.

This launcher must preserve:

- clear current location
- obvious route access to `Home`, `Todo`, and `Public Hub`
- visible logout affordance

## 8. Todo Application

### 8.1 Role

`/app/todo` is the first operational app inside the private desktop. It should
look like a real productivity application window inside the system.

### 8.2 Structure

The todo route must contain:

- app header
- task composer
- compact metrics strip
- list surface
- explicit empty state
- explicit loading state
- explicit error state

### 8.3 Behavior

The route continues to use the existing API contract only:

- list items
- create item
- toggle completion
- delete item

The redesign must not require:

- new backend fields
- drag and drop
- tags
- filtering systems
- due dates

### 8.4 Presentation

The todo interface should feel calmer than the public desktop:

- clearer controls
- tighter spacing
- stronger contrast for form and list content
- reduced ornament around task actions

The task list is the document area. The composer and metrics strip support it
instead of competing with it.

## 9. Visual System

### 9.1 Design Direction

The approved design direction is `Warm Modern macOS`.

This means:

- rounded geometry
- soft shadows
- gentle translucency
- light borders
- warm neutral palette
- premium but approachable presentation

This does not mean:

- literal macOS cloning
- high-gloss Aqua skeuomorphism
- black-heavy futuristic glass UI
- strict neobrutalist borders from RetroUI

RetroUI remains a reference for confidence and component intent, not for direct
surface styling.

### 9.2 Color Strategy

The palette should center around:

- cream and sand neutrals
- warm charcoal text
- pale slate or sky blue accents
- restrained rose or clay accents for depth

Accent colors should help separate windows, modules, and context. They should
not become status-noise.

### 9.3 Typography

Typography should combine:

- a modern UI sans for controls and body copy
- a refined display face for major public headlines when emphasis is needed

Private workspace typography should lean more heavily on the sans system to
keep reading speed high.

### 9.4 Surface Language

The main surfaces are:

- wallpaper
- window chrome
- translucent shell panels
- content cards inside windows
- dock items

Each layer must be visually distinct, but the entire stack should still feel
quiet and cohesive.

## 10. Interaction Principles

### 10.1 Desktop Metaphor Boundaries

Allowed desktop cues:

- dock emphasis
- window headers
- traffic-light controls
- focus elevation
- subtle open or hover transitions

Disallowed desktop cues:

- fake draggable windows with no value
- fake boot sequences
- long startup animations
- novelty interactions that hide navigation

### 10.2 Motion

Motion should be brief and informative:

- hover elevation
- focus shifts
- subtle route-entry transitions (e.g., a quiet fade or very slight scale-in when transitioning from `/login` to `/app` to signal system entry without cinematic delay)
- light dock or button response

Motion must never slow down login, navigation, or task interaction.

## 11. Accessibility and Clarity

Desktop styling must not reduce core usability.

Required guardrails:

- strong text contrast against translucent surfaces
- reliable focus states
- touch-friendly tap targets
- readable content on laptop and mobile widths
- semantic reading order despite layered visual layout

If overlapping windows create ambiguity on smaller screens, the mobile layout
must collapse them into a cleaner stacked flow.

## 12. Implementation Boundaries

This redesign may change:

- layout structure
- section names
- microcopy
- shared UI primitives
- route composition and visual framing

This redesign must not change:

- route inventory for MVP 1
- auth contract
- todo API contract
- backend module scope
- core MVP 1 frontend stack (React, Vite, Tailwind CSS, TanStack Query, and Radix UI primitives only where necessary for accessible overlays)

## 13. Verification Expectations

Implementation should be verified through:

- route-level tests for public, login, dashboard, and todo entry points
- assertions on critical headings, navigation, and CTA affordances
- responsive browser checks for public desktop and private workspace layouts
- interaction checks for login and todo creation, toggle, and delete flows

The key success condition is not pixel-perfect imitation of macOS. The success
condition is that the app feels like a beautiful personal desktop while still
working like a disciplined web product.
