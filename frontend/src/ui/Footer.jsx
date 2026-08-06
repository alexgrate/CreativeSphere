import { useCallback, useLayoutEffect, useRef } from "react"

const WORDMARK = 'THECREATIVESPHERE'

export default function Footer() {
    const markRef = useRef(null)
    const wordRef = useRef(null)

    /* The wordmark used to be SVG <text> with textLength + lengthAdjust, which
       WebKit measures against the fallback font and never re-fits once the real
       one loads — the word overflowed its 1000-unit viewBox and got cropped at
       both ends on iOS. This measures the rendered text instead and sets a
       font-size that fills the footer exactly. The condensed look now comes
       from the font's own wdth axis, so the glyphs are real, not squashed. */
    const fit = useCallback(() => {
        const box = markRef.current
        const el = wordRef.current
        if (!box || !el) return
        const target = box.clientWidth
        if (!target) return

        el.style.fontSize = '100px'
        const natural = el.getBoundingClientRect().width
        if (!natural) return

        // one pass isn't enough: letter-spacing and glyph hinting don't scale
        // perfectly linearly with font-size, so converge instead of assuming
        let size = (100 * target) / natural
        for (let i = 0; i < 5; i++) {
            el.style.fontSize = `${size}px`
            const w = el.getBoundingClientRect().width
            if (!w || Math.abs(w - target) <= 0.5) break
            size *= target / w
        }
        // never let it end up wider than the box — a hair short is invisible,
        // a hair long clips the final letter
        while (el.getBoundingClientRect().width > target && size > 1) {
            size *= 0.997
            el.style.fontSize = `${size}px`
        }
    }, [])

    useLayoutEffect(() => {
        fit()
        // webfonts land after first paint; refit or we keep the fallback's metrics
        document.fonts?.ready.then(fit).catch(() => {})
        window.addEventListener('resize', fit)
        window.addEventListener('orientationchange', fit)
        return () => {
            window.removeEventListener('resize', fit)
            window.removeEventListener('orientationchange', fit)
        }
    }, [fit])

    return (
        <footer className="ftr" aria-label="Site footer">
            <div className="ftr-mark" ref={markRef} aria-hidden="true">
                <span className="ftr-word spark spark--light" ref={wordRef}>
                    {WORDMARK}
                </span>
            </div>

            <div className="ftr-row">
                <p className="ftr-line" data-reveal>
                    Strategy, design and story.<br />Working as one.
                </p>
                <nav className="ftr-links" data-reveal>
                    <a href="mailto:hello@thecreativesphere.com">HELLO@THECREATIVESPHERE.COM</a>
                    <a href="https://instagram.com/inthecrativesphere" target="_blank" rel="noreferrer">INSTAGRAM</a>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer">LINKEDIN</a>
                </nav>
            </div>

            <p className="ftr-copy">© {new Date().getFullYear()} The Creative Sphere. All rights reserved.</p>
        </footer>
    )
}
