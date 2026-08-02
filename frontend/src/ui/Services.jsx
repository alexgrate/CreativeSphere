import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { SERVICES } from "../content/site";

const APPROACH = "Our approach is about cutting through noise and building brands that feel clear, confident, and unmistakably their own."

export default function Services() {
    const listRef = useRef(null)
    const approachRef = useRef(null)
    const btnRef = useRef(null)

    const onDoorMove = (e) => {
        const btn = btnRef.current
        if (!btn) return
        const r = btn.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.18}px)`
    }
    const onDoorLeave = () => { if (btnRef.current) btnRef.current.style.transform = '' }

    useEffect(() => {
        const rows = listRef.current.querySelectorAll('.svc-row')
        const words = approachRef.current.querySelectorAll('.fw')
        const fillAnim = gsap.to(words, {
            color: '#f2f2f2',
            ease: 'none',
            stagger: 0.4,
            scrollTrigger: { trigger: approachRef.current, start: 'top 80%', end: 'bottom 58%', scrub: 0.5 },
        })

        const anims = [...rows].map((row) =>
            gsap.fromTo(row, 
                { y: 34, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.7,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: row, start: 'top 88%' }
                }
            )
        )
        return () => {
            anims.forEach((a) => { a.scrollTrigger?.kill(); a.kill() })
            fillAnim.scrollTrigger?.kill()
            fillAnim.kill()
            gsap.set(rows, { clearProps: 'all' })
        }

    }, [])

    return (
        <section className="services" id="services">
            <div className="svc-wrap">
                <div className="svc-intro">
                    <span className="tag tag-light">+ SERVICES</span>
                    <h2 className="svc-title">
                        <span className="accent">Our</span> focus
                    </h2>
                    <p className="svc-lead">
                        A complete but focused range of services, built to support ambitious
                        brands at every stage of their growth.
                    </p>
                </div>

                <div className="svc-list" ref={listRef}>
                    {SERVICES.map((s) => (
                        <article className="svc-row" key={s.n}>
                            <span className="svc-n"><i>◆</i>{s.n}</span>
                            <div className="svc-thumb"><img src={s.img} alt="" loading="lazy" /></div>
                            <h3 className="svc-name">{s.name}</h3>
                            <p className="svc-line">{s.line}</p>
                        </article>
                    ))}
                </div>

                <div className="svc-close">
                    <p className="approach" ref={approachRef}>
                        {APPROACH.split(' ').map((w, i) => <span className="fw" key={i}>{w} </span>)}
                    </p>

                    <a className="door" href="/contact" onPointerMove={onDoorMove} onPointerLeave={onDoorLeave}>
                        <span className="door-tag">NEXT STEP</span>
                        <span className="door-title">Let&rsquo;s build yours.</span>
                        <span className="door-mail">hello@thecreativesphere.com</span>
                        <span className="door-btn" ref={btnRef} aria-hidden="true">
                            <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                        </span>
                    </a>
                </div>
            </div>
        </section>
    )
}