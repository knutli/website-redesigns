import { useEffect, useState } from 'react';

export default function MobileNav({ sections }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setOpen((v) => !v);
    window.addEventListener('toggle-mobile-nav', toggle);
    return () => window.removeEventListener('toggle-mobile-nav', toggle);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
  }, [open]);

  const close = () => setOpen(false);

  if (!open) return null;

  return (
    <div className="mobile-nav open" role="dialog" aria-modal="true" aria-label="Meny">
      <button className="mobile-nav__close" onClick={close} aria-label="Lukk meny">×</button>
      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} onClick={close}>
              <span className="num">{s.numeral}</span>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
