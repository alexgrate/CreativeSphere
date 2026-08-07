import { useState, useEffect } from "react";


export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : ''
    }, [menuOpen])

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    return (
        <>
            <header className="site-header">
                <a href="/" className="hdr-logo">
                    <img src="/brand/logo-full-blue-trim.png" alt="The Creative Sphere" />
                </a>

                <nav className="hdr-nav hidden lg:flex">
                    <a href="/">Home</a>
                    <a href="/about">About</a>
                    <a href="/work">Work</a>
                    <a href="/services">Services</a>
                </nav>

                <a href="/contact" className="hdr-cta hidden lg:inline-flex">
                    Let&rsquo;s talk
                </a>

                <button className="mob-burger lg:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
                    <span></span><span></span>
                </button>
            </header>

            <div
                className={`mob-veil lg:hidden ${menuOpen ? 'is-open' : ''}`}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
            />

            <div className={`mob-menu lg:hidden ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
                <div className="flex items-center justify-between">
                    <a href="/" className="hdr-logo">
                        <img src="/brand/logo-full-blue-trim.png" alt="The Creative Sphere" />
                    </a>
                    <button className="mob-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>✕</button>
                </div>
                <nav className="mob-links">
                    <a href="/">Home</a>
                    <a href="/about">About</a>
                    <a href="/work">Work</a>
                    <a href="/services">Services</a>
                    <a href="/contact" className="mob-cta">Let&rsquo;s talk</a>
                </nav>
            </div>
        </>
    )
}
