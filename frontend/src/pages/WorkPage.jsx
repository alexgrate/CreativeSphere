import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CLIENTS } from '../content/clients'
import BrandLockup from '../ui/BrandLockup'
import FadeLink from '../ui/FadeLink'
import './pages.css'

const PAGE_SIZE = 6

export default function WorkPage() {
  const [shown, setShown] = useState(PAGE_SIZE)

  useEffect(() => {
    document.title = 'All Work — The Creative Sphere'
  }, [])

  return (
    <main className="page">
      <header className="page-top">
        <FadeLink to="/" className="page-brand"><BrandLockup /></FadeLink>
        <FadeLink to="/" className="page-back">← BACK TO THE SPHERE</FadeLink>
      </header>
      <p className="kicker">THE ARCHIVE</p>
      <h1>All Work</h1>
      <div className="page-list">
        {CLIENTS.slice(0, shown).map((c, i) => (
          <Link
            key={c.slug}
            to={`/work/${c.slug}`}
            className="page-row"
            style={{ '--c': c.color, animationDelay: `${(i % PAGE_SIZE) * 70}ms` }}
          >
            <span className="row-n">{String(i + 1).padStart(2, '0')}</span>
            <div className="row-main">
              <h3>{c.name}</h3>
              <p>{c.line}</p>
            </div>
            <span className="row-tag">{c.sector}</span>
            <span className="row-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
      <div className="page-more">
        <span className="page-count">
          SHOWING {String(Math.min(shown, CLIENTS.length)).padStart(2, '0')} / {String(CLIENTS.length).padStart(2, '0')}
        </span>
        {shown < CLIENTS.length && (
          <button
            type="button"
            className="load-more"
            onClick={() => setShown((s) => s + PAGE_SIZE)}
          >
            LOAD MORE +
          </button>
        )}
      </div>
    </main>
  )
}
