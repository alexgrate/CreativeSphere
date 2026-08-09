import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { scrollToY } from "../hooks/useSmoothScroll"

gsap.registerPlugin(ScrollTrigger)

const SLOTS = [
    { x: 4,  y: 8 },  { x: 20, y: 4 },  { x: 38, y: 6 },  { x: 56, y: 3 },
    { x: 72, y: 7 },  { x: 87, y: 11 }, { x: 2,  y: 24 }, { x: 89, y: 25 },
    { x: 3,  y: 70 }, { x: 18, y: 76 }, { x: 35, y: 82 }, { x: 53, y: 78 },
    { x: 70, y: 84 }, { x: 86, y: 72 }, { x: 12, y: 88 }, { x: 78, y: 62 },
]

const LIVE = 6            
const POOL = 9         

export default function WorkHero({ work }) {
    const secRef = useRef(null)
    const disciplines = new Set(work.flatMap((w) => w.disciplines)).size
    const industries = new Set(work.map((w) => w.sector)).size

    useLayoutEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const sec = secRef.current

        const ctx = gsap.context(() => {
            const thumbs = [...sec.querySelectorAll('.wh-thumb')]
            const words = [...sec.querySelectorAll('.wh-word i')]
            const rest = [...sec.querySelectorAll('.wh-eyebrow, .wh-lead, .wh-stats, .wh-scroll')]

            if (reduce) {
                gsap.set(thumbs.slice(LIVE), { display: 'none' })
                return
            }

            const rand = gsap.utils.random
            const narrow = window.innerWidth < 700
            const [wMin, wMax] = narrow ? [88, 132] : [140, 218]
            let slotCursor = 0
            let imgCursor = 0

            const cycle = (el, first) => {
                const img = el.querySelector('img')
                const slot = SLOTS[slotCursor++ % SLOTS.length]
                const item = work[imgCursor++ % work.length]
                const w = rand(wMin, wMax)
                const travel = rand(38, 74)
                const dir = rand([-1, 1])

                img.src = item.thumb

                gsap.set(el, {
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    width: w,
                    rotate: rand(-8, 8),
                    x: -dir * travel * 0.5,
                    y: rand(-14, 14),
                    scale: rand(0.9, 1.06),
                    opacity: 0,
                })

                const life = rand(7.5, 11)
                const tl = gsap.timeline({ onComplete: () => cycle(el, false) })

                tl.to(el, { opacity: 1, duration: 1.5, ease: 'power2.out' })
                  .to(el, { x: dir * travel * 0.5, y: `+=${rand(-30, 30)}`, duration: life, ease: 'none' }, 0)
                  .to(el, { rotate: `+=${rand(-5, 5)}`, duration: life, ease: 'sine.inOut' }, 0)
                  .to(el, { opacity: 0, duration: 1.6, ease: 'power2.in' }, life - 1.6)

                if (first) tl.delay(rand(0, 4.5))
                return tl
            }

            thumbs.forEach((el) => cycle(el, true))

            gsap.from(words, { yPercent: 118, duration: 1.3, ease: 'expo.out', stagger: 0.06 })
            gsap.from(rest, {
                opacity: 0, y: 22, duration: 0.9, ease: 'power3.out', stagger: 0.09, delay: 0.35,
            })

            let offMove
            if (window.matchMedia('(hover: hover)').matches) {
                const px = gsap.quickTo('.wh-scatter', 'x', { duration: 1.1, ease: 'power3' })
                const py = gsap.quickTo('.wh-scatter', 'y', { duration: 1.1, ease: 'power3' })
                const onMove = (e) => {
                    px((e.clientX / window.innerWidth - 0.5) * -46)
                    py((e.clientY / window.innerHeight - 0.5) * -32)
                }
                sec.addEventListener('pointermove', onMove)
                offMove = () => sec.removeEventListener('pointermove', onMove)
            }

            gsap.to('.wh-scatter', {
                yPercent: -18, ease: 'none',
                scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: true },
            })
            gsap.to('.wh-mid', {
                y: 110, opacity: 0, ease: 'none',
                scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom top', scrub: 0.4 },
            })


            return () => offMove?.()
        }, secRef)

        return () => ctx.revert()
    }, [work])

    return (
        <section className="wh" ref={secRef}>
            <div className="wh-scatter" aria-hidden="true">
                {Array.from({ length: POOL }, (_, i) => (
                    <div className="wh-thumb" key={i}>
                        <img src={work[i % work.length].thumb} alt="" loading="eager" />
                    </div>
                ))}
            </div>

            <div className="wh-mid">
                <span className="wh-eyebrow"><em />Portfolio — 2022 to 2024</span>

                <h1 className="wh-title spark-line">
                    <span className="wh-word"><i className="spark spark--light">Selected</i></span>{' '}
                    <span className="wh-word"><i className="spark spark--light">work</i></span>
                </h1>

                <p className="wh-lead">
                    Brand, campaign and content work for Nigerian companies that
                    <strong> had to be understood before they could be chosen.</strong>
                </p>

                <ul className="wh-stats">
                    <li><b>{String(work.length).padStart(2, '0')}</b><span>Projects</span></li>
                    <li><b>{String(disciplines).padStart(2, '0')}</b><span>Disciplines</span></li>
                    <li><b>{String(industries).padStart(2, '0')}</b><span>Industries</span></li>
                </ul>
            </div>


            <a
                className="wh-scroll"
                href="#work-index"
                onClick={(e) => {
                    const t = document.getElementById('work-index')
                    if (!t) return
                    e.preventDefault()
                    scrollToY(t.getBoundingClientRect().top + window.scrollY - 20, 1.1)
                }}
            >
                <span>Scroll to explore</span>
                <em aria-hidden="true">
                    <svg viewBox="0 0 14 20" width="12" height="17" fill="none"
                         stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 1v17M1.5 12.5 7 18l5.5-5.5" />
                    </svg>
                </em>
            </a>
        </section>
    )
}
