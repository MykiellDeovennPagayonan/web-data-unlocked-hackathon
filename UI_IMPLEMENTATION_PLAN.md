# UI Implementation Plan

## Objective

Rebuild the Tunai homepage dashboard so it closely matches the provided reference image while respecting the product direction in `DESIGN.md` and the existing Next.js web app architecture.

The target is a light, dense, security-operations command center with:

- A fixed left navigation rail branded as `Tunai`.
- A top utility bar with global search, platform switcher, notifications, help, and user profile.
- Five top metric cards.
- A large live access events table.
- Right-side review, AI insight, and webhook health panels.
- Bottom analytics panels for geographic risk, risky IPs, risky ASNs, risk distribution, and certificate health.

Important design reconciliation: `DESIGN.md` describes a dark-mode-first SOC aesthetic, but the provided reference image is a light dashboard. For this rebuild, prioritize the reference image's light visual system for layout, colors, density, and component proportions. Preserve the `DESIGN.md` security semantics, risk language, strict spacing, clear borders, typography intent, accessibility rules, and semantic color use.

## Source of Truth

- `DESIGN.md`
- Provided reference image: `c:/Users/grapz/Downloads/ChatGPT Image May 28, 2026, 02_29_29 PM.png`
- Existing codebase structure, especially:
  - `apps/web/AGENTS.md`
  - `apps/web/package.json`
  - `apps/web/components.json`
  - `apps/web/src/app/layout.tsx`
  - `apps/web/src/app/page.tsx`
  - `apps/web/src/app/globals.css`
  - `apps/web/src/components/ui/button.tsx`
  - `apps/web/src/lib/utils.ts`

## Assumptions

- This is a frontend visual rebuild plan only. Do not change backend APIs, database schema, authentication, authorization, deployment settings, or payment/reward behavior.
- The current homepage is still the stock Create Next App starter UI. The dashboard should replace that starter surface.
- The current web app uses Next.js App Router, React 19, Tailwind CSS 4, shadcn-style CSS variables, `lucide-react`, and `recharts`.
- No dashboard-specific components currently exist. It is acceptable to create small focused dashboard components after confirming the current structure.
- No new dependency is required for the requested UI. Use existing `lucide-react` icons and `recharts`; use CSS/SVG for simple map visuals if needed.
- Because no real dashboard API integration is visible in the web app, initial implementation should use local typed seed data for the dashboard unless an implementation task separately discovers and wires existing backend endpoints.
- The reference image should win over generic SaaS defaults. Do not turn the dashboard into a marketing page or card-heavy landing page.

## Codebase Audit Instructions

Before editing application code, inspect the following:

- Project instructions:
  - Read `apps/web/AGENTS.md`.
  - Because it warns that this is not the usual Next.js version, inspect relevant local docs under `apps/web/node_modules/next/dist/docs/` before writing Next-specific code.
- Relevant pages/routes:
  - `apps/web/src/app/page.tsx` is the current homepage route and should be the first route to rebuild.
  - `apps/web/src/app/layout.tsx` owns global fonts, metadata, `html`, and `body` structure.
- Shared UI components:
  - `apps/web/src/components/ui/button.tsx` is the only existing shared UI component.
  - `apps/web/src/lib/utils.ts` exposes `cn` for class composition.
- Styling system:
  - `apps/web/src/app/globals.css` contains Tailwind imports, shadcn CSS variables, light/dark token definitions, base styles, and radius variables.
  - `apps/web/components.json` confirms shadcn aliases and `lucide` icon library.
- Theme files or design tokens:
  - Update CSS variables in `globals.css` only when needed.
  - Keep token changes centralized. Avoid one-off hex values across components except for data visualization values that should later become tokens.
- Existing card/table/chart/sidebar/header components:
  - None currently exist in `apps/web/src/components` besides `ui/button.tsx`.
  - Plan to create dashboard-specific components in a clearly named area such as `apps/web/src/components/dashboard/`.
- Current responsive behavior:
  - The current page has starter responsive classes only. Treat responsive dashboard behavior as new work, guided by `DESIGN.md` and the reference image.

## Phase 1: Codebase and Design Audit

### Goal

Build a precise implementation inventory before changing UI code.

### Tasks

- Re-read `DESIGN.md` and extract the requirements that apply to the homepage dashboard.
- Open the provided reference image at full size and note layout, spacing, colors, copy, icons, and panel proportions.
- Read `apps/web/AGENTS.md` and the relevant local Next.js 16 docs before writing code.
- Inspect `apps/web/src/app/page.tsx`, `layout.tsx`, `globals.css`, `components/ui/button.tsx`, and `lib/utils.ts`.
- Confirm available dependencies from `apps/web/package.json`: Next, React, Tailwind, shadcn, `lucide-react`, `recharts`, `clsx`, `tailwind-merge`.
- Confirm the homepage route is the intended implementation target.
- Create an implementation inventory with exact visible copy and data values from the reference image.

### Files/Areas to Inspect

- `DESIGN.md`
- Reference image
- `apps/web/AGENTS.md`
- `apps/web/package.json`
- `apps/web/components.json`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/lib/utils.ts`

### Acceptance Criteria

- The implementer can explain the source-of-truth conflict between dark `DESIGN.md` direction and the light reference image.
- The implementer has a list of exact dashboard regions to build.
- The implementer has confirmed no existing dashboard components need to be preserved.
- The implementer has confirmed the package manager and scripts before running validation.

### Risks

- Implementing the dark palette from `DESIGN.md` instead of the light reference image would miss the requested visual target.
- Building everything inside `page.tsx` would be hard to review and maintain.
- Adding new dependencies would be unnecessary because the current stack can handle this UI.

## Phase 2: Layout Structure Alignment

### Goal

Create the app shell and dashboard grid that match the reference image's composition.

### Tasks

- Replace the stock Create Next App homepage content in `apps/web/src/app/page.tsx`.
- Keep `page.tsx` as composition glue. Move repeated dashboard sections into focused components.
- Build a full-viewport shell:
  - Fixed or sticky left sidebar.
  - Main content area to the right.
  - Top utility bar inside the main content area.
  - Dashboard content grid below the top bar.
- Match the reference proportions:
  - Sidebar: about 292-300px wide on desktop.
  - Top bar: about 72-80px tall.
  - Main gutter: about 24px.
  - Top metric row: five equal-width cards.
  - Body grid: left content column plus a narrower right rail.
  - Bottom analytics: large geographic panel on the left, compact risk panels to the right.
- Use `min-h-screen`, stable grid tracks, and `minmax(0, 1fr)` where needed to avoid overflow.
- Keep cards and panels visually flat with subtle borders and low shadows, matching the reference.

### Files/Areas to Inspect/Change

- Inspect/change `apps/web/src/app/page.tsx`.
- Likely create `apps/web/src/components/dashboard/dashboard-shell.tsx`.
- Likely create `apps/web/src/components/dashboard/sidebar.tsx`.
- Likely create `apps/web/src/components/dashboard/top-bar.tsx`.
- Likely create `apps/web/src/components/dashboard/dashboard-grid.tsx`.
- Use `apps/web/src/lib/utils.ts` for class merging.

### Acceptance Criteria

- At desktop width, the screen reads as the reference image: sidebar left, header top, metrics across, table and right rail below, analytics bottom.
- No visible starter Next.js UI remains.
- Layout does not rely on fragile absolute positioning for primary structure.
- Major regions align to a consistent grid and share gutters.

### Risks

- Overusing nested cards will make the UI feel heavier than the reference.
- Hardcoding all dimensions without responsive constraints can cause broken tablet and mobile layouts.
- Excessively large border radii will drift from the precise security-console style.

## Phase 3: Color System and Design Token Updates

### Goal

Centralize the light Tunai visual system while preserving semantic risk colors from `DESIGN.md`.

### Tasks

- Update `apps/web/src/app/globals.css` tokens to support the light dashboard:
  - Page background: near-white or very light blue-gray, close to `#F7FAFF`.
  - Panel/card surface: `#FFFFFF`.
  - Primary blue: close to `#0B6FF6` or `#2563EB`.
  - Text primary: deep navy close to `#0B1B4D`.
  - Text secondary: muted blue-gray close to `#607196`.
  - Border: pale blue-gray close to `#E4EAF4`.
  - Sidebar active background: light blue close to `#EAF3FF`.
  - Subtle page dividers: `#EEF3FA`.
- Preserve semantic colors:
  - Success/clean: `#10B981`.
  - Warning/medium: `#F59E0B`.
  - Danger/high/critical: `#EF4444`.
  - Info/verified: `#3B82F6`.
  - AI/accent: `#8B5CF6`, used sparingly for AI insight labeling.
- Keep color use functional:
  - Blue for navigation, links, active controls, and trust score accents.
  - Green/red/amber only for status, trends, severity, and alerts.
- Keep `.dark` tokens coherent for future use, but do not make dark mode the visual target of this task.
- Prefer CSS variables or Tailwind token classes over repeated arbitrary hex values.

### Files/Areas to Inspect/Change

- `apps/web/src/app/globals.css`
- Existing shadcn variables under `:root` and `.dark`
- Any new dashboard components that need chart or status colors

### Acceptance Criteria

- The implemented dashboard reads as a white/light blue Tunai command center like the image.
- Semantic colors are consistent across cards, badges, charts, and review panels.
- There are no decorative gradients, color blobs, or unrelated palettes.
- Focus rings remain visible and accessible.

### Risks

- The `DESIGN.md` dark tokens can accidentally override the light reference target.
- Too many arbitrary Tailwind color values in components will make future visual tuning difficult.
- Using red/amber/green for non-status decoration will reduce risk-signal clarity.

## Phase 4: Typography and Spacing Updates

### Goal

Match the reference image's compact dashboard typography and strict spacing rhythm.

### Tasks

- Use the existing `Geist` font unless the implementer intentionally switches to `Inter` as specified in `DESIGN.md`.
- If switching to `Inter`, update `apps/web/src/app/layout.tsx` using `next/font/google` and confirm behavior against Next 16 local docs.
- Use compact UI type:
  - Sidebar section labels: 11-12px uppercase, medium weight, muted color.
  - Sidebar nav items: 14px, medium for active item, regular/medium for inactive items.
  - Panel titles: 13-14px uppercase or semibold.
  - Metric labels: 12-13px uppercase or small semibold.
  - Metric values: 26-32px semibold.
  - Table headers: 11-12px uppercase, muted.
  - Table cells: 12-13px.
  - Microcopy: 11-12px.
- Use a 4px spacing grid:
  - Shell gaps: 16px, 20px, or 24px.
  - Card padding: 18-24px depending on panel density.
  - Table row height: about 48px in the reference.
  - Buttons/filters: 36-40px high.
- Avoid viewport-based font scaling.
- Keep letter spacing at `0` except for small uppercase labels, where slight positive tracking is acceptable.

### Files/Areas to Inspect/Change

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`
- Dashboard components under `apps/web/src/components/dashboard/`

### Acceptance Criteria

- Typography hierarchy matches the reference image: large metrics, small dense labels, readable tables.
- Text never overflows buttons, badges, cards, or table columns.
- Spacing is dense but not cramped.
- The UI still meets WCAG contrast requirements.

### Risks

- Reusing default browser/control font sizes will make the UI look unfinished.
- Large marketing-page heading sizes are inappropriate for this dashboard.
- Negative letter spacing or viewport-scaled text can create inconsistent rendering.

## Phase 5: Header and Sidebar Implementation

### Goal

Implement the left navigation and top utility bar as the stable dashboard frame.

### Tasks

- Sidebar:
  - Add Tunai shield mark and wordmark at the top.
  - Group nav items into sections matching the reference:
    - Command Center
    - Intelligence
    - Operations
    - Risk & Analysis
    - Platform
  - Include visible items from the image:
    - Command Center
    - Identities
    - Organizations
    - Devices
    - IP Records
    - Certificates
    - Aliases
    - Access Events
    - Behavioral Events
    - Trust Signals
    - Webhook Logs
    - Pending Reviews with count `12`
    - Risk Explorer
    - Threat Intelligence
    - Attack Surface
    - MITRE ATT&CK with `BETA`
    - Integrations
    - Audit Logs
    - Settings
  - Highlight `Command Center` as the top active dashboard item and `Access Events` as the active operations item only if the reference's dual highlight is intentionally replicated. If one active state is required for accessibility, keep `Command Center` active and use a subtler tint for `Access Events`.
  - Add bottom collapse control and system status area if space allows.
- Header/top bar:
  - Add global search with placeholder `Search identities, IPs, orgs, certificates...`.
  - Add small keyboard/action chips at the right edge of the search field.
  - Add platform switcher with label `Platform` and selected value `Acme Corp`.
  - Add notification icon with count `2`.
  - Add help icon.
  - Add profile avatar/name block: `Alex Morgan`, `Security Admin`.
- Use `lucide-react` for icons. Match the reference's thin, rounded line icon style.
- Give icon-only buttons descriptive `aria-label` values.

### Files/Areas to Inspect/Change

- Likely create `apps/web/src/components/dashboard/sidebar.tsx`.
- Likely create `apps/web/src/components/dashboard/top-bar.tsx`.
- Reuse `apps/web/src/components/ui/button.tsx` for buttons where appropriate.
- Use `lucide-react` icons already installed in `apps/web/package.json`.

### Acceptance Criteria

- Sidebar width, grouping, active states, icon sizing, and spacing resemble the reference.
- Top bar search and right controls align with the screenshot.
- The frame remains stable when dashboard content scrolls.
- All icon-only controls have accessible labels.

### Risks

- Generic icon choices can weaken fidelity. Choose icons that closely match the reference metaphors.
- Adding explanatory text not present in the reference will reduce visual accuracy.
- If active states are ambiguous, document the chosen behavior.

## Phase 6: Main Dashboard/Card Implementation

### Goal

Implement the top metric row and main dashboard panels with the same content hierarchy and density as the image.

### Tasks

- Create a reusable metric card component with:
  - Label.
  - Large value.
  - Trend row.
  - Optional icon.
  - Optional sparkline/gauge.
- Build five metric cards in this order:
  - `ACCESS EVENTS`, value `1.24M`, trend `12.5%`, comparison `vs 24h ago`, blue sparkline.
  - `IDENTITIES`, value `18,392`, trend `8.1%`, comparison `vs 24h ago`, user icon, blue sparkline.
  - `RISKY EVENTS`, value `2,847`, trend `15.3%`, comparison `vs 24h ago`, red shield icon, red sparkline.
  - `BLOCKED EVENTS`, value `732`, trend `6.2%`, comparison `vs 24h ago`, red lock icon, red sparkline.
  - `TRUST SCORE (AVG)`, value `78`, trend `5 pts`, comparison `vs 24h ago`, circular gauge.
- Keep cards white with subtle border, 8px radius, and no heavy shadow.
- Main content region should emphasize the live access events table as the largest area.
- Right rail should stack:
  - Pending Reviews.
  - AI Insights.
  - Webhook Delivery Health.

### Files/Areas to Inspect/Change

- Likely create `apps/web/src/components/dashboard/metric-card.tsx`.
- Likely create `apps/web/src/components/dashboard/trust-score-gauge.tsx`.
- Likely create `apps/web/src/components/dashboard/sparkline.tsx`.
- Likely create `apps/web/src/components/dashboard/dashboard-data.ts` for typed seed data.
- Compose from `apps/web/src/app/page.tsx` or `dashboard-grid.tsx`.

### Acceptance Criteria

- Top row has five cards with consistent height and spacing.
- Values, labels, and trend colors match the image.
- Sparklines/gauge are visually close and do not shift card layout.
- Cards remain aligned at desktop and degrade cleanly at smaller widths.

### Risks

- Inconsistent card heights will immediately break the screenshot match.
- Overly detailed chart axes in metric cards will look wrong; sparklines should be minimal.
- The reference has a light visual treatment, so dark card styling should not be applied.

## Phase 7: Table, Chart, Panel, and Badge Implementation

### Goal

Implement the dense operational content: live events, review queue, insights, charts, map, lists, and status badges.

### Tasks

- Live Access Events table:
  - Panel title: `LIVE ACCESS EVENTS`.
  - Streaming indicator with green dot and text `Streaming`.
  - Controls: `All Events`, `Filters (3)`, overflow menu.
  - Columns:
    - Time
    - Identity
    - IP Address
    - Action
    - Risk Level
    - Trust Score
    - Location
    - Device / Client
  - Show six rows, matching the reference density.
  - Include row status dots, blue identity/IP links, risk badges, score bars, location markers, and device/client two-line text.
  - Footer text: `Showing 1 to 6 of 25,833 events`.
  - Footer link: `View all events`.
- Pending Reviews:
  - Title `PENDING REVIEWS`, count `12`.
  - Six compact items with severity icons, title, metadata, and time.
  - Link `View all pending reviews`.
- AI Insights:
  - Title `AI INSIGHTS`, `BETA` badge.
  - Four bullet-style insight rows.
  - Link `View all insights`.
- Webhook Delivery Health:
  - Title `WEBHOOK DELIVERY HEALTH`.
  - Metrics: success rate `98.7%`, failures `21`, average latency `312 ms`.
  - Small line chart with time labels.
  - Link `View webhook logs`.
- Threat origins/geographic risk:
  - Title `THREAT ORIGINS / GEOGRAPHIC RISK ACTIVITY`.
  - Light map background, blue/amber/red points, attack flow arcs, legend, zoom controls.
  - Tooltip-like callout for `Eastern Europe`, high risk, events `1,283`, trend `28%`.
  - Link `View full geo analysis`.
- Risk lists:
  - `TOP RISKY IPs` table with IP address, risk score, events.
  - `TOP RISKY ASNs` table with ASN number, risk score, events.
- Distribution panels:
  - Risk distribution donut with total `2,847`.
  - Certificate health donut with total `1,248`.
  - Use semantic colors and visible text labels, not color alone.
- Badges:
  - Implement shared status/risk badge variants for `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `BETA`.
  - Badges should be compact, uppercase where shown, 2-4px radius, and color-coded with tinted backgrounds.

### Files/Areas to Inspect/Change

- Likely create:
  - `apps/web/src/components/dashboard/live-events-table.tsx`
  - `apps/web/src/components/dashboard/status-badge.tsx`
  - `apps/web/src/components/dashboard/score-bar.tsx`
  - `apps/web/src/components/dashboard/pending-reviews-panel.tsx`
  - `apps/web/src/components/dashboard/ai-insights-panel.tsx`
  - `apps/web/src/components/dashboard/webhook-health-panel.tsx`
  - `apps/web/src/components/dashboard/geographic-risk-panel.tsx`
  - `apps/web/src/components/dashboard/risky-list-panel.tsx`
  - `apps/web/src/components/dashboard/distribution-panel.tsx`
  - `apps/web/src/components/dashboard/dashboard-data.ts`
- Use existing `recharts` for line/donut charts where practical.
- Use SVG/CSS for the map unless a checked-in asset is deliberately added.

### Acceptance Criteria

- The table, right rail, and lower analytics panels match the image's visual proportions.
- Status/risk colors are consistent with `DESIGN.md`.
- Tables remain scannable and dense.
- Charts support the visual story without excessive axes, labels, or gridlines.
- No user-facing placeholder text such as `Lorem ipsum` appears.

### Risks

- Recharts defaults can look too heavy. Hide or soften axes, gridlines, legends, and tooltips to match the screenshot.
- A detailed map dependency is unnecessary and could add avoidable complexity.
- Color-only badges would violate the accessibility guidance in `DESIGN.md`; include text and/or icons.

## Phase 8: Responsive Behavior

### Goal

Make the dashboard usable across desktop, tablet, and mobile without destroying the desktop reference fidelity.

### Tasks

- Desktop 1280px and wider:
  - Full sidebar.
  - Five metric cards in one row where space permits.
  - Two-column main content with right rail.
  - Bottom analytics in multi-column layout.
- Tablet 768px to 1023px:
  - Collapse sidebar to icon rail or hide behind a menu.
  - Stack metric cards into 2-3 columns.
  - Stack right rail below live events.
  - Keep table horizontally scrollable if all columns are retained.
- Mobile below 768px:
  - Use a compact top app bar.
  - Metrics become one or two columns.
  - Live events table reduces to essential columns: identity, risk/status, action/time.
  - Complex map and charts can become summary panels or scrollable cards.
  - No horizontal page overflow.
- Use stable dimensions for card heights, icon buttons, badges, and chart containers.
- Test with at least desktop, tablet, and mobile viewport widths.

### Files/Areas to Inspect/Change

- Dashboard layout components.
- Table components.
- Chart/map panels.
- Sidebar/top-bar components.
- `apps/web/src/app/globals.css` if global responsive helpers are needed.

### Acceptance Criteria

- Desktop remains close to the reference image.
- Tablet and mobile layouts do not overlap, clip critical controls, or create unreadable tables.
- Sidebar behavior is deliberate and accessible.
- Header controls remain usable on narrow screens.

### Risks

- Optimizing too early for mobile can dilute the desktop reference fidelity.
- Hiding too much operational data on mobile can make the UI useless for urgent triage.
- Tables need explicit overflow behavior to avoid page-level horizontal scrolling.

## Phase 9: Final Visual QA

### Goal

Verify the finished UI against the reference image and document any intentional differences.

### Tasks

- Start the local dev server.
- Capture screenshots at:
  - A desktop viewport close to the reference aspect ratio.
  - A common laptop width.
  - Tablet width.
  - Mobile width.
- Compare desktop screenshot against the reference image section by section:
  - Sidebar.
  - Header.
  - Metric row.
  - Live access table.
  - Right rail.
  - Bottom analytics.
  - Footer/status strip.
- Check exact visible copy and metric values.
- Check colors, typography, panel borders, radius, spacing, icon weight, and density.
- Check keyboard focus states for top controls, sidebar items, filter buttons, and links.
- Check console for runtime errors.
- Run lint and build.
- Document unavoidable differences in the final implementation notes.

### Files/Areas to Inspect/Change

- All changed dashboard files.
- `apps/web/src/app/globals.css`.
- Browser screenshots from the running app.

### Acceptance Criteria

- The desktop screenshot is visibly close to the provided image.
- No layout overlaps, clipped text, broken icons, or placeholder starter content remain.
- Runtime console is clean.
- Lint/build validation passes or failures are documented with cause.
- Any intentional deviation from the reference image is explicitly documented.

### Risks

- Build passing does not prove visual fidelity. Screenshot comparison is required.
- The browser may render fonts slightly differently than the design image; document unavoidable font differences.
- Seed data can accidentally drift from the reference copy if not checked.

## Component Implementation Notes

### Header/Top Navigation

- Layout:
  - Full-width horizontal bar above the dashboard content, inside the main content column.
  - Search field occupies the left/center area and should be the dominant control.
  - Platform switcher, notifications, help, and profile align to the right.
- Spacing:
  - About 24px horizontal padding.
  - Search height about 48px.
  - Right-side controls about 40-48px high.
- Colors:
  - White or transparent over the light page background.
  - Search background `#FFFFFF`.
  - Border `#E4EAF4`.
  - Primary icons in blue or muted navy.
- Typography:
  - Search placeholder around 14px.
  - Platform label around 11px.
  - Platform value and user name around 13-14px semibold.
  - User role around 12px muted.
- Borders/radius/shadows:
  - Search and platform switcher radius 8px.
  - Border 1px.
  - Subtle shadow only if needed to match the screenshot; avoid heavy elevation.
- Behavior:
  - Search can be non-functional for visual rebuild, but should be a real input element.
  - Platform switcher can be a button with chevron until real selection behavior exists.
  - Notification/help/profile controls should be buttons with `aria-label`.
- Fidelity target:
  - Match the reference's slim, utility-style header. Do not add marketing copy or page title.

### Sidebar/Navigation Menu

- Layout:
  - Fixed-width left rail, full viewport height.
  - Logo block at top.
  - Section groups with small uppercase labels.
  - Bottom collapse control.
- Spacing:
  - Sidebar width about 292-300px on desktop.
  - Nav item height about 40-42px.
  - Icon column aligned consistently.
  - Section gaps about 18-24px.
- Colors:
  - Surface `#FFFFFF` or very close.
  - Border-right `#E4EAF4`.
  - Active item background light blue.
  - Active icon/text primary blue.
  - Inactive text deep navy.
  - Section labels muted blue-gray.
- Typography:
  - Wordmark uppercase, bold, spaced.
  - Section labels 11px uppercase.
  - Item labels 14px.
- Borders/radius/shadows:
  - Active nav item radius 6-8px.
  - No heavy sidebar shadow.
- Behavior:
  - Desktop persistent.
  - Tablet/mobile collapses or becomes hidden behind menu.
  - Active states must be visually and programmatically clear.
- Fidelity target:
  - The sidebar is a major first-viewport signal. It should be visually close to the reference before polishing lower panels.

### Main Content Area

- Layout:
  - Main column starts to the right of sidebar.
  - Top metric cards span full content width.
  - Below metrics, use a two-column grid: wide operational area and narrower right rail.
  - Bottom section uses a large map panel plus compact analytics cards.
- Spacing:
  - Outer content padding about 24px.
  - Grid gap about 14-18px in the reference.
  - Keep vertical spacing tight enough to fit all major panels in one desktop screenshot.
- Colors:
  - Page background light blue-gray.
  - Panels white.
  - Dividers pale blue-gray.
- Typography:
  - Panel titles compact and high contrast.
  - Secondary labels muted.
- Borders/radius/shadows:
  - Panels use 1px border and 8px radius.
  - Very subtle shadow only if it helps match the screenshot.
- Behavior:
  - Main content can scroll vertically if viewport is shorter than the reference.
  - Avoid nested scrolling except table/map only if absolutely necessary.
- Fidelity target:
  - Preserve the dashboard's dense operational composition. Do not convert it to a loose card grid.

### Summary/Stat Cards

- Layout:
  - Five equal cards in one row on wide desktop.
  - Each card has title top-left, value below, trend row at bottom-left, visual indicator on the right.
- Spacing:
  - Height about 130-140px.
  - Padding about 20-24px.
  - Internal gap 8-12px.
- Colors:
  - White surface.
  - Pale border.
  - Blue for positive/neutral sparklines.
  - Red for risky/blocked sparklines.
  - Green for positive trend labels.
- Typography:
  - Labels small uppercase or semibold.
  - Values large, 26-32px, semibold.
  - Trend microcopy 12-13px.
- Borders/radius/shadows:
  - Radius 8px.
  - Border 1px.
  - Minimal shadow.
- Behavior:
  - Cards may be static initially.
  - Sparklines should render consistently with stable width and height.
- Fidelity target:
  - Top row must be one of the closest matches because it anchors the screenshot.

### Tables

- Layout:
  - Edge-to-edge inside the panel with header row, six body rows, and footer.
  - Keep columns aligned with the reference.
  - Use two-line identity and device cells.
- Spacing:
  - Header height about 40px.
  - Row height about 50px.
  - Cell padding about 12-16px.
- Colors:
  - Header text muted.
  - Row dividers pale.
  - Links blue.
  - Status dot green for live rows.
  - Score bars use red/amber/green by score.
- Typography:
  - Header 11-12px uppercase.
  - Cells 12-13px.
  - IDs and IPs can use mono or compact UI text.
- Borders/radius/shadows:
  - Panel has border/radius.
  - Table rows use dividers only, no boxed cells.
- Behavior:
  - Row hover should lightly tint background.
  - Links should have accessible focus rings.
  - On mobile, reduce columns or use horizontal scroll inside the table panel.
- Fidelity target:
  - Match table density, column ordering, row count, and footer from the image.

### Charts or Graph Areas

- Layout:
  - Sparklines are minimal and axis-free.
  - Webhook chart is a small line chart with sparse time labels.
  - Donut charts are compact with center total.
  - Map panel is the largest lower visualization.
- Spacing:
  - Keep chart containers at fixed heights to avoid layout jumps.
  - Legends should be compact and close to charts.
- Colors:
  - Use semantic colors only.
  - Use pale blue for low-risk map points and red/amber for higher risk.
- Typography:
  - Axis labels and legends 10-12px.
  - Center donut values 13-16px semibold.
- Borders/radius/shadows:
  - Charts live inside bordered panels.
  - No extra chart frames.
- Behavior:
  - Tooltips can be static for visual match unless interactive behavior is explicitly required.
  - Recharts animations should be subtle or disabled during screenshot QA if they cause inconsistent captures.
- Fidelity target:
  - Charts should look like operational telemetry, not default library demos.

### Status Badges

- Layout:
  - Inline-flex, centered text, optional icon/dot.
  - Compact height around 24-28px.
- Spacing:
  - Horizontal padding 8-10px.
  - Gap 4-6px if icon/dot is present.
- Colors:
  - `CRITICAL` and `HIGH`: red text with red-tinted background.
  - `MEDIUM`: amber/orange text with amber-tinted background.
  - `LOW`: green text with green-tinted background.
  - `BETA`: blue text with blue-tinted background.
- Typography:
  - 11-12px, semibold, uppercase where shown.
- Borders/radius/shadows:
  - Radius 4px or less for badges.
  - No shadows.
- Behavior:
  - Use text labels, not color alone.
- Fidelity target:
  - Badges should be easy to scan and should match the reference's compact severity chips.

### Buttons

- Layout:
  - Use existing `Button` where it matches size/style.
  - For dashboard-specific icon buttons, extend with classes rather than creating a new generic button system.
- Spacing:
  - Header/filter buttons about 36-40px high.
  - Icon-only buttons square.
- Colors:
  - Primary actions blue.
  - Secondary/filter controls white with pale border.
  - Destructive actions red only when needed.
- Typography:
  - 12-13px semibold for compact controls.
- Borders/radius/shadows:
  - Radius 6-8px.
  - Border 1px.
  - Minimal shadow.
- Behavior:
  - Hover tint should be subtle.
  - Focus rings must remain visible.
  - Icon-only buttons require `aria-label`.
- Fidelity target:
  - Controls should feel like dashboard tools, not large marketing CTAs.

### Search/Filter Controls

- Layout:
  - Global search in top bar.
  - Table controls on `LIVE ACCESS EVENTS` panel top-right.
  - Filter button shows `Filters (3)`.
- Spacing:
  - Search field height about 48px.
  - Table filters about 36px high.
- Colors:
  - White surface, pale border, muted placeholder.
  - Blue focus ring.
- Typography:
  - Placeholder and controls 13-14px.
- Borders/radius/shadows:
  - Radius 8px.
  - Border 1px.
- Behavior:
  - Static controls are acceptable for initial visual rebuild.
  - Use real form/button elements so future behavior can be added cleanly.
- Fidelity target:
  - Match the image's exact search placeholder and filter labels.

### Empty, Loading, and Error States

- Layout:
  - These states may not be visible in the reference, but shared panels should have planned states for later data integration.
  - Empty states should be centered inside the panel, not full-page unless the whole dashboard fails.
  - Loading skeletons should match the shape of cards, table rows, and chart panels.
  - Error panels should be compact and red-bordered.
- Spacing:
  - Use existing panel padding.
- Colors:
  - Empty/loading muted blue-gray.
  - Error red border/tint with readable text.
- Typography:
  - Clear, direct text.
  - Avoid playful illustrations or casual language.
- Borders/radius/shadows:
  - Match panel radius and borders.
- Behavior:
  - Loading and error states should not cause layout jumps.
  - Error state should include retry action only if a real data-fetching hook exists.
- Fidelity target:
  - Keep these states consistent with `DESIGN.md`, but do not let them alter the default reference-image dashboard.

## Visual QA Checklist

- [ ] Layout matches the image closely at desktop size.
- [ ] Sidebar width, logo placement, section grouping, and active item styling are correct.
- [ ] Header search, platform switcher, notification/help icons, and profile block align correctly.
- [ ] Five top metric cards have matching order, values, spacing, and visual indicators.
- [ ] Card sizes and spacing are accurate.
- [ ] Colors match the light reference while preserving `DESIGN.md` semantic risk colors.
- [ ] Typography hierarchy is correct across metrics, panel titles, table headers, cells, and microcopy.
- [ ] Border radius and shadows are consistent and restrained.
- [ ] Live access events table matches the visual proportions, columns, row density, and footer.
- [ ] Pending reviews, AI insights, and webhook health panels match the right rail proportions.
- [ ] Map, risk lists, donut charts, and line chart match the lower dashboard proportions.
- [ ] Status badges are compact, readable, and color-coded with text labels.
- [ ] Buttons, search, and filters use dashboard-sized controls, not marketing-sized controls.
- [ ] Responsive behavior does not break the layout.
- [ ] No unnecessary visual differences were introduced.
- [ ] No stock Next.js starter UI remains.
- [ ] No new dependencies were added without explicit justification.
- [ ] Focus states are visible and keyboard navigation is preserved.

## Validation Commands

Use PowerShell from the repository root unless a future repo instruction requires WSL/bash. The current repository appears shell-agnostic and uses pnpm workspaces.

Install dependencies if needed:

```powershell
pnpm install --frozen-lockfile
```

Run the web app in development:

```powershell
pnpm --filter web dev
```

Or from the root script:

```powershell
pnpm dev:web
```

Lint the web app:

```powershell
pnpm --filter web lint
```

Build the web app:

```powershell
pnpm --filter web build
```

Equivalent root build script:

```powershell
pnpm build:web
```

Full app stack, if API plus web are both needed:

```powershell
pnpm dev
```

Available root/API validation context:

- Root scripts include `dev`, `dev:api`, `dev:web`, `build:api`, `build:web`, `db:migrate`, `db:studio`, `db:generate`, and `lint:api`.
- Web scripts include `dev`, `build`, `start`, and `lint`.
- The web package does not currently define `typecheck` or `test` scripts.
- The API package defines `test`, `test:watch`, `test:cov`, `test:e2e`, `lint`, and `build`, but this visual dashboard task should not require API changes.

If RTK is available and the command output may be noisy, prefer:

```powershell
rtk pnpm --filter web lint
rtk pnpm --filter web build
```

If RTK hides information needed for debugging, rerun the original pnpm command without RTK.

## Final Handoff Notes

- Keep changes small and reviewable.
- Follow `DESIGN.md` for Tunai product semantics, accessibility, risk language, and security-console seriousness.
- Match the provided image as closely as possible for the actual visual target.
- Preserve the existing architecture: Next.js App Router, Tailwind 4, shadcn-style variables, `lucide-react`, `recharts`, and the `@/*` import alias.
- Avoid unnecessary dependencies.
- Use existing `Button` and `cn` helpers where they fit.
- Prefer focused dashboard components over one large `page.tsx`.
- Do not invent backend APIs during the visual rebuild.
- Document any unavoidable differences from the image, including font differences, map simplifications, data-source limitations, or responsive compromises.
- Before finishing implementation, re-check `apps/web/AGENTS.md`, the reference image, and this plan to confirm the work stayed within scope.
