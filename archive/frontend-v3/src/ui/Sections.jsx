import { useEffect, useRef, useState } from 'react'
import { setHoverService, useApp } from '../stores/useApp'
import { SERVICES } from '../content/services'
import { CLIENTS } from '../content/clients'
import { GALLERIES } from '../content/galleries'
import { STATS } from '../content/stats'
import { useCountUp } from '../hooks/useCountUp'
import { Link } from 'react-router-dom'
import './sections.css'
import Magnetic from './Magnetic'
import SplitWords from './SplitWords'


function ServiceCard({ s, i }) {
    const ref = useRef()

    const onMove = (e) => {
        const r = ref.current.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width
        const y = (e.clientY - r.top) / r.height
        ref.current.style.setProperty('--mx', `${x * 100}%`)
        ref.current.style.setProperty('--my', `${y * 100}%`)
        ref.current.style.setProperty('--rx', `${(0.5 - y) * 9}deg`)
        ref.current.style.setProperty('--ry', `${(x - 0.5) * 11}deg`)
    }
    const onEnter = () => setHoverService(i)
    const onLeave = () => {
        ref.current.style.setProperty('--rx', '0deg')
        ref.current.style.setProperty('--ry', '0deg')
        setHoverService(-1)
    }

    return (
        <article
            ref={ref}
            className={`svc svc--${s.theme}`}
            style={{ transitionDelay: `${0.45 + i * 0.08}s` }}
            onPointerEnter={onEnter}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
        >
            <span className="svc-ghost">{String(i + 1).padStart(2, '0')}</span>
            <h3>{s.name}</h3>
            <p>{s.line}</p>
            <div className="svc-tags">
                {s.tags.map((t) => (
                    <span key={t}>{t}</span>
                ))}
            </div>
            <span className="svc-arrow">↗</span>
            <span className="svc-spot" />
        </article>
    )
}

const VALUES = ['Creativity', 'Innovation', 'Excellence', 'Collaboration', 'Integrity']

function Stat({ s, active, delay }) {
    const n = useCountUp(s.value, active)
    return (
        <div className="stat" style={{ transitionDelay: `${delay}s` }}>
            <span className="stat-n">{n.toLocaleString()}{s.suffix}</span>
            <span className="stat-l">{s.label}</span>
        </div>
    )
}

export default function Sections() {
  const section = useApp((s) => s.section)
  const stateFor = (id) =>
    id === section ? 'is-on' : id < section ? 'is-past' : 'is-ahead'

  const [peek, setPeek] = useState(null)
  const peekRef = useRef()
  const onWorkMove = (e) => {
    const el = peekRef.current
    if (!el) return
    el.style.transform = `translate(${e.clientX + 28}px, ${e.clientY - 84}px)`
  }

  useEffect(() => {
    CLIENTS.forEach((c) => {
      const src = GALLERIES[c.slug]?.[0]
      if (src) new Image().src = src
    })
  }, [])

  return (
   <>
    <div className={`section-card ${stateFor(1)}`} inert={section !== 1}>
        <p className='kicker'>WHAT WE DO</p>
        <h2><SplitWords text="Services" /></h2>
        <div className="svc-grid">
            {SERVICES.map((s, i) => (
                <ServiceCard key={s.name} s={s} i={i} />
            ))}
        </div>
    </div>

    <div className={`section-card ${stateFor(2)}`} inert={section !== 2}>
        <p className="kicker">SELECTED WORK</p>
        <h2>Work</h2>
        <div className="wrk-list" onPointerMove={onWorkMove} onPointerLeave={() => setPeek(null)}>
            {CLIENTS.map((c, i) => (
                <Link
                    to={`/work/${c.slug}`}
                    className='wrk'
                    key={c.slug}
                    style={{ '--c': c.color, '--d': `${0.45 + i * 0.07}s` }}
                    onPointerEnter={() => setPeek(GALLERIES[c.slug]?.[0] ?? null)}
                    onPointerLeave={() => setPeek(null)}
                >
                    <span className="wrk-n">{String(i + 1).padStart(2, '0')}</span>
                    <div className="wrk-main">
                        <h3>{c.name}</h3>
                        <p>{c.line}</p>
                    </div>
                    <span className='wrk-tag'>{c.sector}</span>
                    <span className='wrk-arrow' aria-hidden="true">↗</span>
                </Link>
            ))}
            <div
                className={`wrk-preview ${peek ? 'is-vis' : ''}`}
                ref={peekRef}
                aria-hidden="true"
                style={{ backgroundImage: peek ? `url(${peek})` : 'none' }}
            />
        </div>
        <Magnetic><Link className="cta solid" to="/work">ALL WORK →</Link></Magnetic>

        <div className="partners">
            <p className="partners-label">CLIENTS WE'VE WORKED WITH</p>
            <div className="marquee" aria-hidden="true">
                <div className="marquee-track">
                    {[...CLIENTS, ...CLIENTS, ...CLIENTS, ...CLIENTS].map((c, i) => (
                        <span className='marquee-logo' key={i}>
                            <img src={c.logo} alt={`${c.name} logo`} />
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </div>

    <div className={`section-card ${stateFor(3)}`} inert={section !== 3}>
        <p className="kicker">MEASURABLE RESULTS</p>
        <h2>Impact</h2>
        <div className="stat-row">
            {STATS.map((s, i) => (
                <Stat key={s.label} s={s} active={section === 3} delay={0.45 + i * 0.1} />
            ))}
        </div>
    </div>

    <div className={`section-card ${stateFor(4)}`} inert={section !== 4}>
        <p className="kicker">WHO WE ARE</p>
        <h2><SplitWords text="About" /></h2>
        <p className="about-statement">
            We turn <em>ideas</em> into<br /><em>powerful brands.</em>
        </p>
        <div className="about-grid">
            <div className="about-col">
                <h4>THE STUDIO</h4>
                <p>
                    The Creative-Sphere is a full-service creative and digital
                    agency based in Nigeria, working worldwide. From FMCG giants
                    to fintech startups, we build brands that get noticed — and
                    remembered.
                </p>
            </div>
            <div className="about-col">
                <h4>THE APPROACH</h4>
                <p>
                    Strategy first, craft always. Design, storytelling and
                    technology working as one team — measured by real results,
                    not applause.
                </p>
            </div>
        </div>
        <div className="value-ticker" aria-hidden="true">
            <div className="value-track">
                {[...VALUES, ...VALUES].map((v, i) => (
                    <span key={i}>{v}<i>✦</i></span>
                ))}
            </div>
        </div>
        <div className="about-facts">
            <span>EST. NIGERIA</span>
            <span>·</span>
            <span>SIX DISCIPLINES</span>
            <span>·</span>
            <span>WORKING WORLDWIDE</span>
        </div>
    </div>

    <div className={`section-card contact ${stateFor(5)}`} inert={section !== 5}>
        <p className="kicker">START SOMETHING</p>
        <h2><SplitWords text="Let's build yours." /></h2>
        <p className="contact-line">
            Every extraordinary brand begins with a single idea. Bring us yours.
        </p>
        <Magnetic><a className="cta solid" href="tel:+2349057051623">START A PROJECT</a></Magnetic>
        <div className="contact-links">
            <Magnetic>
                <a className="contact-chip chip-phone" href="tel:+2349057051623">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>+234 905 705 1623</span>
                </a>
            </Magnetic>
            <Magnetic>
                <a className="contact-chip chip-ig" href="https://instagram.com/Inthecrativesphere" target="_blank" rel="noreferrer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    <span>@inthecrativesphere</span>
                </a>
            </Magnetic>
        </div>
    </div>

   </>
  )
}
