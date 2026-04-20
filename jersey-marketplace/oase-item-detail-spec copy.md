# Oase Item Detail Page Specification

**Parent document:** oase-design-system-spec.md (v7)
**Visual reference:** oase-item-detail.html

This spec covers the item detail page only. All design tokens (colors, fonts, radii, spacing) are defined in the parent design system spec. This document references those tokens throughout.

---

## 1. Page Overview

The item detail page is the transaction decision page. It is reached by tapping any shirt card in the Feed or Marketplace. It presents all information needed to place a bid or buy: shirt imagery, auction state, seller identity, authentication chain, bid history, and similar items.

**Page background:** `--bg` (#111210)
**Max content width:** No max-width on mobile. On desktop (1024px+), center content with max-width: 600px.

---

## 2. Page Structure (Top to Bottom)

The page consists of 9 sections in this exact order:

1. Navigation bar (back, share, bookmark)
2. Hero image carousel
3. Title block
4. Auction block (or Buy Now block)
5. Seller card
6. Shirt details grid
7. Verification section
8. Description
9. Bid history
10. Similar items (horizontal scroll)
11. Sticky bottom bar (fixed to viewport)

---

## 3. Navigation Bar

A simplified nav for the detail context. Replaces the standard app nav (hamburger + logo + avatar).

**Layout:** Flex, space-between, vertically centered.
**Padding:** 8px top, 16px horizontal, 10px bottom.
**Background:** `--bg` (transparent, same as page).

### 3.1 Back Button (Left)

- Flex row, align center, gap 6px.
- Arrow icon: 20x20px, stroke `--text-primary`, stroke-width 2. Left-pointing arrow (chevron or arrow).
- Text: "Back", DM Sans, 14px, weight 500, color `--text-primary`.
- Tapping navigates to the previous page (browser back).

### 3.2 Action Icons (Right)

- Flex row, gap 12px.
- Two icons, each 22x22px, stroke `--text-secondary`, stroke-width 2:
  - **Share:** Upload/share icon (box with upward arrow).
  - **Bookmark/Save:** Bookmark icon. Filled with `--green-400` if the user has saved this item, stroke-only if not.

---

## 4. Hero Image Carousel

Full-width image area with swipeable photos.

**Width:** 100% (edge to edge, no horizontal margin).
**Aspect ratio:** 4:3 (taller than feed card images at 16:10, gives shirts more vertical space).
**Background:** Color-matched gradient to shirt's dominant color (see parent spec, Section 13 for gradient examples). In production, this is the loading/fallback state behind the actual photograph.
**Overflow:** Hidden.
**Border-radius:** None (full bleed).

### 4.1 Image Carousel Behavior

- Horizontal swipe to navigate between images.
- Typical image set: front, back, label/tag close-up, defect detail shots.
- No arrow buttons on mobile. Swipe only.
- On desktop, optional left/right arrow overlays at vertical center, 50% opacity, 32x32px circles with chevron icons.

### 4.2 Dot Indicators

- Position: absolute, bottom 12px, horizontally centered (left: 50%, transform: translateX(-50%)).
- Flex row, gap 6px.
- Inactive dot: 6x6px circle, background rgba(255,255,255,0.3).
- Active dot: 18px wide, 6px tall, border-radius 3px, background `--white`.
- Transition between states: 200ms ease.

---

## 5. Title Block

Shirt name and key metadata directly below the hero image.

**Padding:** 20px top, 20px horizontal, 0 bottom.

### 5.1 Title

- Font: Sora (`--font-display`).
- Size: `--text-2xl` (28px).
- Weight: 700.
- Line-height: 1.12.
- Letter-spacing: -0.02em.
- Color: `--text-primary`.
- Format: "[Team] [Home/Away] '[Season]" e.g. "Netherlands Home '88".

### 5.2 Meta Line

- Font: DM Sans (`--font-body`).
- Size: 13px.
- Color: `--text-secondary`.
- Line-height: 1.5.
- Margin-top: 6px.
- Format: "[Player #Number] · [Size] · [Condition]" e.g. "Van Basten #12 · Size L · Excellent condition".
- Separator: " · " (space, middle dot, space).

---

## 6. Auction Block

The primary action zone. A card containing bid state, stats, and the bid input.

**Margin:** 16px top, 16px horizontal.
**Background:** `--bg-card`.
**Border:** 1px solid `--border`.
**Border-radius:** `--radius-lg` (16px).
**Padding:** 20px.

### 6.1 Bid + Time Row

Top section of the auction block. Two columns, flex, space-between.

**Left column (current bid):**
- Label: "CURRENT BID", 10px, DM Sans, weight 500, `--text-tertiary`, uppercase, letter-spacing 0.08em, margin-bottom 4px.
- Value: Sora, `--text-2xl` (28px), weight 700, `--text-primary`, tabular-nums, letter-spacing -0.02em.
- Format: "6,200 kr" (number with thousands separator, space, "kr").

**Right column (time remaining):**
- Align: text-align right.
- Label: "TIME REMAINING", same style as left label.
- Value: Sora, `--text-lg` (18px), weight 600, `--text-primary`, tabular-nums, letter-spacing -0.01em.
- Format: "2h 41m 08s" (hours, minutes, seconds with units).
- Sub-line: "Ends Mar 27, 18:22", 11px, DM Sans, `--text-tertiary`, margin-top 2px.

**Margin-bottom on this row:** 16px.

### 6.2 Auction Stats Row

A row of key metrics below the bid/time row.

**Layout:** Flex, gap 20px.
**Padding-top:** 12px.
**Border-top:** 1px solid `--border`.
**Margin-bottom:** 16px.

Each stat:
- Flex row, align center, gap 5px.
- Icon: 14x14px, stroke `--text-tertiary`, stroke-width 2.
- Text: 12px, DM Sans, `--text-secondary`.

Stats to display (in order):
1. Heart icon + "[N] bids"
2. Eye icon + "[N] watching"
3. People icon + "[N] unique bidders"

**Backend note:** If bid count or watcher count are not yet available, hide the respective stat. Do not show "0 bids" or "0 watching". Show the stat only when the value is >= 1.

### 6.3 Bid Input Row

**Layout:** Flex row, gap 8px.

**Input field:**
- Flex: 1 (fills remaining space).
- Background: `--bg`.
- Border: 1.5px solid `--border-light`.
- Border-radius: `--radius-md` (10px).
- Padding: 12px 14px.
- Font: Sora, `--text-lg` (18px), weight 600, `--text-primary`, tabular-nums.
- Placeholder: "Your bid...", DM Sans, `--text-sm`, weight 400, `--text-tertiary`.
- Focus state: border-color `--green-400`.
- Pre-filled with the minimum next bid amount.

**Bid button:**
- Font: DM Sans, `--text-sm` (13px), weight 600.
- Background: `--green-400`.
- Color: `--white`.
- Padding: 12px 24px.
- Border-radius: `--radius-md` (10px).
- White-space: nowrap.
- Text: "Bid".

### 6.4 Bid Note

- Margin-top: 8px.
- Font: DM Sans, 11px, `--text-tertiary`.
- Format: "Minimum next bid: [amount] · Bid increments: [amount]".

### 6.5 Buy Now Variant

When the item is a fixed-price listing (not an auction), the auction block is replaced with a simplified version:

- Same card container styles.
- Single price display: label "PRICE", value in Sora `--text-2xl`.
- No time remaining, no stats row, no bid input.
- Full-width button: "Buy Now", DM Sans, `--text-base` (15px), weight 600, background `--green-900`, color `--green-300`, padding 14px, border-radius `--radius-md`.
- Note: "Secure checkout via Vipps", 11px, `--text-tertiary`.

---

## 7. Seller Card

Seller identity and trust signals.

**Margin:** 12px top, 16px horizontal.
**Background:** `--bg-card`.
**Border:** 1px solid `--border`.
**Border-radius:** `--radius-lg` (16px).
**Padding:** 16px.

### 7.1 Layout

Flex row, align center, gap 12px.

### 7.2 Seller Avatar

- Size: 44x44px.
- Border-radius: 50%.
- Background: `--bg-raised`.
- Border: 1px solid `--border`.
- Content: User photo or emoji/initials placeholder.

### 7.3 Seller Info (Center)

- Flex: 1.
- **Name row:** 14px, DM Sans, weight 600, `--text-primary`. Flex row with gap 6px.
  - Verified badge (inline): 16x16px circle, background `--sage` (#5A7A52), centered checkmark icon 9x9px, white stroke.
  - The verified badge appears here only if the seller is BankID-verified.
- **Stats line:** 12px, DM Sans, `--text-secondary`, margin-top 2px.
  - Format: "★ [rating] · [N] sales · Since [year]"
  - Items separated by 8px margin-right on each span.

### 7.4 Follow Button (Right)

- Flex-shrink: 0.
- Font: DM Sans, 12px, weight 600.
- Background: `--bg`.
- Color: `--text-primary`.
- Border: 1.5px solid `--border-light`.
- Padding: 8px 16px.
- Border-radius: 100px.
- Text: "Follow" (default) or "Following" (active state, background `--green-900`, color `--green-300`, border-color `--green-900`).

---

## 8. Shirt Details Grid

Structured data about the shirt in a scannable grid.

**Padding:** 20px top, 16px horizontal.

### 8.1 Section Title

- Font: Sora, `--text-lg` (18px), weight 600, letter-spacing -0.01em.
- Color: `--text-primary`.
- Margin-bottom: 14px.
- Text: "Shirt Details".

### 8.2 Grid

- Display: grid.
- Grid-template-columns: 1fr 1fr.
- Gap: 1px (creates thin divider lines between cells).
- Background: `--border` (the gap background becomes the divider).
- Border-radius: `--radius-md` (10px).
- Overflow: hidden.

### 8.3 Individual Cell

- Background: `--bg-card`.
- Padding: 14px 16px.
- **Label:** 11px, DM Sans, weight 500, `--text-tertiary`, uppercase, letter-spacing 0.06em, margin-bottom 3px.
- **Value:** 14px, DM Sans, weight 500, `--text-primary`.

### 8.4 Fields (in order, 2 per row)

| Row | Left Cell | Right Cell |
|-----|-----------|------------|
| 1 | Team | Season |
| 2 | Player | Size |
| 3 | Type (Home/Away/Third) | Condition |
| 4 | Brand | Authenticity (Original/Replica) |

**Backend note:** If a field has no data (e.g. no player name), the cell still renders with value "N/A" in `--text-tertiary`. Do not collapse the grid. All 8 cells are always present.

---

## 9. Verification Section

This is the only place in the entire product where sage green appears. It is a distinct visual zone that communicates authentication and trust.

**Padding:** 20px top, 16px horizontal.

### 9.1 Container

- Background: `--sage-900` (#1A2E15). This is a very dark green, almost black with a green tint.
- Border: 1px solid rgba(90, 122, 82, 0.25).
- Border-radius: `--radius-lg` (16px).
- Padding: 18px.

### 9.2 Header

Flex row, align center, gap 10px, margin-bottom 12px.

- **Icon circle:** 36x36px, border-radius 50%, background `--sage` (#5A7A52). Centered shield icon, 18x18px, white stroke.
- **Title:** Sora, 15px, weight 600, `--text-primary`, letter-spacing -0.01em. Text: "Verified Authentic".
- **Subtitle:** 12px, DM Sans, `--green-300`. Text: "Passed all checks".

### 9.3 Verification Steps

Flex column, gap 10px.

Each step:
- Flex row, align flex-start, gap 10px.
- **Dot:** 20x20px circle, background rgba(90, 122, 82, 0.3), centered checkmark icon 10x10px, `--green-300` stroke, stroke-width 3. Flex-shrink 0, margin-top 1px.
- **Text:** 13px, DM Sans, `--text-secondary`, line-height 1.4.

### 9.4 Verification Steps Content

Step 1 (AI):
> "AI analysis confirmed as genuine [year] [team] [brand] [type] shirt based on label, stitching, and print patterns."

Step 2 (Expert):
> "Expert review by Oase authentication team. Reviewed photos and confirmed AI assessment."

Step 3 (Seller):
> "Seller verified via BankID. Identity confirmed, [N] previous sales with [rating] rating."

**Backend note:** If AI or expert verification has not been completed for this item, show the step with a hollow circle (no checkmark, border 1.5px solid rgba(90,122,82,0.3), no fill) and text: "Pending review." If the seller is not BankID-verified, show: "Seller identity not yet verified" with the hollow circle.

---

## 10. Description

Seller-written free-text description of the shirt.

**Padding:** 20px top, 16px horizontal.

### 10.1 Section Title

Same style as Shirt Details title (Section 8.1). Text: "Description".

### 10.2 Description Text

- Font: DM Sans, `--text-sm` (13px).
- Color: `--text-secondary`.
- Line-height: 1.65.
- White-space: pre-wrap (preserves line breaks from seller input).

**Backend note:** This section is optional. If the seller did not write a description, hide the entire section (both title and text). Do not show an empty section or placeholder text.

---

## 11. Bid History

Chronological list of bids placed on this item.

**Padding:** 20px top, 16px horizontal.

### 11.1 Section Title

Same style as previous section titles. Text: "Bid History".

### 11.2 Bid List

No outer container or card. Items render directly on page background.

Each bid item:
- Flex row, align center, gap 10px.
- Padding: 10px 0 (vertical only).
- Border-bottom: 1px solid `--border`.
- Last item: no border-bottom.

**Avatar:** 28x28px circle, background `--bg-card`, border 1px solid `--border`, centered emoji/initials, font-size 13px.

**Info (center):**
- Flex: 1.
- **Name:** 13px, DM Sans, weight 600, `--text-primary`.
- **Time:** 11px, DM Sans, `--text-tertiary`. Format: "[N] min ago", "[N]h ago", "[N]d ago".

**Amount (right):**
- Font: Sora, 14px, weight 700, tabular-nums.
- Color: `--text-primary` for all bids except the current highest.
- Current highest bid: color `--green-400`.
- Text-align: right.

### 11.3 Display Rules

- Show the 5 most recent bids by default.
- If more than 5 bids exist, show a "Show all [N] bids" link below the list: 13px, DM Sans, weight 500, `--green-400`, padding 10px 0.
- If no bids yet (new auction), hide the entire Bid History section.

---

## 12. Similar Items

Horizontal scroll of related shirts.

**Padding:** 20px top on the section, 0 horizontal (the scroll handles its own padding).

### 12.1 Section Header

- Flex row, space-between, align baseline.
- Padding: 0 20px 12px.
- Title: Sora, `--text-lg`, weight 600, letter-spacing -0.01em. Text: "Similar Shirts".
- Link: `--text-xs`, `--green-400`, weight 500, no underline. Text: "See all".

### 12.2 Scroll Container

- Flex row, gap 10px.
- Padding: 0 16px 20px.
- Overflow-x: auto.
- Scrollbar: hidden.

### 12.3 Similar Item Card

- Flex: 0 0 140px (fixed width, no shrink).
- Background: `--bg-card`.
- Border-radius: `--radius-md` (10px).
- Border: 1px solid `--border`.
- Overflow: hidden.

**Image area:**
- Width: 100%, aspect-ratio 1:1.
- Background: color-matched gradient (same system as marketplace cards).
- Time pill: same as marketplace cards (9px, weight 600, dark pill, bottom 5px left 5px, padding 2px 6px).

**Body:**
- Padding: 8px 10px 10px.
- Team: Sora, 11px, weight 600, letter-spacing -0.01em, `--text-primary`.
- Detail: 9px, DM Sans, `--text-tertiary`, margin-top 1px.
- Price: Sora, 12px, weight 700, tabular-nums, `--text-primary`, margin-top 5px.
- Bids/Buy Now: 9px, DM Sans, weight 500, `--green-400` (for bids) or `--green-300` (for buy now), margin-top 1px.

### 12.4 Similarity Logic

**Backend note:** "Similar" should be determined by matching (in priority order): same team, same era/decade, same league, same brand. Show 6-10 items in the scroll. If fewer than 3 similar items exist, hide the entire section.

---

## 13. Sticky Bottom Bar

Fixed CTA bar at the bottom of the viewport. Always visible while scrolling.

**Position:** sticky, bottom 0.
**Background:** `--bg-raised` (#1A1B19).
**Backdrop-filter:** blur(12px) (for slight transparency effect on scroll).
**Border-top:** 1px solid `--border`.
**Padding:** 12px 16px 28px (extra bottom padding for mobile safe area / home indicator).
**Z-index:** 100.

### 13.1 Layout

Flex row, align center, gap 12px.

### 13.2 Price (Left)

- Flex: 1.
- **Label:** 10px, DM Sans, `--text-tertiary`, uppercase, letter-spacing 0.06em. Text: "Current bid" (for auctions) or "Price" (for buy now).
- **Amount:** Sora, `--text-xl` (22px), weight 700, `--text-primary`, tabular-nums, letter-spacing -0.01em.

### 13.3 Bid Button (Right)

- Font: DM Sans, `--text-base` (15px), weight 600.
- Background: `--green-400`.
- Color: `--white`.
- Padding: 14px 32px.
- Border-radius: `--radius-md` (10px).
- Text: "Place Bid" (for auctions) or "Buy Now" (for fixed price).
- This button scrolls the page up to the auction block and focuses the bid input field on tap.

### 13.4 Buy Now Variant

When the item is a fixed-price listing:
- Label: "Price".
- Button text: "Buy Now".
- Button background: `--green-400` (same as bid button, not the soft variant).

### 13.5 Sold State

When the auction has ended or the item has been purchased:
- Price label: "Sold for".
- Price amount: final price, color `--text-secondary` (dimmed).
- Button: disabled, background `--bg-card`, color `--text-tertiary`, text "Sold". No cursor pointer.

---

## 14. States and Edge Cases

### 14.1 Auction Not Started

If the auction has a future start time:
- Auction block shows "Starting bid" instead of "Current bid".
- Time section shows "Starts in [countdown]" with start date below.
- Bid input is disabled (grayed out), placeholder: "Bidding opens [date]".
- Sticky bar button: disabled, text "Not Yet Open".

### 14.2 Auction Ended (Item Sold)

- Hero image: no visual change.
- Title block: no change.
- Auction block: "FINAL PRICE" label, winning bid amount, "Auction ended [date/time]". No bid input. Stats still visible.
- A banner below the auction block: background `--red-900` (#2A1210), border 1px solid rgba(204,68,51,0.2), border-radius `--radius-lg`, padding 14px 16px. Text: "This auction has ended. [winner_username] won with a bid of [amount]." 13px, DM Sans, `--text-secondary`. Winner name in `--text-primary`, weight 600.
- Sticky bar: sold state (see 13.5).
- Bid history: full history visible, winner's final bid highlighted green.
- Similar items: still shown (redirect the user to other options).

### 14.3 User is the Current High Bidder

- Auction block: a small indicator below the bid value. Text: "You are the highest bidder", 12px, DM Sans, `--green-400`, weight 500.
- Bid input placeholder changes to: "Raise your bid..."
- Sticky bar: price label changes to "Your bid (highest)".

### 14.4 User Has Been Outbid

- Auction block: indicator text changes to "You have been outbid", 12px, DM Sans, `--red-300`, weight 500.
- Bid input is pre-filled with the minimum next bid.
- Sticky bar: price label shows "Current bid" with amount in `--red-300` to draw attention.

### 14.5 User is the Seller

- Auction block: no bid input. Instead, show an "Edit Listing" button (DM Sans, 13px, weight 600, background `--bg`, border 1.5px solid `--border-light`, border-radius `--radius-md`, padding 12px 24px, full width).
- Sticky bar: hidden.
- Seller card: hidden (you don't need to see your own seller card).

### 14.6 No Images

If the seller uploaded no images (should not happen with AI-assisted listing, but as a fallback):
- Hero area shows a placeholder: `--bg-card` background, centered shirt emoji at 64px, and text "No photos available" in 13px `--text-tertiary` below.
- Dot indicators: hidden.

---

## 15. Scroll Behavior and Performance

- The page is a single vertical scroll. No nested scroll areas except the similar items horizontal scroll.
- The sticky bottom bar uses `position: sticky; bottom: 0` so it naturally sits at the bottom during scroll.
- Images in the carousel should lazy-load. Only the first image loads immediately. Subsequent images load as the user swipes.
- Similar items images lazy-load as the section comes into view (intersection observer).
- The bid history section renders a maximum of 5 items initially. "Show all" loads the rest dynamically.

---

## 16. Accessibility Notes

- Hero image carousel: use `role="region"` with `aria-label="Shirt photos"`. Each image has alt text: "[Team] [season] [type] shirt, [view description]" e.g. "Netherlands 1988 home shirt, front view."
- Bid input: `aria-label="Enter your bid amount"`, `inputmode="numeric"`.
- Bid button: `aria-label="Place bid of [amount]"`.
- Verification steps: use an ordered list (`<ol>`) semantically.
- Bid history: use a definition list or table with appropriate headers.
- Sticky bar: `role="complementary"` with `aria-label="Bid actions"`.
- All interactive elements meet 44x44px minimum touch target.
- Color contrast ratios are inherited from the parent design system spec (all pass WCAG AA).

---

## 17. CSS Custom Properties (Page-Specific Additions)

These extend the base design system tokens for the detail page:

```css
/* Verification section */
--sage:         #5A7A52;
--sage-900:     #1A2E15;

/* Sold/ended state */
--red-900:      #2A1210;
```

All other tokens are inherited from the parent design system spec (Section 18).

---

## 18. Component Measurements Summary

| Component | Width | Height | Radius | Border | Padding |
|-----------|-------|--------|--------|--------|---------|
| Detail nav | 100% | auto | none | none | 8px 16px 10px |
| Hero image | 100% | auto (4:3) | 0 | none | none |
| Dot indicator (inactive) | 6px | 6px | 50% | none | none |
| Dot indicator (active) | 18px | 6px | 3px | none | none |
| Auction block | viewport - 32px | auto | 16px | 1px `--border` | 20px |
| Bid input | flex: 1 | auto | 10px | 1.5px `--border-light` | 12px 14px |
| Bid button (inline) | auto | auto | 10px | none | 12px 24px |
| Seller card | viewport - 32px | auto | 16px | 1px `--border` | 16px |
| Seller avatar | 44px | 44px | 50% | 1px `--border` | none |
| Seller follow btn | auto | auto | 100px | 1.5px `--border-light` | 8px 16px |
| Details grid | viewport - 32px | auto | 10px | 1px gap (border bg) | cells: 14px 16px |
| Verify container | viewport - 32px | auto | 16px | 1px sage border | 18px |
| Verify icon | 36px | 36px | 50% | none | none |
| Verify step dot | 20px | 20px | 50% | none | none |
| Bid history avatar | 28px | 28px | 50% | 1px `--border` | none |
| Similar item card | 140px | auto | 10px | 1px `--border` | body: 8px 10px 10px |
| Sticky bar | 100% | auto | 0 | top 1px `--border` | 12px 16px 28px |
| Sticky bid button | auto | auto | 10px | none | 14px 32px |

---

## 19. Data Requirements

Fields needed from the backend to render this page. Marked as required or optional.

### 19.1 Item Data

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Unique item identifier |
| title | string | yes | Display title, e.g. "Netherlands Home '88" |
| images | array of URLs | yes | At least 1 image. Ordered: front first. |
| team | string | yes | |
| season | string | yes | |
| player_name | string | optional | Include shirt number if available |
| size | string | yes | |
| condition | string | yes | Enum: Mint, Excellent, Very Good, Good, Fair |
| type | string | yes | Enum: Home, Away, Third, Training, Special |
| brand | string | optional | e.g. "adidas", "Nike" |
| authenticity | string | optional | Enum: Original, Replica |
| description | string | optional | Seller-written free text |
| listing_type | string | yes | Enum: auction, fixed_price |

### 19.2 Auction Data (when listing_type = "auction")

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| current_bid | number | yes | 0 if no bids yet |
| starting_bid | number | yes | |
| bid_increment | number | yes | Minimum step between bids |
| bid_count | number | yes | |
| unique_bidder_count | number | optional | |
| watcher_count | number | optional | |
| end_time | ISO datetime | yes | |
| start_time | ISO datetime | yes | |
| status | string | yes | Enum: upcoming, active, ended |
| winner_username | string | optional | Set when status = ended |

### 19.3 Fixed Price Data (when listing_type = "fixed_price")

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| price | number | yes | |
| status | string | yes | Enum: available, sold |

### 19.4 Seller Data

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| username | string | yes | |
| avatar_url | string | optional | Falls back to initials |
| rating | number | optional | 1.0 to 5.0 |
| sale_count | number | optional | |
| member_since | year (number) | optional | |
| is_bankid_verified | boolean | yes | |
| is_followed_by_current_user | boolean | yes | For follow button state |

### 19.5 Verification Data

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| ai_verified | boolean | yes | |
| ai_verification_summary | string | optional | Human-readable AI result |
| expert_verified | boolean | yes | |
| expert_verification_summary | string | optional | |
| seller_bankid_verified | boolean | yes | Mirrors seller data |

### 19.6 Bid History

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| bids | array | yes | Can be empty array |
| bids[].username | string | yes | |
| bids[].avatar_url | string | optional | |
| bids[].amount | number | yes | |
| bids[].timestamp | ISO datetime | yes | |
| bids[].is_current_user | boolean | yes | For highlighting |

### 19.7 Similar Items

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| similar_items | array | optional | Array of item summary objects |
| similar_items[].id | string | yes | |
| similar_items[].title | string | yes | Short title for card |
| similar_items[].team | string | yes | |
| similar_items[].detail | string | yes | e.g. "Bergkamp · Size M" |
| similar_items[].image_url | string | optional | First image |
| similar_items[].price | number | yes | Current bid or fixed price |
| similar_items[].bid_count | number | optional | |
| similar_items[].time_remaining | string | optional | Formatted, e.g. "4h 12m" |
| similar_items[].listing_type | string | yes | auction or fixed_price |

### 19.8 Current User Context

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| is_authenticated | boolean | yes | |
| is_seller | boolean | yes | True if current user owns this listing |
| is_highest_bidder | boolean | yes | |
| is_outbid | boolean | yes | True if user previously bid but is no longer highest |
| has_bookmarked | boolean | yes | For bookmark icon state |
