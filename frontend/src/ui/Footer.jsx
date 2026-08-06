export default function Footer() {
    return (
        <footer className="ftr" aria-label="Site footer">
            <div className="ftr-mark" aria-hidden="true">
                <svg viewBox="0 0 1000 130" width="100%">
                    <defs>
                        {/* the spark: a blue band inside a white gradient,
                            slid across by GSAP when the footer is revealed */}
                        <linearGradient id="ftrSpark" x1="0" y1="0" x2="1" y2="0"
                                        gradientTransform="translate(-1 0)">
                            <stop offset="0%" stopColor="#fff" />
                            <stop offset="40%" stopColor="#fff" />
                            <stop offset="50%" stopColor="#5B9DFF" />
                            <stop offset="60%" stopColor="#fff" />
                            <stop offset="100%" stopColor="#fff" />
                        </linearGradient>
                    </defs>
                    <text x="500" y="112" textAnchor="middle" textLength="1000"
                          lengthAdjust="spacingAndGlyphs" fill="url(#ftrSpark)">
                        THECREATIVESPHERE
                    </text>
                </svg>
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