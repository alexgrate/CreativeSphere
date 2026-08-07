import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { GALLERY } from "../content/site"

gsap.registerPlugin(ScrollTrigger)

export default function Gallery() {
    const secRef = useRef(null)
    const stripRef = useRef(null)

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia()

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const sec = secRef.current
                const strip = stripRef.current
                if (!sec || !strip) return

                const tween = gsap.fromTo(strip,
                    { x: 0 },
                    {
                        x: () => -Math.max(0, strip.scrollWidth - sec.clientWidth),
                        ease: 'none',
                        scrollTrigger: {
                            trigger: sec,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 0.6,
                            invalidateOnRefresh: true,  
                        },
                    }
                )

                return () => { tween.scrollTrigger?.kill(); tween.kill() }
            })
        }, secRef)

        const t = setTimeout(() => ScrollTrigger.refresh(), 500)
        return () => { clearTimeout(t); ctx.revert() }
    }, [])

    return (
        <section className="gal" ref={secRef} aria-label="Selected work">
            <div className="gal-strip" ref={stripRef}>
                {GALLERY.map((g) => (
                    <figure className="gal-item" key={g.src}>
                        <img src={g.src} alt={g.alt} loading="lazy" draggable="false" />
                    </figure>
                ))}
            </div>
        </section>
    )
}
