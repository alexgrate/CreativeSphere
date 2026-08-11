import { useState, useEffect, useRef } from "react"
import { Menu, X, Plus } from "lucide-react"

const IgIcon = () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
         strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
)

const LiIcon = () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
         strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-13h4v1.5A6 6 0 0 1 16 8z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
)
import { lockScroll } from "../hooks/useSmoothScroll"

const LINKS = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/work', label: 'Work' },
    { href: '/services', label: 'Services' },
]

const NAV = [...LINKS, { href: '/contact', label: 'Contact' }]

const CTA_LABEL = 'Let’s talk'
const CTA_REPEATS = 6
const MAILTO = 'inthecreativesphere@gmail.com'

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [solid, setSolid] = useState(false)
    const raf = useRef(0)

    const path = typeof window !== 'undefined' ? window.location.pathname : '/'

    useEffect(() => {
        const compute = () => {
            const hero = document.querySelector('.hero')
            if (!hero) return setSolid(true)
            setSolid(window.scrollY > hero.offsetHeight - 100)
        }
        const onScroll = () => {
            if (raf.current) return
            raf.current = requestAnimationFrame(() => { raf.current = 0; compute() })
        }
        compute()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        return () => {
            cancelAnimationFrame(raf.current)
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
    }, [])

    useEffect(() => {
        document.documentElement.classList.toggle('is-menu', menuOpen)
        lockScroll(menuOpen)
        return () => {
            document.documentElement.classList.remove('is-menu')
            lockScroll(false)
        }
    }, [menuOpen])

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    const close = () => setMenuOpen(false)

    return (
        <>
            <header className={`hb ${solid ? 'is-solid' : ''}`}>
                <nav className="hb-nav" aria-label="Primary">
                    {LINKS.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            className={path === l.href ? 'is-on' : ''}
                            aria-current={path === l.href ? 'page' : undefined}
                            aria-label={l.label}
                        >
                            {[...l.label].map((ch, i) => (
                                <span key={i} style={{ '--i': i }} aria-hidden="true">{ch}</span>
                            ))}
                        </a>
                    ))}
                </nav>

                <a href="/" className="hb-logo" aria-label="The Creative Sphere — home">
                    <img className="hb-light" src="/brand/logo-full-white-trim.png" alt="The Creative Sphere" />
                    <img className="hb-dark" src="/brand/logo-full-blue-trim.png" alt="" aria-hidden="true" />
                </a>

                <div className="hb-right">
                    <a className="hb-ico" href="https://www.instagram.com/inthecreativesphere?igsh=MTVhMm1vMGp1N2JoMg%3D%3D&utm_source=qr"
                       target="_blank" rel="noreferrer" aria-label="Instagram">
                        <IgIcon />
                    </a>
                    <a className="hb-ico" href="https://linkedin.com"
                       target="_blank" rel="noreferrer" aria-label="LinkedIn">
                        <LiIcon />
                    </a>
                    <a className="hb-cta" href="/contact" aria-label={CTA_LABEL}>
                        <span className="hb-cta-win" aria-hidden="true">
                            <span className="hb-cta-track">
                                {Array.from({ length: CTA_REPEATS }, (_, i) => (
                                    <span key={i}>{CTA_LABEL}</span>
                                ))}
                            </span>
                        </span>
                        <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
                    </a>

                    <button className="hb-burger" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
                        <Menu size={20} strokeWidth={2} aria-hidden="true" />
                    </button>
                </div>
            </header>


            <div className={`mob-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen} inert={!menuOpen}>
                <div className="mm-top">
                    <a href="/" className="mm-logo" onClick={close}>
                        <img src="/brand/logo-full-white-trim.png" alt="The Creative Sphere" />
                    </a>
                    <button className="mm-close" aria-label="Close menu" onClick={close}>
                        <X size={22} strokeWidth={1.6} aria-hidden="true" />
                    </button>
                </div>

                <nav className="mm-links" aria-label="Mobile">
                    {NAV.map((l, i) => (
                        <a key={l.href} href={l.href} style={{ '--i': i }} onClick={close}>{l.label}</a>
                    ))}
                </nav>

                <div className="mm-foot">
                    <span className="mm-loc">Lagos, NG</span>
                    <div className="mm-contact">
                        <a href={`mailto:${MAILTO}`}>{MAILTO.toUpperCase()}</a>
                        <a href="tel:+2349057051623">+234 905 705 1623</a>
                    </div>
                </div>
            </div>
        </>
    )
}
