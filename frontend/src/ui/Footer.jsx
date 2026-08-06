export default function Footer() {
    return (
        <footer className="ftr" aria-label="Site footer">
            <div className="ftr-mark" aria-hidden="true">
                <svg viewBox="0 0 1000 130" width="100%">
                    <text x="500" y="112" textAnchor="middle" textLength="1000" lengthAdjust="spacingAndGlyphs">
                        THECREATIVESPHERE
                    </text>
                </svg>
            </div>

            <div className="ftr-row">
                <p className="ftr-line">
                    Strategy, design and story.<br />Working as one.
                </p>
                <nav className="ftr-links">
                    <a href="mailto:hello@thecreativesphere.com">HELLO@THECREATIVESPHERE.COM</a>
                    <a href="https://instagram.com/inthecrativesphere" target="_blank" rel="noreferrer">INSTAGRAM</a>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer">LINKEDIN</a>
                </nav>
            </div>

            <p className="ftr-copy">© {new Date().getFullYear()} The Creative Sphere. All rights reserved.</p>
        </footer>
    )
}