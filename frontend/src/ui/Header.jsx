import { useState, useEffect } from "react";

function Arrow() {
    return (
        <span className="arr" aria-hidden="true">
            <svg viewBox="0 0 10 10"><path d="M2 8L8 2M8 2H3M8 2V7" /></svg>
            <svg viewBox="0 0 10 10"><path d="M2 8L8 2M8 2H3M8 2V7" /></svg>
        </span>
    )
}

export default function Header() {
    const [more, setMore] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : ''
    }, [menuOpen])

    return (
        <>
            <header className="site-header">
                <nav className="hidden lg:flex gap-2.5">
                    <a href="/services" className="pill">SERVICES <Arrow /></a>
                    <a href="/work" className="pill">WORK <Arrow /></a>
                    <a href="/about" className="pill">STUDIO <Arrow /></a>
                </nav>

                <div className="hdr-coords hidden lg:flex">
                    <span>6.524 N, 3.379 E</span>
                    <span>EST. 2019 · LAGOS</span>
                </div>

                <div className="hidden lg:flex items-center gap-3">
                    <div
                        className={`hdr-more flex items-center ${more ? 'is-open' : ''}`}
                        onMouseEnter={() => setMore(true)}
                        onMouseLeave={() => setMore(false)}
                    >
                        <div className="hdr-drawer">
                            <a href="/impact" className="pill">IMPACT <Arrow /></a>
                            <a href="/about" className="pill">ABOUT <Arrow /></a>
                            <a href="/contact" className="pill">CONTACT <Arrow /></a>
                        </div>
                        <button
                            className="hdr-burger"
                            aria-expanded={more}
                            aria-label="More links"
                            onClick={() => setMore(!more)}
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    </div>

                    <button className="lang-switch" role="switch" aria-checked="true">
                        <span className="knob" /> EN
                    </button>
                </div>

                <a href="/" className="hdr-logo lg:hidden">
                    <img src="/brand/logo-mark-blue-trim.png" alt="The Creative Sphere" />
                </a>
                <button className="mob-burger lg:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
                    <span></span>
                    <span></span>
                </button>
            </header>

            <div className={`mob-menu lg:hidden ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
                <div className="flex items-center justify-between">
                    <img src="/brand/logo-full-white-trim.png" alt="The Creative Sphere" className="menu-logo" />
                    <button className="mob-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>✕</button>
                </div>
                <nav className="mob-links">
                    <a href="/services">Services</a>
                    <a href="/work">Work</a>
                    <a href="/studio">Studio</a>
                    <a href="/impact">Impact</a>
                    <a href="/about">About</a>
                    <a href="/contact">Contact</a>
                </nav>
                <div className="mob-foot">
                    <button className="lang-switch"><span className="knob" /> EN</button>
                    <div className="mob-contact">
                    <span>HELLO@THECREATIVESPHERE.COM</span>
                    <span>+234 905 705 1623</span>
                    </div>
                </div>
            </div>

        </>
    )
}