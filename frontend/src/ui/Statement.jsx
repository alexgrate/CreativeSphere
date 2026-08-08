import { Fragment, useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { STATEMENT } from "../content/site"

gsap.registerPlugin(ScrollTrigger)

export default function Statement() {
    const secRef = useRef(null)

    useLayoutEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const words = [...secRef.current.querySelectorAll('.st-w')]

        if (reduce) {
            gsap.set(words, { opacity: 1 })
            return
        }

        const ctx = gsap.context(() => {
            gsap.fromTo(words,
                { opacity: 0.16 },
                {
                    opacity: 1,
                    ease: 'none',
                    stagger: 0.5,
                    scrollTrigger: {
                        trigger: secRef.current,
                        start: 'top 85%',
                        end: 'bottom 70%',
                        scrub: 0.4,
                    },
                })
        }, secRef)

        return () => ctx.revert()
    }, [])

    return (
        <section className="st" ref={secRef}>
            <span className="st-eyebrow">{STATEMENT.eyebrow}</span>

            <p className="st-body">
                {/* the space is a sibling text node, not part of the span: a
                    trailing space inside an inline-block collapses away */}
                {STATEMENT.body.map((w, i) => (
                    <Fragment key={i}>
                        <span className="st-w">{w}</span>{' '}
                    </Fragment>
                ))}
            </p>

            <p className="st-sig">{STATEMENT.sig}</p>
        </section>
    )
}
