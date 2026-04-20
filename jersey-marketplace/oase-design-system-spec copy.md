# Oase Design System Specification
## v6 — Dark Mode, Green Primary, Red Accent

Last updated: March 2026
Status: Proposal for implementation

---

## 1. Foundations

### 1.1 Design Philosophy

Oase is a social marketplace for football shirt collectors. The design system serves three goals:

1. Make shirt photography the visual hero (dark backgrounds, minimal chrome)
2. Make the platform feel alive even with limited inventory (feed-first, social signals)
3. Feel premium without feeling corporate (editorial typography, restrained color use)

The interface is designed mobile-first for a 90% mobile audience. Desktop is a scaled-up adaptation, not the primary target.

---

## 2. Color System

### 2.1 Background Scale

All background colors carry a subtle warm-green undertone. This prevents the dark theme from feeling cold or overly technical. Compare #1F211E to a neutral #1F1F1F — the difference is subtle but significant at scale.

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#111210` | Page background, base layer |
| `--bg-raised` | `#1A1B19` | Elevated surfaces (menu panels, modal overlays) |
| `--bg-card` | `#1F211E` | All card surfaces (feed cards, marketplace cards, form fields) |
| `--bg-card-hover` | `#262825` | Card hover/pressed state |
| `--border` | `#2A2C28` | Card borders, dividers, separator lines |
| `--border-light` | `#333530` | Subtle inner borders, input field borders |

### 2.2 Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#E8E6E1` | Headings, shirt titles, prices, usernames |
| `--text-secondary` | `#9B9990` | Body text, shirt metadata, seller names |
| `--text-tertiary` | `#6B6960` | Timestamps, labels, placeholder text, inactive tabs |
| `--text-inverse` | `#111210` | Text on light/colored backgrounds (e.g. inside green buttons) |

### 2.3 Green Spectrum (Primary)

Green handles all positive/primary actions: bidding, active states, links, confirmations.

| Token | Hex | Usage |
|-------|-----|-------|
| `--green-50` | `#F0F5EC` | Reserved for light-mode contexts (detail pages if needed) |
| `--green-100` | `#D4E4CB` | Reserved for light-mode contexts |
| `--green-200` | `#A8C99A` | Reserved for light-mode contexts |
| `--green-300` | `#7BAF6A` | Soft green text on dark (Buy Now button text, highlights in compact cards) |
| `--green-400` | `#5A9C47` | Primary button fill, active pill fill, bid counts, links |
| `--green-500` | `#4A8339` | Button hover/pressed state |
| `--green-600` | `#356228` | Reserved for deep emphasis |
| `--green-900` | `#1A2E15` | Soft button background (Buy Now button bg), subtle highlight backgrounds |

### 2.4 Red Spectrum (Accent)

Red is used sparingly. It appears in exactly three contexts: sold/won badges, ending-soon urgency, and notification counts.

| Token | Hex | Usage |
|-------|-----|-------|
| `--red-50` | `#FDF0EE` | Reserved for light-mode contexts |
| `--red-100` | `#F5D0CA` | Reserved for light-mode contexts |
| `--red-200` | `#E89E91` | Soft red text on dark (e.g. ending-soon text in compact cards) |
| `--red-300` | `#D9685A` | Ending-soon urgency text in compact feed cards |
| `--red-400` | `#CC4433` | "Sold" badge fill, notification count badge fill |
| `--red-500` | `#A83628` | Red button hover state |
| `--red-600` | `#7A271D` | Soft red button background (if needed) |

### 2.5 Color Rules

- Cards, feed, and marketplace surfaces use ONLY the background scale, text scale, green spectrum, and red spectrum.
- No other accent colors appear on browsing surfaces.
- Verification badges (sage green), collection features (purple) are reserved for detail/interior pages only. They never appear on feed or marketplace cards.
- Shirt photography is the only source of arbitrary color on any card. The UI chrome never competes with it.

---

## 3. Typography

### 3.1 Font Stack

| Role | Font | Fallback | Weight(s) |
|------|------|----------|-----------|
| Display | Young Serif | Georgia, serif | 400 (regular only) |
| Body | DM Sans | -apple-system, sans-serif | 300, 400, 500, 600 |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Young+Serif&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap
```

### 3.2 Type Scale

All sizes are mobile-first. Use rem units.

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-xs` | 0.75rem (12px) | 1.4 | Timestamps, badge labels, price labels, micro-text |
| `--text-sm` | 0.8125rem (13px) | 1.45 | Usernames, action text, button labels, seller names |
| `--text-base` | 0.9375rem (15px) | 1.55 | Body text, card metadata, descriptions |
| `--text-lg` | 1.125rem (18px) | 1.3 | Shirt titles (display font), section headers, prices |
| `--text-xl` | 1.375rem (22px) | 1.25 | Hero prices, large emphasis |
| `--text-2xl` | 1.75rem (28px) | 1.15 | Page titles, hero card titles |
| `--text-3xl` | 2.25rem (36px) | 1.1 | Marketing headlines, brand moments |

### 3.3 Font Usage Rules

- Young Serif is used exclusively for: shirt titles on cards, section headers ("Ending Soon", "Just Listed", "Marketplace"), hero card titles, and the "Oase" wordmark in the nav.
- DM Sans handles everything else: usernames, metadata, buttons, labels, body copy, navigation items.
- Young Serif is never used below `--text-lg` (18px). At small sizes it loses legibility.
- DM Sans weight 600 (semibold) is used for: usernames, prices, button labels, active tab text.
- DM Sans weight 500 (medium) is used for: seller names in ratings, navigation items, category pills.
- DM Sans weight 400 (regular) is used for: body text, metadata, descriptions.
- DM Sans weight 300 (light) is not used in the dark theme (insufficient contrast).

### 3.4 Letter Spacing

| Context | Value |
|---------|-------|
| Section labels (uppercase) | 0.15em |
| Badge/pill labels (uppercase) | 0.06em-0.08em |
| Price labels (uppercase) | 0.06em |
| Body text | 0 (default) |
| Young Serif display text | 0 (default) |

### 3.5 Font Variant

- All prices and time displays use `font-variant-numeric: tabular-nums` so numbers align vertically in lists and do not shift when values change.

---

## 4. Spacing System

### 4.1 Base Unit

The spacing system uses a 4px base grid. All spacing values are multiples of 4.

### 4.2 Spacing Scale

| Token | Value | Common Usage |
|-------|-------|-------------|
| `2px` | 2px | Hairline gaps (e.g. between swatch name and hex) |
| `4px` | 4px | Tight internal spacing (between title and meta text) |
| `6px` | 6px | Badge internal padding (vertical), small gaps |
| `8px` | 8px | Grid gap (marketplace), card internal margin (small) |
| `10px` | 10px | Card horizontal gap (h-scroll), card margins |
| `12px` | 12px | Feed card internal padding (top of sections), compact card padding |
| `14px` | 14px | Card outer margin (left/right from screen edge), action bar padding |
| `16px` | 16px | Card inner content padding (left/right), feed card main padding |
| `20px` | 20px | Section head left/right padding, category scroll padding, nav padding |
| `24px` | 24px | Section vertical padding, page-level left/right padding |
| `28px` | 28px | Status bar horizontal padding |
| `40px` | 40px | Major section padding (top/bottom) |
| `48px` | 48px | Hero section padding (top) |

### 4.3 Card Outer Margins

- Feed cards: 14px left and right from screen edge, 8px gap between cards vertically.
- Marketplace grid: 14px left and right from screen edge, 8px gap between cards (both axes).
- Category pill scroll: 20px left padding, 14px bottom padding.

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Compact card thumbnails, inner elements, input fields |
| `--radius-md` | 10px | Marketplace cards, feed card shirt images, menu panels |
| `--radius-lg` | 16px | Feed cards, hero cards, navigation menu overlay |
| Pill radius | 100px (fully round) | Buttons, category pills, badges, time pills |
| Phone frame | 40px | Mockup only, not a product token |
| Avatar | 50% (circle) | All user avatars |

---

## 6. Borders and Dividers

- All card borders: 1px solid `--border` (#2A2C28)
- Internal dividers within cards (e.g. between content and action bar): 1px solid `--border`
- Feed tab underline (active): 2px solid `--green-400`, 2px border-radius, inset 20% from each side
- No box-shadows on cards. Depth is created through background color stepping (bg < bg-raised < bg-card) and borders.
- The only shadow in the system is on the phone mockup frame, which is not a production element.

---

## 7. Buttons

### 7.1 Button Specs

All buttons share:
- Font: DM Sans
- Size: `--text-sm` (13px)
- Weight: 600
- Padding: 12px vertical, 24px horizontal (for standard), 10px vertical, 22px horizontal (for card-inline)
- Border-radius: 100px (fully round)
- No box-shadow
- No border (except ghost variant)

| Variant | Background | Text Color | Usage |
|---------|-----------|------------|-------|
| Primary (green) | `--green-400` | `#FFFFFF` | Place Bid, primary CTAs |
| Soft green | `--green-900` | `--green-300` | Buy Now, secondary positive actions |
| Red | `--red-400` | `#FFFFFF` | Urgency CTAs (rare, e.g. "Ending Soon" button if used) |
| Ghost | `--bg-card` | `--text-primary` | Filters, Share, tertiary actions. 1.5px border `--border` |

### 7.2 Button States

| State | Change |
|-------|--------|
| Hover | Background shifts one step darker in spectrum (400 to 500 for green) |
| Pressed | Scale transform 0.97 |
| Disabled | Opacity 0.4, no pointer events |
| Focus | 2px outline, `--green-400`, 2px offset |

### 7.3 Card-Inline Buttons

Buttons inside feed action bars and listing cards use slightly smaller padding:
- Padding: 10px vertical, 22px horizontal (feed cards)
- Padding: 7px vertical, 16px horizontal (listing card compact buttons)
- Same border-radius and font specs.

---

## 8. Navigation

### 8.1 Top Navigation Bar

- Height: auto (content-driven), padding 8px top, 12px bottom, 20px horizontal.
- Background: `--bg` (same as page, no separate nav background).
- Sticky on scroll (position: sticky, top: 0, z-index: 10).
- Contents (left to right): hamburger icon, centered "Oase" wordmark, search icon + user avatar.

### 8.2 Hamburger Icon

- Three horizontal lines.
- Line thickness: 2px.
- Line color: `--text-primary`.
- Border-radius on each line: 2px.
- Line widths (top to bottom): 18px, 22px, 14px. This asymmetry is intentional and part of the brand.
- Container size: 22x22px.
- Gaps between lines: 4px.

### 8.3 Navigation Menu (Slide-out)

- Background: `--bg-raised`.
- Border: 1px solid `--border`.
- Border-radius: `--radius-lg` (16px) if implemented as an overlay panel.
- Padding: 24px top/bottom, 20px horizontal.
- Menu items:
  - Padding: 13px vertical.
  - Font: DM Sans, 15px, weight 500, color `--text-primary`.
  - Icon: 20x20px, color `--text-tertiary`.
  - Gap between icon and label: 14px.
  - Divider between items: 1px solid `--border`.
- Badge pills (notification counts):
  - Border-radius: 100px.
  - Padding: 2px vertical, 8px horizontal.
  - Font: 11px, weight 600.
  - Green badge: bg `--green-400`, text white.
  - Red badge: bg `--red-400`, text white.

### 8.4 Menu Items (in order)

1. Feed (home icon)
2. Marketplace (grid icon) — with green badge showing new listing count
3. My Collection (bookmark icon)
4. Active Bids (heart icon) — with red badge showing active bid count
5. Settings (gear icon)

### 8.5 User Avatar (Nav)

- Size: 28x28px.
- Border-radius: 50%.
- Background: `--green-900`.
- Border: 2px solid `--bg`.
- Outer ring: box-shadow 0 0 0 1px `--border`.
- Placeholder: user emoji or initials.

---

## 9. Feed

### 9.1 Feed Tab Switcher

- Container: full width, padding 0 20px, bottom border 1px `--border`.
- Tabs: flex, equal width (flex: 1).
- Tab text: 13px, DM Sans weight 500, color `--text-tertiary`.
- Active tab: weight 600, color `--text-primary`.
- Active indicator: 2px tall bar, `--green-400`, centered below text (20% inset from each side), border-radius 2px, positioned at bottom: -1px.
- Tab labels: "All", "Following", "My Bids".

### 9.2 Rich Feed Card (New Listing, Auction Won)

Structure top to bottom:
1. Header: avatar + username + action text + timestamp
2. Shirt image
3. Shirt details (title + meta)
4. Action bar (price + button) — only on active listings
5. Footer stats (watchers, time remaining)

**Header:**
- Padding: 14px horizontal, 16px left/right, 0 bottom.
- Avatar: 34x34px circle, bg `--bg-raised`, border 1px `--border`.
- Username: 13px, weight 600, color `--text-primary`.
- Action text: 12px, weight 400, color `--text-tertiary`.
- Timestamp: 11px, color `--text-tertiary`, right-aligned, align-self: flex-start.
- Gap between avatar and text: 10px.

**Shirt image:**
- Margin: 12px top, 16px horizontal.
- Border-radius: `--radius-md` (10px).
- Aspect ratio: 16:10.
- The background should use a gradient tinted to match the shirt's dominant color (this creates a color-matched dark backdrop behind the actual photo). Examples: orange gradient for Netherlands shirts, dark blue for Inter, dark red for Roma, dark green for Nigeria.
- No verification badge on the image.

**Shirt details:**
- Padding: 12px top, 16px horizontal.
- Title: Young Serif, `--text-lg` (18px), weight 400, color `--text-primary`.
- Meta: DM Sans, 12px, color `--text-secondary`. Format: "Player #Number · Size · Condition".

**Action bar:**
- Padding: 14px all around, 16px horizontal.
- Margin-top: 8px.
- Top border: 1px solid `--border`.
- Left side: price label (10px, uppercase, `--text-tertiary`, tracking 0.06em) + price value (`--text-lg`, weight 600, `--text-primary`).
- Right side: button (see Button specs).
- For auctions: green "Place Bid" button.
- For buy-now: soft green "Buy Now" button.

**Footer stats:**
- Padding: 0 16px, 12px bottom.
- Items: flex, gap 16px.
- Each item: 12px, color `--text-tertiary`, flex with 4px gap for icon.
- Icons: 13x13px, stroke only.
- Watcher count icon: eye.
- Time remaining icon: clock.
- No colored text in footer. Everything is `--text-tertiary`.

### 9.3 Compact Feed Card (Bid, Milestone)

- Single-row layout: flex, align center, gap 12px, padding 12px 16px.
- Thumbnail: 44x44px, border-radius `--radius-sm` (6px).
- Thumbnail background: a dark color tinted to vaguely match the shirt. E.g. dark blue (#1C2430) for Inter, dark red (#2A1A18) for Roma.
- Text: 13px, color `--text-secondary`.
- Bold names: `--text-primary`, weight 600.
- Highlighted values (bid amounts): `--green-300`, weight 600.
- Highlighted urgency (ending soon): `--red-300`, weight 600.
- Timestamp line: 11px, color `--text-tertiary`.

### 9.4 Won Auction Card

Same structure as rich feed card, with these additions:
- Image overlay: linear-gradient from transparent (top-left 40%) to rgba(17,18,16,0.7) (bottom-right 100%).
- "Sold" label: positioned absolute, bottom 10px, right 10px. Background `--red-400`, text white, 11px, weight 600, padding 5px 14px, border-radius 100px.
- No action bar (auction is complete).
- Meta text includes bid count and duration, e.g. "22 bids over 7 days".

### 9.5 Feed Card Spacing

- Vertical gap between feed cards: 8px (margin-bottom on each card).
- First card after tabs: 10px margin-top.
- Card outer margin (horizontal): 14px from each screen edge.

---

## 10. Marketplace Grid

### 10.1 Layout

- 2-column grid.
- Gap: 8px (both column and row).
- Outer padding: 14px horizontal.

### 10.2 Marketplace Card

**Image area:**
- Aspect ratio: 1:1 (square).
- Border-radius: top corners match card radius (`--radius-md`), bottom corners 0 (shared with body).
- Background: dark gradient tinted to shirt color (same principle as feed cards).
- Time pill (if auction): position absolute, bottom 6px, left 6px. Background rgba(17,18,16,0.7), backdrop-filter blur(4px), text `--text-primary`, 9px, weight 600, padding 3px 7px, border-radius 100px.
- No verification badges.

**Card body:**
- Padding: 10px horizontal, 10px top, 12px bottom.
- Team name: 12px, weight 600, color `--text-primary`.
- Detail: 10px, color `--text-tertiary`, margin-top 1px. Format: "Player · Size".

**Seller row:**
- Margin-top: 6px.
- Flex layout, 4px gap.
- Avatar: 14x14px circle, bg `--bg-raised`.
- Name: 10px, color `--text-tertiary`.
- Rating: 10px, color `--text-tertiary`, margin-left auto. Format: "★ 4.9".

**Price row:**
- Margin-top: 6px.
- Flex, space-between.
- Price: 13px, weight 600, color `--text-primary`.
- Bid count: 10px, weight 500, color `--green-400`. Format: "18 bids".
- Buy Now label (if not auction): 10px, weight 500, color `--green-300`. Text: "Buy Now".

### 10.3 Section Header

- Flex, space-between, baseline aligned.
- Padding: 16px top, 20px horizontal, 10px bottom.
- Title: Young Serif, `--text-lg`, weight 400.
- Link: `--text-xs`, color `--green-400`, weight 500, no underline.

### 10.4 Category Pills

- Horizontal scroll container.
- Padding: 0 20px (horizontal), 14px bottom.
- Scrollbar: hidden (scrollbar-width: none, ::-webkit-scrollbar display: none).
- Scroll-snap: optional, snap to start.

**Individual pill:**
- Padding: 9px vertical, 16px horizontal.
- Border-radius: 100px.
- Font: DM Sans, 13px, weight 500.
- White-space: nowrap.
- Flex-shrink: 0.
- Gap between pills: 8px.

| State | Background | Border | Text |
|-------|-----------|--------|------|
| Default | `--bg-card` | 1.5px solid `--border` | `--text-secondary` |
| Active | `--green-400` | 1.5px solid `--green-400` | `#FFFFFF` |

---

## 11. Iconography

### 11.1 Icon Style

- Stroke-based icons (not filled).
- Stroke width: 2px (for 22px icons), 2.5px (for 14px icons).
- Line cap: round.
- Line join: round.
- No fill unless explicitly noted.
- Color follows the text color of the context.

### 11.2 Icon Sizes

| Context | Size |
|---------|------|
| Navigation bar | 22x22px |
| Feed card footer | 13x13px |
| Menu items | 20x20px |
| Badge/pill icons | 14x14px |
| Card time pills | (text only, no icon) |

### 11.3 Icon Set

| Name | Usage | Description |
|------|-------|-------------|
| Search | Nav bar | Circle with diagonal line |
| Bell | Notifications (if shown) | Bell shape |
| Hamburger | Menu open | Three horizontal lines (18px, 22px, 14px) |
| Home | Menu, feed | House shape |
| Grid | Menu, marketplace | 2x2 square grid |
| Bookmark | Menu, collection | Bookmark/flag shape |
| Heart | Menu, active bids | Heart shape |
| Gear | Menu, settings | Gear/cog shape |
| Eye | Watcher count | Eye with iris |
| Clock | Time remaining | Circle with clock hands |
| Plus | Sell/create | Plus sign (for floating action button) |

---

## 12. Avatars

### 12.1 Avatar Sizes

| Context | Size | Border |
|---------|------|--------|
| Navigation | 28x28px | 2px solid `--bg`, outer 1px `--border` |
| Feed card header | 34x34px | 1px solid `--border` |
| Compact feed card thumbnail | 44x44px (square, `--radius-sm`) | none |
| Marketplace card seller | 14x14px | none |

### 12.2 Avatar Style

- All circular (border-radius: 50%) except compact card thumbnails (which are square shirt thumbnails, not user avatars).
- Default background: `--bg-raised`.
- Placeholder: initials (centered, DM Sans, weight 600) or emoji.
- No gradient or colored backgrounds for user avatars. Keep them neutral.

---

## 13. Shirt Image Backgrounds

When actual photography is not available (placeholder state), shirt image areas use dark gradients tinted to suggest the shirt's dominant color. This is also recommended as a loading-state background before the actual image loads.

| Shirt | Gradient |
|-------|----------|
| Netherlands/Orange kits | `linear-gradient(135deg, #F26522 0%, #C8441A 100%)` |
| Inter/Blue kits | `linear-gradient(135deg, #1C2440 0%, #2A3660 100%)` |
| Milan/Roma/Red kits | `linear-gradient(135deg, #8B1A1A 0%, #5C1111 100%)` |
| Nigeria/Green kits | `linear-gradient(135deg, #1A3A1A 0%, #2A5A2A 100%)` |
| Juventus/Neutral kits | `linear-gradient(135deg, #2A2A2E 0%, #3A3A3E 100%)` |
| Barcelona/Dark mixed | `linear-gradient(135deg, #1A1A3A 0%, #3A1A3A 100%)` |

In production, once real shirt photos are available, the image container background should be set to a dark neutral (`--bg-card`) and the photo fills the space. The gradient backgrounds above are for placeholders and loading states.

---

## 14. Motion and Transitions

### 14.1 General Principles

- Prefer CSS transitions over JavaScript animations.
- All interactive state changes (hover, focus, active) use transitions.
- No entrance animations on feed cards during normal scrolling (performance concern on mobile).
- Subtle transitions on interactive elements only.

### 14.2 Transition Specs

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Buttons (hover) | background-color | 150ms | ease |
| Buttons (press) | transform | 100ms | ease |
| Cards (hover, desktop only) | background-color | 150ms | ease |
| Tab indicator | left, width | 200ms | ease-out |
| Menu slide-in | transform | 250ms | ease-out |
| Menu overlay fade | opacity | 200ms | ease |

### 14.3 Disabled Motion

Respect `prefers-reduced-motion: reduce`. When active, remove all transitions and animations.

---

## 15. Responsive Behavior

### 15.1 Breakpoints

| Name | Width | Notes |
|------|-------|-------|
| Mobile (default) | 0-767px | Primary design target. All specs above are mobile. |
| Tablet | 768px-1023px | Marketplace grid can expand to 3 columns. Feed cards max-width: 560px, centered. |
| Desktop | 1024px+ | Feed max-width: 600px. Marketplace max-width: 960px (4 columns). Sidebar nav replaces hamburger. |

### 15.2 Mobile-Specific Rules

- All horizontal scrolling containers (category pills, card carousels) have padding: 20px on left side to create a visual indent from the screen edge.
- Scrollbar hidden on all horizontal scroll containers.
- Touch targets: minimum 44x44px for all interactive elements.
- Feed cards stretch full width minus 14px margin on each side (total card width: viewport - 28px).
- Marketplace grid: 2 columns, 8px gap, 14px outer margin.

### 15.3 Desktop Adaptations

- Hamburger menu becomes a permanent left sidebar (240px wide).
- Feed and marketplace content is centered with a max-width.
- Cards do not stretch beyond their max-width. They are not designed for wide landscape viewing.
- Hover states activate on desktop (not present on mobile).

---

## 16. Accessibility

### 16.1 Contrast Ratios

All text/background combinations must meet WCAG AA minimum (4.5:1 for normal text, 3:1 for large text).

| Combination | Ratio | Pass |
|-------------|-------|------|
| `--text-primary` on `--bg` | ~13:1 | Yes (AAA) |
| `--text-primary` on `--bg-card` | ~10.5:1 | Yes (AAA) |
| `--text-secondary` on `--bg-card` | ~4.7:1 | Yes (AA) |
| `--text-tertiary` on `--bg-card` | ~3.1:1 | Marginal (use only for large text/non-essential info) |
| `--green-400` on `--bg-card` | ~4.5:1 | Yes (AA) |
| `--red-400` on `--bg-card` | ~4.2:1 | Yes (AA, large text) |
| White on `--green-400` | ~4.2:1 | Yes (AA, large text — buttons are large-text context) |
| White on `--red-400` | ~4.8:1 | Yes (AA) |

### 16.2 Focus States

- All interactive elements must have a visible focus indicator.
- Focus ring: 2px solid `--green-400`, 2px offset from element edge.
- Never remove focus outlines. Only restyle them.

### 16.3 Semantic Structure

- Feed cards use `<article>` elements.
- Section headers use appropriate heading levels (`h2` for major sections, `h3` for card titles).
- Interactive elements use `<button>` or `<a>`, never `<div>` with click handlers.
- Images include alt text describing the shirt (team, season, player if applicable).

---

## 17. Component Summary

Quick reference of every component with its key measurements.

| Component | Width | Height | Radius | Border | Padding |
|-----------|-------|--------|--------|--------|---------|
| Feed card | viewport - 28px | auto | 16px | 1px `--border` | internal per section |
| Compact feed card | viewport - 28px | auto (single row) | 16px | 1px `--border` | 12px 16px |
| Marketplace card | (grid cell) | auto | 10px | 1px `--border` | body: 10px 10px 12px |
| Category pill | auto | auto | 100px | 1.5px `--border` | 9px 16px |
| Button (standard) | auto | auto | 100px | none (ghost: 1.5px) | 12px 24px |
| Button (card-inline) | auto | auto | 100px | none | 10px 22px |
| Nav avatar | 28px | 28px | 50% | 2px `--bg` + 1px shadow | none |
| Feed avatar | 34px | 34px | 50% | 1px `--border` | none |
| Seller avatar | 14px | 14px | 50% | none | none |
| Time pill | auto | auto | 100px | none | 3px 7px |
| Menu item | full width | auto | none | bottom 1px `--border` | 13px 0 |
| Sold badge | auto | auto | 100px | none | 5px 14px |

---

## 18. CSS Custom Properties (Copy-Paste Ready)

```css
:root {
  /* Backgrounds */
  --bg:             #111210;
  --bg-raised:      #1A1B19;
  --bg-card:        #1F211E;
  --bg-card-hover:  #262825;
  --border:         #2A2C28;
  --border-light:   #333530;

  /* Text */
  --text-primary:   #E8E6E1;
  --text-secondary: #9B9990;
  --text-tertiary:  #6B6960;
  --text-inverse:   #111210;

  /* Green (primary) */
  --green-50:       #F0F5EC;
  --green-100:      #D4E4CB;
  --green-200:      #A8C99A;
  --green-300:      #7BAF6A;
  --green-400:      #5A9C47;
  --green-500:      #4A8339;
  --green-600:      #356228;
  --green-900:      #1A2E15;

  /* Red (accent) */
  --red-50:         #FDF0EE;
  --red-100:        #F5D0CA;
  --red-200:        #E89E91;
  --red-300:        #D9685A;
  --red-400:        #CC4433;
  --red-500:        #A83628;
  --red-600:        #7A271D;

  /* Typography */
  --font-display:   'Young Serif', Georgia, serif;
  --font-body:      'DM Sans', -apple-system, sans-serif;

  --text-xs:        0.75rem;
  --text-sm:        0.8125rem;
  --text-base:      0.9375rem;
  --text-lg:        1.125rem;
  --text-xl:        1.375rem;
  --text-2xl:       1.75rem;
  --text-3xl:       2.25rem;

  /* Radii */
  --radius-sm:      6px;
  --radius-md:      10px;
  --radius-lg:      16px;
}
```

---

## 19. What Does NOT Appear on Feed/Marketplace

For clarity, these elements are explicitly excluded from the main browsing surfaces:

- Verification badges (green checkmarks) — moved to shirt detail page only
- Purple accent color — reserved for collection/profile interior pages
- Sage green accent — reserved for detail page authentication section
- Box shadows on cards — depth from background stepping only
- Gradient backgrounds on cards (the card surface itself is flat `--bg-card`)
- Any text below `--text-tertiary` opacity — nothing should be less readable than timestamps

---

## 20. Tone of Voice Reference

Not a visual spec, but included for completeness since it affects UI text strings.

| Context | Default (avoid) | Oase tone |
|---------|----------------|-----------|
| Empty search | "0 results" | "Nothing here yet. Try loosening your filters, the right shirt is out there." |
| Auction won | "You won the auction." | "It's yours. A 1998 Fiorentina Batistuta, heading your way." |
| Outbid | "You have been outbid." | "Someone wants this one too. Raise your bid or set an auto-limit." |
| Welcome | "Welcome to Oase." | "Welcome to the collection. 36,000 shirt nerds are glad you're here." |
| Ending soon | "Auction ends in 47 minutes." | "AS Roma 00/01 Totti ending in 47 minutes." |
| Watcher milestone | (nothing) | "Nigeria 2018 WC just hit 50 watchers." |
