import { useApp } from '../stores/useApp'
import { SERVICES } from '../content/services'
import { CLIENTS } from '../content/clients'
import './sections.css'

const PLACEHOLDER = [
  { id: 3, title: 'Impact', line: 'Numbers with gravity.' },
  { id: 4, title: 'About', line: 'The minds inside the sphere.' },
  { id: 5, title: 'Contact', line: "Let's build yours." },
]

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
        <a className="wrk-all" href="#work" onClick={(e) => e.preventDefault()}>
            ALL WORK →
        </a>

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

    {PLACEHOLDER.map((c) => (
       <div key={c.id} className={`section-card ${stateFor(c.id)}`}>
            <h2>{c.title}</h2>
            <p>{c.line}</p>
       </div>
    ))}
   </>
  )
}
