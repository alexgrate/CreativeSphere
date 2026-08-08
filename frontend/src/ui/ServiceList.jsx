import { useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import {
  Compass, PenTool, Clapperboard, MessageCircle, Megaphone, LineChart, CornerDownRight,
} from "lucide-react"
import { SERVICES } from "../content/site"

const ICONS = {
  strategy: Compass, identity: PenTool, content: Clapperboard,
  social: MessageCircle, ads: Megaphone, analytics: LineChart,
}

export default function ServiceList() {
  const [active, setActive] = useState(0)
  const [canHover] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
  )
  const hostRef = useRef(null)
  const previewRef = useRef(null)

  useLayoutEffect(() => {
    const host = hostRef.current
    const preview = previewRef.current
    if (!host || !preview) return
    if (!window.matchMedia('(hover: hover)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0.8, opacity: 0 })
      const xTo = gsap.quickTo(preview, 'x', { duration: 0.55, ease: 'power3' })
      const yTo = gsap.quickTo(preview, 'y', { duration: 0.55, ease: 'power3' })

      const move = (e) => {
        const r = host.getBoundingClientRect()
        xTo(e.clientX - r.left)
        yTo(e.clientY - r.top)
      }
      const enter = (e) => {
        move(e)   
        gsap.to(preview, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' })
      }
      const leave = () =>
        gsap.to(preview, { opacity: 0, scale: 0.8, duration: 0.35, ease: 'power3.out' })

      host.addEventListener('pointermove', move)
      host.addEventListener('pointerenter', enter)
      host.addEventListener('pointerleave', leave)
      return () => {
        host.removeEventListener('pointermove', move)
        host.removeEventListener('pointerenter', enter)
        host.removeEventListener('pointerleave', leave)
      }
    }, hostRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="svc">
      <div className="svc-head">
        <div className="svc-headL">
          <h1 className="svc-title spark">Our services</h1>
          <p className="svc-lead">
            <CornerDownRight size={20} strokeWidth={1.6} aria-hidden="true" />
            <span>
              Six disciplines under one roof, so strategy, craft and distribution
              never get handed between agencies.
            </span>
          </p>
        </div>

        <div className="svc-stat">
          <span className="svc-stat-label">Brands transformed</span>
          <span className="svc-stat-value">9+</span>
          <span className="svc-stat-note">Across eight industries since 2019</span>
        </div>
      </div>

      <div className="svc-body">
        <div className="svc-list" ref={hostRef}>
          {canHover && (
            <div className="svc-preview" ref={previewRef} aria-hidden="true">
              {SERVICES.map((s, i) => (
                <img key={s.id} src={s.img} alt="" className={i === active ? 'is-on' : ''} />
              ))}
            </div>
          )}

          {SERVICES.map((s, i) => {
            const Icon = ICONS[s.id]
            return (
              <div
                className={`svc-row ${i === active ? 'is-active' : ''}`}
                key={s.id}
                onPointerEnter={() => setActive(i)}
              >

                <figure className="svc-shot" aria-hidden="true">
                  <img src={s.img} alt="" loading="lazy" />
                  <span className="svc-idx">{String(i + 1).padStart(2, '0')}</span>
                </figure>

                <span className="svc-name">
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                  {s.title}
                </span>
              </div>
            )
          })}
        </div>

        <div className="svc-note" data-reveal>
          <p>
            Every engagement starts with strategy and ends with numbers. We build the
            brand, make the work, put it in front of the right people and measure what
            it moved — one team, no handoffs between three different agencies.
          </p>
        </div>
      </div>
    </section>
  )
}
