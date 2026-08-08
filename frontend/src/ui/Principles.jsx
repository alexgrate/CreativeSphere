import { useLayoutEffect, useRef } from "react"
import ScrollTrigger from "gsap/ScrollTrigger"
import { PRINCIPLES } from "../content/site"

export default function Principles() {
    const secRef = useRef(null)

    /* the rules draw in CSS; this only decides when. Done here rather than in
       useReveal because the item itself fades — the rule needs its own beat. */
    useLayoutEffect(() => {
        const items = [...secRef.current.querySelectorAll('.pr-item')]
        const sts = items.map((el, i) => ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => setTimeout(() => el.classList.add('is-in'), i * 110),
        }))
        return () => sts.forEach((st) => st.kill())
    }, [])

    return (
        <section className="pr" ref={secRef}>
            <span className="pr-eyebrow">What we believe</span>

            <div className="pr-grid">
                {PRINCIPLES.map((p) => (
                    <article className="pr-item" key={p.id}>
                        <span className="pr-rule" aria-hidden="true" />
                        <h3>{p.title}</h3>
                        <p>{p.line}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}
