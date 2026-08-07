import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const STATEMENT = "We’re a creative and digital agency that moves at the speed of your ambition. From strategy to production and beyond."
const WORDMARK = ['The', 'Creative', 'Sphere']

/* The bottom spark: a four-point star plus two trailing swooshes, drawn as
   separate paths so they can be staggered — the reference stacks four of these
   and reveals each with stroke-dashoffset. */
const SPARK = [
    'M110 46 C 112 24, 114 14, 116 2 C 118 14, 120 24, 122 46 C 138 48, 150 50, 168 52 C 150 54, 138 56, 122 58 C 120 80, 118 90, 116 102 C 114 90, 112 80, 110 58 C 92 56, 80 54, 62 52 C 80 50, 92 48, 110 46 Z',
    'M6 74 C 22 74, 30 66, 38 56 C 46 46, 56 40, 74 40 L 104 40',
    'M18 92 C 34 92, 42 86, 50 78 C 58 70, 66 66, 82 66 L 104 66',
    'M132 22 C 142 18, 150 18, 154 22 C 158 26, 154 32, 146 32',
]

export default function Hero() {
    const secRef = useRef(null)
    const sparkRef = useRef(null)

    useLayoutEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduce) document.querySelector('.hero-media video')?.pause()

        const ctx = gsap.context(() => {
            // dash each path by its own length, then run the offsets to zero in
            // sequence — the star lands first, then the trails chase it
            const paths = sparkRef.current?.querySelectorAll('path') || []
            paths.forEach((path) => {
                const len = path.getTotalLength()
                gsap.set(path, { strokeDasharray: len, strokeDashoffset: reduce ? 0 : len })
            })
            if (!reduce && paths.length) {
                gsap.to(paths, {
                    strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut',
                    stagger: 0.22, delay: 1.3,
                })
            }

            if (!reduce) {
                gsap.fromTo('.hero-media',
                    { clipPath: 'inset(12% 8% 12% 8% round 30px)', scale: 1.12 },
                    { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1,
                      duration: 1.5, ease: 'power3.inOut' })

                // the crest assembles: mark first, then each wordmark line out
                // of its own mask
                gsap.fromTo('.hc-mark',
                    { scale: 0.7, opacity: 0, rotate: -12 },
                    { scale: 1, opacity: 1, rotate: 0, duration: 1.4, ease: 'power3.out', delay: 0.35 })
                gsap.fromTo('.hc-line i',
                    { yPercent: 115 },
                    { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.11, delay: 0.6 })

                // a slow drift keeps it alive without asking for attention
                gsap.to('.hero-crest', {
                    y: -9, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2,
                })

                gsap.fromTo('.hs i',
                    { yPercent: 110 },
                    { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.02, delay: 0.8 })
                gsap.fromTo(['.hero-eyebrow', '.hero-side'],
                    { y: 18, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.1, delay: 1 })
            }

            gsap.fromTo('.hero-media',
                { yPercent: 0, scale: 1 },
                { yPercent: 14, scale: 1.1, ease: 'none', immediateRender: false,
                  scrollTrigger: { trigger: secRef.current, start: 'top top', end: 'bottom top', scrub: true } })
            gsap.to('.hero-grid', {
                yPercent: -16, opacity: 0.2, ease: 'none',
                scrollTrigger: { trigger: secRef.current, start: 'top top', end: 'bottom top', scrub: true },
            })
            gsap.to('.hero-scrim', {
                opacity: 1, ease: 'none',
                scrollTrigger: { trigger: secRef.current, start: 'top top', end: 'bottom top', scrub: true },
            })
        }, secRef)

        return () => ctx.revert()
    }, [])

    return (
        <section className="hero" ref={secRef}>
            <div className="hero-media" aria-hidden="true">
                <video autoPlay muted loop playsInline preload="metadata" poster="/video/poster.webp">
                    <source src="/video/reel.webm" type="video/webm" />
                    <source src="/video/reel.mp4" type="video/mp4" />
                </video>
            </div>
            <div className="hero-scrim" aria-hidden="true" />

            <div className="hero-grid">
                <div className="hero-left">
                    <p className="hero-eyebrow">Welcome!</p>
                    <p className="hero-statement">
                        {STATEMENT.split(' ').map((w, i) => (
                            <span className="hs" key={i}><i>{w}</i></span>
                        ))}
                    </p>
                </div>

                {/* a crest, not the header lockup repeated: the mark sits behind
                    the wordmark stacked and set large */}
                <h1 className="hero-crest">
                    <img className="hc-mark" src="/brand/logo-mark-white-trim.png" alt="" aria-hidden="true" />
                    <span className="hc-stack">
                        {WORDMARK.map((l) => (
                            <span className="hc-line" key={l}><i>{l}</i></span>
                        ))}
                    </span>
                    <span className="hc-sr">The Creative Sphere</span>
                </h1>

                <p className="hero-side">
                    Loud is easy. Being the thing people turn toward takes strategy,
                    design and story working together. Nine brands, eight industries,
                    one team that does all of it.
                </p>
            </div>

            {/* bottom-centre, the way theirs sits — not tucked under the mark */}
            <svg className="hero-spark" ref={sparkRef} viewBox="0 0 174 108" fill="none" aria-hidden="true">
                {SPARK.map((d, i) => (
                    <path key={i} d={d} stroke="currentColor" strokeWidth="1.4"
                          strokeLinecap="round" strokeLinejoin="round" />
                ))}
            </svg>
        </section>
    )
}
