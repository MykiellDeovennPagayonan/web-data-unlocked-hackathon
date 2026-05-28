# Tunai DESIGN.md

## Overview
Tunai is an enterprise trust intelligence interface for platforms that need to evaluate identities, organizations, devices, IPs, and behavioral activity in real time. 

The aesthetic is designed to function as a high-stakes security operations center (SOC). It feels **secure, intelligent, precise, and calm under pressure**. The UI accommodates high information density—processing millions of `access_events` and `trust_signals`—without feeling cluttered or chaotic. The visual language favors sharp borders, dark/slate tones, highly legible typography, and strict semantic color coding to ensure security reviewers and platform admins can instantly identify and act on risk.

---

## Colors
The Tunai palette is engineered for a dark-mode-first security environment, reducing eye strain for reviewers working long shifts while ensuring critical alerts are unmissable.

**Core Brand & Surface**
* **Primary:** `#2563EB` (Royal Blue) — Primary actions, active tab states, focused inputs.
* **Primary Hover:** `#1D4ED8` (Deep Blue) — Interactive hover states for primary buttons.
* **Secondary:** `#334155` (Slate 700) — Secondary buttons, neutral actions.
* **Accent (AI/Intelligence):** `#8B5CF6` (Violet) — Indicates machine learning insights, such as `llm_summary` in background checks or predictive email fraud flags.
* **Background:** `#0F172A` (Slate 900) — Deep slate for the main application canvas.
* **Surface:** `#1E293B` (Slate 800) — Cards, panels, tables, and modal backgrounds.
* **Surface Muted:** `#0B1120` (Slate 950) — Sidebar background, nested data tables, JSON viewer backgrounds.

**Text & Borders**
* **Text Primary:** `#F8FAFC` (Slate 50) — Headings, primary data values, table rows.
* **Text Secondary:** `#94A3B8` (Slate 400) — Column headers, timestamps, helper text.
* **Text Muted:** `#64748B` (Slate 500) — Placeholder text, disabled states, empty state text.
* **Border:** `#334155` (Slate 700) — Card outlines, table row dividers, input borders.

**Semantic Risk Palette**
Used strictly for status indicators, badges, and trust scoring.
* **Allowed / Clean (Success):** `#10B981` (Emerald 500) — Clean background checks, allowed access events.
* **Verified / Trusted:** `#3B82F6` (Blue 500) — Entities holding valid `trust_certificates`.
* **Flagged / Warning:** `#F59E0B` (Amber 500) — Soft flags, limited sessions, throttled API calls, yellow severity `registry_entries`.
* **Blocked / Critical (Danger/Error):** `#EF4444` (Red 500) — Blocked logins, hard red `registry_entries`, failed webhook logs, revoked certificates.
* **Info:** `#0EA5E9` (Sky 500) — System updates, neutral audit log actions.
* **Unknown / Pending:** `#64748B` (Slate 500) — Ongoing verification requests, pending community reports.

---

## Typography
The typography system is engineered for technical clarity, dense data scanning, and enterprise-grade professionalism.

* **Display Font:** `Inter` — Used for page headers, metric card numbers, and modal titles. 
* **Body Font:** `Inter` — Used for all UI text, table rows, badges, and standard copy.
* **Code/Monospace Font:** `JetBrains Mono` — Used for IP addresses, `api_keys`, `session_token_hash`, JSON viewer blocks, and webhook payloads.

**Type Scale & Usage:**
* **H1 (Page Titles):** 24px, Semi-Bold, -0.02em letter spacing.
* **H2 (Section/Modal Titles):** 18px, Medium, -0.01em letter spacing.
* **H3 (Card Titles):** 14px, Medium, Default letter spacing.
* **Dashboard Metrics:** 32px, Semi-Bold, -0.02em letter spacing.
* **Body (Default):** 14px, Regular, Default letter spacing.
* **Table Text / UI Controls:** 13px, Regular, Default letter spacing.
* **Code / Badges / Timestamps:** 12px, `JetBrains Mono` (Code) or `Inter Medium` (Badges), +0.02em letter spacing for uppercase badges.

---

## Layout
The dashboard employs a rigid, grid-based layout that prioritizes content and evidence visibility. 

* **Sidebar:** Fixed left sidebar (260px). Persistent. Can be collapsed to icons (64px) for power users.
* **Top Bar:** Fixed height (64px). Houses global search (finds `identities`, `ip_records`, `organizations`), current Platform context switcher, and user profile/settings.
* **Main Content Area:** Fluid width, constrained to a max-width of 1600px for ultra-wide monitors. Uses a 12-column grid with a 24px gap.
* **Card Grid:** Metric cards typically span 3 columns (4 per row). Charts span 6 or 12 columns. Tables always span the full 12 columns.
* **Detail Pages:** Split layout. Left column (8 cols) for primary timelines and raw data (`behavioral_events`, `access_events`). Right column (4 cols) for sticky contextual summaries (current trust score, linked `entity_aliases`, action buttons).
* **Drawers:** Slide out from the right. Used for deep-dives into single rows without losing the context of the main list (e.g., clicking a specific `access_event` opens a drawer showing the `triggered_rules` and `ip_records` context).
* **Responsive Behavior:** Below 1024px, the sidebar collapses automatically. Detail page split-views stack vertically. 

---

## Elevation
Tunai relies on **borders and color contrast** rather than decorative shadows to separate z-index layers. This keeps the interface feeling flat, sharp, and technical.

* **Static Cards:** No shadow. 1px solid border (`#334155`). Background `#1E293B`.
* **Hover Cards (e.g., clickable list items):** 1px solid border (`#475569`), slight background lighten (`#334155`).
* **Dropdowns / Context Menus:** 1px solid border (`#475569`), soft drop shadow (0 10px 15px -3px rgba(0, 0, 0, 0.5)) to break it away from complex underlying data.
* **Modals & Drawers:** Full screen backdrop (`#000000` at 60% opacity). The modal itself has a 1px border and no shadow.
* **Focus States:** 2px solid ring of `#2563EB` with a 2px offset. Absolutely critical for keyboard navigation.
* **Critical Alert States:** Glow effect using `#EF4444` at 20% opacity for pulsing high-severity unreviewed `community_reports` or live breach alerts.

---

## Components

* **Buttons:** Flat, rectangular. Primary buttons have `#2563EB` background. Destructive buttons use `#EF4444`. Secondary buttons are transparent with a `#334155` border.
* **Cards:** Square corners (4px radius). Padded evenly (24px). Always possess a 1px border.
* **Metric Cards:** Display a label (e.g., "Blocked IPs"), a large value (e.g., "1,204"), and a sparkline or percentage change indicator.
* **Inputs & Selects:** 40px height. Background `#0F172A`, border `#334155`. Text is `#F8FAFC`.
* **Search Bars:** Prominent, often taking up 40% of the top bar. Includes a keyboard shortcut indicator (e.g., `Cmd + K`).
* **Filters:** Rendered as horizontal pill groups above tables. Include complex boolean filter builders for `access_events` (e.g., `Risk Score > 80 AND Event Type = API_Call`).
* **Tables:** Edge-to-edge within their container. Sticky headers. 40px row height for high density. Hover state highlights the entire row.
* **Tabs:** Underline style. Active tab has a 2px bottom border in Primary Blue; inactive tabs are Muted text.
* **Badges:** Small, 24px height, inline indicators. Used for entity types (e.g., [ORGANIZATION], [IDENTITY]).
* **Risk Badges / Status Chips:** Color-coded with a 10% opacity background of the semantic color, and 100% text color (e.g., `#EF4444` text on a dark red-tinted background for BLOCKED).
* **Trust Score Indicators:** A circular gauge or a bold numerical pill (0-100). 0-39 (Red), 40-69 (Amber), 70-89 (Blue), 90-100 (Green).
* **Verdict / Severity Badges:** Used to show `overall_verdict` from background checks. Uppercase, bold, dot indicator next to text (e.g., `🔴 HARD FLAG`).
* **Timelines:** Vertical line with nodes connecting `behavioral_events`, `access_events`, and `trust_score_snapshots` to tell the story of a session.
* **Activity Feeds:** Streaming lists of events. New events flash briefly with a muted surface color before settling into the list.
* **Detail Panels:** Side-by-side key-value pairs for metadata (e.g., `device_signals`).
* **JSON Viewers:** Used for `webhook_delivery_logs` and `background_check_results` (raw data). Darker background (`#0B1120`), syntax highlighting (Keys: Blue, Strings: Green, Numbers: Violet).
* **Code/API Key Blocks:** Monospace text, obscured by default (`••••••••`), with a click-to-copy icon.
* **Webhook Log Rows:** Expandable table rows. Clicking expands to show request payload, response status (color coded green/red), and response body.
* **Certificate Cards:** Visual representation of `trust_certificates` featuring a blockchain hash, valid date range, and a secure watermark icon.
* **Registry Target Lists:** Dense lists linking `registry_entries` to actual IPs, Emails, and Devices, utilizing aliases.
* **Empty States:** Center-aligned, muted text, subtle line-art icon (e.g., empty shield), and a clear secondary action button.
* **Loading Skeletons:** Pulsing `#1E293B` blocks that match the shape of the data that is loading.
* **Error Panels:** Red-bordered cards with a warning triangle icon, clear error text, and a "Retry" or "View Logs" button.
* **Confirmation Modals:** Required for destructive actions. Red primary button. Forces user to type "BLOCK" or "REVOKE" for high-impact decisions.

---

## Navigation
The sidebar is structured logically, moving from high-level monitoring down to granular configuration and compliance.

**Overview**
* **Platforms:** Manage platform instances, view aggregated strictness levels.
* **Live Access Events:** The streaming firehose of `access_events`. The SOC view.

**Intelligence & Entities**
* **Identities:** Global directory of individuals and their trust statuses.
* **Organizations:** Global directory of verified and unverified companies.
* **Devices & IPs:** Intelligence database of device fingerprints and IP risk profiles.
* **Sessions & Behavior:** Drill down into active sessions and `behavioral_events`.

**Trust Engine**
* **Background Checks:** Queue of pending/completed `background_checks` and LLM summaries.
* **Trust Engine:** View `trust_signals` weighting, score configurations, and snapshots.
* **Certificates:** Manage issued `trust_certificates` and monitor network-wide verifications.

**Network & Community**
* **Registry:** The core Blacklist/Whitelist of `registry_entries` and their targets.
* **Community Reports:** Review queue for bad actor reports submitted by platforms.

**Configuration & Logs**
* **Rules & Strictness:** Configure `platform_rules` (Low, Medium, High, Custom).
* **API Keys:** Issue and revoke platform authentication keys.
* **Webhooks:** Monitor `webhook_delivery_logs` and configure endpoints.
* **Compliance:** Manage `consent_records` and `verification_requests` workflows.
* **Audit Logs:** Immutable system action trail.
* **Settings:** Global user preferences and billing.

---

## Dashboard Sections (Homepage)
The main view operates as a Command Center for platform trust and security.

1. **Top Metric Cards:** - Active Sessions (Live)
   - Blocked Requests (Last 24h)
   - Average Trust Score 
   - Webhook Delivery Health (%)
2. **Live Access Event Feed (Left Column, 8 cols):** A real-time, auto-updating table of `access_events` showing Timestamp, Identity/IP, Triggered Rules, and Verdict.
3. **Risk & Trust Score Distribution (Right Column, 4 cols):** A stacked bar chart showing the breakdown of Clean vs. Flagged vs. Blocked entities currently interacting with the platform.
4. **IP/Device Intelligence Panel:** A geographic heat map or top-10 list of anomalous traffic origins (e.g., Datacenter/Tor traffic spikes).
5. **Pending Review Queue:** A prioritized list of entities requiring manual review (e.g., yellow severity `community_reports` or flagged `verification_requests`).
6. **Certificate & Registry Health:** A small monitoring block showing certificates expiring in 7 days and new additions to the global Blacklist.

---

## Screen Patterns

**List Screens**
* **Usage:** `identities`, `organizations`, `access_events`, `registry_entries`.
* **Pattern:** Top bar contains a powerful search input and "Add Filter" button. Below, a dense data table. Checkboxes on the left for bulk actions (e.g., Bulk Flag). Far right column holds an overflow menu (`...`) for row-specific actions. Status indicators are prominent in the second column.

**Detail Screens**
* **Usage:** Viewing a specific Identity, IP, or Certificate.
* **Pattern:** Header contains the entity name/hash, large Trust Status badge, and current Risk Score. Below the header, a 2-column layout. Left side: A chronological timeline of `behavioral_events` and `trust_score_snapshots`. Right side: Related records (`entity_aliases`, linked IPs), an Action Panel (Revoke, Block, Override), and a mini audit trail.

**Review Screens**
* **Usage:** Processing `community_reports`, `background_checks`, or manual flags.
* **Pattern:** "Evidence-First Layout." The left panel displays the raw data (LinkedIn mismatches, OFAC hits, LLM summary). The right panel is a fixed decision module requiring the reviewer to select a verdict (Accept/Reject/Flag), input human review notes, and click a confirmation button.

**Settings Screens**
* **Usage:** `platform_rules`, API Keys, Webhooks.
* **Pattern:** Standard vertical forms divided into logical sections by subtle borders. Destructive or high-impact settings (like dropping strictness to "Low") are accompanied by amber warning text. Includes "Preview before save" behavior for rule configurations.

---

## Spacing
Built on a strict 4px grid to ensure vertical and horizontal rhythm.

* **Base Unit:** 4px
* **Spacing Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
* **Page Padding:** 32px (Desktop), 16px (Mobile)
* **Card Padding:** 24px
* **Table Row Height:** 40px (High density), 48px (Standard density)
* **Sidebar Width:** 260px (Expanded), 64px (Collapsed)
* **Header Height:** 64px
* **Section Gaps:** 32px between discrete dashboard modules.
* **Modal Padding:** 24px internal padding.
* **Drawer Width:** 480px (Standard), 800px (Wide, for JSON/code review).

---

## Border Radius
Corners are kept tight to reinforce the technical, serious nature of the product.

* **Small Elements (Checkboxes, Tags, Badges):** 2px
* **Interactive Elements (Buttons, Inputs, Selects):** 4px
* **Structural Elements (Cards, Panels, Modals, Drawers):** 8px
* **Avatars / Status Dots:** 50% (Fully rounded)

---

## Iconography
Icons are strict, uniform, line-based, and non-decorative. Stroke width is 1.5px.

* **Shield / Check-Shield:** Security status, Verified status.
* **Fingerprint:** Device intelligence, Identity records.
* **Globe / Crosshairs:** IP intelligence, geographic origin.
* **Key:** API keys, authentication events.
* **Bell / Webhook:** Delivery logs, system alerts.
* **File Certificate:** `trust_certificates`, verification requests.
* **Warning Triangle:** High risk, flagged behavior, failed background checks.
* **Database / List:** Registry entries, raw logs.
* **Lock / Scale:** Compliance, consent records, audit trails.

---

## Motion & Interaction
Motion is fast, functional, and never decorative. Animations must not impede the speed of a security reviewer.

* **Hover Transitions:** 100ms ease-in-out (color fades on buttons/rows).
* **Focus States:** Instant (0ms) to ensure accessibility responsiveness.
* **Drawer Transitions:** 250ms cubic-bezier slide-in from the right.
* **Modal Transitions:** 150ms fade-in + slight scale up (98% to 100%).
* **Table Row Hover:** Instant background color change.
* **Loading States:** Shimmer effect on skeletons moving left-to-right at 1.5s intervals.
* **Risk Alert Behavior:** High-priority live alerts (`behavioral_events` triggers) slide in as toast notifications from the top right, staying on screen until manually dismissed.

---

## Data Visualization
Data visualization is used sparingly and only when it provides faster insights than a raw table.

* **Risk Distribution Charts:** Stacked horizontal bars showing the ratio of Clean / Flagged / Blocked traffic over a 24-hour period.
* **Trust Score Trends:** Line charts showing score drift over time. The AI insight color (`#8B5CF6`) is used to highlight anomalies or sudden score drops.
* **Access Event Volume:** Simple histograms (bar charts) above the live access feed to visualize traffic spikes.
* **IP Geography Map:** A dark, minimalist dot-map with glowing points for traffic sources. Red dots indicate blocked origins.
* **Tables vs. Charts:** If the user needs to *take action* on a specific entity, use a table. If the user needs to *understand a trend* to adjust a `platform_rule`, use a chart.

---

## Risk Status Language
Language must be highly consistent across the UI to avoid ambiguity during security incidents.

* **Clean:** Passed all checks; no flags.
* **Verified:** Passed KYC/Background check; holds a Trust Certificate.
* **Flagged:** Suspicious behavior or soft matches found; requires review or increased friction.
* **Limited:** Session permissions restricted due to behavioral triggers.
* **Throttled:** API or request rates artificially slowed due to suspicious IP patterns.
* **Blocked:** Hard denial of access based on Blacklist or high-risk rules.
* **Pending Review:** Awaiting human decision (e.g., community reports).
* **Revoked:** A previously valid certificate or API key that has been killed.
* **Expired:** Time-limited credential that has lapsed.

---

## Do's and Don'ts

* **Do** use risk colors (Red, Amber, Green) *only* for status and severity. Do not use them for primary buttons or general branding.
* **Do** keep dangerous actions (Block, Revoke, Delete) visually distinct, usually requiring secondary confirmation.
* **Do** show raw evidence (e.g., LinkedIn API response, OFAC match data) side-by-side with the decision buttons in review screens.
* **Do** use dense, paginated tables for high-volume logs like `access_events`.
* **Do** require typed confirmation ("REVOKE") for high-impact destructive actions.
* **Don't** use playful illustrations, heavily rounded corners, or emojis.
* **Don't** use decorative gradients; flat colors and subtle borders denote hierarchy.
* **Don't** hide raw evidence behind excessive clicks or tooltips. Security reviewers need the data visible immediately.
* **Don't** display raw `api_keys` after creation; always obscure them.
* **Don't** make AI-driven insights look like absolute certainties. Label them clearly (e.g., "LLM Summary - 85% Confidence").
* **Don't** allow any manual status override without an accompanying text note that writes to the `audit_logs`.

---

## Accessibility
Tunai must be usable by all technical staff, adhering to strict WCAG 2.1 AA standards.

* **Contrast:** All text, especially in Dark Mode, must meet a 4.5:1 contrast ratio against its background.
* **Color Independence:** Color is never the *only* risk indicator. Statuses must always include an icon or explicit text label (e.g., a red background must be accompanied by the text "BLOCKED" and a warning icon).
* **Keyboard Navigation:** Every actionable element (links, buttons, table rows, tab headers) must be reachable via `Tab` and actionable via `Enter`/`Space`.
* **Focus Rings:** Visible, high-contrast `#2563EB` focus rings are mandatory. Do not disable `outline: none` without providing a robust custom focus state.
* **Screen Reader Labels:** All icon-only buttons (like "Copy API Key") must have descriptive `aria-labels`.

---

## Responsive Design
While Tunai is an enterprise tool primarily used on desktop, urgent security actions often happen on the go.

* **Desktop (1024px+):** Full expanded sidebar, multi-column layouts, deep data tables showing 8+ columns.
* **Tablet (768px - 1023px):** Sidebar collapses to icons. Detail split-screens (8-col/4-col) collapse into a single stacked column.
* **Mobile (Below 768px):** The dashboard shifts from an "analysis" tool to an "alert and triage" tool. Tables strip down to 3 essential columns (Entity, Status, Action). Complex chart views are hidden in favor of top-level metric summaries. Modals take up 100% of the screen width.

---

## Final Design Summary
Tunai is not a standard SaaS application; it is a **trust intelligence command center**. The design must instill absolute confidence in the user. By utilizing a dark, high-contrast, data-dense UI with rigid spacing, unambiguous risk language, and strict semantic coloring, Tunai empowers security operations teams and platform administrators to make high-stakes, compliance-aware identity risk decisions rapidly and accurately.