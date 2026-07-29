// CaseStudyPage.jsx
import { Link, useParams } from 'react-router-dom'
import { CLIENTS } from '../content/clients'
import './pages.css'

export default function CaseStudyPage() {
  const { slug } = useParams()
  const i = CLIENTS.findIndex((c) => c.slug === slug)
  const c = CLIENTS[i]

  if (!c) {
    return (
      <main className="page">
        <h1>Lost in space.</h1>
        <Link to="/work" className="page-back">← ALL WORK</Link>
      </main>
    )
  }

  const next = CLIENTS[(i + 1) % CLIENTS.length]

  return (
    <main className="page">
      <header className="page-top">
        <Link to="/" className="page-brand">THE CREATIVE-SPHERE</Link>
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
      <section className="case-block">
        <h2>The impact</h2>
        <p>{c.story.impact}</p>
      </section>

      <Link to={`/work/${next.slug}`} className="case-next">NEXT — {next.name} →</Link>
    </main>
  )
}
