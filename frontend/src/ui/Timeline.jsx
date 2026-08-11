import { useEffect, useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTimeline } from "../lib/api"
import { scrollToY } from "../hooks/useSmoothScroll"

gsap.registerPlugin(ScrollTrigger)

const PULSE = [0.22, 0.30, 0.24, 0.42, 0.28, 0.72, 1, 0.55, 0.26, 0.34,
               0.24, 0.28, 0.46, 0.26, 0.32, 0.22, 0.38, 0.26, 0.30, 0.24]

const STEP_VH = 0.62
const HEADER_H = 64        

function Ticks({ active }) {
    return (
        <div className={`tl-ticks ${active ? 'is-active' : ''}`} aria-hidden="true">
            {PULSE.map((h, i) => (
                <span key={i} style={{ '--h': h, '--i': i }} />
            ))}
        </div>
    )
}

export default function Timeline() {
    const { data: milestones } = useTimeline()
    const [active, setActive] = useState(0)
    const secRef = useRef(null)
    const railRef = useRef(null)
    const trackRef = useRef(null)
    const stRef = useRef(null)

    const N = milestones.length

    useLayoutEffect(() => {

        if (N < 2) return

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia()

            mm.add('(prefers-reduced-motion: no-preference) and (min-height: 480px)', () => {
                const sec = secRef.current
                const rail = railRef.current
                const track = trackRef.current

                if (sec.offsetHeight > window.innerHeight - HEADER_H) return

                sec.classList.add('is-pinned')
                const setX = gsap.quickSetter(track, 'x', 'px')

                const maxX = () => {
                    const pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0
                    return Math.max(0, track.scrollWidth - (rail.clientWidth - pad))
                }

                const restFor = (i) => {
                    const cols = track.children
                    return Math.min(cols[i].offsetLeft - cols[0].offsetLeft, maxX())
                }

                const st = ScrollTrigger.create({
                    trigger: sec,
                    start: `top ${HEADER_H}px`,
                    end: () => '+=' + Math.round((N - 1) * window.innerHeight * STEP_VH),
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const p = self.progress * (N - 1)   
                        const lo = Math.min(Math.floor(p), N - 2)
                        setX(-gsap.utils.interpolate(restFor(lo), restFor(lo + 1), p - lo))
                        setActive(Math.round(p))
                    },
                })

                stRef.current = st
                return () => {
                    stRef.current = null
                    sec.classList.remove('is-pinned')
                    gsap.set(track, { clearProps: 'transform' })
                }
            })
        }, secRef)

        return () => ctx.revert()
    }, [N])

    useEffect(() => {
        const rail = railRef.current
        if (!rail) return
        let raf = 0
        const onScroll = () => {
            if (stRef.current) return        
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                const railRect = rail.getBoundingClientRect()
                const pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0
                const mark = railRect.left + pad + 40
                let best = 0, dist = Infinity
                rail.querySelectorAll('.tl-item').forEach((el, i) => {
                    const d = Math.abs(el.getBoundingClientRect().left - mark)
                    if (d < dist) { dist = d; best = i }
                })
                setActive((cur) => (cur === best ? cur : best))
            })
        }
        rail.addEventListener('scroll', onScroll, { passive: true })
        return () => { cancelAnimationFrame(raf); rail.removeEventListener('scroll', onScroll) }
    }, [])


    const go = (i) => {
        if (N < 2) return
        const next = Math.min(Math.max(i, 0), N - 1)
        const st = stRef.current
        if (!st) {                       
            setActive(next)
            const col = railRef.current?.children[0]?.children[next]
            if (col) {
                const rail = railRef.current
                const pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0
                const delta = col.getBoundingClientRect().left - rail.getBoundingClientRect().left - pad
                rail.scrollTo({ left: rail.scrollLeft + delta, behavior: 'smooth' })
            }
            return
        }
        scrollToY(st.start + (next / (N - 1)) * (st.end - st.start))
    }

    return (
        <section className="tl" ref={secRef}>
            <div className="tl-head">
                <h2 className="spark">The story behind<br />the studio</h2>
                <div className="tl-nav">
                    <button onClick={() => go(active - 1)} disabled={active === 0}
                            aria-label="Previous milestone"><ChevronLeft size={18} /></button>
                    <button onClick={() => go(active + 1)} disabled={active === N - 1}
                            aria-label="Next milestone"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="tl-rail" ref={railRef}>
                <div className="tl-track" ref={trackRef}>
                    {milestones.map((m, i) => (
                        <article
                            className={`tl-item ${i === active ? 'is-active' : ''}`}
                            key={m.id}
                            onClick={() => go(i)}
                            onFocus={() => go(i)}
                            tabIndex={0}
                        >
                            <div className="tl-top">
                                <span className="tl-rule" aria-hidden="true" />
                                <h3 className="tl-year">{m.year}</h3>
                                <p className="tl-label">{m.title}</p>
                                <Ticks active={i === active} />
                            </div>

                            <div className="tl-detail">
                                <div className="tl-detail-in">
                                    <p className="tl-body">{m.body}</p>
                                    <img className="tl-img" src={m.img}
                                         alt={m.alt} loading="lazy" draggable="false" />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
