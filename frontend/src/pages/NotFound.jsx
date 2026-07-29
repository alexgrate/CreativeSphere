import { Link } from 'react-router-dom'
import BrandLockup from '../ui/BrandLockup'
import './pages.css'

export default function NotFound() {
  return (
    <main className="page">
      <header className="page-top">
        <Link to="/" className="page-brand"><BrandLockup /></Link>
        <Link to="/" className="page-back">← BACK TO THE SPHERE</Link>
      </header>
      <p className="kicker">404</p>
      <h1>Lost in space.</h1>
      <p className="case-intro">This corner of the universe is empty. Let&rsquo;s get you home.</p>
    </main>
  )
}
