# Trond Knutli Portfolio Site: Production Spec

## Overview

Portfolio website for Trond Knutli, a graphic artist and printmaker based in Bergen, Norway. Active since the late 1970s. The site replaces an existing Squarespace site at trondknutli.no and serves as a showcase of approximately 130 works spanning nearly five decades.

The primary audience skews older (50+), so the site must prioritize clarity, readability, and conventional navigation. No horizontal scrolling, no complex interactions, no infinite scroll. Vertical page, clear sections, large click targets.

The site is Norwegian-only.


## Architecture

### Framework: Astro + React islands

Use Astro as the static site generator. It produces fast, minimal HTML by default and supports React components where interactivity is needed (image grid filtering, lightbox, contact form). This keeps the site simple for content while allowing rich UI where it matters.

### CMS: DecapCMS (formerly Netlify CMS)

DecapCMS provides a browser-based admin UI at /admin where Trond or a photographer can log in and add/edit works without touching code. It commits content as markdown files + images directly to the Git repo, which triggers a rebuild.

Content is stored as markdown files with YAML frontmatter in `src/content/works/`. Each work is one file. Images are stored in `public/images/works/`.

### Hosting: Vercel

Deploy from a GitHub repo. Vercel handles builds, CDN, and the trondknutli.no custom domain. Free tier is sufficient.

### Analytics: Plausible or Umami (self-hosted on Railway)

Lightweight, cookie-free, GDPR-compliant. Track page views and custom events for image clicks and lightbox opens. This lets you see which works get the most attention without any cookie banners or privacy concerns.

Recommendation: Umami self-hosted on Railway (free tier) gives you full control and zero ongoing cost. Alternatively, Plausible Cloud at $9/month if you want zero maintenance.

Custom events to track:
- `work_click` with properties: `title`, `section` (aktuelt/verker/arkiv), `series`
- `lightbox_open` with same properties
- `marketplace_click` with property: `platform` (fineart/etsy/saatchi)
- `contact_form_submit`


## Content Model

### Work (single markdown file per work)

Each file lives at `src/content/works/{slug}.md`:

```yaml
---
title: "Ode til kvinna"
slug: "ode-til-kvinna"
year: 2021
technique: "H.kolorert koldnål særtrykk"
dimensions: "102×144 cm"
section: "aktuelt"           # "aktuelt" | "verker" | "arkiv"
availability: "digital"      # "original" | "digital" | "sold" | "wip"
featured: true               # optional, shows in hero area and gets FREMHEVET badge
series: "klover"             # optional, links to a series
sortOrder: 10                # optional, manual sort within section (lower = first)
image: "/images/works/ode-til-kvinna.jpg"
imageAlt: "Ode til kvinna, håndkolorert koldnål særtrykk"
---
Optional free-text description or notes about the work. Displayed in the lightbox.
```

### Series (defined in a single config file)

`src/content/series.yaml`:

```yaml
- id: stjernetegn
  name: "Stjernetegn-serien"
  description: "Stjernetegn i koldnål."

- id: lemurisk
  name: "Lemuriske landskap"
  description: "Lemurisk landskap-serien."

- id: hester
  name: "Heste-motivene"
  description: ""

- id: klover
  name: "Kløver-serien"
  description: ""

- id: sjoreise
  name: "Sjøreise-motivene"
  description: ""
```

### Site config

`src/content/config.yaml`:

```yaml
artistName: "Trond Knutli"
tagline: "Grafiker og billedkunstner, Bergen"
email: "post@trondknutli.no"
location: "Atelier Nesttun, Bergen"
bio: |
  Trond Knutli er en grafiker og billedkunstner med atelier og verksted i Bergen.
  Han har vært yrkesaktiv siden sent 70-tall, og har en lang rekke utstillinger,
  utsmykninger og innkjøp bak seg.
portraitImage: "/images/portrait.jpg"
marketplaces:
  - name: "Fineart.no"
    url: "https://fineart.no"
    description: "Norges største kunstportal"
  - name: "Etsy"
    url: "https://etsy.com"
    description: "Internasjonal markedsplass"
  - name: "Saatchi Art"
    url: "https://saatchiart.com"
    description: "Internasjonal kunstplattform"
```


## Image Handling

### Upload and processing

Images uploaded via DecapCMS or committed to the repo go into `public/images/works/` as-is. An Astro image pipeline (using `astro:assets` or `@astrojs/image`) generates optimized versions at build time:

- **Thumbnail:** 400px wide, WebP + JPEG fallback, quality 80
- **Grid display:** 800px wide, WebP + JPEG fallback, quality 82
- **Lightbox full:** 1600px wide, WebP + JPEG fallback, quality 85

Aspect ratios are preserved automatically from the source image. No manual ratio field needed (unlike the prototype).

All images get `loading="lazy"` and `decoding="async"` except the first 6 visible on page load.

### Accepted source formats

JPEG, PNG, TIFF, WebP. The build pipeline normalizes everything to WebP with JPEG fallback.


## Page Structure

The site is a single-page layout with defined sections, linked from a sticky header nav. Each section is defined below.

### Header (sticky)

- Artist name: "Trond Knutli" in serif font (Libre Baskerville)
- Subtitle: "GRAFIKER . BILLEDKUNSTNER . BERGEN"
- Nav links: Aktuelt, Verker, Arkiv, Om, Kjøp, Kontakt
- Sticky on scroll with slight backdrop blur
- On mobile: hamburger menu

### Section: Aktuelt

Label: "Aktuelt"
Subtitle: "Nyere arbeider og pågående prosjekter"

Shows all works where `section: "aktuelt"`. These are current, recent, or work-in-progress pieces.

Display: masonry grid, 3 columns on desktop, 2 on tablet, 1 on mobile.

If any works in this section have `featured: true`, show them in a highlighted 4-column row at the very top of this section, before the main grid. These get a gold "FREMHEVET" badge.

Series chips: if works in this section belong to series, show pill-shaped chips above the grid listing each series name and count (e.g. "Stjernetegn-serien (4)"). Clicking a chip filters the grid to that series.

### Section: Verker

Label: "Verker"
Subtitle: "Etablerte verk fra de siste tiårene"

Shows all works where `section: "verker"`. Same masonry grid layout. Same series chips if applicable.

### Section: Arkiv

Label: "Arkiv"
Subtitle: "Tidligere arbeider. Originaler er utsolgt, enkelte tilgjengelig som digitaltrykk."

Shows all works where `section: "arkiv"`. Initially collapsed to show only the first 6 works with a "Vis alle X verk" button to expand. This keeps the page length manageable since the archive could be large.

### Section: Om

Two-column layout (stacks on mobile):
- Left: bio text from config
- Right: portrait image placeholder

### Section: Kjøp

Explanatory paragraph: originals available directly from the artist, digital prints through platforms. Then marketplace cards with links (from config). Each card shows platform name, short description, and links out in a new tab.

### Section: Kontakt

Contact form with fields:
- Navn (name, required)
- E-post (email, required)
- Emne (subject, optional dropdown: "Generell henvendelse", "Kjøp av original", "Digitaltrykk", "Utstilling/utsmykning", "Annet")
- Melding (message, textarea, required)
- Submit button: "Send melding"

The form submits to a serverless function (Vercel function or a service like Formspree/Getform) that sends an email to post@trondknutli.no. The reply-to address is set to the sender's email so Trond can reply directly from his inbox.

Below the form: email address and studio location as plain text.


## Work Card Component

Each work in the grid is a card showing:

1. **Image** with subtle rounded corners (4px)
2. **Hover overlay** (dark gradient from bottom) showing technique, dimensions, year
3. **Always-visible caption below the image:**
   - Title (14px, dark text)
   - Availability badge (color-coded pill)
   - Series tag (if applicable, outlined pill)
4. **Optional "FREMHEVET" badge** in top-left corner of image

Clicking a card opens the lightbox.

### Availability badges

| Value      | Label               | Style                          |
|------------|----------------------|--------------------------------|
| original   | Original tilgjengelig | Green background, dark text   |
| digital    | Kun digitaltrykk     | Blue-grey background           |
| sold       | Utsolgt              | Warm red background            |
| wip        | Under arbeid         | Amber background               |


## Lightbox Component

Triggered by clicking any work card. Shows:

1. Large image (constrained to viewport, maintains aspect ratio)
2. Title (larger serif font)
3. Technique, dimensions, year
4. Availability badge
5. Series membership (if applicable): "Del av: [series name]"
6. Contextual CTA:
   - If `availability: "original"`: "Interessert? Ta kontakt for pris og tilgjengelighet." (links to #kontakt)
   - If `availability: "digital"`: "Tilgjengelig som digitaltrykk. Se kjøpsmuligheter." (links to #kjop)
   - If `availability: "sold"`: no CTA
   - If `availability: "wip"`: "Under arbeid. Ta kontakt for oppdateringer."
7. **Series siblings:** if the work belongs to a series, show small thumbnails of other works in the same series below a "Andre i serien" label. Clicking a sibling swaps the lightbox content.
8. Keyboard: Escape closes. Left/right arrows navigate to prev/next work within the current section.

Close button: top-right X. Clicking outside the content area closes.


## Search

A text input at the top of the page content area. Searches across title, technique, year, and series name. Filters all three sections simultaneously. Debounced, 200ms.

Placeholder text: "Søk i alle verk: tittel, teknikk, år..."


## Visual Design

### Theme: Light mode

- Page background: #f5f2ee (warm off-white)
- Text: #2a2520 (warm near-black)
- Secondary text: #8a847a
- Borders/dividers: #ddd8d0
- Accent (featured badge, links): #8a6a1a (warm dark gold)
- Card backgrounds on hover: subtle lift with box-shadow

### Typography

- Headings: Libre Baskerville (serif), 400 weight
- Body/UI: DM Sans, 300/400/500
- No monospace anywhere

### Spacing

- Section padding: 48px horizontal on desktop, 24px on mobile
- Card gap: 20px in masonry grid
- Section dividers: 1px solid #ddd8d0

### Responsive breakpoints

- Desktop: >= 1024px, 3-column grid
- Tablet: 640-1023px, 2-column grid, stacked nav
- Mobile: < 640px, 1-column grid, hamburger menu, stacked sections


## DecapCMS Admin Setup

Admin UI accessible at /admin. Configuration in `public/admin/config.yml`.

### Authentication

Use Netlify Identity or GitHub OAuth (since the site is on Vercel, GitHub OAuth via a small proxy is simplest). Trond and the photographer each get a login.

### Collections

**Works collection:**
- Folder: `src/content/works`
- Create/edit/delete works
- Fields match the frontmatter schema above
- Image field with media upload to `public/images/works/`
- Dropdown for section, availability, series

**Series collection:**
- File: `src/content/series.yaml`
- List widget for adding/editing series

**Site config:**
- File: `src/content/config.yaml`
- Bio, contact info, marketplace links


## Migration from Squarespace

The existing site at trondknutli.no has approximately 20-25 works visible on the front page. Steps:

1. Export images from Squarespace (via site export or manual download)
2. Extract metadata from Squarespace: title, description, price/availability
3. Create a markdown file per work with correct frontmatter
4. For the remaining ~100 works not currently on Squarespace, Trond or the photographer uploads them via DecapCMS after launch
5. Update DNS for trondknutli.no to point to Vercel


## File Structure

```
/
├── public/
│   ├── admin/
│   │   ├── index.html          # DecapCMS entry point
│   │   └── config.yml          # CMS configuration
│   ├── images/
│   │   ├── works/              # Source images
│   │   └── portrait.jpg
│   └── favicon.ico
├── src/
│   ├── content/
│   │   ├── works/              # One .md file per work
│   │   │   ├── ode-til-kvinna.md
│   │   │   ├── destinasjon-ukjent.md
│   │   │   └── ...
│   │   ├── series.yaml
│   │   └── config.yaml
│   ├── components/             # React components (interactive islands)
│   │   ├── WorkGrid.jsx
│   │   ├── WorkCard.jsx
│   │   ├── Lightbox.jsx
│   │   ├── SearchBar.jsx
│   │   ├── ContactForm.jsx
│   │   └── MobileNav.jsx
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   └── index.astro         # Single-page layout
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
└── README.md
```


## Dependencies

```json
{
  "dependencies": {
    "astro": "^5.x",
    "@astrojs/react": "^4.x",
    "react": "^19.x",
    "react-dom": "^19.x"
  },
  "devDependencies": {
    "decap-cms-app": "^3.x"
  }
}
```

Astro image optimization is built-in (`astro:assets`). No additional image libraries needed.


## Contact Form Backend

Option A (simplest): Use Formspree (formspree.io). Free tier allows 50 submissions/month. Add the Formspree endpoint as the form action. Set reply-to to the sender's email.

Option B: Vercel serverless function at `/api/contact.ts` that uses Resend or Nodemailer to send an email to post@trondknutli.no. More control, but requires an email service account.

Recommendation: Start with Formspree. Migrate to a serverless function later if volume or features demand it.


## Performance Targets

- Lighthouse Performance: >= 95
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Total page weight (initial load, before lazy images): < 500KB
- Image lazy loading for everything below the fold


## Out of Scope

- E-commerce / shopping cart / payment processing
- Multi-language support
- Blog or news section
- User accounts or saved favorites
- Print-on-demand integration
- Social media feeds
