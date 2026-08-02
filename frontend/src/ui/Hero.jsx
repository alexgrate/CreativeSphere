import { useEffect, useState, useRef } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { lockScroll } from "../hooks/useSmoothScroll"


export default function Hero() {
    const [open, setOpen] = useState(false)
    const wordRef = useRef(null)

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        lockScroll(open)
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false)}
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    useEffect(() => {
        const el = wordRef.current
        const anim = gsap.to(el, {
            filter: 'blur(16px)',
            opacity: 0.15,
            scale: 1.04,
            ease: 'none',
            scrollTrigger: {
                trigger: el,
                start: 'top 65%',
                end: 'bottom 15%',
                scrub: 0.6,
            },
        })
        return () => { anim.scrollTrigger?.kill(); anim.kill() }
    }, [])


    return (
        <>
            <section className="hero">
                <div className="hero-left">
                    <div className="hero-statement">
                        <p>We are a creative agency.</p>
                        <p>Through strategy, design and storytelling, we turn ideas into powerful brands.</p>
                    </div>
                    <span className="hero-cue">SCROLL DOWN<br />AND LEARN MORE</span>
                </div>

                <div className="hero-right">
                    <div className="reel-meta">
                        <span className="reel-label">SEE SHOWREEL</span>
                        <span className="reel-time">00:01:32</span>
                    </div>
                    <button className="sphere" onClick={() => setOpen(true)} aria-label="Play showreel with sound">
                        <video className="sphere-vid" autoPlay muted loop playsInline preload="auto" poster="/reel-poster.jpg">
                            <source src="/reel-loop.webm" type="video/webm" />
                            <source src="/reel-loop.mp4" type="video/mp4" />
                        </video>

                        <svg className="sphere-ring" viewBox="0 0 200 200" aria-hidden="true">
                            <defs>
                                <path id="ring" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"  />
                            </defs>
                            <text><textPath href="#ring">SHOWREEL · 00:01:32 · WATCH IN FULL · SHOWREEL · 00:01:32 · WATCH IN FULL ·</textPath></text>
                        </svg>

                        <span className="sphere-cta">WATCH ↗</span>
                    </button>
                </div>
            </section>

            <div className="wordmark" ref={wordRef}>
                <svg viewBox="0 0 1000 118" width="100%" aria-hidden="true">
                    <text x="500" y="100" textAnchor="middle" textLength="1000" lengthAdjust="spacingAndGlyphs">
                        CREATIVESPHERE
                    </text>
                </svg>
            </div>

            {open && (
                <div className="reel-full" role="dialog" aria-modal="true" aria-label="Showreel">
                    <button className="reel-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
                    <video className="reel-full-vid" src="/reel-full.mp4" autoPlay controls playsInline />
                </div>
            )}
        </>
    )
}