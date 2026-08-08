export const HERO_SLIDES = [
  { id: 'chi', name: 'CHI Nigeria', tag: 'FMCG · Lagos', img: '/hero/chi.webp' },
  { id: 'vfd', name: 'VFD / Vbank', tag: 'Banking', img: '/hero/vfd.webp' },
  { id: 'dash', name: 'Dash MFB', tag: 'Fintech', img: '/hero/esvolt.webp' },
  { id: 'aurora', name: 'Acacia', tag: 'Lifestyle', img: '/hero/aurora.webp' },
  { id: 'prudential', name: 'Prudential Zenith', tag: 'Insurance', img: '/hero/prudential.webp' },
]

export const IMPACT = [
  {
    id: 'followers', value: 10000, suffix: '+', label: 'Followers grown',
    detail: 'We took VFD Bank\u2019s X account from roughly 100 followers to over 10,000 in nine months of brand and social work.',
  },
  {
    id: 'influencers', value: 50, suffix: '', label: 'Nano-influencers coordinated',
    detail: 'One coordinated influencer push — fifty creators briefed, scheduled and managed as a single campaign voice.',
  },
  {
    id: 'brands', value: 9, suffix: '+', label: 'Brands transformed',
    detail: 'From CHI and Prudential Zenith to Dash MFB and Esvolt — identities, campaigns and content that changed how they\u2019re seen.',
  },
  {
    id: 'industries', value: 8, suffix: '', label: 'Industries served',
    detail: 'FMCG, banking, fintech, insurance, energy, lifestyle, logistics, art — the method carries across all of them.',
  },
]

/* The four /hero/*.jpg entries here pointed at a directory that was deleted when
   the hero became a video, so the carousel was rendering four broken frames.
   Repointed at existing work imagery; alts are generic because these are stand-ins
   — swap for the real per-client format shots when they land. */
export const FORMATS = [
  { id: 'vbank',      img: '/format/vbank.webp', alt: 'VFD / Vbank social campaign' },
  { id: 'campaign',   img: '/gallery/01.webp',   alt: 'Campaign film still' },
  { id: 'identity',   img: '/gallery/06.webp',   alt: 'Brand identity applied in print' },
  { id: 'social',     img: '/gallery/09.webp',   alt: 'Social-first content set' },
  { id: 'activation', img: '/gallery/04.webp',   alt: 'Retail activation photography' },
]

export const LOGOS = [
  { name: 'CHI Nigeria',            src: '/logos/chi.webp' },
  { name: 'VFD / Vbank',            src: '/logos/vfd.webp' },
  { name: 'Dash MFB',               src: '/logos/dash.jpg' },
  { name: 'Aurora',                 src: '/logos/aurora.webp' },
  { name: 'Prudential Zenith Life', src: '/logos/prudential.webp' },
  { name: 'ESVolt',                 src: '/logos/esvolt.webp' },
  { name: 'Acacia Solicitors',      src: '/logos/acacia-solicitors.svg' },
]

export const CTA_LOGOS = [
  { src: '/logos/chi.webp',        size: 133, x: 10, y: -4,  rot: -8 },
  { src: '/logos/vfd.webp',        size: 85,  x: 27, y: 42,  rot: 6 },
  { src: '/logos/dash.jpg',        size: 78,  x: 4,  y: 62,  rot: -5 },
  { src: '/logos/aurora.webp',     size: 74,  x: 22, y: 78,  rot: 9 },
  { src: '/logos/prudential.webp', size: 133, x: 78, y: 6,   rot: 7 },
  { src: '/logos/esvolt.webp',     size: 149, x: 86, y: 46,  rot: -6 },
  { src: '/logos/acacia-solicitors.svg', size: 78, x: 70, y: 40, rot: -10 },
  { src: '/logos/chi.webp',        size: 78,  x: 73, y: 76,  rot: 5 },
]



export const TIMELINE = [
  { year: 2019, title: 'One room in Lagos',
    body: 'The Creative Sphere opens with a small team and a single idea: strategy, design and story in one room instead of three agencies.',
    img: '/timeline/2019.webp',
    alt: 'The studio floor in its first year' },
  { year: 2021, title: 'Onto the shelf',
    body: 'CHI Limited puts the work in front of a national audience. Chivita and Capri-Sonne campaigns are shot, cut and shipped in house.',
    img: '/timeline/2021.webp',
    alt: 'A campaign shoot in progress on set' },
  { year: 2023, title: 'Into the app',
    body: 'VFD Microfinance Bank and Dash MFB move the work onto screens, where a brand has to earn trust in the first ten seconds.',
    img: '/timeline/2023.webp',
    alt: 'Interface design being worked through on screen' },
  { year: 2025, title: 'Eight industries in',
    body: 'Insurance, clean energy, logistics, art. The studio moves between sectors now without changing how it works.',
    img: '/timeline/2025.webp',
    alt: 'The studio at work across several projects' },
]


export const SERVICES = [
  { id: 'strategy',  title: 'Brand strategy',     img: '/svc/1.webp' },
  { id: 'identity',  title: 'Identity & design',  img: '/svc/2.webp' },
  { id: 'content',   title: 'Content production', img: '/svc/3.webp' },
  { id: 'social',    title: 'Social media',       img: '/svc/4.webp' },
  { id: 'ads',       title: 'Advertising',        img: '/svc/5.webp' },
  { id: 'analytics', title: 'Analytics & growth', img: '/svc/6.webp' },
]

export const GALLERY = [
  { src: '/gallery/01.webp', alt: 'CHI Nigeria campaign' },
  { src: '/gallery/02.webp', alt: 'The Creative Sphere team' },
  { src: '/gallery/03.webp', alt: 'Chivita retail activation' },
  { src: '/gallery/04.webp', alt: 'Prudential Zenith community' },
  { src: '/gallery/05.webp', alt: 'ESVolt clean energy' },
  { src: '/gallery/06.webp', alt: 'Inside the studio' },
  { src: '/gallery/07.webp', alt: 'VFD / Vbank brand work' },
  { src: '/gallery/08.webp', alt: 'Aurora lifestyle' },
  { src: '/gallery/09.webp', alt: 'Acacia Solicitors identity' },
]

export const EXTRAS = [
  {
    id: 'influencer', title: 'Influencer campaigns',
    body: 'One coordinated push — fifty nano-influencers briefed, scheduled and managed as a single campaign voice, so the message lands the same way whoever is saying it.',
  },
  {
    id: 'community', title: 'Community management',
    body: 'Day-to-day custody of the comment section, the DMs and the replies. We handled community for Prudential Zenith, where tone under pressure is the whole job.',
  },
  {
    id: 'activation', title: 'Retail & experiential activation',
    body: 'Campaign work for CHI Limited — Chivita and Capri-Sonne — took us into national retail activation, turning a brand idea into something people meet in person.',
  },
  {
    id: 'production', title: 'Photography & video production',
    body: 'Shoots planned around the edit and the platform, not the other way round. One production run feeds the campaign film, the cutdowns and the stills.',
  },
  {
    id: 'management', title: 'Brand management',
    body: 'Ongoing custody of a brand once the identity is built — guardrails, asset libraries and the judgement calls that keep it consistent as it grows.',
  },
  {
    id: 'growth', title: 'Social growth & reporting',
    body: 'We took VFD Bank’s X account from roughly 100 followers to over 10,000 in nine months, and reported on what actually moved rather than what looked good.',
  },
]

export const CAPABILITIES = [
  {
    id: 'strategy', title: 'Strategy',
    items: ['Brand positioning', 'Market research', 'Messaging frameworks', 'Campaign planning', 'Content strategy'],
  },
  {
    id: 'design', title: 'Design',
    items: ['Visual identity', 'Logo systems', 'Packaging', 'Brand guidelines', 'Art direction'],
  },
  {
    id: 'content', title: 'Content',
    items: ['Photography', 'Video production', 'Motion graphics', 'Copywriting', 'Social assets'],
  },
  {
    id: 'growth', title: 'Growth',
    items: ['Paid media', 'Influencer marketing', 'Community management', 'Search & discovery', 'Analytics & reporting'],
  },
]


export const APPROACH = [
  {
    id: 'understand', n: '01', title: 'Understand',
    lead: 'We start with the business, not the brief.',
    body: 'Before anything gets designed we learn how you actually make money, who you are really competing with, and what your audience already believes. Most briefs describe a symptom. We go looking for the cause.',
    img: '/approach/01.webp',
  },
  {
    id: 'position', n: '02', title: 'Position',
    lead: 'A brand people can repeat back to you.',
    body: 'Positioning, message and tone, decided together and written down. If your team cannot repeat it in one sentence, neither can your market — so we keep working until it is that short.',
    img: '/approach/02.webp',
  },
  {
    id: 'make', n: '03', title: 'Make',
    lead: 'Six disciplines under one roof.',
    body: 'Identity, content, film, social and advertising built by one team that shares a brief. Nothing gets handed between agencies, so nothing arrives diluted or three weeks late.',
    img: '/approach/03.webp',
  },
  {
    id: 'grow', n: '04', title: 'Grow',
    lead: 'We stay for the part that counts.',
    body: 'The work goes out, we watch what it moves, and we change what is not working. We took one bank from roughly 100 followers to over 10,000 in nine months by staying in the room after launch.',
    img: '/approach/04.webp',
  },
]


export const STATEMENT = {
  eyebrow: 'Who we are',
  body: `We are a Lagos creative studio built the way a brand actually needs one: strategy, design, film and media sitting in the same room, answering to the same brief, judged on the same result.`.split(' '),
  sig: 'The Creative Sphere, Lagos',
}

export const PRINCIPLES = [
  {
    id: 'strategy',
    title: 'Strategy before decoration.',
    line: 'Work that looks good but says nothing is expensive noise.',
  },
  {
    id: 'oneteam',
    title: 'One team, no handoffs.',
    line: 'Six disciplines in one room, so nothing arrives diluted.',
  },
  {
    id: 'local',
    title: 'Nigerian market. International standard.',
    line: 'We build for the room you are actually selling in.',
  },
  {
    id: 'after',
    title: 'We stay past launch.',
    line: 'The work is judged on what it moves, not on the reveal.',
  },
]
