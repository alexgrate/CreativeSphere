import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { WORK } from "../content/site"

gsap.registerPlugin(ScrollTrigger)

export default function WorkDetail({ project }) {
    const secRef = useRef(null)

    const idx = WORK.findIndex((w) => w.id === project.id)
    const next = WORK[(idx + 1) % WORK.length]

    useLayoutEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const sec = secRef.current

        const ctx = gsap.context(() => {
            if (reduce) return

            const words = [...sec.querySelectorAll('.wd-word i')]
            const lede = [...sec.querySelectorAll('.wd-eyebrow, .wd-line, .wd-facts')]

            gsap.from(words, { yPercent: 116, duration: 1.2, ease: 'expo.out', stagger: 0.055 })
            gsap.from(lede, {
                opacity: 0, y: 20, duration: 0.85, ease: 'power3.out', stagger: 0.09, delay: 0.25,
            })

            const banner = sec.querySelector('.wd-banner')
            gsap.timeline({ delay: 0.35 })
                .fromTo(banner,
                    { clipPath: 'inset(100% 0% 0% 0%)' },
                    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'expo.out' })
                .from(banner.querySelector('img'), { scale: 1.24, duration: 1.5, ease: 'expo.out' }, 0)

            gsap.to(banner.querySelector('img'), {
                yPercent: 8, ease: 'none',
                scrollTrigger: { trigger: banner, start: 'top top', end: 'bottom top', scrub: true },
            })

            sec.querySelectorAll('.wd-reveal').forEach((el) => {
                gsap.from(el, {
                    y: 44, opacity: 0, duration: 1, ease: 'expo.out',
                    scrollTrigger: { trigger: el, start: 'top 86%', once: true },
                })
            })

            sec.querySelectorAll('.wd-shot').forEach((fig) => {
                gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 84%', once: true } })
                    .fromTo(fig,
                        { clipPath: 'inset(100% 0% 0% 0%)' },
                        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out' })
                    .from(fig.querySelector('img'), { scale: 1.2, duration: 1.35, ease: 'expo.out' }, 0)

                gsap.fromTo(fig.querySelector('img'), { yPercent: -5 }, {
                    yPercent: 5, ease: 'none',
                    scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true },
                })
            })

            sec.querySelectorAll('.wd-stat b').forEach((el) => {
                const raw = el.dataset.v || ''
                const num = parseFloat(raw.replace(/[^\d.]/g, ''))
                if (!Number.isFinite(num)) return
                const obj = { n: 0 }
                gsap.to(obj, {
                    n: num, duration: 1.9, ease: 'expo.out',
                    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                    onUpdate: () => {
                        const v = num >= 100 ? Math.round(obj.n).toLocaleString()
                                             : obj.n.toFixed(0)
                        el.textContent = raw.replace(/[\d,.]+/, v)
                    },
                })
            })
        }, secRef)

        return () => ctx.revert()
    }, [project.id])

    return (
        <article className="wd" ref={secRef}>
            <header className="wd-top">
                <a className="wd-eyebrow" href="/work">
                    <span aria-hidden="true">&larr;</span> All work
                </a>

                <h1 className="wd-title spark-line">
                    {project.title.split(' ').map((word, n) => (
                        <span className="wd-word" key={n}><i className="spark spark--light">{word}</i></span>
                    ))}
                </h1>

                <p className="wd-line">{project.line}</p>

                <dl className="wd-facts">
                    <div><dt>Client</dt><dd>{project.client}</dd></div>
                    <div><dt>Sector</dt><dd>{project.sector}</dd></div>
                    <div><dt>Year</dt><dd>{project.year}</dd></div>
                    <div className="wd-facts-wide">
                        <dt>Scope</dt>
                        <dd>{project.scope.join(', ')}</dd>
                    </div>
                </dl>
            </header>

            <figure className="wd-banner">
                <img src={project.hero} alt={`${project.client} — ${project.title}`}
                     width="1800" height="900" loading="eager" fetchPriority="high" />
            </figure>

            <div className="wd-body">
                <section className="wd-block wd-reveal">
                    <h2>The situation</h2>
                    <p>{project.brief}</p>
                </section>

                <section className="wd-block wd-reveal">
                    <h2>What we did</h2>
                    <p>{project.approach}</p>
                </section>
            </div>

            <div className="wd-shots">
                {project.shots.map((src, n) => (
                    <figure className="wd-shot" key={src}>
                        <img src={src} alt={`${project.client} — detail ${n + 1}`}
                             width="1100" height="820" loading="lazy" />
                    </figure>
                ))}
            </div>

            {project.stats && (
                <ul className="wd-stats wd-reveal">
                    {project.stats.map((s) => (
                        <li className="wd-stat" key={s.l}>
                            <b data-v={s.v}>{s.v}</b>
                            <span>{s.l}</span>
                        </li>
                    ))}
                </ul>
            )}

            <section className="wd-outcome wd-reveal">
                <span className="wd-outcome-label">The result</span>
                <p>{project.outcome}</p>
            </section>

            <a className="wd-next" href={`/work/${next.id}`}>
                <span className="wd-next-label">Next project</span>
                <span className="wd-next-title">{next.title}</span>
                <span className="wd-next-client">{next.client}</span>
                <figure><img src={`/work/t-${next.id}.webp`} alt="" loading="lazy" /></figure>
            </a>
        </article>
    )
}
