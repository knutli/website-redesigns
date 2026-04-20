# Trond Knutli — portefølje

Astro + React-basert portefølje-nettsted som erstatter den eksisterende
Squarespace-siden på trondknutli.no.

## Lokal utvikling

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # Statisk bygg til ./dist
npm run preview    # Serve ./dist lokalt
```

## Struktur

```
public/
  admin/           DecapCMS admin-grensesnitt (/admin)
  images/works/    Optimerte kildebilder per verk
  images/portrait.jpg
src/
  components/      React islands (Gallery, Lightbox, ContactForm, MobileNav)
  content/
    works/         Ett .md-dokument per verk (frontmatter-schema)
    config.ts      Astro content-collection-skjema
  data/site.ts     Nettstedskonfigurasjon + serieregister
  layouts/         BaseLayout.astro
  pages/index.astro
  styles/global.css
scripts/
  build-content.mjs   Genererer .md-filer + kopierer bilder fra ../images/
```

## Legge til eller redigere verk

Bruk administrasjonsgrensesnittet på `/admin` (krever innlogging via
Netlify Identity eller git-gateway), eller rediger markdown-filene i
`src/content/works/` direkte.

## Deployment

Forventet: Vercel med custom-domene trondknutli.no.
Kontakt-skjemaet er en placeholder — koble til Formspree eller en Vercel
serverless-funksjon som sender e-post til post@trondknutli.no.
