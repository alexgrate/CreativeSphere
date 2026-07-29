import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CLIENTS } from '../content/clients'
import './pages.css'

export default function WorkPage() {
  useEffect(() => {
    document.title = 'All Work — The Creative Sphere'
  }, [])

  return (
    <main className="page">
      <header className="page-top">
        <Link to="/" className="page-brand">THE CREATIVE-SPHERE</Link>
        <Link to="/" className="page-back">← BACK TO THE SPHERE</Link>
      </header>
      <p className="kicker">THE ARCHIVE</p>
      <h1>All Work</h1>
      <div className="page-list">
        {CLIENTS.map((c, i) => (
          <Link key={c.slug} to={`/work/${c.slug}`} className="page-row">
            <span className="row-n">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>{c.name}</h3>
              <p>{c.line}</p>
            </div>
            <span className="row-tag">{c.sector}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
