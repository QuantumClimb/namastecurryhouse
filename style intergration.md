# Style Integration Plan: Adopt Shared CN Theme

This document is the blueprint to replace the current site styling with the provided shared CN theme found in `public/style.txt`. No code is changed yet—this is the agreed plan for implementation after approval.

## Goals
- Replace the existing neon/nightlife HSL theme with the provided OKLCH-based design tokens and shadows.
- Centralize tokens and ensure full alignment between CSS variables, Tailwind utilities, and component styles.
- Preserve functionality and accessibility; improve visual consistency and themability (light/dark).

## Current vs Target Theme: Highlights

- Color model
  - Current: HSL variables defined in `src/index.css` (e.g., `--primary: 295 100% 43%`) with custom extras `--neon-*`, `--midnight`.
  - Target: OKLCH variables in `public/style.txt` (e.g., `--primary: oklch(0.7686 0.1647 70.0804)`), plus mapped `@theme inline` exports (Tailwind v4-style tokens).
- Token scope
  - Current: `:root` + `.dark` in `src/index.css`; Tailwind reads via `tailwind.config.ts` color hsl(var(--...)).
  - Target: `:root` + `.dark` in the shared file, with a comprehensive set (background, foreground, card, popover, primary… sidebar*, chart*, radius, shadows, fonts).
- Fonts
  - Current: Raleway via Tailwind `font-raleway` and explicit body font.
  - Target: `--font-sans: Inter`, `--font-serif: Source Serif 4`, `--font-mono: JetBrains Mono`.
- Shadows, radii, spacing
  - Current: Custom animations and glow effects; `--radius: 0.5rem`.
  - Target: Multiple shadow presets (`--shadow-*`), radius scale (sm/md/lg/xl), and other tokens (tracking, spacing) for system-wide consistency.
- Tailwind versioning
  - Current: Tailwind v3.4.x with a classic config (`tailwind.config.ts`).
  - Target options: Either integrate tokens within v3 or fully adopt v4-style `@theme` usage. The shared file suggests v4 patterns, but v3 compatibility is possible with a bridge.

## Strategy Options

- Option A: Tailwind v3-compatible adoption (safer, incremental)
  - Keep Tailwind v3.4.x.
  - Import `public/style.txt` into global CSS and map variables to existing Tailwind config (`hsl(var(--...))` → "use OKLCH values via CSS vars").
  - Replace site references to HSL variables with the new tokens (no component API change required if tokens names remain: `--background`, `--foreground`, `--primary`, etc.).

- Option B: Migrate to Tailwind v4 and use `@theme inline` (bigger change)
  - Upgrade Tailwind, adjust config to v4 conventions, and rely on `@theme inline` exports in `public/style.txt`.
  - Refactor any deprecated plugin/config patterns; verify Shadcn components under v4.

Recommendation: Start with Option A (v3-compatible). It’s faster, low-risk, and respects existing color var names that match the shared theme. We can evaluate a v4 upgrade later.

## Implementation Plan (Phased)

Phase 1 — Token Integration
1. Add shared theme file
   - Place `public/style.txt` contents into an importable global CSS (e.g., `src/theme.css`) or inline into `src/index.css` under a distinct block.
   - Ensure both `:root` and `.dark` sections are present. Preserve `@theme inline` comment block for future v4 migration, but it won’t affect v3.
2. Map Tailwind colors to CSS vars (no change if names match)
   - Verify `tailwind.config.ts` references `hsl(var(--...))` tokens. Keep names identical: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, card/foreground, sidebar/*.
   - Remove unused nightlife-specific tokens later (`--neon-*`, `--midnight`) after visual parity check.
3. Fonts
   - Switch `fontFamily` in Tailwind to use Inter/Source Serif/JetBrains Mono.
   - Update the body font from Raleway to `font-sans` (Inter). Keep Raleway as a fallback if needed during the transition.
4. Radius & shadows
   - Introduce radius scale and shadow variables via utility classes or component tokens where applicable. Keep existing "glow" animations temporarily to avoid sudden visual regressions.

Phase 2 — Component Audit and Theming
1. Global primitives
   - Buttons, Inputs, Selects, Tabs, Dialogs, Cards: verify they consume `bg-background`, `text-foreground`, `border-border`, `ring-ring`, and `bg-primary text-primary-foreground` utilities.
   - Swap any hard-coded color classes to token-based classes (e.g., `text-[#...]` → `text-foreground`, `bg-[#...]` → `bg-card`).
2. Layout & Surfaces
   - Header/Navigation, Footer, Sections: ensure `bg-background`/`bg-card` and borders follow the new tokens. Verify contrast ratios (≥ 4.5:1 for text on backgrounds).
3. Sidebar and Charts
   - Replace any sidebar colors with `--sidebar-*` tokens.
   - Update chart component palette to `--chart-1..5` and confirm legibility in dark mode.
4. Typography
   - Headings, paragraphs, small text: adjust sizes/weights/leading if the new font metrics require tuning. Use `tracking-normal` if adopting the token.

Phase 3 — Dark Mode Polishing
1. Ensure `dark` class toggling (via `next-themes` or manual) applies correctly to new tokens.
2. Validate interactive states (hover/focus/active) in both modes. Confirm focus rings use `ring` token.
3. Audit subtle surfaces (popover, tooltip, dropdown) for adequate contrast and elevation (shadows).

Phase 4 — Visual Enhancements and Clean-up
1. Migrate shadows
   - Replace bespoke shadow utilities with the provided shadow tokens (`shadow`, `shadow-md`, etc.) and ensure consistency.
2. Deprecate nightlife effects
   - Remove `neon-glow`, `text-glow`, `gradient-text` where they clash with the brand. Optionally keep a tasteful accent glow using the new `--primary`.
3. Remove obsolete custom color vars
   - Delete `--neon-purple`, `--neon-green`, `--gold-glow`, `--midnight` after sign-off.

Phase 5 — QA, Regression, and Accessibility
1. Visual regression sweep across all pages: Home, Menu, AboutUs, Gallery, Reservation, Contact.
2. Component-by-component pass for hover, disabled, focus-visible states.
3. a11y checks: color contrast, prefers-reduced-motion (reduce animated glow), and keyboard focus order.
4. Cross-browser checks (Chromium, Firefox, Safari where possible) and responsive breakpoints.

## Mapping Details

- Color tokens: maintain existing names to avoid refactors. The shared theme already provides 1:1 names (`--background`, `--primary`, `--ring`, etc.).
- Sidebar tokens: ensure Tailwind config maps `sidebar` group properly (it already does in `tailwind.config.ts`).
- Charts: wire `--chart-1..5` into the chart color props; add a small adapter in the chart component.
- Fonts: switch Tailwind `fontFamily` to use `Inter`, `Source Serif 4`, `JetBrains Mono`. Update `body` class to `font-sans`.
- Radius: align Tailwind `borderRadius` scale (`sm`, `md`, `lg`) to shared `--radius` mapping; optionally expose `xl` as a custom class.

## Risks and Mitigations
- Tailwind v3 vs v4 mismatch: We’ll implement v3-compatible mapping first; keep the `@theme inline` block for a later upgrade path.
- Contrast regressions: predefine test pages/screenshots; adjust `--foreground`/surface tokens if needed.
- Font reflow: introduce font-display: swap; verify heading spacing/line-height.

## Rollback Plan
- Keep a git branch `style/integration` and a tag before merging.
- Feature flag via environment or class toggle to switch back to old variables during testing.

## Acceptance Criteria
- All components use tokenized colors; no hard-coded hex values remain.
- Light and dark modes render with correct contrast.
- Fonts updated globally, with consistent typographic rhythm.
- No visual regressions on key flows and breakpoints.

## Timeline (Estimate)
- Phase 1–2: 1–2 days (tokens + core components)
- Phase 3: 0.5 day (dark mode pass)
- Phase 4: 0.5–1 day (cleanup + polish)
- Phase 5: 0.5 day (QA/regression)

Upon approval, we’ll proceed with implementation in a separate branch and provide a preview build for review.