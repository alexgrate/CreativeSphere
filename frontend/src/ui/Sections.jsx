import { useApp } from '../stores/useApp'
import { SERVICES } from '../content/services'
import { CLIENTS } from '../content/clients'
import { STATS } from '../content/stats'
import { useCountUp } from '../hooks/useCountUp'
import { Link } from 'react-router-dom'
import './sections.css'

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

  return (
   <>
    <div className={`section-card ${stateFor(1)}`}>
        <p className='kicker'>WHAT WE DO</p>
        <h2>Services</h2>
        <div className="svc-grid">
            {SERVICES.map((s, i) => (
                <article
                    className='svc'
                    key={s.name}
                    style={{ transitionDelay: `${0.45 + i * 0.08}s`}}
                >
                    <span className='svc-n'>{String(i + 1).padStart(2, '0')}</span>
                    <h3>{s.name}</h3>
                    <p>{s.line}</p>
                </article>
            ))}
        </div>
    </div>

    <div className={`section-card ${stateFor(2)}`}>
        <p className="kicker">SELECTED WORK</p>
        <h2>Work</h2>
        <div className="wrk-list">
            {CLIENTS.map((c, i) => (
                <article
                    className='wrk'
                    key={c.name}
                    style={{ transitionDelay: `${0.45 + i * 0.07}s` }}
                >
                    <span className="wrk-n">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                        <h3>{c.name}</h3>
                        <p>{c.line}</p>
                    </div>
                    <span className='wrk-tag'>{c.sector}</span>
                </article>
            ))}
        </div>
        <Link className="wrk-all" to="/work">ALL WORK →</Link>

        <div className="partners">
            <p className="partners-label">CLIENTS WE'VE WORKED WITH</p>
            <div className="marquee">
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

    <div className={`section-card ${stateFor(3)}`}> 
        <p className="kicker">MEASURABLE RESULTS</p>
        <h2>Impact</h2>
        <div className="stat-row">
            {STATS.map((s, i) => (
                <Stat key={s.label} s={s} active={section === 3} delay={0.45 + i * 0.1} />
            ))}
        </div>
    </div>

    <div className={`section-card ${stateFor(4)}`}> 
        <p className="kicker">WHO WE ARE</p>
        <h2>About</h2>
        <p className="about-blurb">
            The Creative-Sphere is a full-service creative and digital agency
            dedicated to transforming ideas into powerful brands. We pair
            cutting-edge creativity with data-driven strategy — design,
            storytelling and technology working as one — so every brand we
            touch stands out in a competitive market.
        </p>
        <div className="value-row">
            {['Creativity', 'Innovation', 'Excellence', 'Collaboration', 'Integrity'].map((v, i) => (
                <span className="value-chip" key={v} style={{ transitionDelay: `${0.5 + i * 0.07}s` }}>
                    {v}
                </span>
            ))}
        </div>
    </div>

    <div className={`section-card contact ${stateFor(5)}`}>
        <p className="kicker">START SOMETHING</p>
        <h2>Let&rsquo;s build yours.</h2>
        <p className="contact-line">
            Every extraordinary brand begins with a single idea. Bring us yours.
        </p>
        <a className="cta solid" href="tel:+2349057051623">START A PROJECT</a>
        <div className="contact-meta">
            <a href="tel:+2349057051623">+234 905 705 1623</a>
            <span>·</span>
            <a href="https://instagram.com/Inthecrativesphere" target="_blank" rel="noreferrer">INSTAGRAM</a>
        </div>
    </div>

   </>
  )
}
