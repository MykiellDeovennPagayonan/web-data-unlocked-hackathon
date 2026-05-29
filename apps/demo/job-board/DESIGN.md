# Job Board — Glassdoor.com Design System

## Overview
The Job Board is a career discovery and job-search platform designed to feel **trustworthy, empowering, transparent, and community-driven**. The aesthetic mirrors Glassdoor — a site where job seekers find listings, read company reviews, compare salaries, and make informed career decisions. The UI prioritizes search discoverability, rich company information cards, salary transparency, and social proof through reviews and ratings.

The visual language favors a signature green accent for trust and success, clean sans-serif typography, card-heavy layouts for browsing, and a light spacious canvas that keeps dense job data readable and approachable.

---

## Colors

**Core Brand & Surface**
* **Primary / Accent:** `#0CAA41` (Glassdoor Green) — Logo, primary buttons, active nav indicators, links on hover, star ratings, success states.
* **Primary Hover:** `#0A8C36` (Deeper Green) — Interactive hover states for primary buttons and links.
* **Background:** `#FFFFFF` (Pure White) — Main application canvas, page backgrounds.
* **Surface:** `#F5F6F7` (Light Gray) — Cards, panels, table headers, sidebar backgrounds, alternating row fills.
* **Surface Muted:** `#EAECEE` (Medium Light Gray) — Code blocks, section separators, empty state fills.
* **Surface Elevated:** `#FFFFFF` (White) — Dropdowns, modals, floating menus with soft shadow.

**Text & Borders**
* **Text Primary:** `#222222` (Near Black) — Headings, body copy, card titles, job titles, company names.
* **Text Secondary:** `#595959` (Medium Gray) — Captions, timestamps, helper text, metadata labels, location text.
* **Text Muted:** `#8F8F8F` (Gray) — Placeholder text, disabled states, footer links, empty state hints.
* **Text Link:** `#0CAA41` (Accent Green) — Inline links, navigation, company names, apply buttons.
* **Border:** `#D1D1D1` (Light Border) — Card outlines, table dividers, input borders, section separators.
* **Border Subtle:** `#EAECEE` (Very Light Gray) — Inner dividers, subtle rule lines.

**Semantic Palette**
Used strictly for status indicators, ratings, and actions.
* **Success / Easy Apply:** `#0CAA41` (Green) — Applied status, easy-apply badges, high ratings.
* **Warning / Hot:** `#FF9900` (Orange) — Urgency tags, hot job listings, limited openings.
* **Error / Closed:** `#CC0000` (Red) — Expired listings, rejected applications, low ratings.
* **Info:** `#1861BF` (Blue) — Company-verified badges, tips, help links.
* **Rating / Stars:** `#0CAA41` (Green) — Filled stars for company ratings. Empty stars: `#D1D1D1`.
* **Salary Highlight:** `#1861BF` (Blue) — Salary range pills, compensation highlights.

---

## Typography

The typography system is engineered for clarity, scannability, and professional trust.

* **Display / Headings:** `Lato` or `Helvetica Neue`, `Arial`, sans-serif — Clean, humanist sans-serif used for page titles, hero headlines, card titles, and section headers. Friendly but authoritative.
* **Body / UI:** `Lato` or `Segoe UI`, `-apple-system`, `Arial` fallback — Highly legible sans-serif used for all UI text, body copy, tables, badges, and metadata.
* **Monospace:** `Consolas`, `Courier New`, `monospace` — Used for salary numbers, dates, and technical metadata.

**Type Scale & Usage:**
* **H1 (Page / Hero Titles):** 40px, Bold, -0.02em letter spacing.
* **H2 (Section / Card Titles):** 24px, Bold, -0.01em letter spacing.
* **H3 (Subsection / List Headers):** 20px, Semi-Bold, Default letter spacing.
* **H4 (Labels / Small Headers):** 16px, Semi-Bold, Default letter spacing.
* **Body (Default):** 15px, Regular, 1.5 line-height.
* **UI Text / Metadata:** 13px, Regular, 1.4 line-height.
* **Captions / Timestamps:** 12px, Regular.
* **Badges / Tags:** 12px, Medium, +0.02em letter spacing for uppercase badges.
* **Stats / Numbers:** 28px, Bold, -0.02em letter spacing. Used for large metric values (e.g., "4.2 ★", "$120K").

---

## Layout

The layout prioritizes search, discoverability, and rich information density without feeling overwhelming.

* **Top Navbar:** Fixed top, 64px height. Background `#FFFFFF` with 1px bottom border `#EAECEE`. Left: Glassdoor-style logo. Center: navigation links (Jobs, Companies, Salaries, Reviews, Interviews). Right: "Write a Review" link, "Sign In" button.
* **Search Hero:** Full-width, light gradient or white background. Large bold headline centered. Below: prominent search bar with two inputs (What job, Where location) and a green "Find Jobs" button.
* **Main Content Area:** Centered, max-width 1280px. Uses a flexible grid with 16px–24px gaps.
* **Card Grid:** Job / company cards typically span 1 column (full-width list) or 3 columns (grid view on large screens).
* **Job Search Results (Split-Pane):** Desktop uses a fixed split-pane layout — left pane (~35%) with a scrollable job cards list, right pane (~65%) with the full job details of the selected card. Both panes scroll independently.
* **Job Detail Pages:** Two-column split. Left column (~66%) for job description, company info, reviews. Right column (~33%) for sticky apply panel (Apply button, company stats, salary estimate, similar jobs).
* **Company Pages:** Header with logo, name, rating, review count, tabs for Overview, Reviews, Jobs, Salaries, Interviews, Photos.
* **Tables:** Used for salary comparisons, application tracking. Edge-to-edge within container. Sticky headers. 48px row height. Hover highlight.
* **Responsive Behavior:**
  - **Desktop (1024px+):** Full navigation, multi-column layouts, split-pane job search, split detail pages.
  - **Tablet (768px - 1023px):** Navigation collapses to hamburger or dropdown. Split-pane job search maintained but left pane narrows. Detail pages stack.
  - **Mobile (Below 768px):** Single-column everything. Search hero stacks. Job search becomes a card list; tapping a card navigates to a full-page job detail. Bottom sticky apply bar on job details.

---

## Elevation

Glassdoor relies on **subtle borders, light backgrounds, and minimal shadows** to separate layers. The interface feels flat, clean, and trustworthy.

* **Static Cards:** No shadow. 1px solid border (`#D1D1D1`) or bottom border only. Background `#FFFFFF` or `#F5F6F7`.
* **Hover Cards:** Subtle border darkening to `#BDBDBD`, background shift to `#F5F6F7`.
* **Dropdowns / Menus:** Soft drop shadow (`0 4px 12px rgba(0, 0, 0, 0.08)`), no border, background `#FFFFFF`, border-radius 4px.
* **Modals & Drawers:** Full-screen backdrop (`#000000` at 40% opacity). The modal itself has no shadow, 1px border `#D1D1D1`, background `#FFFFFF`, border-radius 8px.
* **Focus States:** 2px solid ring of `#0CAA41` with a 2px offset. Mandatory for keyboard navigation.
* **Sticky Panels / Bars:** Bottom-fixed apply bar on mobile, white background, top border `#EAECEE`, shadow `0 -2px 8px rgba(0,0,0,0.05)`.

---

## Components

* **Buttons:**
  - *Primary:* Solid `#0CAA41` background, `#FFFFFF` text, rounded (4px radius), 44px height, bold text. Hover: `#0A8C36`.
  - *Secondary / Ghost:* Transparent background, `#0CAA41` text, 1px `#0CAA41` border. Hover: light green tint background.
  - *Text Link:* No background, `#0CAA41` text, underline on hover.
  - *Easy Apply:* Green button with lightning bolt or check icon. Indicates one-click apply.
* **Job Cards:**
  - Horizontal layout: Company logo (48px, square, 4px radius) on left. Title, company name (green link), location, salary estimate, tags, time posted.
  - Or vertical layout for grid: Logo top, title, company, rating stars, location, salary.
  - Bottom border separator `#EAECEE`. Hover: light gray background.
  - Actions: Save (bookmark icon), Hide (X icon).
* **Company Cards:**
  - Larger format: Company logo, name, star rating (green), review count, "Follow" button, sample review text, job count.
* **Rating Stars:**
  - 5-star scale. Filled stars: `#0CAA41`. Empty stars: `#D1D1D1`.
  - Display as ★★★★☆ with numeric (4.2) beside it.
* **Salary Estimate Pills:**
  - Blue (`#1861BF`) background, white text, 4px radius. Format: "$95K - $120K".
* **Review Cards:**
  - Header: Job title, employment status (Current/Former), date.
  - Star rating row.
  - Pros / Cons split layout with green/red left borders.
  - Helpful button (thumbs up + count).
* **Inputs & Search:**
  - 48px height. `#FFFFFF` background, 1px `#D1D1D1` border. Text `#222222`.
  - Search hero: Two side-by-side inputs + green search button.
  - Focus: `#0CAA41` border.
* **Tags / Badges:**
  - *Easy Apply:* Green pill with icon.
  - *Hot:* Orange pill.
  - *Remote:* Blue pill.
  - *Verified:* Blue checkmark badge.
  - Small pills, 12px font, 4px radius.
* **Avatar / Logo:** Square with 4px radius for company logos. Circular for user avatars.
* **Tabs:** Underline style. Active tab has a 2px bottom border in `#0CAA41`; inactive tabs are muted gray.
* **Tables:**
  - Edge-to-edge within container. Sticky headers with `#F5F6F7` background.
  - 48px row height. Hover highlights entire row with `#F5F6F7`.
  - Sortable columns indicated by arrow icons.
* **Progress / Application Tracker:**
  - Horizontal step indicator: Applied → Reviewed → Interview → Offer.
  - Completed steps: green circle. Current step: green circle with pulse. Future: gray circle.
* **Empty States:** Centered, muted gray text, subtle illustration or icon, and a clear primary action button.
* **Loading Skeletons:** Pulsing `#F5F6F7` blocks matching card shapes.
* **Confirmation Modals:** Centered, white background. Primary button for confirm, secondary for cancel.
* **Tooltip / Popover:** Small white card with arrow, used for salary breakdowns or company info previews.

---

## Navigation

**Top Navbar (Always Present)**
* **Left:** Logo (wordmark in green/black).
* **Center:** Primary nav links — Jobs, Companies, Salaries, Reviews, Interviews. Dropdowns on hover for subcategories.
* **Right:** "Write a Review" text link, "Sign In" / "Join" button.

**User Dropdown (Logged In)**
* Profile, Applications, Saved Jobs, Job Alerts, Settings, Sign Out.

**Footer (Landing & App Pages)**
* Extensive multi-column footer.
* Columns: Browse Jobs, Salaries, Companies, Reviews, Countries, Site Map.
* Bottom row: Copyright, Privacy, Terms, Cookies.

---

## Page Patterns

**Landing Page**
1. **Hero:** Full-width white or very light gradient. Large bold headline: "You deserve a job that loves you back." Below: dual search bar (Job title / Keywords + Location) with green "Find Jobs" button.
2. **Popular Searches:** Horizontal row of text links: "Remote jobs", "Engineering jobs", "Marketing jobs", etc.
3. **Feature Cards Section:** 3-column grid of value props:
   - "Search & Apply" — Browse millions of jobs.
   - "Company Reviews" — Read what employees say.
   - "Salaries" — Know your worth.
4. **Trending Companies:** Horizontal scroll or grid of company cards with ratings.
5. **Testimonial / Social Proof:** Quote from a user about how the platform helped their career.
6. **Footer:** Extensive link columns.

**Job Search Results (Split-Pane Layout)**
1. **Filter Bar (Top):** Horizontal pills above the split pane — Easy Apply only, Remote only, Date Posted, Salary Range, Job Type, Company Rating. Filter button opens a modal/drawer on mobile.
2. **Results Header:** "[X] jobs found" + sort dropdown (Relevance, Date, Salary) + "Create job alert" button.
3. **Split-Pane Layout (Desktop & Tablet):**
   - *Left Pane (~35%, scrollable):* Job cards list. Each card: company logo (48px square), title, company name (green link), location, salary estimate, tags (Easy Apply, Remote), time posted. Active card has a left green border indicator.
   - *Right Pane (~65%, scrollable):* Full job details for the selected card. Loads inline without page navigation.
4. **Job Cards List:** Compact horizontal cards with 1px bottom border `#EAECEE`. Hover: light gray background `#F5F6F7`. Selected state: left 4px green border `#0CAA41`, subtle background tint.
5. **Pagination:** "Show more jobs" button at bottom of left pane, or infinite scroll.

**Job Detail Panel (Right Pane)**
1. **Header:** Company logo + name (green link), job title (H2), location, posted date.
2. **Apply Bar:** Prominent green "Apply" button (full width on mobile). Secondary actions: Save, Share.
3. **Meta Section:** Salary estimate (blue pill), job type, company size, rating stars.
4. **Job Description:** Rich text: responsibilities, requirements, qualifications, benefits.
5. **Company Overview:** Brief description with "See all [company] reviews" link.
6. **Reviews Teaser:** 1-2 featured employee reviews with Pros/Cons, star rating.
7. **Similar Jobs:** 3-5 related job cards at bottom of panel.

**Company Page**
1. **Header:** Company logo, name, overall rating (large stars + number), review count, "Follow" button, "Add a Review" button.
2. **Tabs:** Overview, Reviews, Jobs, Salaries, Interviews, Photos, Benefits.
3. **Overview Tab:** Description, basic info (size, type, founded, industry), mission, competitors.
4. **Reviews Tab:** Rating distribution bar chart (5-star to 1-star), sort/filter reviews, review cards list.
5. **Jobs Tab:** Open positions at this company, filtered list.
6. **Salaries Tab:** Salary ranges by job title, table with low/median/high.

**Dashboard (Job Seeker)**
1. **Metric Cards:** Applications Submitted, Saved Jobs, Interview Requests, Profile Views.
2. **Application Tracker:** List of applications with status (Applied, In Review, Interview, Offer, Rejected). Color-coded status badges.
3. **Recommended Jobs:** Based on profile, a short list of job cards.
4. **Job Alerts:** Saved search alerts with edit/manage actions.

**Profile / Resume**
1. **Header:** Name, headline, location, open to work toggle.
2. **Tabs:** About, Experience, Education, Skills, Applications.
3. **Content:** Resume-style layout. Edit buttons on each section.
4. **Privacy Settings:** Anonymous review toggle, profile visibility.

---

## Spacing

Built on a 4px grid.

* **Base Unit:** 4px
* **Spacing Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
* **Page Padding:** 24px (Desktop), 16px (Mobile)
* **Card Padding:** 16px–20px
* **Card Gap:** 16px
* **Section Gaps:** 48px between major sections.
* **Navbar Height:** 64px
* **Max Content Width:** 1280px
* **Modal Padding:** 24px internal padding.
* **Drawer Width:** 360px (standard filters), 480px (wide for application flow).

---

## Border Radius

* **Small Elements (Tags, Badges, Pills):** 4px
* **Interactive Elements (Buttons, Inputs, Selects):** 4px
* **Structural Elements (Cards, Modals, Drawers):** 8px
* **Avatars (User):** 50% (Fully rounded)
* **Company Logos:** 4px (Square)

---

## Iconography

Icons are clean, minimal, and functional. Stroke width 1.5px. Material-style or Font Awesome set.

* **Search:** Magnifying glass
* **Bookmark / Save:** Bookmark outline / filled
* **Hide / Dismiss:** X circle
* **Share:** Share arrow
* **Location:** Map pin
* **Money / Salary:** Dollar sign
* **Star:** Star (filled/empty) for ratings
* **Check:** Checkmark for Easy Apply, verified
* **Lightning Bolt:** Easy Apply instant apply
* **Thumbs Up / Down:** Helpful / Not helpful on reviews
* **Bell:** Job alerts, notifications
* **User / Avatar:** Person outline or uploaded image
* **Building:** Company / organization
* **Calendar:** Date posted, interview scheduling
* **More / Overflow:** Three vertical dots
* **Close:** X
* **Filter:** Funnel icon

---

## Motion & Interaction

Motion is subtle, purposeful, and never decorative.

* **Hover Transitions:** 150ms ease-in-out (color, background, border).
* **Focus States:** Instant (0ms) for accessibility.
* **Card Hover:** Background shifts to `#F5F6F7`, border darkens. Title may underline.
* **Drawer Transitions:** 250ms ease slide-in from right (filters, apply flow).
* **Modal Transitions:** 150ms fade-in + slight scale (0.98 → 1).
* **Button Press:** Scale to 0.98 on active click.
* **Save Animation:** Bookmark icon fills with `#0CAA41` and bounces slightly.
* **Skeleton Shimmer:** Subtle left-to-right gradient sweep on loading blocks, 1.5s interval.
* **Table Row Hover:** Instant background color change to `#F5F6F7`.
* **Dropdown Open:** 100ms fade + slight translate-y (-4px → 0).
* **Rating Hover:** Stars fill sequentially on hover, reset on leave.

---

## Data Visualization

Data visualization is used for ratings, salary insights, and application tracking.

* **Star Ratings:** 5-star display, green filled, gray empty. Numeric score (e.g., 4.2) beside stars.
* **Rating Distribution Bars:** Horizontal bar chart showing % of 5-star, 4-star, 3-star, 2-star, 1-star reviews. Green fill on bars.
* **Salary Range Bars:** Horizontal bar with low/median/high markers. Blue/cyan accent for range.
* **Application Funnel / Tracker:** Horizontal step dots connected by line. Green for completed, gray for pending.
* **Tables vs. Charts:** If the user needs to *compare* specific salaries or ratings, use a table. If the user needs to *understand distribution*, use a bar chart.

---

## Do's and Don'ts

* **Do** use the green accent (`#0CAA41`) for primary actions, active nav, star ratings, and apply buttons.
* **Do** keep job cards flat with subtle borders — no heavy shadows.
* **Do** prominently display company ratings and review counts on every job card.
* **Do** show salary estimates as blue pills wherever available.
* **Do** use the dual-search pattern (What / Where) as the primary discovery mechanism.
* **Do** allow users to save, hide, and report jobs from the card level.
* **Don't** use more than one accent color in a view — green is the hero.
* **Don't** hide the apply button; it must be prominent and always accessible (sticky on mobile).
* **Don't** use rounded corners larger than 8px — keep it sharp and professional.
* **Don't** show unverified salary data without a "Estimated" or "Glassdoor Estimate" label.
* **Don't** use playful illustrations or emojis — the tone is professional and career-focused.
* **Don't** allow application submission without a confirmation step.

---

## Accessibility

The platform must be usable by all job seekers, adhering to WCAG 2.1 AA standards.

* **Contrast:** Body text `#222222` on `#FFFFFF` exceeds 4.5:1. Green `#0CAA41` on white text passes for large text/buttons.
* **Focus Rings:** Visible, 2px solid `#0CAA41` with 2px offset.
* **Keyboard Navigation:** All interactive elements reachable via Tab. Job cards are focusable as a unit (Enter to navigate to detail).
* **Screen Readers:** Job cards announced as "Job: [Title] at [Company], [Location], [Salary], [Rating] stars". Icons have aria-labels.
* **Motion:** Respect `prefers-reduced-motion` — disable save animations and page transitions.
* **Form Labels:** All search inputs and filters have visible, associated labels.

---

## Responsive Design

* **Desktop (1024px+):** Full navigation, filter sidebar on search results, split detail pages, multi-column feature grids.
* **Tablet (768px - 1023px):** Filter sidebar becomes collapsible drawer. Card grids become 2 columns. Detail pages stack.
* **Mobile (Below 768px):** Single-column everything. Search hero stacks (What on top, Where below). Hamburger navigation. Bottom sticky apply bar on job details. Filters as bottom sheet.

---

## Final Design Summary

The Job Board is not a simple listing site; it is a **career transparency and discovery platform**. The design must instill trust, empowerment, and clarity in the job seeker. By utilizing a signature green palette, friendly sans-serif typography, rating-driven cards, salary transparency, and community review integration, the Job Board empowers candidates to make informed career decisions with confidence.
