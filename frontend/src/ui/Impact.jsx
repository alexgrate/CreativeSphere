import { useEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { IMPACT } from "../content/site"
import { TrendingUp, Users, Store, Layers, CalendarDays, Sparkles, Globe2, Award } from "lucide-react"


const ICONS = {
  followers:   TrendingUp,
  influencers: Users,
  brands:      Store,
  industries:  Layers,
  founded:     CalendarDays,
  disciplines: Sparkles,
  reach:       Globe2,
  standards:   Award,
}


export default function Impact({ 
    title = <>We turn attention<br />into results.</>,
    lead = 'Full-service creative leadership for banks, FMCG giants, fintechs and insurers that need more than a design vendor.',
    items = IMPACT,
}) {
    const secRef = useRef(null)



    useEffect(() => {
        const counters = [...secRef.current.querySelectorAll('.i-value b')].map(el => {
            const target = Number(el.dataset.count)
            // years and codes must not get a thousands separator
            const plain = el.dataset.plain === '1'
            const fmt = (n) => plain ? String(n) : n.toLocaleString()

            if (el.dataset.nocount === '1') {
                el.textContent = fmt(target)
                return null
            }

            const obj = { n: 0 }
            return gsap.to(obj, {
                n: target, duration: 1.6, ease: 'power2.out',
                scrollTrigger: { trigger: secRef.current, start: 'top 76%' },
                onUpdate: () => { el.textContent = fmt(Math.round(obj.n)) },
            })
        }).filter(Boolean)

        return () => {
            counters.forEach(c => { c.scrollTrigger?.kill(); c.kill() })
        }
    }, [items])

    return (
        <section className="impact" ref={secRef}>
            <div className="impact-head">
                <h2 className="spark">{title}</h2>
                <p data-reveal>
                    {lead}
                </p>
            </div>

            <div className="impact-cards">
                {items.map(c => {
                    const Icon = ICONS[c.id]
                    return (
                    <article className="i-card" key={c.id} tabIndex={0} data-reveal>
                        <div className="i-front">
                            <Icon size={34} strokeWidth={1.6} aria-hidden="true" />
                            <div>
                                <span className="i-value">
                                    <b
                                        data-count={c.value}
                                        data-plain={c.plain ? '1' : undefined}
                                        data-nocount={c.noCount ? '1' : undefined}
                                    >0</b>{c.suffix}
                                </span>
                                <span className="i-label">{c.label}</span>
                            </div>
                        </div>
                        <p className="i-back">{c.detail}</p>
                    </article>
                    )
                })}
            </div>
        </section>
    )
}
