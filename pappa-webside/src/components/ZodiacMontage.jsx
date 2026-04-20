import { useState, useEffect } from 'react';

const SIGNS = [
  { name: 'Aquarius',    image: '/images/works/aquarius.jpg' },
  { name: 'Aries',       image: '/images/works/aries.jpg' },
  { name: 'Cancer',      image: '/images/works/cancer.jpg' },
  { name: 'Capricorn',   image: '/images/works/capricorn.jpg' },
  { name: 'Gemini',      image: '/images/works/gemini.jpg' },
  { name: 'Leo',         image: '/images/works/leo.jpg' },
  { name: 'Libra',       image: '/images/works/libra.jpg' },
  { name: 'Pisces',      image: '/images/works/pisces.jpg' },
  { name: 'Sagittarius', image: '/images/works/sagittarius.jpg' },
  { name: 'Scorpio',     image: '/images/works/scorpio.jpg' },
  { name: 'Taurus',      image: '/images/works/taurus.jpg' },
  { name: 'Virgo',       image: '/images/works/virgo.jpg' },
];

// Each card gets a random-ish but deterministic layout position
const LAYOUTS = SIGNS.map((_, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  return {
    x: col * 25 + (row % 2 ? 6 : -2) + Math.sin(i * 2.3) * 4,
    y: row * 33 + Math.cos(i * 1.7) * 5,
    rotation: Math.sin(i * 3.1) * 18,
    scale: 0.85 + Math.abs(Math.sin(i * 1.9)) * 0.25,
    delay: i * 0.12,
  };
});

export default function ZodiacMontage() {
  const [active, setActive] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-cycle through signs for a dramatic entrance
  const [spotlight, setSpotlight] = useState(-1);
  useEffect(() => {
    if (!loaded) return;
    let i = 0;
    const interval = setInterval(() => {
      setSpotlight(i);
      i++;
      if (i >= SIGNS.length) {
        clearInterval(interval);
        setTimeout(() => setSpotlight(-1), 800);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [loaded]);

  return (
    <div className="zodiac-montage" onMouseLeave={() => setActive(null)}>
      {/* Glow backdrop */}
      <div className="zodiac-montage__glow" />

      {SIGNS.map((sign, i) => {
        const layout = LAYOUTS[i];
        const isActive = active === i;
        const isSpotlit = spotlight === i;
        const isAnyActive = active !== null;

        return (
          <div
            key={sign.name}
            className={`zodiac-card ${loaded ? 'zodiac-card--in' : ''} ${isActive || isSpotlit ? 'zodiac-card--active' : ''} ${isAnyActive && !isActive ? 'zodiac-card--dimmed' : ''}`}
            style={{
              '--x': `${layout.x}%`,
              '--y': `${layout.y}%`,
              '--r': `${layout.rotation}deg`,
              '--s': layout.scale,
              '--d': `${layout.delay}s`,
              '--hover-r': `${layout.rotation * 0.3}deg`,
            }}
            onMouseEnter={() => setActive(i)}
          >
            <img src={sign.image} alt={sign.name} loading="eager" />
            <span className="zodiac-card__label">{sign.name}</span>
          </div>
        );
      })}

      {/* Floating zodiac symbol */}
      <div className="zodiac-montage__symbol">✦</div>
    </div>
  );
}
