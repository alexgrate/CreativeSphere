import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { useGallery } from "../lib/api"

gsap.registerPlugin(ScrollTrigger)

export default function Gallery() {
    const { data: gallery } = useGallery()
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
        // rebuilt when the images land: the tween's travel distance comes from
        // strip.scrollWidth, which is zero until they are in the DOM
    }, [gallery])

    return (
        <section className="gal" ref={secRef} aria-label="Selected work">
            <div className="gal-strip" ref={stripRef}>
                {gallery.map((g) => (
                    <figure className="gal-item" key={g.id}>
                        <img src={g.src} alt={g.alt} loading="lazy" draggable="false" />
                    </figure>
                ))}
            </div>
        </section>
    )
}
