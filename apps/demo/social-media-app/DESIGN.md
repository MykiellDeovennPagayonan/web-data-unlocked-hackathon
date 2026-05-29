# Social Media App — Medium.com Design System

## Overview
The social-media-app is an editorial publishing platform designed to feel **warm, readable, human, and calm**. The aesthetic mirrors Medium.com — a content-first interface that gets out of the reader's way while providing rich tools for writers and curators. The UI prioritizes typography, generous whitespace, and a warm neutral palette that reduces eye strain during long reading sessions.

The visual language favors serif display type for headings, a clean sans-serif for body text, a signature warm yellow-green accent, and editorial-grade spacing to ensure stories feel premium and immersive.

---

## Colors

**Core Brand & Surface**
* **Accent (Primary):** `#FFC017` (Warm Yellow-Green) — Logo, primary buttons, active nav indicators, topic tags, and key CTAs.
* **Accent Hover:** `#E5AC00` (Deeper Yellow) — Interactive hover states for primary buttons and links.
* **Background:** `#F7F4ED` (Warm Off-White) — Main page canvas, article backgrounds. Softer than pure white for extended reading.
* **Surface:** `#FFFFFF` (Pure White) — Cards, panels, modals, dropdown menus, elevated content blocks.
* **Surface Muted:** `#F2F2F2` (Light Gray) — Secondary panels, code blocks, blockquote backgrounds, table zebra striping.

**Text & Borders**
* **Text Primary:** `#242424` (Near Black) — Headings, body copy, primary UI labels.
* **Text Secondary:** `#6B6B6B` (Medium Gray) — Timestamps, captions, helper text, reading time, author bios.
* **Text Muted:** `#757575` (Gray) — Placeholder text, disabled states, footer links, empty state hints.
* **Text Link:** `#1A8917` (Forest Green) — Inline text links, author names, topic tags in hover state.
* **Border:** `#E5E5E5` (Light Border Gray) — Card dividers, table row separators, input borders, horizontal rules.
* **Border Subtle:** `#F2F2F2` (Very Light Gray) — Section dividers, subtle separators.

**Semantic Palette**
Used strictly for status indicators and actions.
* **Success:** `#1A8917` (Forest Green) — Published status, positive feedback, follow confirmations.
* **Warning:** `#FFC017` (Accent Yellow) — Draft status, pending actions, content warnings.
* **Error:** `#CC0000` (Red) — Deletion confirmations, validation errors, failed publish.
* **Info:** `#1A73E8` (Blue) — System notifications, help tooltips.

---

## Typography

The typography system is engineered for long-form reading, editorial hierarchy, and calm scanning.

* **Display / Headings:** `GT Super` or `Georgia` fallback — A sharp, modern serif used for article titles, section headings, hero headlines, and featured card titles. Evokes print journalism authority.
* **Body / UI:** `Sohne` or `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` fallback — A clean, highly legible sans-serif used for all UI text, body paragraphs, buttons, navigation, and metadata.
* **Code / Monospace:** `Menlo, Monaco, "Courier New", Courier, monospace` — Used for inline code snippets, code blocks, and technical metadata.

**Type Scale & Usage:**
* **H1 (Hero / Article Titles):** 42px (desktop) / 32px (mobile), Bold, -0.02em letter spacing, `GT Super`.
* **H2 (Section Titles / Featured Cards):** 28px, Bold, -0.01em letter spacing, `GT Super`.
* **H3 (Card Titles / Subsections):** 22px, Bold, Default letter spacing, `GT Super`.
* **H4 (Inline Labels / Small Headings):** 18px, Semi-Bold, Default letter spacing, sans-serif.
* **Body (Article Copy):** 20px (reading view) / 16px (UI), Regular, 1.6 line-height (reading), 1.5 (UI), sans-serif.
* **UI Text / Metadata:** 14px, Regular, 1.4 line-height, sans-serif.
* **Captions / Timestamps:** 13px, Regular, sans-serif.
* **Badges / Tags:** 13px, Medium, +0.02em letter spacing.

---

## Layout

The layout prioritizes readability and content immersion over information density.

* **Navbar:** Fixed top, 75px height. Transparent on landing page (over hero), solid white with bottom border on scroll. Houses logo (left), search icon, write button, and user avatar (right).
* **Main Content Area:** Centered, max-width 1192px on desktop. Side padding 24px (desktop), 16px (mobile).
* **Hero Section:** Full-width, warm off-white background. Split layout — large serif headline + subheadline on left, floating brand illustration on right (desktop only). Height ~600px.
* **Feed / Home:** Centered single-column or two-column grid. Left column (wider) for article cards. Right column (narrower) for sticky sidebar: Staff Picks, Recommended Topics, Who to Follow.
* **Article Reading View:** Centered, max-width 680px for body text. Article title can span wider (max 900px). Generous top padding (80px+). Clean, unadorned layout — no sidebars to minimize distraction.
* **Profile / Author Pages:** Header with large avatar, name, bio, follower count. Below: tabbed navigation (Home, About, Lists) with article feed.
* **Write / Editor:** Minimal chrome. Full-width centered editor (max 740px). Top toolbar: Publish button, story settings. Bottom: character count, reading time estimate.
* **Modal & Drawers:** Centered modals for confirmations (e.g., Delete Story). Slide-out drawers from right for menus (Notifications, Account Settings).
* **Responsive Behavior:**
  - **Desktop (1024px+):** Full two-column layouts, sidebar visible, hero illustration present.
  - **Tablet (768px - 1023px):** Sidebar collapses below main content. Single-column article cards. Hero stacks vertically.
  - **Mobile (Below 768px):** Single-column feed. Hero illustration hidden. Navbar condenses to hamburger menu. Article reading view uses full width with 20px padding. Floating bottom bar for claps/responses.

---

## Elevation

Medium relies on **flat layers, whitespace, and subtle borders** rather than heavy shadows. The interface feels light and airy.

* **Static Cards:** No shadow. 1px solid border (`#E5E5E5`) on bottom or all sides. Background `#FFFFFF`.
* **Hover Cards (e.g., article cards):** No shadow change. Subtle background shift to `#FAFAFA` or text underline on title.
* **Dropdowns / Menus:** Soft drop shadow (`0 4px 12px rgba(0, 0, 0, 0.08)`), no border, background `#FFFFFF`, border-radius 4px.
* **Modals & Drawers:** Full-screen backdrop (`#FFFFFF` at 85% opacity, or `#242424` at 50% for emphasis). The modal itself has no shadow, 1px border, background `#FFFFFF`.
* **Focus States:** 2px solid ring of `#242424` with a 2px offset. Primary buttons use `#FFC017` ring.
* **Floating Elements (e.g., reading progress bar):** Thin 2px line at top of viewport, `#FFC017` fill.

---

## Components

* **Buttons:**
  - *Primary:* Solid `#242424` background, `#FFFFFF` text, rounded-full (pill shape), 40px height, 16px horizontal padding. Hover: `#000000`.
  - *Secondary / Ghost:* Transparent background, `#242424` text, 1px `#242424` border, rounded-full. Hover: light gray background.
  - *Accent:* `#FFC017` background, `#242424` text, rounded-full. Used for "Start reading", "Get started".
  - *Text Link:* No background, `#242424` text, underline on hover. Used for "Sign in".
* **Cards (Article Cards):**
  - Horizontal layout: Thumbnail (200x134px, 4px radius, right side) + text (left).
  - Or vertical layout: Large thumbnail on top, title + excerpt below.
  - No border-radius on card container. Separator is a 1px `#E5E5E5` bottom border.
  - Contains: Author avatar (20px, circle) + name, date, reading time, title (serif, bold), excerpt (sans, secondary color), topic tags.
* **Inputs & Search:**
  - 40px height. Transparent or `#F2F2F2` background, no border or 1px `#E5E5E5`. Text `#242424`.
  - Search bar expands on focus, rounded-full.
* **Topic Tags:** Small pills, `#F2F2F2` background, `#242424` text, 4px radius, 13px font. Hover: underline.
* **Avatar:** Circular, 24px (inline), 48px (profile header), 96px (author page). No border.
* **Tabs:** Underline style. Active tab has a 1px bottom border in `#242424`; inactive tabs are muted gray. Used on profiles and settings.
* **Divider / Horizontal Rule:** 1px `#E5E5E5`, used between article cards and sections.
* **Clap Button:** Hand icon + count. Hover triggers animated scale-up. Active state fills icon with `#FFC017`.
* **Bookmark:** Bookmark outline icon. Filled when saved.
* **Follow Button:** Ghost button, rounded-full. Changes to "Following" on click (filled style).
* **Reading Time / Metadata:** Inline, 13px, `#6B6B6B`. Format: "5 min read · Sep 12, 2024".
* **Blockquote (Editorial):** Left 4px border `#E5E5E5`, italic serif text, light gray left padding.
* **Code Blocks:** Background `#F2F2F2`, 4px radius, monospace font, horizontal scroll if needed.
* **Empty States:** Centered, muted gray text, no illustration. Simple message like "You haven't published any stories yet."
* **Loading Skeletons:** Pulsing `#F2F2F2` blocks matching article card shapes.
* **Confirmation Modals:** Centered, white background, black heading, green primary button for safe actions, red for destructive (e.g., Delete story).

---

## Navigation

The navigation is minimal and disappears into the background so content shines.

**Top Navbar (Always Present)**
* **Left:** Medium logo (wordmark in black, or white when over dark hero).
* **Right (Logged Out):** Search icon, "Write" (optional), "Sign in" text link, "Get started" primary button (accent `#FFC017`, black text).
* **Right (Logged In):** Search icon, "Write" text link, notification bell, user avatar (dropdown: Profile, Library, Stories, Stats, Settings, Help, Sign out).

**Footer (Landing Page Only)**
* Single horizontal row of text links centered on page: Help, Status, About, Careers, Press, Blog, Privacy, Rules, Terms, Text to speech.
* 13px font, muted gray, separated by spacing (no bullets).

**Sidebar Navigation (Feed Page)**
* **Staff Picks:** Curated list of 3-5 article links.
* **Recommended Topics:** Horizontal scroll or wrap of topic tags.
* **Who to Follow:** Author cards with follow buttons.

---

## Page Patterns

**Landing Page**
1. **Hero:** Full-width warm off-white background. Large serif headline: "Human stories & ideas." Subhead: "A place to read, write, and deepen your understanding." CTA: "Start reading" (accent pill). Floating editorial illustration on right (desktop).
2. **Trending / Featured (Optional):** Below hero, a grid of trending articles or curated topics.
3. **Footer:** Centered link row.

**Feed / Home**
1. **Two-column layout:** Main column (article cards, infinite scroll). Sidebar (sticky: Staff Picks, Topics, Who to Follow).
2. **Article Card:** Author info row → Title (serif, bold) → Excerpt (2 lines, muted) → Thumbnail (right). Bottom: topic tags + read time.
3. **Topic Tabs (Optional):** Horizontal tabs above feed (For you, Following, Technology, Programming, etc.).

**Article Reading View**
1. **Header:** Article title (serif, 42px), author info (avatar + name + follow button), publication info, reading time.
2. **Hero Image (Optional):** Full-width, max 900px, above title or below.
3. **Body:** Centered, max-width 680px. Rich text: paragraphs, subheadings (serif), blockquotes, code blocks, images (full-bleed within container), embedded links.
4. **Clap / Response Bar:** Floating or fixed bottom bar on mobile. Clap button, response count, bookmark, share menu.
5. **Author Bio:** Bottom of article — author avatar, name, bio, follow button.
6. **More From Author / Related:** Below bio, 3 article cards.

**Profile / Author Page**
1. **Header:** Large avatar, name (serif, bold), bio, follower/following counts.
2. **Tabs:** Home (article feed), About, Lists.
3. **Article Feed:** Same cards as main feed, filtered by author.

**Write / Editor**
1. **Minimal Header:** Title input (placeholder: "Title"), Publish button (top right).
2. **Editor Body:** Rich text editor, placeholder: "Tell your story..."
3. **Toolbar:** Floating or fixed: Bold, Italic, Link, Heading, Quote, Code, Image embed.
4. **Story Settings (Drawer):** Tags, SEO description, Distribution settings, Schedule publish.

---

## Spacing

Built on a 4px grid with generous editorial whitespace.

* **Base Unit:** 4px
* **Spacing Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 80px, 120px
* **Page Padding:** 24px (Desktop), 16px (Mobile)
* **Section Gaps:** 48px between major sections (e.g., hero to feed). 80px+ on landing page.
* **Card Padding:** 24px internal padding for article cards.
* **Article Padding:** 80px top (below navbar), 40px bottom.
* **Navbar Height:** 75px
* **Hero Height:** ~600px (desktop), auto (mobile)
* **Max Content Width:** 1192px (desktop feed), 680px (article body), 900px (article title)
* **Modal Padding:** 32px internal padding.
* **Drawer Width:** 360px (standard), 480px (wide for settings).

---

## Border Radius

* **Small Elements (Tags, Badges, Pills):** 4px
* **Interactive Elements (Buttons, Inputs, Selects):** 99px (full pill/rounded)
* **Structural Elements (Cards, Modals, Drawers):** 0px (sharp editorial corners) or 4px for dropdowns
* **Avatars:** 50% (fully rounded)
* **Thumbnails:** 4px

---

## Iconography

Icons are thin, minimal, and functional. Stroke width ~1.5px. Primarily used for actions, not decoration.

* **Search:** Magnifying glass
* **Bookmark:** Bookmark outline / filled
* **Clap:** Hand / applause
* **Share:** Share arrow / three-dot menu
* **Notification:** Bell
* **User / Avatar:** Person outline or uploaded image
* **Write:** Pencil
* **More / Overflow:** Three horizontal dots
* **Close:** X
* **Check:** Used for "Following" state

---

## Motion & Interaction

Motion is subtle, purposeful, and never jarring. It should feel like turning a page.

* **Hover Transitions:** 150ms ease-in-out (text color, underline, background fills).
* **Focus States:** Instant (0ms) for accessibility.
* **Card Hover:** Title underline animates in. Thumbnail subtle scale (1.02) over 200ms.
* **Drawer Transitions:** 250ms ease slide-in from right.
* **Modal Transitions:** 150ms fade-in, content scales slightly (0.98 → 1).
* **Page Load:** Content fades in with a 200ms delay, 300ms duration.
* **Clap Animation:** Hand icon scales up (1.2) and bounces back with a slight rotation.
* **Button Press:** Scale to 0.98 on active click.
* **Skeleton Shimmer:** Subtle left-to-right gradient sweep on loading blocks, 1.5s interval.

---

## Editorial Content Patterns

**Article Cards**
* Always show author credibility: avatar + name (link to profile).
* Excerpt limited to 2 lines, truncated with ellipsis.
* Thumbnail aspect ratio: 200x134 (horizontal card) or 16:9 (vertical card).
* Timestamp format: "Sep 12" (recent), "Sep 12, 2024" (older).

**Reading Experience**
* No distractions: no sidebar, no popups, clean white/off-white background.
* Paragraph spacing: 1.6em line-height, 1.5em margin-bottom.
* Subheadings: Serif, bold, 28px, generous top margin (48px) to create rhythm.
* Links in body: Underlined, `#1A8917` color.
* Images: Full-width within the 680px column, 4px radius, centered caption below in muted gray.
* Blockquotes: Left border, italic serif, light gray background.
* Code blocks: Light gray background, rounded corners, horizontal scroll.

---

## Do's and Don'ts

* **Do** use the serif font (`GT Super` / Georgia) for all headings and article titles.
* **Do** maintain generous whitespace (80px+) between major sections.
* **Do** use the accent color (`#FFC017`) sparingly — only for primary CTAs, logo, and active indicators.
* **Do** keep the reading view completely clean — no sidebars, no ads, no floating widgets except clap bar.
* **Do** use pill-shaped buttons for all primary actions.
* **Do** truncate excerpts to 2 lines max on article cards.
* **Don't** use dark mode as default — this is a warm, light editorial experience.
* **Don't** use heavy drop shadows on cards — rely on whitespace and borders.
* **Don't** use more than one accent color in a view.
* **Don't** show full dates on recent articles — use relative or short format.
* **Don't** allow article body text to exceed 680px width (optimal reading measure).
* **Don't** use rounded corners on large structural containers — keep them sharp for editorial authority.

---

## Accessibility

The platform must be usable by all readers and writers, adhering to WCAG 2.1 AA standards.

* **Contrast:** Body text `#242424` on `#F7F4ED` / `#FFFFFF` exceeds 4.5:1. Accent `#FFC017` on black text passes for large text/buttons.
* **Focus Rings:** Visible, 2px solid `#242424` (or `#FFC017` on dark backgrounds) with 2px offset.
* **Keyboard Navigation:** All interactive elements reachable via Tab. Article cards are focusable as a unit.
* **Screen Readers:** Article cards announced as "Article: [Title] by [Author], [date]". Icons have aria-labels.
* **Motion:** Respect `prefers-reduced-motion` — disable clap animations and page fade-ins.
* **Text Size:** Support browser text zoom up to 200% without horizontal scroll on article body.

---

## Responsive Design

* **Desktop (1024px+):** Full two-column feed with sidebar. Hero shows illustration. Navbar fully expanded.
* **Tablet (768px - 1023px):** Single-column feed. Sidebar moves below main content or becomes horizontal scroll. Hero stacks vertically.
* **Mobile (Below 768px):** Single-column everything. Hero illustration hidden. Navbar hamburger menu. Article reading view full-width with 20px padding. Floating bottom action bar (clap, respond, share).

---

## Final Design Summary

This social-media-app is not a standard SaaS dashboard; it is an **editorial publishing platform**. The design must instill calm, focus, and trust in the reader. By utilizing a warm off-white palette, authoritative serif typography, generous whitespace, and a signature yellow-green accent, the app empowers writers to publish confidently and readers to immerse deeply in stories.
