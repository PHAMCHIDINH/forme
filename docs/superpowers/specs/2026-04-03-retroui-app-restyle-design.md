# RetroUI App-Wide Restyle Design

## Goal

Restyle the entire `chidinh_client` app so it reads clearly as `retroui.dev`-inspired neo-brutalist UI instead of a warm, polished SaaS/product UI. The redesign must keep the existing routes, content structure, and interaction model intact while changing the visual system aggressively enough that the app immediately signals a stronger RetroUI-like identity.

## Scope

In scope:

- Global visual tokens and CSS theme behavior
- Shared UI primitives and form-system primitives
- Public shell and private dashboard shell
- Portfolio, login, dashboard, and todo surfaces
- Light and dark mode parity for the new visual language
- Tests that currently lock in the old “balanced product retro” theme assumptions

Out of scope:

- Feature additions
- Route changes or information architecture changes
- Rewriting business logic or data flow
- Introducing a third visual mode

## Design Intent

The current UI reads as “balanced retro product UI”: warm palette, subtle shadows, medium radius, careful polish, low aggression. The new target is intentionally more graphic and more assertive.

The app should feel:

- framed
- punchy
- contrast-heavy
- playful but not childish
- product-usable, but visibly stylized

The app should not feel:

- soft
- tasteful-to-the-point-of-generic
- airy minimal SaaS
- poster-chaotic or novelty-only

## Chosen Approach

Use a system-first redesign:

1. Replace the current token set with a RetroUI-driven palette and geometry.
2. Rework shared primitives so panels, buttons, fields, labels, and navigation all speak the same visual language.
3. Recompose page shells and feature surfaces using the updated primitives rather than leaving page-level ad hoc styling in place.

This is deliberately stronger than a token-only refresh but stops short of changing the product structure.

## Theme Direction

Use the user-provided theme as the base contract, with freedom to tune contrast and supporting tokens as needed:

```css
:root {
    --radius: 0.5rem;
    --background: #FCFFE7;
    --foreground: #000000;
    --muted: #EFD0D5;
    --muted-foreground: #A42439;
    --card: #FFFFFF;
    --card-foreground: #000000;
    --popover: #FFFFFF;
    --popover-foreground: #000000;
    --border: #000000;
    --input: #FFFFFF;
    --primary: #EA435F;
    --primary-hover: #D00000;
    --primary-foreground: #FFFFFF;
    --secondary: #FFDA5C;
    --secondary-foreground: #000000;
    --accent: #CEEBFC;
    --accent-foreground: #000000;
    --destructive: #D00000;
    --destructive-foreground: #FFFFFF;
    --ring: #000000;
}

.dark {
    --background: #0f0f0f;
    --foreground: #f5f5f5;
    --muted: #3a1f24;
    --muted-foreground: #f2a7b2;
    --card: #1a1a1a;
    --card-foreground: #ffffff;
    --popover: #1a1a1a;
    --popover-foreground: #ffffff;
    --border: #2a2a2a;
    --input: #2a2a2a;
    --primary: #EA435F;
    --primary-hover: #D00000;
    --primary-foreground: #ffffff;
    --secondary: #FFDA5C;
    --secondary-foreground: #000000;
    --accent: #2a3b45;
    --accent-foreground: #CEEBFC;
    --destructive: #D00000;
    --destructive-foreground: #ffffff;
    --ring: #EA435F;
}
```

## Visual DNA

### Geometry

- Standard radius becomes `0.5rem` across controls, buttons, panels, and grouped surfaces.
- Rounded-full pills are no longer baseline UI language.
- Corners should feel firm and intentional, not soft and bubbly.

### Border Language

- Borders are primary structure, not subtle decoration.
- Default borders should be near-black in light mode and clearly visible in dark mode.
- Border thickness should read stronger than current Tailwind defaults on all primary surfaces and controls.

### Shadow Language

- Prefer hard offset shadows over blurry depth.
- Panels, buttons, and emphasized modules should read as stacked paper blocks or framed objects.
- Shadows should create graphic separation, not soft elevation.

### Color Behavior

- Background should be bright and flat enough to let blocks of red, yellow, blue, black, and white do the work.
- `primary` is for the loudest CTA moments.
- `secondary` and `accent` should appear as deliberate slabs or patches, not faint tints.
- Muted content should still feel designed, not greyed out.

### Typography

- Headings should move closer to editorial/display energy.
- Labels, eyebrows, nav labels, and module captions should be more assertive and often uppercase.
- Body copy remains readable and compact enough for app use.
- Type contrast should come from size, case, weight, and spacing before color.

## App-Level Composition

### Public Surfaces

- The public portfolio page should feel like a designed poster-workspace hybrid rather than a generic landing page.
- Hero and section surfaces should use framed blocks, stronger contrast, and more obvious visual rhythm.

### Private Shell

- The dashboard shell should look like a modular control board.
- Sidebar, top context area, and content panels should feel like separate framed pieces rather than one soft canvas.
- Navigation should use stronger selected and hover states, with explicit module framing.

### Density

- Maintain usability for app flows, but bias toward compact, deliberate grouping instead of large soft whitespace.
- Rhythm should come from grouped blocks and visible boundaries rather than mostly from spacing alone.

## Component Rules

### Panel / Surface

- All core panels become white or themed blocks with dark borders and offset shadows.
- `featured` surfaces may use `secondary` or `accent` fills rather than subtle warm tints.
- Shell panels should feel like discrete slabs.

### Button

- Primary buttons become chunkier and more obviously clickable.
- Secondary buttons should still have fill and contrast, not look like timid outline buttons.
- Ghost buttons are limited to low-emphasis places.
- Destructive actions need a distinct destructive treatment, not just “another neutral button”.

### Input / Select / Textarea

- Default field shell should be white in light mode, dark in dark mode, with strong border contrast.
- Focus states should be louder and more graphic.
- Placeholder text should recede more clearly.
- Readonly and disabled must remain visibly different, with readonly still feeling active for review.
- `Textarea` or rich text entry must use the same shell language as the rest of the system.

### Validation Summary

- Validation summary should read as a strong alert card or banner.
- Error title and links should feel intentional and high-contrast.
- Jump-to-error behavior remains part of the v1 contract.

### Labels / Helper / Error Text

- Labels become more assertive.
- Helper text remains compact but should still feel integrated with the graphic system.
- Error text should pair with the stronger alert treatment rather than look like a generic red caption.

### Chips / Tags / Small Actions

- Remove the soft rounded-full chip default in todo and similar views.
- Small actions should reuse the system button language or a closely related reduced variant.

### Metrics / Toolbars

- Toolbars and metric cards need the same panel/button/control language.
- Native controls should not appear as browser-default-looking elements beside highly styled panels.

## Page-Specific Direction

### Portfolio Page

- Increase art-direction energy.
- Lean into framed sections, stronger headline treatment, and more obvious accent blocking.
- Preserve content hierarchy and route structure.

### Login Page

- Make the split layout feel like two bold framed panels rather than two polite cards.
- Left panel can carry more graphic identity; right panel should still remain form-focused.

### Dashboard Layout

- Sidebar should look like a module board, with stronger nav affordances and clearer separation from the main content stack.
- Top context strip should feel like a control bar, not just another polite panel.

### Todo Page

- Replace remaining ad hoc controls with system primitives or matching variants.
- Form, toolbar, metrics, and list items must all feel like they belong to the same visual system.
- Rich text controls and item actions must stop reading as generic utility buttons.

## Implementation Boundaries

### Core files expected to change

- `chidinh_client/src/styles/globals.css`
- `chidinh_client/src/shared/ui/Button.tsx`
- `chidinh_client/src/shared/ui/Panel.tsx`
- `chidinh_client/src/shared/ui/SectionHeading.tsx`
- `chidinh_client/src/shared/ui/SidebarNav.tsx`
- `chidinh_client/src/shared/ui/WindowFrame.tsx`
- `chidinh_client/src/shared/ui/SystemBar.tsx`
- `chidinh_client/src/shared/form-system/primitives/InputShell.tsx`
- `chidinh_client/src/shared/form-system/primitives/SelectTrigger.tsx`
- `chidinh_client/src/shared/form-system/primitives/TextareaShell.tsx`
- `chidinh_client/src/shared/form-system/primitives/Checkbox.tsx`
- `chidinh_client/src/shared/form-system/primitives/Radio.tsx`
- `chidinh_client/src/shared/form-system/primitives/Switch.tsx`
- `chidinh_client/src/shared/form-system/primitives/Label.tsx`
- `chidinh_client/src/shared/form-system/primitives/HelperText.tsx`
- `chidinh_client/src/shared/form-system/primitives/ErrorText.tsx`
- `chidinh_client/src/shared/form-system/patterns/ValidationSummary.tsx`
- `chidinh_client/src/modules/portfolio/PortfolioPage.tsx`
- `chidinh_client/src/modules/auth/LoginPage.tsx`
- `chidinh_client/src/modules/dashboard/DashboardLayout.tsx`
- `chidinh_client/src/modules/todo/TodoPage.tsx`
- `chidinh_client/src/modules/todo/TodoForm.tsx`
- `chidinh_client/src/modules/todo/TodoToolbar.tsx`
- `chidinh_client/src/modules/todo/TodoList.tsx`
- `chidinh_client/src/modules/todo/TodoMetrics.tsx`

### Test files expected to change

- Theme/token tests
- Panel/button/form-system primitive tests
- Pilot page tests that assert old class names or old layout assumptions

## Acceptance Criteria

The redesign is successful when:

1. The app reads immediately as RetroUI-inspired without needing explanation.
2. Light and dark mode both preserve the same neo-brutalist DNA.
3. Shared primitives visibly drive the styling instead of page-specific one-off CSS doing the work.
4. `todo` no longer contains obvious style outliers that look generic next to the updated system.
5. `login`, `portfolio`, and `dashboard` each feel visually related but remain appropriate to their purpose.
6. Existing usability and readability stay intact.

## Risks

### Over-styling

Pushing too hard can make the app look like a demo rather than a usable workspace. The implementation must preserve hierarchy and scanability even while increasing contrast and character.

### Partial migration

If only tokens and a few shared primitives change, the app will still look inconsistent. The page-level cleanup is required, especially on todo and shell surfaces.

### Dark Mode Drift

It is easy to make light mode bold and leave dark mode merely “functional”. Dark mode must preserve the same attitude, not just survive the change.

## Testing Strategy

- Update tests that encode old theme assumptions.
- Add or adjust tests where new variants or semantics are introduced.
- Run the relevant `vitest` suites for theme, primitives, patterns, login, todo, dashboard, and smoke coverage.
- Perform visual spot checks in the browser on at least:
  - `/`
  - `/login`
  - `/app`
  - `/app/todo`

## Recommendation For Planning

Implementation should proceed in this order:

1. Token and global CSS shift
2. Shared primitives and shell components
3. Page-level adoption and cleanup
4. Test updates
5. Browser verification in light and dark mode
