import { useEffect, useState, useRef } from "react"
import { HERO_SLIDES } from "../content/site"

const AUTO_MS = 6000

export default function Hero() {
    const [active, setActive] = useState(0)
    const railRef = useRef(null)

    useEffect(() => {
        const t = setInterval(() => setActive(a => (a + 1) % HERO_SLIDES.length), AUTO_MS)
        return () => clearInterval(t)
    }, [active])

    useEffect(() => {
        const rail = railRef.current
        const card = rail?.children[active]
        if (rail && card) rail.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
    }, [active])

    return (
        <section className="hero">
            {HERO_SLIDES.map((s, i) => (
                <div key={s.id} className={`hero-bg ${i === active ? 'is-on' : ''}`}
                    style={{ backgroundImage: `url(${s.img})` }} aria-hidden="true" />
            ))}
            <div className="hero-scrim" aria-hidden="true" />

            <div className="hero-inner">
                <div className="hero-left">
                    <span className="hero-label">FULL-SERVICE CREATIVE &amp; DIGITAL AGENCY</span>
                    <h1>We give brands gravity.</h1>
                    <p className="hero-copy">
                        Loud is easy. Being the thing people turn toward takes strategy,
                        design and story working together. We build that.
                    </p>
                    <div className="hero-buttons">
                        <a href="/start" className="hero-btn hero-btn-primary">Start a project</a>
                        <a href="/work" className="hero-btn hero-btn-secondary">Explore the work</a>
                    </div>
                </div>
            </div>

            <div className="hero-rail" aria-label="Featured work">
                <div className="hero-prog" aria-hidden="true">
                    <span>{String(active + 1).padStart(2, '0')}</span>
                    <i><b style={{ width: `${((active + 1) / HERO_SLIDES.length) * 100}%` }} /></i>
                    <span>{String(HERO_SLIDES.length).padStart(2, '0')}</span>
                </div>
                <div className="hero-thumbs" ref={railRef}>
                    {HERO_SLIDES.map((s, i) => (
                        <button key={s.id}
                                className={`hero-thumb ${i === active ? 'is-active' : ''}`}
                                onClick={() => setActive(i)}
                                aria-label={`Show ${s.name}`}>
                            <img src={s.img} alt="" />
                            <span className="ht-meta"><strong>{s.name}</strong><em>{s.tag}</em></span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    )
}
