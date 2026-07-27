# THE CREATIVE SPHERE — CREATIVE DIRECTION V3

## "Galaxies, Not a Journey"

*Supersedes V2 (archived on git branch `archive/ascent-concept`; V2 docs kept for reference). Direction anchored to two visual references chosen by the owner:*

- **daiki-design.com** — the hero: a tilted spiral particle galaxy center-screen, elegant typography overlaid, "click to unleash" scatter interaction, restrained editorial framing.
- **boilerlab.ai** — the structure: dark starfield site with bold central headlines, real readable content per section, bottom section-index navigation, and warp/spacecraft scroll transitions between sections.

**Process rule (non-negotiable): pixels approve paper.** Every screen is prototyped and approved on-screen by the owner before the next is built.

---

## The Experience

### 1. Loader
Black. Company logo/wordmark centered. The dust swirl orbits it while assets load. Load complete → the swirl releases outward into the hero. No progress bar ever.

### 2. Hero — the Galaxy
- Tilted spiral galaxy of particles, center screen: molten-gold core → blue-white arms, bokeh size variety, slow rotation, subtle mouse parallax.
- Typography over/around it (layout blueprint):
  - Top center: logo. Top corners: sound toggle / nav as needed.
  - Small caps label: FULL-SERVICE CREATIVE & DIGITAL AGENCY
  - Big headline overlaying the galaxy: **Innovate. Create. Elevate.**
  - Mono subline: TURNING IDEAS INTO POWERFUL BRANDS
  - Bottom center: SCROLL cue. Bottom right: CLICK TO UNLEASH THE GALAXY.
  - Bottom edge: section index — SERVICES · WORK · IMPACT · ABOUT · CONTACT (active section highlighted, boilerlab-style).
- **The Unleash:** clicking the galaxy scatters its particles outward in a burst; they drift and re-form after a beat. Repeatable delight.

### 3. Scroll — the Warp
Scrolling between sections is a spacecraft jump: stars stretch into streaks, brief acceleration, decelerate into the next section. Every section transition uses the same warp grammar. Honest and reversible.

### 4. Sections (each its own "galaxy" — a centerpiece + real content)
1. **SERVICES** — centerpiece: constellation formation. The six canonical services (see COMPANY_PROFILE.md) with short real copy; links to service pages.
2. **WORK** — centerpiece: client planets/cluster. Featured clients; clicking opens case-study pages (the "rooms" — see SITE_ARCHITECTURE.md, still valid).
3. **IMPACT** — stats condensing from particles + testimonials. Real numbers only.
4. **ABOUT** — the agency, values, team (content pending from company).
5. **CONTACT** — the single light; "Let's build yours." Minimal conversational form.

Content is real, readable HTML in every section (boilerlab density), laid out around the 3D centerpiece. Stardust/particle text reserved for rare dramatic beats.

### 5. Everything that carries over from V2 builds
Star shader craft (size hierarchy, color temperature, twinkle), glow sprites, bloom discipline, cursor wake, Lenis scroll, swirl (now the loader), warp = camera dash + velocity streaks, stations logic (now section snapping), SEO/accessibility/perf foundations, trailer+rooms page architecture.

---

## Aesthetic Rules (from the references)

- Deep black space; sparse, tiny background stars — emptiness is a feature.
- One luminous centerpiece per screen; never two spectacles competing.
- Typography: big, confident, editorial; letterspaced small caps for labels; generous whitespace.
- Restraint everywhere else — the galaxy is loud, so the frame around it is silent.

## Build Order

1. **Hero prototype** — spiral galaxy to daiki quality → owner approves on screen.
2. Hero typography layout + click-to-unleash.
3. Loader (swirl + logo) wired to real asset loading.
4. Warp transition + section scaffold + bottom index nav.
5. Sections one by one (SERVICES first), each: centerpiece + real copy + approval.
6. Rooms (case-study/service pages), Django wiring, sound, mobile, polish.
