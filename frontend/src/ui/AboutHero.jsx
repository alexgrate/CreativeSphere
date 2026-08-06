import { useRef } from "react"
import { LOGOS } from "../content/site"


export default function AboutHero() {
    // duplicated so the -50% loop is seamless; tripled gives room to drag
    const strip = [...LOGOS, ...LOGOS, ...LOGOS]

    const railRef = useRef(null)
    const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 })

    const down = (e) => {
        const rail = railRef.current
        drag.current = { active: true, startX: e.clientX, startScroll: rail.scrollLeft, moved: 0 }
        rail.setPointerCapture(e.pointerId)
        rail.classList.add('is-dragging')      // pauses the CSS animation
    }
    const move = (e) => {
        if (!drag.current.active) return
        const dx = e.clientX - drag.current.startX
        drag.current.moved = Math.abs(dx)
        railRef.current.scrollLeft = drag.current.startScroll - dx
    }
    const up = (e) => {
        if (!drag.current.active) return
        drag.current.active = false
        railRef.current.releasePointerCapture(e.pointerId)
        railRef.current.classList.remove('is-dragging')
    }

    return (
        <section className="abt">
            <h1 className="abt-title spark">Craft. Leadership. Consequence.</h1>

            <div className="abt-frame">
                <img src="/hero-06.webp" alt="The Creative Sphere studio" width="1440" height="920" loading="eager" />

                <div
                    className="abt-marquee"
                    ref={railRef}
                    onPointerDown={down}
                    onPointerMove={move}
                    onPointerUp={up}
                    onPointerCancel={up}
                    aria-hidden="true"
                >
                    <div className="abt-track">
                        {strip.map((l, n) => (
                            <img key={n} src={l.src} alt="" draggable="false" />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}