// Site-wide config. In production this could be a yaml file edited via DecapCMS.

export const siteConfig = {
  artistName: 'Trond Knutli',
  tagline: 'Grafiker . Billedkunstner . Bergen',
  email: 'post@trondknutli.no',
  location: 'Atelier Nesttun, Bergen',
  yearsActive: 'Yrkesaktiv siden 1977',
  bio: `Trond Knutli er en grafiker og billedkunstner med atelier og verksted i Bergen. Han har vært yrkesaktiv siden sent 70-tall, og har en lang rekke utstillinger, utsmykninger og innkjøp bak seg.

Arbeidet hans beveger seg mellom koldnål, etsning, litografi og særtrykk. Tematisk spenner verkene fra mytologiske motiver og sjøreiser til portretter, landskap og serier som Stjernetegn, Lemuriske landskap og Kløver-serien.`,
  portraitImage: '/images/portrait.jpg',
  marketplaces: [
    {
      name: 'Fineart.no',
      url: 'https://fineart.no',
      description: 'Norges største kunstportal',
      handle: '01',
    },
    {
      name: 'Saatchi Art',
      url: 'https://saatchiart.com',
      description: 'Internasjonal kunstplattform',
      handle: '02',
    },
  ],
};

export const sections = [
  { id: 'aktuelt', label: 'Aktuelt', numeral: 'I', subtitle: 'Nyere arbeider og pågående prosjekter' },
  { id: 'verker', label: 'Verk', numeral: 'II', subtitle: 'Etablerte verk fra de siste tiårene' },
  { id: 'om', label: 'Om', numeral: 'III', subtitle: 'Kunstneren' },
  { id: 'kjop', label: 'Kjøp', numeral: 'IV', subtitle: 'Originaler og digitaltrykk' },
  { id: 'kontakt', label: 'Kontakt', numeral: 'V', subtitle: 'Ta kontakt med atelieret' },
] as const;
