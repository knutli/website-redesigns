import { useState, useMemo, useEffect, useCallback } from 'react';

/* ---------------- badges ---------------- */

const AVAILABILITY = {
  original: { label: 'Original tilgjengelig', className: 'badge--original' },
  digital:  { label: 'Kun digitaltrykk',       className: 'badge--digital' },
  sold:     { label: 'Utsolgt',                className: 'badge--sold' },
  wip:      { label: 'Under arbeid',           className: 'badge--wip' },
};

/* ---------------- card ---------------- */

function WorkCard({ work, onOpen, index }) {
  const av = AVAILABILITY[work.availability] || AVAILABILITY.digital;
  const loading = index < 6 ? 'eager' : 'lazy';
  return (
    <button className="card" onClick={() => onOpen(work)} aria-label={`Åpne verk: ${work.title}`}>
      <div className="card__media">
        {work.featured && <span className="card__featured">Fremhevet</span>}
        <img
          src={work.image}
          alt={work.imageAlt || work.title}
          loading={loading}
          decoding="async"
        />
        <div className="card__overlay">
          <div className="card__overlay-inner">
            <em>{work.title}</em>
            {[work.technique, work.dimensions, work.year].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>
      <div className="card__caption">
        <h3 className="card__title">{work.title}</h3>
        {work.year && <span className="card__year">{work.year}</span>}
        <div className="card__badges">
          <span className={`badge ${av.className}`}>{av.label}</span>
        </div>
      </div>
    </button>
  );
}

/* ---------------- lightbox ---------------- */

function Lightbox({ work, worksInView, onClose, onNav }) {
  const av = AVAILABILITY[work.availability] || AVAILABILITY.digital;

  const index = worksInView.findIndex((w) => w.slug === work.slug);
  const num = String(index + 1).padStart(3, '0');
  const total = String(worksInView.length).padStart(3, '0');

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  onNav(-1);
      if (e.key === 'ArrowRight') onNav(1);
    };
    document.addEventListener('keydown', handler);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.classList.remove('no-scroll');
    };
  }, [onClose, onNav]);

  const cta =
    work.availability === 'original' ? { href: '#kontakt', label: 'Ta kontakt for pris og tilgjengelighet' } :
    work.availability === 'digital'  ? { href: '#kjop',    label: 'Se kjøpsmuligheter' } :
    work.availability === 'wip'      ? { href: '#kontakt', label: 'Ta kontakt for oppdateringer' } :
    null;

  return (
    <div className="lightbox" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true">
      <button className="lightbox__nav lightbox__prev" onClick={() => onNav(-1)} aria-label="Forrige">‹</button>
      <button className="lightbox__nav lightbox__next" onClick={() => onNav(1)}  aria-label="Neste">›</button>

      <div className="lightbox__panel">
        <button className="lightbox__close" onClick={onClose} aria-label="Lukk">×</button>
        <div className="lightbox__image-wrap">
          <img src={work.image} alt={work.imageAlt || work.title} />
        </div>
        <div className="lightbox__info">
          <div className="lightbox__num">№ {num} / {total}</div>
          <h3 className="lightbox__title">{work.title}</h3>

          <dl className="lightbox__meta">
            {work.technique && (<><dt>Teknikk</dt><dd>{work.technique}</dd></>)}
            {work.dimensions && (<><dt>Format</dt><dd>{work.dimensions}</dd></>)}
            {work.year && (<><dt>År</dt><dd>{work.year}</dd></>)}
            <dt>Status</dt><dd><span className={`badge ${av.className}`}>{av.label}</span></dd>
            {work.price && (<><dt>Pris</dt><dd>{work.price}</dd></>)}
          </dl>

          {cta ? (
            <a className="lightbox__cta" href={cta.href} onClick={onClose}>{cta.label}</a>
          ) : (
            <div className="lightbox__cta lightbox__cta--muted">Ikke tilgjengelig</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- technique tag parser ---------------- */

// Splits compound technique strings into normalized tags.
// "Linosnitt/elementtrykk (særtrykk)" → ["Linosnitt", "Elementtrykk", "Særtrykk"]
// "Koldnål/etsning (håndkolorert)" → ["Koldnål", "Etsning", "Håndkolorert"]
// "Serigrafi (1981)" → ["Serigrafi"]
function parseTechniqueTags(raw) {
  if (!raw) return [];
  let str = raw;
  const parens = [];
  str = str.replace(/\(([^)]+)\)/g, (_, inner) => {
    if (/^\d{4}$/.test(inner.trim())) return '';
    parens.push(inner.trim());
    return '';
  });
  // Split on /
  const parts = [...str.split('/'), ...parens]
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s+TRIPTYK$/i, '').trim())
    .filter(Boolean);
  // Further split "Håndkolorert X" into ["Håndkolorert", "X"]
  const expanded = [];
  for (const part of parts) {
    const hMatch = part.match(/^(håndkolorert)\s+(.+)$/i);
    if (hMatch) {
      expanded.push(hMatch[1]);
      expanded.push(hMatch[2]);
    } else {
      expanded.push(part);
    }
  }
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const seen = new Set();
  return expanded
    .map((s) => s.trim())
    .filter(Boolean)
    .map(capitalize)
    .filter((t) => { if (seen.has(t)) return false; seen.add(t); return true; });
}

// Check if a work matches a technique tag (inclusive — any of its tags matching counts)
function workMatchesTechnique(work, tag) {
  if (!work.technique) return false;
  const tags = parseTechniqueTags(work.technique);
  return tags.includes(tag);
}

/* ---------------- filter chips ---------------- */

function FilterChips({ works, filters, setFilters }) {
  // Extract unique availability values with counts
  const availabilities = useMemo(() => {
    const counts = {};
    works.forEach((w) => {
      const key = w.availability || 'digital';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => ({
        key,
        label: AVAILABILITY[key]?.label || key,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [works]);

  // Extract technique tags — split compound techniques into individual tags
  // e.g. "Linosnitt/elementtrykk (særtrykk)" → ["Linosnitt", "Elementtrykk", "Særtrykk"]
  const techniques = useMemo(() => {
    const counts = {};
    works.forEach((w) => {
      if (!w.technique) return;
      const tags = parseTechniqueTags(w.technique);
      tags.forEach((tag) => { counts[tag] = (counts[tag] || 0) + 1; });
    });
    return Object.entries(counts)
      .filter(([, count]) => count >= 2)
      .map(([key, count]) => ({ key, label: key, count }))
      .sort((a, b) => b.count - a.count);
  }, [works]);

  const hasActiveFilter = filters.availability || filters.techniques.length > 0;

  const toggleTechnique = (key) => {
    setFilters((f) => {
      const set = new Set(f.techniques);
      if (set.has(key)) set.delete(key); else set.add(key);
      return { ...f, techniques: [...set] };
    });
  };

  return (
    <div className="filters">
      <div className="filter-group">
        <span className="filter-group__label">Status</span>
        <div className="chips">
          <button
            className="chip"
            data-active={!hasActiveFilter}
            onClick={() => setFilters({ availability: null, techniques: [] })}
          >
            Alle <small>{works.length}</small>
          </button>
          {availabilities.map((a) => (
            <button
              key={a.key}
              className="chip"
              data-active={filters.availability === a.key}
              onClick={() => setFilters((f) => ({
                ...f,
                availability: f.availability === a.key ? null : a.key,
              }))}
            >
              {a.label} <small>{a.count}</small>
            </button>
          ))}
        </div>
      </div>
      {techniques.length > 0 && (
        <div className="filter-group">
          <span className="filter-group__label">Teknikk</span>
          <div className="chips">
            {techniques.map((t) => (
              <button
                key={t.key}
                className="chip"
                data-active={filters.techniques.includes(t.key)}
                onClick={() => toggleTechnique(t.key)}
              >
                {t.label} <small>{t.count}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- one gallery section ---------------- */

function SectionGrid({
  sectionId,
  numeral,
  label,
  subtitle,
  works,
  searchQuery,
  onOpen,
  initialLimit,
  filters,
  setFilters,
}) {
  const [expanded, setExpanded] = useState(false);

  const showFilters = sectionId === 'verker';

  const filtered = useMemo(() => {
    let result = works;
    if (showFilters && filters.availability) {
      result = result.filter((w) => w.availability === filters.availability);
    }
    if (showFilters && filters.techniques.length > 0) {
      result = result.filter((w) => {
        const tags = parseTechniqueTags(w.technique);
        return filters.techniques.every((t) => tags.includes(t));
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((w) =>
        (w.title || '').toLowerCase().includes(q) ||
        (w.technique || '').toLowerCase().includes(q) ||
        String(w.year || '').includes(q)
      );
    }
    return result;
  }, [works, searchQuery, filters, showFilters]);

  const hasActiveFilter = showFilters && (filters.availability || filters.techniques.length > 0);
  const shouldCollapse = initialLimit && !expanded && !searchQuery && !hasActiveFilter;
  const allDisplayed = shouldCollapse ? filtered.slice(0, initialLimit) : filtered;

  if (searchQuery && filtered.length === 0) {
    return null;
  }

  return (
    <section id={sectionId} className="section">
      <div className="container">
        <header className="section__head">
          <div className="section__numeral">{numeral}</div>
          <div className="section__titleblock">
            <h2>{label}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="section__count">
            {filtered.length !== works.length
              ? `${filtered.length} av ${works.length} verk`
              : `${works.length} verk`}
          </div>
        </header>

        {showFilters && (
          <FilterChips works={works} filters={filters} setFilters={setFilters} />
        )}

        {allDisplayed.length === 0 ? (
          <p style={{ color: 'var(--ink-mute)', fontStyle: 'italic' }}>
            Ingen verk å vise{searchQuery ? ' for dette søket' : ' med dette filteret'}.
          </p>
        ) : (
          <div className="work-grid">
            {allDisplayed.map((w, i) => (
              <WorkCard
                key={w.slug}
                work={w}
                onOpen={(work) => onOpen(work, sectionId)}
                index={i}
              />
            ))}
          </div>
        )}

        {shouldCollapse && filtered.length > initialLimit && (
          <div className="show-more">
            <button onClick={() => setExpanded(true)}>
              Vis alle {filtered.length} verk →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- root ---------------- */

export default function Gallery({ works, sections }) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filters, setFilters] = useState({ availability: null, techniques: [] });

  // lightbox state
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  // Build per-section works. Verker is shuffled; aktuelt sorted by sortOrder/year.
  const bySection = useMemo(() => {
    const groups = { aktuelt: [], verker: [] };
    works.forEach((w) => {
      const sec = w.section === 'arkiv' ? 'verker' : w.section;
      if (groups[sec]) groups[sec].push(w);
    });
    groups.aktuelt.sort((a, b) => {
      if ((b.sortOrder ?? 0) !== (a.sortOrder ?? 0)) return (b.sortOrder ?? 0) - (a.sortOrder ?? 0);
      return (b.year ?? 0) - (a.year ?? 0);
    });
    // Shuffle verker (Fisher-Yates)
    const arr = groups.verker;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return groups;
  }, [works]);

  const sectionsConfig = sections.filter((s) => ['aktuelt', 'verker', 'arkiv'].includes(s.id));

  const handleOpen = (work, sectionId) => setLightbox({ work, sectionId });
  const handleClose = () => setLightbox(null);

  // Works in lightbox view respect both search and filters
  const worksInLightboxView = useMemo(() => {
    if (!lightbox) return [];
    let result = bySection[lightbox.sectionId] || [];
    if (lightbox.sectionId === 'verker') {
      if (filters.availability) result = result.filter((w) => w.availability === filters.availability);
      if (filters.techniques.length > 0) {
        result = result.filter((w) => {
          const tags = parseTechniqueTags(w.technique);
          return filters.techniques.every((t) => tags.includes(t));
        });
      }
    }
    if (debounced) {
      const q = debounced.toLowerCase();
      result = result.filter((w) =>
        (w.title || '').toLowerCase().includes(q) ||
        (w.technique || '').toLowerCase().includes(q) ||
        String(w.year || '').includes(q)
      );
    }
    return result;
  }, [lightbox, bySection, debounced, filters]);

  const handleNav = useCallback((dir) => {
    if (!lightbox || worksInLightboxView.length === 0) return;
    const idx = worksInLightboxView.findIndex((w) => w.slug === lightbox.work.slug);
    const next = (idx + dir + worksInLightboxView.length) % worksInLightboxView.length;
    setLightbox({ work: worksInLightboxView[next], sectionId: lightbox.sectionId });
  }, [lightbox, worksInLightboxView]);

  return (
    <>
      <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div className="search">
          <svg className="search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Søk i alle verk: tittel, teknikk, år…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Søk i alle verker"
          />
        </div>
      </div>

      {sectionsConfig.map((s) => (
        <SectionGrid
          key={s.id}
          sectionId={s.id}
          numeral={s.numeral}
          label={s.label}
          subtitle={s.subtitle}
          works={bySection[s.id] || []}
          searchQuery={debounced}
          onOpen={handleOpen}
          initialLimit={s.id === 'arkiv' ? 6 : null}
          filters={filters}
          setFilters={setFilters}
        />
      ))}

      {lightbox && (
        <Lightbox
          work={lightbox.work}
          worksInView={worksInLightboxView}
          onClose={handleClose}
          onNav={handleNav}
        />
      )}
    </>
  );
}
