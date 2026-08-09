import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { WORK } from "../content/site"

gsap.registerPlugin(ScrollTrigger)

export default function WorkGrid() {
    const secRef = useRef(null)
    const pathRef = useRef(null)
    const pulseRef = useRef(null)
    const [box, setBox] = useState({ w: 0, h: 0 })
    const [live, setLive] = useState(0)
    const [inRun, setInRun] = useState(false)

    const draw = useCallback(() => {
        const sec = secRef.current
        const path = pathRef.current
        if (!sec || !path) return

        const cards = [...sec.querySelectorAll('.wk-card')]
        if (cards.length < 2) return

        const base = sec.getBoundingClientRect()
        const pts = cards.map((c) => {
            const f = c.querySelector('.wk-shot').getBoundingClientRect()
            return {
                x: f.left - base.left + f.width / 2,
                y: f.top - base.top + f.height / 2,
            }
        })

        setBox({ w: Math.round(base.width), h: Math.round(base.height) })


        let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i - 1] || pts[i]
            const p1 = pts[i]
            const p2 = pts[i + 1]
            const p3 = pts[i + 2] || p2
            d += ` C ${(p1.x + (p2.x - p0.x) / 6).toFixed(1)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(1)},`
               + ` ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(1)},`
               + ` ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
        }
        path.setAttribute('d', d)
        pulseRef.current?.setAttribute('d', d)

        const len = path.getTotalLength()
        path.style.strokeDasharray = `${len}`
        path.style.strokeDashoffset = `${len}`
        if (pulseRef.current) {
            pulseRef.current.style.strokeDasharray = `0 ${len}`
            pulseRef.current.style.strokeDashoffset = '0'
        }
        return len
    }, [])

    useLayoutEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const canHover = window.matchMedia('(hover: hover)').matches
        const sec = secRef.current

        const ctx = gsap.context(() => {
            const cards = [...sec.querySelectorAll('.wk-card')]
            const offs = []

            cards.forEach((card, i) => {
                const shot = card.querySelector('.wk-shot')
                const img = card.querySelector('.wk-shot img')
                const words = [...card.querySelectorAll('.wk-word i')]
                const meta = [...card.querySelectorAll('.wk-client, .wk-line, .wk-tags li')]
                const ghost = card.querySelector('.wk-ghost')

                if (reduce) {
                    gsap.set([shot, ...words, ...meta], { clearProps: 'all' })
                } else {
                    const tl = gsap.timeline({
                        scrollTrigger: { trigger: card, start: 'top 84%', once: true },
                    })
                    tl.fromTo(shot,
                        { clipPath: 'inset(100% 0% 0% 0%)' },
                        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'expo.out' })
                     .from(img, { scale: 1.28, duration: 1.4, ease: 'expo.out' }, 0)
                     .from(words, { yPercent: 112, duration: 0.9, ease: 'expo.out', stagger: 0.05 }, 0.28)
                     .from(meta, { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.035 }, 0.42)

                    gsap.fromTo(img, { yPercent: -6 }, {
                        yPercent: 6, ease: 'none',
                        scrollTrigger: { trigger: shot, start: 'top bottom', end: 'bottom top', scrub: true },
                    })

                    if (ghost) {
                        gsap.fromTo(ghost, { yPercent: 26 }, {
                            yPercent: -26, ease: 'none',
                            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
                        })
                    }
                }

                ScrollTrigger.create({
                    trigger: card,
                    start: 'top 60%',
                    end: 'bottom 40%',
                    onToggle: (self) => { if (self.isActive) setLive(i) },
                })

                if (!canHover || reduce) return

                const rx = gsap.quickTo(shot, 'rotationX', { duration: 0.6, ease: 'power3' })
                const ry = gsap.quickTo(shot, 'rotationY', { duration: 0.6, ease: 'power3' })

                const move = (e) => {
                    const r = shot.getBoundingClientRect()
                    ry(((e.clientX - r.left) / r.width - 0.5) * 9)
                    rx(-(((e.clientY - r.top) / r.height - 0.5) * 7))
                }
                const enter = () => {
                    sec.classList.add('is-focus')
                    card.classList.add('is-hot')
                    gsap.to(shot, { scale: 1.025, duration: 0.6, ease: 'power3.out' })
                    gsap.to(img, { scale: 1.07, duration: 0.9, ease: 'power3.out' })
                }
                const leave = () => {
                    sec.classList.remove('is-focus')
                    card.classList.remove('is-hot')
                    rx(0); ry(0)
                    gsap.to(shot, { scale: 1, duration: 0.6, ease: 'power3.out' })
                    gsap.to(img, { scale: 1, duration: 0.9, ease: 'power3.out' })
                }
                card.addEventListener('pointermove', move)
                card.addEventListener('pointerenter', enter)
                card.addEventListener('pointerleave', leave)
                offs.push(() => {
                    card.removeEventListener('pointermove', move)
                    card.removeEventListener('pointerenter', enter)
                    card.removeEventListener('pointerleave', leave)
                })
            })

            ScrollTrigger.create({
                trigger: sec,
                start: 'top 55%',
                end: 'bottom 55%',
                onToggle: (self) => setInRun(self.isActive),
            })

            const teardown = () => offs.forEach((f) => f())
            if (reduce) return teardown

            const len = draw()
            if (!len) return teardown

            gsap.to(pathRef.current, {
                strokeDashoffset: 0, ease: 'none',
                scrollTrigger: { trigger: sec, start: 'top 70%', end: 'bottom 80%', scrub: 0.6 },
            })

            if (pulseRef.current) {
                gsap.fromTo(pulseRef.current,
                    { strokeDasharray: `86 ${len}`, strokeDashoffset: 0 },
                    {
                        strokeDashoffset: -len, ease: 'none',
                        scrollTrigger: { trigger: sec, start: 'top 70%', end: 'bottom 80%', scrub: 0.6 },
                    })
            }

            return teardown
        }, secRef)

        return () => ctx.revert()
    }, [draw])

    useEffect(() => {
        const redo = () => { draw(); ScrollTrigger.refresh() }
        const t = setTimeout(redo, 600)
        document.fonts?.ready.then(redo).catch(() => {})
        window.addEventListener('resize', redo)
        return () => {
            clearTimeout(t)
            window.removeEventListener('resize', redo)
        }
    }, [draw])

    return (
        <section className="wk" id="work-index" ref={secRef}>
            <svg
                className="wk-thread"
                viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}
                width={box.w || undefined}
                height={box.h || undefined}
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path ref={pathRef} className="wk-line-base" d="" fill="none" />
                <path ref={pulseRef} className="wk-line-pulse" d="" fill="none" />
            </svg>

            {WORK.map((w, i) => (
                <article
                    className="wk-card"
                    key={w.id}
                    style={{ '--start': w.start, '--span': w.span, '--row': w.row, '--off': `${w.off}px` }}
                >
                    <span className="wk-ghost" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>

                    {/* the whole card is the link now that there is somewhere
                        to go — a plain <a> to match the rest of the site */}
                    <a className="wk-link" href={`/work/${w.id}`} aria-label={`${w.client} — ${w.title}`}>
                    <figure className="wk-shot">
                        <img src={w.img} alt={`${w.client} — ${w.title}`} loading="lazy" />
                        <span className="wk-n">{String(i + 1).padStart(2, '0')}</span>
                    </figure>

                    <div className="wk-meta">
                        <span className="wk-client">{w.client}</span>

                        <h2 className="wk-title">
                            {w.title.split(' ').map((word, n) => (
                                <span className="wk-word" key={n}><i>{word}</i></span>
                            ))}
                        </h2>

                        <p className="wk-line">{w.line}</p>

                        <ul className="wk-tags">
                            {w.disciplines.map((d) => <li key={d}>{d}</li>)}
                            <li className="wk-year">{w.year}</li>
                        </ul>

                        <span className="wk-cta">
                            View case study
                            <em aria-hidden="true">&rarr;</em>
                        </span>
                    </div>
                    </a>
                </article>
            ))}

            <div className={`wk-count ${inRun ? 'is-on' : ''}`} aria-hidden="true">
                <b>{String(live + 1).padStart(2, '0')}</b>
                <em />
                <span>{String(WORK.length).padStart(2, '0')}</span>
            </div>
        </section>
    )
}
