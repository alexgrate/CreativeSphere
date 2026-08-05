import { useEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { IMPACT } from "../content/site"
import { TrendingUp, Users, Store, Layers } from "lucide-react"

const ICONS = {
  followers:   TrendingUp,
  influencers: Users,
  brands:      Store,
  industries:  Layers,
}

export default function Impact() {
    const secRef = useRef(null)

    useEffect(() => {
        const cards = secRef.current.querySelectorAll('.i-card')
        const entrance = gsap.fromTo(cards,
            { y: 44, opacity: 0 },
            {
                y: 0, opacity: 1,
                duration: 0.85, stagger: 0.12, ease: 'power3.out',
                scrollTrigger: { trigger: secRef.current, start: 'top 76%' },
            }
        )

        const counters = [...secRef.current.querySelectorAll('.i-value b')].map(el => {
            const target = Number(el.dataset.count)
            const obj = { n: 0 }
            return gsap.to(obj, {
                n: target, duration: 1.6, ease: 'power2.out',
                scrollTrigger: { trigger: secRef.current, start: 'top 76%' },
                onUpdate: () => { el.textContent = Math.round(obj.n).toLocaleString() },
            })
        })

        return () => {
            entrance.scrollTrigger?.kill(); entrance.kill()
            counters.forEach(c => { c.scrollTrigger?.kill(); c.kill() })
            gsap.set(cards, { clearProps: 'all' })
        }
    }, [])

    return (
        <section className="impact" ref={secRef}>
            <div className="impact-head">
                <h2>We turn attention<br />into results.</h2>
                <p>
                    Full-service creative leadership for banks, FMCG giants,
                    fintechs and insurers that need more than a design vendor.
                </p>
            </div>

            <div className="impact-cards">
                {IMPACT.map(c => {
                    const Icon = ICONS[c.id]
                    return (
                    <article className="i-card" key={c.id} tabIndex={0}>
                        <div className="i-front">
                            <Icon size={34} strokeWidth={1.6} aria-hidden="true" />
                            <div>
                                <span className="i-value"><b data-count={c.value}>0</b>{c.suffix}</span>
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
