# API Store — Kaggle.com Design System

## Overview
The API Store is a data-science-oriented API marketplace designed to feel **technical, collaborative, authoritative, and energizing**. The aesthetic mirrors Kaggle — a platform where developers and data scientists discover, share, and interact with APIs, datasets, and tools. The UI prioritizes discoverability through search, rich metadata cards, leaderboards, and community signals (votes, usage stats).

The visual language favors a signature bright cyan-blue accent, clean geometric sans-serif typography, card-heavy browsing layouts, and a light, spacious canvas that keeps dense data readable.

---

## Colors

**Core Brand & Surface**
* **Primary / Accent:** `#20BEFF` (Kaggle Blue / Bright Cyan) — Logo, primary buttons, active nav indicators, links on hover, vote buttons, tags.
* **Primary Hover:** `#169BD6` (Deeper Cyan) — Interactive hover states for primary buttons and links.
* **Background:** `#FFFFFF` (Pure White) — Main application canvas, page backgrounds.
* **Surface:** `#FAFAFA` (Off-White) — Cards, panels, table headers, sidebar backgrounds.
* **Surface Muted:** `#F4F4F4` (Light Gray) — Code blocks, alternate row backgrounds, empty state fills.
* **Surface Elevated:** `#FFFFFF` (White) — Dropdowns, modals, floating menus with soft shadow.

**Text & Borders**
* **Text Primary:** `#222222` (Near Black) — Headings, body copy, card titles, table text.
* **Text Secondary:** `#6C757D` (Medium Gray) — Captions, timestamps, helper text, metadata labels.
* **Text Muted:** `#8E8E8E` (Gray) — Placeholder text, disabled states, footer links, empty state hints.
* **Text Link:** `#20BEFF` (Accent Cyan) — Inline links, navigation, author names, tags.
* **Border:** `#E1E1E1` (Light Border) — Card outlines, table dividers, input borders, section separators.
* **Border Subtle:** `#F0F0F0` (Very Light Gray) — Inner dividers, subtle rule lines.

**Semantic Palette**
Used strictly for status indicators, voting, and actions.
* **Success / Upvote:** `#20BEFF` (Accent Cyan) — Positive votes, trending indicators, success states.
* **Warning:** `#FFC107` (Amber) — Beta tags, pending verification, limited trials.
* **Error / Downvote:** `#DC3545` (Red) — Validation errors, failed requests, revoked keys.
* **Info:** `#17A2B8` (Teal) — System notifications, help tips, new feature badges.
* **Premium / Gold:** `#FFD700` (Gold) — Pro tiers, featured listings, organization badges.

---

## Typography

The typography system is engineered for technical clarity, data scanning, and developer-grade professionalism.

* **Display / Headings:** `Google Sans` or `Roboto` fallback — Clean, geometric sans-serif used for page titles, hero headlines, card titles, and section headers.
* **Body / UI:** `Roboto` or `Segoe UI`, `-apple-system`, `Arial` fallback — Highly legible sans-serif used for all UI text, body copy, tables, badges, and metadata.
* **Code / Monospace:** `Roboto Mono`, `Consolas`, `monospace` — Used for API endpoint paths, code snippets, JSON payloads, keys, and technical identifiers.

**Type Scale & Usage:**
* **H1 (Page / Hero Titles):** 36px, Bold, -0.02em letter spacing.
* **H2 (Section / Card Titles):** 24px, Bold, -0.01em letter spacing.
* **H3 (Subsection / List Headers):** 20px, Semi-Bold, Default letter spacing.
* **H4 (Labels / Small Headers):** 16px, Semi-Bold, Default letter spacing.
* **Body (Default):** 14px, Regular, 1.5 line-height.
* **UI Text / Metadata:** 13px, Regular, 1.4 line-height.
* **Code / Badges / Timestamps:** 12px, `Roboto Mono` (Code) or `Roboto Medium` (Badges), +0.02em letter spacing for uppercase badges.
* **Stats / Numbers:** 28px, Bold, `-0.02em` letter spacing. Used for large metric values (e.g., "1.2M calls").

---

## Layout

The layout prioritizes discoverability, search, and dense but scannable data presentation.

* **Top Navbar:** Fixed top, 64px height. Background `#FFFFFF` with 1px bottom border. Left: hamburger menu (opens sidebar), Kaggle-style logo. Center: global search bar ( prominent, rounded, up to 40% width). Right: "Create" dropdown, notification bell, user avatar.
* **Left Sidebar:** Collapsible (256px expanded, off-canvas on mobile). Background `#FAFAFA`. Contains: Create button, primary nav links (Marketplace, Dashboard, Analytics, Endpoints, Keys, Credits), section dividers.
* **Main Content Area:** Fluid width, constrained to max-width 1200px. Uses a flexible grid with 16px–24px gaps.
* **Card Grid:** API / dataset cards typically span 3 columns (4 per row on large screens), 2 columns on tablet, 1 column on mobile.
* **Detail Pages:** Two-column split. Left column (~66%) for primary content (endpoint docs, code samples, description). Right column (~33%) for sticky metadata panel (owner info, usage stats, tags, action buttons).
* **Tables:** Used for leaderboards, analytics, key lists. Edge-to-edge within container. Sticky headers. 48px row height. Hover highlight.
* **Responsive Behavior:**
  - **Desktop (1024px+):** Sidebar expanded, multi-column card grids, split detail pages.
  - **Tablet (768px - 1023px):** Sidebar collapses to icon-only or off-canvas overlay. Card grids become 2 columns.
  - **Mobile (Below 768px):** Sidebar hidden behind hamburger. Single-column cards. Tables stack or become horizontal-scroll cards. Detail pages stack vertically.

---

## Elevation

Kaggle relies on **subtle borders and light backgrounds** rather than heavy shadows. Elevation is minimal and functional.

* **Static Cards:** No shadow. 1px solid border (`#E1E1E1`) or bottom border only. Background `#FFFFFF` or `#FAFAFA`.
* **Hover Cards:** Subtle border darkening to `#CFCFCF`, background shift to `#FAFAFA`.
* **Dropdowns / Menus:** Soft drop shadow (`0 4px 12px rgba(0, 0, 0, 0.08)`), no border, background `#FFFFFF`, border-radius 4px.
* **Modals & Drawers:** Full-screen backdrop (`#000000` at 40% opacity). The modal itself has no shadow, 1px border `#E1E1E1`, background `#FFFFFF`, border-radius 8px.
* **Focus States:** 2px solid ring of `#20BEFF` with a 2px offset. Mandatory for keyboard navigation.
* **Floating Action Bars:** Bottom-fixed on mobile, white background, top border, shadow `0 -2px 8px rgba(0,0,0,0.05)`.

---

## Components

* **Buttons:**
  - *Primary:* Solid `#20BEFF` background, `#FFFFFF` text, rounded (4px radius), 36px height. Hover: `#169BD6`.
  - *Secondary / Ghost:* Transparent background, `#20BEFF` text, 1px `#20BEFF` border. Hover: light cyan tint background.
  - *Text Link:* No background, `#20BEFF` text, underline on hover.
  - *Danger:* `#DC3545` background, white text. Used for revoke, delete.
* **Cards (API / Dataset Cards):**
  - Vertical layout: Thumbnail or icon area (top, 16:9 or 4:3 ratio, 4px radius) → title → owner row (avatar + name) → metadata row (vote count, usage stats, tags).
  - 1px border `#E1E1E1` or bottom border only. Background `#FFFFFF`.
  - Hover: subtle background shift, border darkens.
* **Inputs & Search:**
  - 40px height. `#F4F4F4` or `#FFFFFF` background, 1px `#E1E1E1` border. Text `#222222`.
  - Search bar: rounded-full, prominent, with search icon. Focus: `#20BEFF` border.
* **Topic / Category Tags:** Small pills, `#E1F5FE` (light cyan) background, `#20BEFF` text, 4px radius, 12px font. Hover: darker background.
* **Vote / Clap Button:** Up-arrow icon + count. Hover fills with `#20BEFF`. Active state: filled icon.
* **Avatar:** Circular, 24px (inline), 48px (profile card), 96px (profile page). No border or 1px subtle border.
* **Tabs:** Underline style. Active tab has a 2px bottom border in `#20BEFF`; inactive tabs are muted gray.
* **Tables:**
  - Edge-to-edge within container. Sticky headers with `#FAFAFA` background.
  - 48px row height. Hover highlights entire row with `#F4F4F4`.
  - Sortable columns indicated by arrow icons.
* **Code Blocks:** Background `#F4F4F4`, 4px radius, monospace font. Syntax highlighting: keys in blue, strings in green, numbers in orange.
* **API Endpoint Path:** Monospace, `#20BEFF` background pill or inline code style. Click-to-copy icon.
* **Empty States:** Centered, muted gray text, subtle illustration or icon (e.g., empty box), and a clear primary action button.
* **Loading Skeletons:** Pulsing `#F4F4F4` blocks matching card shapes.
* **Confirmation Modals:** Centered, white background. Primary button for confirm, secondary for cancel. Destructive actions use red.
* **Notification Badge:** Small red dot or number pill on bell icon.

---

## Navigation

**Top Navbar (Always Present)**
* **Left:** Hamburger menu (opens left sidebar), logo.
* **Center:** Global search bar — finds APIs, endpoints, users, datasets.
* **Right:** "Create" button (dropdown: New API, New Dataset, New Notebook), notification bell, user avatar dropdown (Profile, Settings, Dashboard, Sign out).

**Left Sidebar (Collapsible)**
* **Create:** Prominent "Create" button at top.
* **Primary Nav:**
  - Marketplace (browse APIs)
  - Dashboard (personal overview)
  - Analytics (usage stats)
  - Endpoints (my endpoints)
  - Keys (API keys management)
  - Credits (billing / usage credits)
* **Secondary Nav:**
  - Competitions (if applicable)
  - Datasets
  - Notebooks
  - Discussions

**Footer (Landing Page)**
* Minimal footer on app pages. Landing page may have a link row.

---

## Page Patterns

**Landing Page**
1. **Hero:** Full-width white or light gradient background. Large bold sans-serif headline: "The World's API Proving Ground." Subhead: "Discover, publish, and integrate APIs with the world's data community." CTA: "Explore Marketplace" (primary) + "Publish an API" (secondary).
2. **Trending APIs:** Grid of featured API cards. Section title with "See all" link.
3. **Categories:** Horizontal scroll or grid of category tags/cards (Finance, ML, Geo, Social, etc.).
4. **Leaderboard / Stats:** A section showing platform-wide metrics (total APIs, total calls, active developers) in large bold numbers.
5. **Community:** Teaser for discussions, competitions, or featured notebooks.

**Marketplace / Browse**
1. **Filter Bar:** Horizontal pills for categories, pricing (Free / Paid), sort (Trending / Newest / Most Used).
2. **Card Grid:** 3–4 column responsive grid of API cards.
3. **Pagination or Infinite Scroll:** Load more button or auto-infinite scroll.

**API Detail Page**
1. **Header:** API name (H1), owner avatar + name, publish date, tags, vote button.
2. **Two-Column Layout:**
   - *Left (66%):* Description, documentation tabs (Overview, Docs, Changelog), code samples, endpoint list.
   - *Right (33%):* Sticky panel — usage stats (calls today, avg latency), pricing tier, "Get API Key" button, related APIs.
3. **Code Samples:** Tabs for language selection (cURL, Python, JavaScript, Go). Syntax-highlighted blocks.

**Dashboard**
1. **Metric Cards:** Top row — Total Calls, Active Keys, Avg Latency, Credits Remaining.
2. **Analytics Chart:** Line chart of API calls over time. Cyan line on white background.
3. **Recent Activity:** Table of recent requests (timestamp, endpoint, status, latency).
4. **Quick Actions:** Buttons to create new key, view docs, manage endpoints.

**Keys Management**
1. **List View:** Table of API keys (name, masked key, created date, last used, status).
2. **Actions:** Copy key, regenerate, revoke. Revoke triggers confirmation modal.
3. **Create Key:** Modal form — name input, scope selection, submit.

**Profile / Organization Page**
1. **Header:** Avatar, display name, bio, join date, reputation score.
2. **Tabs:** APIs, Datasets, Notebooks, Competitions, Activity.
3. **Content:** Grid of cards filtered by tab.

---

## Spacing

Built on a 4px grid.

* **Base Unit:** 4px
* **Spacing Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
* **Page Padding:** 24px (Desktop), 16px (Mobile)
* **Card Padding:** 16px
* **Card Gap:** 16px–24px
* **Section Gaps:** 48px between major sections.
* **Navbar Height:** 64px
* **Sidebar Width:** 256px (Expanded), 0 / off-canvas (Mobile)
* **Max Content Width:** 1200px
* **Modal Padding:** 24px internal padding.
* **Drawer Width:** 360px (standard), 480px (wide for code/docs).

---

## Border Radius

* **Small Elements (Tags, Badges, Pills):** 4px
* **Interactive Elements (Buttons, Inputs, Selects):** 4px
* **Structural Elements (Cards, Modals, Drawers):** 8px
* **Avatars:** 50% (Fully rounded)
* **Thumbnails / Images:** 4px
* **Search Bar:** 99px (fully rounded / pill)

---

## Iconography

Icons are thin, geometric, and functional. Stroke width 1.5px. Primarily from a Material-style set.

* **Search:** Magnifying glass
* **Vote / Upvote:** Up arrow / triangle
* **Bookmark / Save:** Bookmark outline / filled
* **Share:** Share arrow
* **Notification:** Bell
* **User / Avatar:** Person outline or uploaded image
* **Create:** Plus / pencil
* **More / Overflow:** Three vertical dots
* **Close:** X
* **Copy:** Two overlapping squares
* **Code / Terminal:** Terminal / code brackets
* **Key:** Key icon for API keys
* **Chart / Analytics:** Bar chart / line chart
* **Organization:** Building / people

---

## Motion & Interaction

Motion is fast, functional, and unobtrusive.

* **Hover Transitions:** 150ms ease-in-out (color, background, border).
* **Focus States:** Instant (0ms) for accessibility.
* **Card Hover:** Subtle background color change, border darkens. No lift/shadow.
* **Drawer Transitions:** 250ms ease slide-in from left (sidebar) or right (settings).
* **Modal Transitions:** 150ms fade-in + slight scale (0.98 → 1).
* **Button Press:** Scale to 0.98 on active click.
* **Vote Animation:** Icon fills with color, count increments with a brief scale-up (1.2 → 1) over 200ms.
* **Skeleton Shimmer:** Subtle left-to-right gradient sweep on loading blocks, 1.5s interval.
* **Table Row Hover:** Instant background color change to `#F4F4F4`.
* **Dropdown Open:** 100ms fade + slight translate-y (-4px → 0).

---

## Data Visualization

Data visualization is used for analytics, leaderboards, and usage dashboards.

* **Line Charts:** API call volume over time. Cyan `#20BEFF` line, light fill under curve, grid lines `#F0F0F0`.
* **Bar Charts:** Endpoint usage comparison. Cyan bars on white.
* **Pie / Donut Charts:** Credit allocation, status distribution. Cyan, gray, amber segments.
* **Tables vs. Charts:** If the user needs to *take action* on a specific record (e.g., revoke a key), use a table. If the user needs to *understand a trend* (e.g., traffic spike), use a chart.
* **Leaderboards:** Dense tables with rank, user avatar, name, score/metric. Highlight top 3 with gold/silver/bronze accents.

---

## Do's and Don'ts

* **Do** use the accent color (`#20BEFF`) for primary actions, active nav, links, and upvotes.
* **Do** keep cards flat with subtle borders — no heavy shadows.
* **Do** show API metadata prominently: latency, uptime, usage count, owner credibility.
* **Do** use code blocks with syntax highlighting for all endpoint examples.
* **Do** truncate long API descriptions with "Read more" expansion.
* **Do** use monospace for all technical identifiers (API keys, endpoint paths, JSON keys).
* **Don't** use more than one accent color in a view — cyan is the hero.
* **Don't** hide critical actions (Get Key, Copy Endpoint) behind menus.
* **Don't** use rounded corners larger than 8px — keep it sharp and technical.
* **Don't** show raw API keys by default; always mask with `••••••••` and provide copy/reveal.
* **Don't** use playful illustrations or emojis — the tone is professional and developer-focused.
* **Don't** allow destructive actions (Revoke Key, Delete Endpoint) without a confirmation modal.

---

## Accessibility

The platform must be usable by all developers and data scientists, adhering to WCAG 2.1 AA standards.

* **Contrast:** Body text `#222222` on `#FFFFFF` exceeds 4.5:1. Accent `#20BEFF` on white text passes for large text/buttons.
* **Focus Rings:** Visible, 2px solid `#20BEFF` with 2px offset.
* **Keyboard Navigation:** All interactive elements reachable via Tab. Cards are focusable as a unit (Enter to navigate).
* **Screen Readers:** API cards announced as "API: [Name] by [Author], [vote count] votes, [usage] calls". Icons have aria-labels.
* **Motion:** Respect `prefers-reduced-motion` — disable vote animations and page transitions.
* **Code Blocks:** Ensure horizontal scroll for long code lines; do not truncate.

---

## Responsive Design

* **Desktop (1024px+):** Full expanded sidebar, 3–4 column card grids, split detail pages, dense analytics tables.
* **Tablet (768px - 1023px):** Sidebar collapses to icon-only or off-canvas overlay. Card grids become 2 columns. Detail pages stack.
* **Mobile (Below 768px):** Sidebar hidden behind hamburger. Single-column cards. Tables become horizontal-scroll or card lists. Detail pages fully stacked. Floating bottom bar for primary actions (Get Key, Vote).

---

## Final Design Summary

The API Store is not a standard e-commerce site; it is a **developer-centric API proving ground**. The design must instill confidence, technical credibility, and community energy. By utilizing a bright cyan accent, clean geometric typography, flat card-based browsing, and rich code-first documentation, the API Store empowers developers to discover, test, and integrate APIs rapidly while fostering a collaborative marketplace community.
