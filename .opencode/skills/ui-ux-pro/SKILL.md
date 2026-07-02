---
name: ui-ux-pro
description: "Design and implement professional, fluid, and adaptive web interfaces. Use this skill for any UI creation or redesign (page, dashboard, application, component) whenever visual quality, UX, accessibility, or design system consistency is at stake."
---

This skill turns a product need into a production-ready interface: readable, accessible, consistent, and maintainable by a team.

**Core principle**: every design decision must be justifiable by a user need or a business constraint — not by a trend or an abstract aesthetic preference.

## 6-Step Process

Each step has a clear **expected output**. Do not move to the next step until that output is defined.

---

### 1. Scoping

**Answer these questions before any visual decision:**
- Who is the primary user? What is their level of technical proficiency?
- What is the critical task (the one that must work no matter what)?
- What are the non-negotiable constraints: stack, existing design system, imposed palette, legal accessibility requirements (WCAG), i18n, performance targets (LCP, TTI)?
- What failed in the current interface (if this is a redesign)?

**Expected output:** a prioritized list of 5–10 constraints, and a definition of the critical task.

---

### 2. Visual Direction

**Pick one direction and commit to it fully.** Examples of opposing directions that both work:
- Dense management interface → monospace typography, tight grid, minimal color, maximum information per screen
- Consumer-facing app → generous spacing, warm colors, strong hierarchy, obvious CTAs
- Expert professional tool → neutrality, precise affordances, no ornamentation, data front and center

**Visual foundation tokens to define explicitly:**

| Token | Default recommended value | Adjust when... |
|-------|--------------------------|----------------|
| Spacing unit | base 4px (4, 8, 12, 16, 24, 32, 48, 64) | Extreme density → base 2px |
| Type scale | 12 / 14 / 16 / 20 / 24 / 32 / 40px | Mobile app → reduce to 5 levels max |
| Breakpoints | 375 / 768 / 1024 / 1280 / 1536px | |
| Border radius | 4px components, 8px cards, 16px modals | Very angular design → 0px throughout |
| Shadows | 3 levels max (xs / md / xl) | |
| Transition durations | 150ms (micro), 250ms (component), 400ms (page) | |
| Palette | 1 primary color, 1 neutral with 10 levels, 3 semantic (success/warning/danger) | |

**Expected output:** defined tokens (in a file or as CSS variables) + 3 guiding principles, each expressed in one sentence.

---

### 3. UX Architecture

**Organize information by user priority, never by backend data structure.**

Hierarchy rules:
- One H1 per view, maximum 3 heading levels visible at once
- The primary action is visible without scrolling on all breakpoints
- The critical path (most important task) is completed in ≤ 3 clicks from the entry point

**States to cover for every view or interactive component:**

| State | Description | What must change visually |
|-------|-------------|---------------------------|
| Default | At rest, data loaded | — |
| Loading | Request in progress | Localized skeleton or spinner, never full-screen except on first load |
| Empty | No data | Illustration + message + suggested action (never a blank screen without guidance) |
| Error | Load or action failure | Explanatory message + recovery action (retry, go back, contact) |
| Disabled | Action unavailable | 40% opacity, `cursor: not-allowed`, tooltip explaining why |
| Success | Action completed | Localized visual confirmation, disappears after 3–5s or on interaction |
| Destructive | Irreversible action | Danger color, mandatory confirmation (dialog, not just a toast) |

**Expected output:** list of views with their default state and 3 critical states handled.

---

### 4. Component System

**One component = one role. No unnecessary variants.**

Before creating a component:
- Does it already exist in the design system? Extending is preferable to duplicating.
- Does it need variants? Justify each variant with a distinct usage context.
- Are all states defined (default, hover, focus, active, disabled, loading, error)?

**Composition rules:**
- Use 1 layout component (grid/flex) per hierarchical level — no arbitrary nesting
- Component colors go through semantic tokens (`--color-action`, `--color-surface`), never raw values
- Icons always have an accessible label (`aria-label` or visible text)
- Forms: label always visible (not just placeholder), error message directly below the relevant field, never at the top of the form

**Expected output:** list of components to create or extend, with justified variants.

---

### 5. Fluidity and Interactions

**Every animation must have a UX reason.** Valid reasons:
- Indicate a state transition (open, close, load)
- Guide attention toward a context change
- Provide feedback on a user action

**Motion rules:**
- `easing`: `ease-out` for entrances (fast then slow = natural), `ease-in` for exits
- Never block interaction during an animation (`pointer-events` remain active)
- `prefers-reduced-motion`: all non-essential transitions must be disabled
- Skeleton screens over spinners for content taking more than 500ms
- Optimistic UI for high-frequency actions (like, toggle, drag): apply the change immediately, revert on server error

**Expected output:** list of animated interactions with duration, easing, and UX justification.

---

### 6. Pre-delivery Verification

Go through every point. One unvalidated point blocks delivery.

**Accessibility (WCAG 2.1 AA minimum):**
- [ ] Normal text contrast ≥ 4.5:1, large text (18px+ or 14px+ bold) ≥ 3:1
- [ ] Interactive component contrast (button border, standalone icon) ≥ 3:1
- [ ] All interactive elements reachable by keyboard (Tab + Shift+Tab)
- [ ] Focus visible on all interactive elements (outline ≥ 2px, not removed via `outline: none` without a replacement)
- [ ] Decorative images with `alt=""`, informative images with a useful description
- [ ] Forms: every input has a `<label>` linked via `for`/`id` or `aria-labelledby`
- [ ] Modals/dialogs: focus trapped inside, closed via Escape, focus returned to the triggering element

**Readability:**
- [ ] Line length: between 60 and 80 characters for long-form text
- [ ] Line height: minimum 1.5 for body copy, 1.2 for headings
- [ ] No more than 2 font families, no more than 3 weights used simultaneously
- [ ] Alignment: body text always left-aligned (never justified), headings are free

**Content robustness:**
- [ ] Long text tested (+50% of expected length) — no layout breakage
- [ ] Short text tested (1 word, null value) — no awkward empty space
- [ ] All empty/error/loading states are visually handled

**Perceived performance:**
- [ ] Images have explicit dimensions (`width`/`height`) to prevent layout shift
- [ ] Fonts loaded with `font-display: swap`
- [ ] Critical interactions respond in < 100ms (immediate feedback, even if the action is async)

---

## Anti-patterns — with their fix

| Anti-pattern | Why it's a problem | Fix |
|---|---|---|
| Placeholder as the only label | Disappears on input, inaccessible to screen readers | Visible label above the field, placeholder optional and redundant |
| Toast for form errors | Not localized, disappears, not re-read by assistive tech | Error message below the field, persistent until corrected |
| `outline: none` without replacement | Makes keyboard navigation invisible | Replace with a custom focus-visible style (ring, box-shadow) |
| Full-screen spinner | Blocks perception, no progress indicator | Localized skeleton, or spinner scoped to the relevant component only |
| Disabled button without explanation | User doesn't know why they can't act | Tooltip on hover/focus explaining the condition |
| Icon alone without label | Meaningless out of context | `aria-label` or adjacent visible text |
| Color alone to convey information | Inaccessible to colorblind users | Always pair color + icon or text |
| Arbitrary z-index values (999, 9999) | Unpredictable conflicts | z-index scale defined in tokens (10 / 20 / 30 / modal: 100 / toast: 200) |

---

## Definition of Done

Work is considered complete when **all** of the following are true:

- [ ] The critical task completes without error in ≤ 3 steps
- [ ] All states (loading, empty, error, success, disabled) are implemented and visible
- [ ] Contrast score is ≥ 4.5:1 on all text (validated with a tool: Colour Contrast Analyser, axe DevTools, etc.)
- [ ] Keyboard navigation covers 100% of critical interactions
- [ ] Layout does not break at 375px, 768px, and 1280px
- [ ] Layout does not break with content +50% longer than expected
- [ ] Every created component has a unique role and justified variants
- [ ] `prefers-reduced-motion` is respected
- [ ] Tokens (colors, spacing, typography) are centrally defined and consistently applied
