import BrandLockup from '../ui/BrandLockup'
import FadeLink from '../ui/FadeLink'
import './pages.css'

export default function NotFound() {
  return (
    <main className="page">
      <header className="page-top">
        <FadeLink to="/" className="page-brand"><BrandLockup /></FadeLink>
        <FadeLink to="/" className="page-back">← BACK TO THE SPHERE</FadeLink>
      </header>
      <p className="kicker">404</p>
      <h1>Lost in space.</h1>
      <p className="case-intro">This corner of the universe is empty. Let&rsquo;s get you home.</p>
    </main>
  )
}
