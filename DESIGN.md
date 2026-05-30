# Tunai DESIGN.md

## 1. Design Overview

Tunai is an AI-native identity trust and access-security platform. It helps client platforms evaluate identities, organizations, devices, IP addresses, certificates, and behavioral activity in real time.

The interface should feel like a **modern enterprise trust-intelligence dashboard**: secure, precise, data-rich, and approachable. It must communicate operational seriousness without looking intimidating, overly technical, or cyberpunk-inspired.

The visual reference establishes a calm and professional control-center experience:

- Light-mode-first interface
- White cards on a soft blue-gray canvas
- Thin borders and subtle elevation
- Compact but readable information density
- Clear blue primary accent
- Restrained use of red, amber, and green for security meaning
- Minimal decorative styling
- Frequent use of small status indicators, badges, icons, and concise labels
- Dashboard modules arranged in a structured grid
- Fast scanning for security reviewers and platform administrators

The application should resemble a polished modern B2B SaaS product used by operations and security teams throughout the day.

---

## 2. Visual Source of Truth

The provided Tunai Command Center dashboard image is the primary visual source of truth.

When implementing or extending the application:

1. Match the reference image's layout proportions, spacing rhythm, density, borders, and component treatment.
2. Preserve the clean and calm visual character.
3. Prefer white surfaces, pale blue-gray backgrounds, and restrained accents.
4. Avoid introducing visual ideas that conflict with the reference, such as dark-mode-first layouts, cyberpunk effects, neon colors, heavy gradients, excessive shadows, or highly decorative cards.
5. Keep new screens consistent with the reference even when the exact screen is not shown.

The interface should feel cohesive across dashboards, lists, detail views, reviews, settings pages, drawers, and modals.

---

## 3. Core Design Principles

### 3.1 Calm Security Interface

Tunai deals with high-risk events, but the entire interface should not look alarming. Most surfaces should remain neutral. Risk colors are reserved for the specific items that require attention.

### 3.2 High Information Density Without Visual Clutter

The dashboard contains metrics, live tables, review queues, maps, health panels, and AI-generated insights. Information must be arranged in clear modules with predictable spacing and hierarchy.

### 3.3 Evidence-First Presentation

Risk decisions should be supported by visible evidence. The UI should expose event details, trust scores, locations, devices, linked identities, triggered rules, and recent activity without forcing excessive navigation.

### 3.4 Clear Operational Hierarchy

The user should immediately understand:

- What is happening now
- What changed recently
- Which events are risky
- Which items require human review
- Whether system health is stable
- Where to investigate further

### 3.5 Restrained Branding

Tunai should feel distinctive through consistency rather than decoration. Use the Tunai blue accent, shield iconography, careful typography, and a structured dashboard shell.

---

## 4. Color System

Tunai uses a light-mode-first color system. The application should feel bright, clean, and professional while retaining enough contrast for data-heavy workflows.

### 4.1 Core Brand Colors

| Token | Approximate Value | Usage |
|---|---:|---|
| `brand-primary` | `#176BFF` | Main links, active icons, primary actions, selected states |
| `brand-primary-hover` | `#0D5BE8` | Hover state for primary buttons and links |
| `brand-primary-soft` | `#EAF3FF` | Active sidebar item background, pale icon containers, selected filters |
| `brand-primary-muted` | `#CFE2FF` | Soft blue borders and secondary highlights |
| `brand-deep` | `#09265E` | Logo text, dark headings, important values |

### 4.2 Application Surfaces

| Token | Approximate Value | Usage |
|---|---:|---|
| `app-background` | `#F5F8FC` | Main application canvas |
| `sidebar-background` | `#FFFFFF` | Left navigation |
| `header-background` | `#F9FBFE` | Top command bar |
| `card-background` | `#FFFFFF` | Dashboard cards, tables, panels |
| `surface-subtle` | `#F8FBFF` | Secondary panel areas, footer strip |
| `surface-muted` | `#F1F6FC` | Map area, empty states, hover rows |
| `surface-selected` | `#EAF3FF` | Active navigation items, selected tabs |
| `overlay-background` | `rgba(9, 38, 94, 0.24)` | Modal backdrop |

### 4.3 Text Colors

| Token | Approximate Value | Usage |
|---|---:|---|
| `text-primary` | `#071C4A` | Headings, key values, table content |
| `text-secondary` | `#4E6798` | Supporting text, descriptions, secondary values |
| `text-muted` | `#7C90B6` | Timestamps, placeholders, helper text |
| `text-subtle` | `#A6B4CC` | Disabled states, low-priority metadata |
| `text-link` | `#0A61F5` | Clickable identities, IP addresses, actions |

### 4.4 Borders and Dividers

| Token | Approximate Value | Usage |
|---|---:|---|
| `border-default` | `#DCE5F1` | Cards, input fields, panel boundaries |
| `border-subtle` | `#E9EFF7` | Table dividers, nested row separators |
| `border-focus` | `#176BFF` | Focus rings and active inputs |
| `border-hover` | `#C4D5EA` | Hovered interactive cards and inputs |

### 4.5 Semantic Security Colors

Semantic colors should be used only when they communicate risk, health, or state.

| Meaning | Color | Soft Background | Typical Usage |
|---|---:|---:|---|
| Success / Low Risk / Healthy | `#00B67A` | `#E9FBF4` | Low-risk badge, operational system status, success trends |
| Warning / Medium Risk | `#FF9F1A` | `#FFF7E8` | Medium-risk events, caution icons, items requiring attention |
| Critical / Blocked / Failure | `#FF4355` | `#FFF0F2` | Critical badge, blocked activity, failed delivery |
| Informational / Trusted | `#176BFF` | `#EAF3FF` | Links, verified states, certificates, neutral insights |
| Unknown / Pending | `#7C90B6` | `#F1F4F8` | Pending checks, unknown values, unavailable data |

### 4.6 Color Usage Rules

- Use blue as the primary product accent.
- Use red only for critical risk, failures, blocking, and destructive actions.
- Use amber only for warnings, medium-risk states, or items needing attention.
- Use green only for positive health, allowed activity, low-risk states, or successful changes.
- Do not use purple as the default AI color. AI insights should use the same blue visual system as the rest of Tunai.
- Do not fill entire large cards with risk colors.
- Prefer pastel semantic backgrounds with saturated text and icons.
- Never rely on color alone. Always include a label, icon, or explicit status text.

---

## 5. Typography

Tunai uses a compact, legible typography system optimized for dashboards and technical scanning.

### 5.1 Font Families

| Purpose | Font |
|---|---|
| Primary interface font | `Inter`, `Arial`, sans-serif |
| Monospace values | `JetBrains Mono`, `SFMono-Regular`, monospace |

Use the primary interface font for almost all visible text. Use monospace selectively for IP addresses, hashes, IDs, coordinates, certificate fingerprints, API keys, and raw payloads.

### 5.2 Type Scale

| Style | Size | Weight | Usage |
|---|---:|---:|---|
| Page title | `22px` | `600` | Major screen heading |
| Large metric value | `28px–32px` | `650–700` | Dashboard KPI values |
| Section title | `14px–16px` | `600–700` | Card and panel titles |
| Navigation item | `14px` | `500` | Sidebar links |
| Table cell | `12px–13px` | `400–600` | Event rows and metadata |
| Table header | `10px–11px` | `600` | Uppercase column headings |
| Card label | `11px–12px` | `600–700` | Uppercase metric labels |
| Helper text | `11px–12px` | `400–500` | Timestamps, subtitles |
| Badge text | `10px–11px` | `600–700` | Uppercase risk labels |
| Status strip text | `11px–12px` | `400–600` | Footer health information |

### 5.3 Typography Rules

- Use dark navy rather than pure black.
- Use uppercase labels sparingly for metrics, table headings, and grouped navigation headings.
- Keep line heights compact but readable.
- Use bold type to highlight values, not entire paragraphs.
- Avoid oversized marketing-style text inside the application shell.
- Truncate long content only when the full value is available through hover, expansion, or a detail view.

---

## 6. Application Shell

The application shell is persistent and should remain consistent across all authenticated Tunai screens.

### 6.1 Desktop Layout

The reference layout uses:

- Fixed left sidebar
- Fixed top command bar
- Fluid main content area
- Optional fixed bottom system-status strip
- Compact page padding
- Responsive grid modules

Recommended dimensions:

| Element | Recommended Size |
|---|---:|
| Expanded sidebar width | `288px` |
| Collapsed sidebar width | `64px` |
| Top command bar height | `72px` |
| Bottom system-status strip | `34px–36px` |
| Main page horizontal padding | `24px` |
| Main page vertical padding | `16px` |
| Standard dashboard gap | `16px` |
| Compact internal gap | `8px–12px` |

### 6.2 Sidebar

The sidebar uses a white background with a thin right border.

#### Header Area

Display:

- Tunai shield logo inside a pale blue rounded container
- `TUNAI` wordmark in dark navy
- Generous spacing around the logo
- Optional collapse control near the bottom

#### Navigation Grouping

Use uppercase section labels with subdued blue-gray text.

**Command Center**
- Command Center

**Intelligence**
- Identities
- Organizations
- Devices
- IP Records
- Certificates
- Aliases

**Operations**
- Access Events
- Behavioral Events
- Trust Signals
- Webhook Logs
- Pending Reviews

**Risk & Analysis**
- Risk Explorer
- Threat Intelligence
- Attack Surface

Additional configuration pages may appear below these sections when needed.

#### Active Navigation Item

The active item should use:

- Pale blue background
- Blue icon
- Blue text
- Rounded rectangle container
- No heavy shadow
- No strong border unless required for accessibility

#### Sidebar Icons

Use small line icons with consistent stroke weight. Icons should be visually simple and aligned to a fixed width.

#### Scroll Behavior

The sidebar may scroll independently when navigation content exceeds the viewport. Keep the logo area stable when possible.

---

## 7. Top Command Bar

The top command bar is a compact utility area spanning the content width.

### 7.1 Global Search

The left side contains a prominent search input.

Example placeholder:

`Search identities, IPs, orgs, certificates...`

Include:

- Search icon
- Placeholder text
- Keyboard shortcut indicator such as `Ctrl` + `K`
- Soft white background
- Thin border
- Rounded corners
- Optional focused blue outline

The search bar should be wide enough to feel global, usually around `45%–55%` of the available header width.

### 7.2 Platform Selector

The right side contains a platform-context switcher.

Example:

- Label: `Platform`
- Value: `Acme Corp`
- Key or platform icon
- Chevron indicator

This control should look like a bordered select card rather than a plain dropdown.

### 7.3 Utility Actions

Include:

- Notification icon with small numeric badge
- Help icon
- User avatar
- User name
- User role
- Dropdown chevron

Keep utility icons compact and aligned horizontally.

---

## 8. Dashboard Grid Structure

The Command Center dashboard is a structured overview screen designed for rapid scanning.

Use a responsive 12-column grid with `16px` gaps.

### 8.1 Desktop Grid

The reference composition contains:

1. A full-width KPI row
2. A large live-event table on the left
3. A review queue on the right
4. Geographic risk activity panel below
5. Ranked risk lists
6. AI-generated insight card
7. Health and distribution cards
8. Bottom system-health strip

### 8.2 Recommended Column Distribution

| Module | Suggested Width |
|---|---:|
| Live Access Events | `8 / 12` columns |
| Pending Reviews | `4 / 12` columns |
| Geographic Risk Activity | `4 / 12` columns |
| Top Risky IPs | `2 / 12` columns |
| Top Risky ASNs | `2 / 12` columns |
| AI Insights | `4 / 12` columns |
| Risk Distribution | `2 / 12` or `4 / 12` columns |
| Certificate Health | `2 / 12` or `4 / 12` columns |
| Webhook Delivery Health | `4 / 12` columns |

The exact dimensions may adapt to available content, but the dashboard should preserve the balanced left-heavy monitoring area and right-side triage panels.

---

## 9. Dashboard KPI Cards

The top row contains five compact KPI cards.

### 9.1 Required Cards

1. **Access Events**
   - Example value: `1.24M`
   - Trend indicator: `↑ 12.5% vs 24h ago`
   - Activity waveform icon

2. **Identities**
   - Example value: `18,392`
   - Trend indicator
   - Identity icon

3. **Risky Events**
   - Example value: `2,847`
   - Red increase indicator
   - Shield-alert icon

4. **Blocked Events**
   - Example value: `732`
   - Red increase indicator
   - Lock icon

5. **Trust Score (Avg)**
   - Example value: `78`
   - Trend indicator: `↑ 5 pts vs 24h ago`
   - Circular progress gauge

### 9.2 Metric Card Structure

Each metric card includes:

- Uppercase label
- Large numeric value
- Small trend text
- Small icon in a pale semantic container
- Optional chart or gauge
- Thin border
- White background
- Rounded corners

### 9.3 Metric Card Styling

Recommended values:

| Property | Value |
|---|---|
| Minimum height | `108px` |
| Padding | `14px–16px` |
| Border radius | `8px–10px` |
| Border | `1px solid border-default` |
| Shadow | Very subtle or none |

The cards should feel compact and operational, not oversized.

---

## 10. Live Access Events Table

The Live Access Events table is the most important dashboard module.

### 10.1 Header

Display:

- Section title: `LIVE ACCESS EVENTS`
- Green streaming dot
- Text label: `Streaming`
- Event-type dropdown
- Filter button with active filter count
- Overflow menu

Example controls:

- `All Events`
- `Filters (3)`
- `...`

### 10.2 Columns

Use the following visible columns:

| Column | Content |
|---|---|
| Time | Event timestamp and live status dot |
| Identity | Email, username, or service identity; secondary ID below |
| IP Address | Clickable monospace IP |
| Action | Login, API Access, Admin Action, Data Export |
| Risk Level | Low, Medium, High, Critical badge |
| Trust Score | Numeric score with thin horizontal indicator |
| Location | Country code and city |
| Device / Client | Browser, operating system, API client, or device |

### 10.3 Table Treatment

- White background
- Thin row separators
- Small uppercase headers
- Compact rows
- Clickable identity and IP values in blue
- Muted metadata beneath primary values
- Small green streaming dot for new live activity
- Risk badges with semantic pastel backgrounds
- Trust score bar that changes color by score
- Footer with result count and action link

Example footer:

`Showing 1 to 6 of 25,833 events`

`View all events →`

### 10.4 Table Row Density

| Property | Value |
|---|---:|
| Header row height | `32px–36px` |
| Data row height | `40px–44px` |
| Cell horizontal padding | `12px–16px` |
| Primary text size | `12px–13px` |
| Secondary text size | `10px–11px` |

### 10.5 Interaction

- Highlight rows with a very subtle blue-gray background on hover.
- Open event details in a right-side drawer.
- Briefly animate new streaming rows with a soft background pulse.
- Preserve scroll position when the live stream updates.
- Allow users to pause automatic updates.

---

## 11. Pending Reviews Panel

The Pending Reviews panel is a compact triage queue on the right side of the dashboard.

### 11.1 Header

Display:

- `PENDING REVIEWS`
- Count badge, such as `12`

### 11.2 Review Row Structure

Each item should include:

- Semantic icon container
- Review title
- Secondary contextual information
- Relative timestamp
- Thin divider between rows

Example review items:

- `Critical login from new ASN`
- `Impossible travel detected`
- `High volume data export`
- `New device seen`
- `Unusual API activity`

### 11.3 Footer Action

Display:

`View all pending reviews →`

### 11.4 Styling

- Use red icons for critical reviews.
- Use amber icons for warning-level reviews.
- Keep card background white.
- Use minimal visual noise.
- Keep descriptions short.
- Align timestamps to the right.

---

## 12. Geographic Risk Activity

The geographic panel visualizes suspicious traffic sources and attack flows.

### 12.1 Header

Use a title such as:

`THREAT ORIGINS / GEOGRAPHIC RISK ACTIVITY`

Include:

- Info tooltip icon
- Compact legend
- Risk levels
- Attack-flow indicator

Example legend:

- Blue dot: Low
- Amber dot: Medium
- Red dot: High
- Dashed red line: Attack Flow

### 12.2 Map Styling

The map should use:

- Pale blue-gray background
- Light muted continent shapes
- Minimal geographic detail
- Small glowing dots
- Dashed curved attack-flow lines
- Low saturation
- High contrast only for meaningful threat markers

### 12.3 Tooltip

Map hover tooltips may display:

- City and country
- Risk level
- Event count
- Coordinates
- Related ASN or IP address
- Time period

The tooltip should use a white card with a subtle border and minimal shadow.

### 12.4 Map Rules

- Do not use a dark map.
- Do not use excessive glow effects.
- Avoid cluttering the map with too many visible markers.
- Aggregate dense regions where necessary.
- Provide a `View full geo analysis →` action.

---

## 13. Ranked Risk Lists

Use compact ranked tables for the most suspicious infrastructure sources.

### 13.1 Top Risky IPs

Columns:

- IP Address
- Risk Score
- Events

### 13.2 Top Risky ASNs

Columns:

- ASN Number
- Risk Score
- Events

### 13.3 Styling

- Use monospace font for IP addresses and ASN values.
- Use blue links for clickable infrastructure identifiers.
- Use red and amber text for elevated risk scores.
- Keep tables dense.
- Add an info tooltip to the card title.
- Use thin dividers between rows.

---

## 14. AI Insights Panel

AI Insights should feel integrated into the product rather than visually separated into a futuristic or decorative panel.

### 14.1 Header

Display:

- Sparkle or intelligence icon
- `AI INSIGHTS`
- Small `BETA` badge

### 14.2 Content

Use a concise bulleted list of actionable findings.

Examples:

- `Identity risk for account contractor.user is elevated from unusual authentication patterns observed.`
- `2 critical sign-ins require immediate attention`
- `5 identities show anomalous behavior`
- `10 risky events in the last 24h`

### 14.3 Styling

- Use the Tunai blue accent.
- Use white card background.
- Keep body text compact.
- Avoid violet panels, gradients, or glowing effects.
- Label AI-generated insights clearly.
- Do not present AI conclusions as absolute certainty.
- Link to a more detailed insight screen.

Example footer:

`View all insights →`

---

## 15. Webhook Delivery Health

This card summarizes platform integration health.

### 15.1 Suggested Metrics

- Success Rate
- Failures
- Average Latency

Example:

| Metric | Value |
|---|---:|
| Success Rate | `98.7%` |
| Failures | `21` |
| Average Latency | `312 ms` |

### 15.2 Styling

- Keep the module compact.
- Use green for improved success rate.
- Use red for increasing failures or worsening latency.
- Use subdued labels above prominent values.
- Provide drill-down access to webhook logs.

---

## 16. Risk Distribution and Certificate Health

Smaller analytical cards may appear beneath the main risk panels.

### 16.1 Risk Distribution

Use:

- Donut chart, horizontal segmented bar, or compact legend
- Risk-category counts
- Percentage values
- Muted category labels

Recommended categories:

- Low
- Medium
- High
- Critical

### 16.2 Certificate Health

Use:

- Donut chart or radial gauge
- Valid certificates
- Expiring certificates
- Revoked certificates
- Pending verification

### 16.3 Chart Rules

- Prefer simple charts.
- Use limited labels.
- Use semantic colors only when meaningful.
- Avoid rainbow palettes.
- Keep legends compact.
- Prioritize rapid interpretation over visual complexity.

---

## 17. Bottom System-Status Strip

A thin system-status strip appears at the bottom of the application.

### 17.1 Left Side

Display:

- Shield or system icon
- `System Status`
- Green status dot
- `All Systems Operational`

### 17.2 Right Side

Display:

- Last data update time
- Stream health
- Live status
- Events per second

Example:

- `Data last updated: 14:32:12 UTC`
- `Stream Health`
- `Live`
- `Event/sec: 240`

### 17.3 Styling

- Pale blue-gray background
- Thin upper border
- Compact font size
- Minimal height
- Fixed positioning when appropriate
- Green used only for the live operational state

---

## 18. General Component System

### 18.1 Cards

Cards are the primary structural components.

| Property | Value |
|---|---|
| Background | White |
| Border | `1px solid border-default` |
| Border radius | `8px–10px` |
| Shadow | None or extremely subtle |
| Padding | `14px–18px` |
| Internal spacing | `8px–16px` |

Cards should look clean and structured rather than elevated or floating.

### 18.2 Buttons

#### Primary Button

- Blue fill
- White text
- Blue hover state
- `6px–8px` corner radius
- Compact height

#### Secondary Button

- White background
- Thin border
- Navy or blue text
- Subtle blue-gray hover state

#### Destructive Button

- Red fill or red outline
- Used only for block, revoke, delete, or irreversible actions
- Requires confirmation for high-impact changes

#### Icon Button

- Small square or rounded rectangle
- White or pale background
- Clear hover state
- Tooltip and accessible label required

### 18.3 Inputs

Inputs should use:

- White background
- Thin gray-blue border
- Dark navy text
- Blue focus outline
- Muted placeholder
- Compact `36px–40px` height
- Rounded `6px–8px` corners

### 18.4 Dropdowns

Dropdowns should:

- Match input styling
- Use compact rows
- Support keyboard navigation
- Show a small chevron
- Use subtle shadow only when floating over other content

### 18.5 Badges

Badges should be compact and readable.

| Property | Value |
|---|---|
| Height | `20px–24px` |
| Radius | `4px–6px` |
| Font size | `10px–11px` |
| Font weight | `600–700` |
| Case | Uppercase for risk states |

Examples:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`
- `BETA`
- `LIVE`
- `PENDING`
- `REVOKED`

### 18.6 Count Badges

Count badges, such as the Pending Reviews count, should use:

- Small rounded capsule shape
- Pale blue background
- Blue text
- Compact numeric value

### 18.7 Trust Score Indicator

Trust score components may use:

- Circular radial gauge for summary cards
- Numeric score with thin bar inside tables
- Semantic color transitions

Recommended meaning:

| Score | Meaning | Color |
|---:|---|---|
| `0–39` | Critical risk | Red |
| `40–69` | Medium risk | Amber |
| `70–89` | Generally trusted | Blue |
| `90–100` | Highly trusted | Green |

### 18.8 Tooltips

Use tooltips for:

- Icon explanations
- Chart legends
- Map details
- Abbreviated values
- Risk score methodology
- ASN and certificate metadata

Tooltips should use a white surface, dark text, subtle border, and light shadow.

---

## 19. Detail Screens

Detail screens should extend the dashboard style without increasing visual noise.

### 19.1 Identity Detail Page

Header should contain:

- Identity name or email
- Entity ID
- Trust score
- Risk status
- Verification state
- Primary actions

Main content may include:

- Identity overview
- Linked devices
- IP addresses
- Aliases
- Organizations
- Certificates
- Access events
- Behavioral anomalies
- Trust-signal timeline
- Audit history

Recommended layout:

- Main column: `8 / 12`
- Contextual side panel: `4 / 12`

### 19.2 IP Record Detail Page

Show:

- IP address
- ASN
- Country and location
- Risk score
- Datacenter, proxy, Tor, VPN, or residential classification
- Related events
- Linked identities
- Attack patterns
- Registry status
- Historical activity

### 19.3 Organization Detail Page

Show:

- Organization name
- Verification status
- Linked identities
- Domains
- Certificates
- Recent events
- API activity
- Risk trend
- Manual-review history

### 19.4 Certificate Detail Page

Show:

- Certificate ID
- Holder
- Type
- Issuance date
- Expiration date
- Verification state
- Trust score
- Related organization or identity
- Audit history
- Revoke action

Use a clean metadata card rather than a highly decorative certificate illustration.

---

## 20. List Screens

List screens include:

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
- Pending Reviews
- Threat Intelligence

### 20.1 Standard List Layout

Use:

1. Page header
2. Search input
3. Filters
4. Optional summary metrics
5. Dense data table
6. Pagination or infinite scrolling
7. Row actions
8. Optional detail drawer

### 20.2 Filters

Filters should appear as compact bordered controls.

Examples:

- Risk Level
- Trust Score
- Event Type
- Country
- Device Type
- Certificate Status
- Review State
- Date Range

Active filters may show a numeric count:

`Filters (3)`

Avoid oversized pill-heavy filter toolbars.

### 20.3 Row Actions

Use a right-aligned overflow menu for secondary actions.

Examples:

- View details
- Add to registry
- Flag for review
- Block
- Revoke certificate
- Copy identifier
- View related events

---

## 21. Review Screens

Review screens are used for manual decisions involving suspicious identities, events, certificates, organizations, or community reports.

### 21.1 Evidence-First Layout

Use:

- Main evidence area on the left
- Sticky decision module on the right
- Clear event timeline
- Linked entity context
- Triggered trust signals
- Reviewer notes

### 21.2 Review Decision Module

Include:

- Risk summary
- Recommended action
- Confidence indicator
- Human-review notes field
- Approve / Allow action
- Flag action
- Block / Reject action
- Audit-log notice

### 21.3 Confirmation Rules

Require confirmation for:

- Blocking an identity
- Revoking a certificate
- Deleting a registry entry
- Overriding a trust verdict
- Disabling a security rule

For critical actions, require a text note that is saved to the audit log.

---

## 22. Drawers and Modals

### 22.1 Right-Side Drawers

Use drawers for investigation workflows that should not interrupt the current screen.

Examples:

- Access-event detail
- Pending-review preview
- Identity quick view
- Webhook payload detail
- Trust-signal explanation

Recommended widths:

| Drawer Type | Width |
|---|---:|
| Standard metadata drawer | `480px` |
| Detailed investigation drawer | `640px` |
| Raw JSON or payload drawer | `760px–820px` |

### 22.2 Modals

Use modals for:

- Confirmations
- Short forms
- Platform switching
- Creating keys
- Issuing or revoking certificates
- Adding registry entries

Modal styling:

- White surface
- Thin border
- Soft shadow
- Rounded corners
- Dark navy headings
- Compact spacing
- Restrained backdrop opacity

---

## 23. Raw Data and Developer-Facing Content

### 23.1 JSON Viewers

Use JSON viewers for:

- Webhook payloads
- Trust-signal metadata
- Background-check results
- API request details
- Device signals
- Debug data

Styling:

- Light neutral background or opt-in dark code panel
- Monospace font
- Syntax highlighting
- Copy button
- Expand and collapse behavior
- Search within payload

### 23.2 API Key Display

API keys must be:

- Obscured after creation
- Copyable only during controlled flows
- Clearly labeled
- Supported by revoke and regenerate actions
- Accompanied by audit-log entries

Never display permanent secret keys openly in a standard table.

---

## 24. Spacing System

Tunai uses a strict `4px` base grid.

### 24.1 Spacing Scale

Use:

- `4px`
- `8px`
- `12px`
- `16px`
- `20px`
- `24px`
- `32px`
- `40px`
- `48px`
- `64px`

### 24.2 Recommended Usage

| Context | Spacing |
|---|---:|
| Icon to label | `8px–10px` |
| Compact control gap | `8px` |
| Table cell horizontal padding | `12px–16px` |
| Card internal padding | `14px–18px` |
| Dashboard module gap | `16px` |
| Page padding | `16px–24px` |
| Large page section gap | `24px–32px` |

The interface should feel tighter and more efficient than a marketing website.

---

## 25. Border Radius

Tunai uses modest rounding to feel modern without appearing playful.

| Component | Radius |
|---|---:|
| Status dot | `50%` |
| Small badge | `4px–6px` |
| Input or button | `6px–8px` |
| Card or table container | `8px–10px` |
| Avatar | `50%` |
| Large modal | `10px–12px` |

Avoid excessively rounded `20px+` cards, oversized pill shapes, or bubbly visual styling.

---

## 26. Elevation and Borders

Tunai relies primarily on borders, spacing, and surface contrast.

### 26.1 Standard Card

```css
background: #ffffff;
border: 1px solid #dce5f1;
border-radius: 8px;
box-shadow: 0 1px 2px rgba(9, 38, 94, 0.03);
````

### 26.2 Floating Menu

```css
background: #ffffff;
border: 1px solid #dce5f1;
border-radius: 8px;
box-shadow: 0 10px 24px rgba(9, 38, 94, 0.10);
```

### 26.3 Focus State

```css
outline: 2px solid #176bff;
outline-offset: 2px;
```

### 26.4 Rules

* Avoid heavy shadows.
* Avoid glowing cards.
* Avoid large gradients.
* Use shadows only for menus, tooltips, drawers, and modals that float over existing content.
* Use thin separators for dense tables and lists.

---

## 27. Iconography

Icons should be:

* Line-based
* Compact
* Consistent
* Easy to scan
* Professional
* Usually `16px–18px`
* Around `1.5px–2px` stroke width

Recommended icon meanings:

| Icon             | Usage                                |
| ---------------- | ------------------------------------ |
| Shield           | Trust status, certificates, security |
| Grid             | Command Center                       |
| User             | Identities                           |
| Building         | Organizations                        |
| Monitor          | Devices                              |
| Globe            | IP Records                           |
| Link             | Aliases                              |
| Pulse / waveform | Access Events                        |
| Sparkle          | AI Insights                          |
| Nodes            | Trust Signals                        |
| Bell             | Notifications                        |
| Lock             | Blocked Events                       |
| Key              | Platform selector and API access     |
| Warning triangle | Medium-risk review                   |
| Shield alert     | Critical review                      |
| Database         | Logs and registries                  |
| Map pin          | Geographic analysis                  |
| Fingerprint      | Identity or device signals           |

Icons should not be decorative. Each icon must communicate function or status.

---

## 28. Motion and Interaction

Motion should be subtle and functional.

### 28.1 Recommended Timing

| Interaction             |       Duration |
| ----------------------- | -------------: |
| Hover color transition  |  `100ms–150ms` |
| Button state transition |        `120ms` |
| Dropdown opening        |        `150ms` |
| Drawer slide-in         |  `220ms–280ms` |
| Modal fade and scale    |  `150ms–200ms` |
| New live row highlight  | `600ms–1200ms` |
| Skeleton shimmer        |    `1.4s–1.8s` |

### 28.2 Motion Rules

* Do not animate large areas unnecessarily.
* Do not use decorative looping animations.
* Allow users to pause live-event streaming.
* Respect `prefers-reduced-motion`.
* Preserve keyboard focus during dynamic updates.
* Use subtle transitions to reinforce responsiveness, not to attract attention.

---

## 29. Loading, Empty, and Error States

### 29.1 Loading Skeletons

Use:

* Pale blue-gray skeleton blocks
* Shapes matching the eventual layout
* Minimal shimmer
* Stable card dimensions to prevent layout shift

### 29.2 Empty States

Use:

* Small line icon
* Concise title
* Short explanation
* One clear next action where appropriate

Example:

`No risky events found`

`No events matched the current filters.`

### 29.3 Error States

Use:

* Soft red-tinted background
* Red warning icon
* Concise message
* Retry action
* Optional view-logs action

Avoid filling the full page with aggressive red styling unless the entire application is unavailable.

---

## 30. Responsive Behavior

Tunai is desktop-first because it is designed for operational monitoring. It must still support smaller screens for urgent review and triage.

### 30.1 Large Desktop: `1440px+`

* Full expanded sidebar
* Five KPI cards in one row
* Multi-column lower dashboard layout
* Full live-events table columns
* Bottom system-health strip visible

### 30.2 Standard Desktop: `1024px–1439px`

* Full or compact sidebar depending on space
* KPI cards may wrap into two rows
* Reduce less-important table columns
* Preserve live events and pending reviews as highest-priority modules

### 30.3 Tablet: `768px–1023px`

* Sidebar collapses to icons or becomes a drawer
* Dashboard modules stack into fewer columns
* Hide lower-priority table columns
* Use horizontal scrolling only when necessary
* Preserve review actions and status visibility

### 30.4 Mobile: `<768px`

Shift from analytics to triage:

* Use top-bar menu instead of persistent sidebar
* Stack KPI cards
* Show compact event cards instead of wide tables
* Surface critical reviews first
* Reduce maps and charts to summary cards
* Use full-width drawers and modals
* Prioritize allow, review, block, and inspect actions

---

## 31. Accessibility

Tunai must meet WCAG 2.1 AA standards.

### 31.1 Contrast

* Use dark navy text on white surfaces.
* Ensure muted text remains readable.
* Validate semantic badge contrast.
* Avoid low-contrast pale text for essential information.

### 31.2 Color Independence

Never rely solely on red, amber, green, or blue. Use:

* Explicit label
* Icon
* Numeric value
* Tooltip or helper text where needed

### 31.3 Keyboard Support

All interactive elements must be keyboard accessible:

* Sidebar links
* Search input
* Platform selector
* Dropdowns
* Table rows
* Filter controls
* Buttons
* Drawers
* Modal actions
* Chart detail controls

### 31.4 Screen Readers

Provide:

* Descriptive labels for icon-only buttons
* Table headers
* Accessible status announcements for live events
* Proper modal focus trapping
* Non-disruptive live-region updates
* Meaningful chart summaries

---

## 32. Risk Status Language

Use consistent language throughout the product.

| Status         | Meaning                                              |
| -------------- | ---------------------------------------------------- |
| Low Risk       | Minimal indicators of suspicious activity            |
| Medium Risk    | Some suspicious signals; monitor or review           |
| High Risk      | Strong suspicious signals; investigation recommended |
| Critical       | Immediate attention required                         |
| Allowed        | Access permitted                                     |
| Limited        | Reduced access due to risk signals                   |
| Throttled      | Request rate intentionally restricted                |
| Blocked        | Access denied                                        |
| Pending Review | Waiting for human evaluation                         |
| Verified       | Trust checks passed                                  |
| Revoked        | Previously valid permission or certificate disabled  |
| Expired        | Time-limited credential is no longer valid           |
| Unknown        | Insufficient information                             |

Avoid inconsistent synonyms that could cause operational ambiguity.

---

## 33. Do's and Don'ts

### Do

* Use white cards and pale blue-gray backgrounds.
* Use the Tunai blue accent consistently.
* Keep the dashboard compact and data-rich.
* Use restrained semantic colors for risk and health.
* Use thin borders to separate modules.
* Provide visible evidence for risk decisions.
* Keep AI insights concise and clearly labeled.
* Use dense tables for high-volume operational data.
* Preserve strong visual hierarchy.
* Require confirmation and notes for high-impact actions.
* Add audit-log entries for manual overrides.

### Don't

* Do not design the app as a dark-mode-first SOC dashboard.
* Do not use neon colors, cyberpunk effects, or glowing panels.
* Do not introduce purple AI cards unless explicitly required later.
* Do not use excessive gradients.
* Do not use heavy drop shadows.
* Do not make every card oversized.
* Do not overuse rounded pill shapes.
* Do not use playful illustrations inside the admin interface.
* Do not use red or amber for decorative emphasis.
* Do not hide essential evidence behind multiple clicks.
* Do not present AI suggestions as absolute facts.
* Do not display secret API keys after creation.
* Do not allow destructive changes without confirmation.

---

## 34. Implementation Checklist

Before marking a Tunai UI implementation as complete, confirm:

### Shell

* [ ] Sidebar matches the white, bordered, grouped-navigation style.
* [ ] Tunai logo area is visible and properly spaced.
* [ ] Active navigation item uses pale blue selection styling.
* [ ] Top command bar contains global search.
* [ ] Platform selector is visible.
* [ ] Notification, help, avatar, name, and role controls are present.
* [ ] Bottom status strip is implemented where appropriate.

### Dashboard

* [ ] Five KPI cards are present.
* [ ] KPI cards use compact spacing and restrained colors.
* [ ] Live Access Events is the largest visible module.
* [ ] Streaming indicator is included.
* [ ] Filters and event-type dropdown are available.
* [ ] Pending Reviews panel is visible.
* [ ] Geographic Risk Activity map is visible.
* [ ] Ranked risky-IP and ASN lists are present.
* [ ] AI Insights uses the blue visual system.
* [ ] Webhook health information is visible.
* [ ] Risk Distribution and Certificate Health panels are supported.

### Components

* [ ] Cards use white backgrounds and thin borders.
* [ ] Buttons use restrained styling.
* [ ] Tables are compact and readable.
* [ ] Risk badges include text labels.
* [ ] Trust-score visuals are easy to interpret.
* [ ] Modals and drawers match the light surface system.
* [ ] Loading, empty, and error states are implemented.
* [ ] Keyboard focus states are visible.
* [ ] Responsive layouts preserve triage workflows.

---

## 35. Final Design Summary

Tunai is a **calm, light-mode-first trust intelligence command center**.

Its design should balance high information density with a clean enterprise SaaS aesthetic. The interface uses white surfaces, pale blue-gray backgrounds, thin borders, compact modules, dark navy typography, and a restrained blue accent. Red, amber, and green appear only where they communicate security meaning.

The result should feel secure, credible, and efficient without appearing harsh or intimidating. Tunai is not a cyberpunk SOC dashboard. It is a polished operational platform that helps security teams and platform administrators understand risk, review anomalies, and take action with confidence.

