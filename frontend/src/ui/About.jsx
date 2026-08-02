import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { STATS, LOGOS } from "../content/site";
import { fill } from "three/src/extras/TextureUtils.js";

const FILL_TEXT = "At the end of the day, we're here to help your brand grow. That means thinking past decoration. Building strategy, design and story that move real numbers."

export default function About() {
    const fillRef = useRef(null)

    useEffect(() => {
        const words = fillRef.current.querySelectorAll('.fw')
        const anim = gsap.to(words, {
            color: "#0b0b0e",
            ease: 'none',
            stagger: 0.4,
            scrollTrigger: {
                trigger: fillRef.current,
                start: 'top 78%',
                end: 'bottom 55%',
                scrub: 0.5,
            },
        })
        return () => { anim.scrollTrigger?.kill(); anim.kill() }
    }, [])

    return (
        <section className="about" id="about">
            <div className="about-head">
                <span className="tag">+ WHO WE ARE</span>
                <h2 className="about-title">
                    <span className="dim">Built for brands</span><br />that intend to last
                </h2>
                <p className="about-sub">
                    We&rsquo;re a full-service creative and digital agency based in Lagos, working worldwide, turning ideas into brands people remember.
                </p>
            </div>

            <div className="about-logos">
                <span className="tag">TRUSTED BY</span>
                <div className="logo-row">
                    {LOGOS.map((l) => (
                        <img key={l.name} src={l.src} alt={l.name} title={l.name} />
                    ))}
                </div>
            </div>

            <p className="fill" ref={fillRef}>
                {FILL_TEXT.split(' ').map((w, i) => (
                    <span className="fw" key={i}>{w} </span>
                ))}
            </p>

            <div className="stats">
                {STATS.map((s) => (
                    <div className="stat-card" key={s.label}>
                        <span className="stat-dots" aria-hidden="true" />
                        <span className="stat-label">{s.label}</span> 
                        <span className="stat-value">{s.value}</span> 
                        <span className="stat-note">{s.note}</span> 
                    </div>
                ))}
            </div>
        </section>
    )
}