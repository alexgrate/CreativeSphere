import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CLIENTS } from '../content/clients'
import BrandLockup from '../ui/BrandLockup'
import './pages.css'
import { GALLERIES } from '../content/galleries'

function Shot({ src, alt, i }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`shot ${loaded ? 'is-loaded' : ''}`}
      style={{ transitionDelay: `${Math.min(i * 70, 400)}ms` }}
    />
  )
}

export default function CaseStudyPage() {
  const { slug } = useParams()
  const i = CLIENTS.findIndex((c) => c.slug === slug)
  const c = CLIENTS[i]

  useEffect(() => {
    document.title = c
      ? `${c.name} — The Creative Sphere`
      : 'Lost in space — The Creative Sphere'
  }, [c])

  if (!c) {
    return (
      <main className="page">
        <h1>Lost in space.</h1>
        <Link to="/work" className="page-back">← ALL WORK</Link>
      </main>
    )
  }

  const next = CLIENTS[(i + 1) % CLIENTS.length]
  const prev = CLIENTS[(i - 1 + CLIENTS.length) % CLIENTS.length]
  const shots = GALLERIES[slug] ?? []

  return (
    <main className="page" key={slug}>
        <header className="page-top">
            <Link to="/" className="page-brand"><BrandLockup /></Link>
            <Link to="/work" className="page-back">← ALL WORK</Link>
        </header>
        <p className="kicker">{c.sector.toUpperCase()}</p>
        <h1>{c.name}</h1>
        <p className="case-intro">{c.line}</p>

        <section className="case-block">
            <h2>The challenge</h2>
            <p>{c.story.challenge}</p>
        </section>
        <section className="case-block">
            <h2>The approach</h2>
            <p>{c.story.approach}</p>
        </section>
        {shots.length > 0 && (
            <section className="case-gallery">
                <h2>The work</h2>
                <div className="shot-grid">
                {shots.map((src, n) => (
                    <Shot key={src} src={src} alt={`${c.name} campaign work ${n + 1}`} i={n} />
                ))}
                </div>
            </section>
        )}

        <section className="case-block">
            <h2>The impact</h2>
            <p>{c.story.impact}</p>
        </section>

        <nav className="case-nav">
            <Link to={`/work/${prev.slug}`} className="case-next">← {prev.name}</Link>
            <Link to={`/work/${next.slug}`} className="case-next">{next.name} →</Link>
        </nav>
    </main>
  )
}
