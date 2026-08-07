import { useEffect, useState } from "react"

// The nav uses plain <a href>, so every internal click is a full page load and
// would re-run this. Once per session is enough.
const SEEN = 'tcs:loaded'

const MIN_MS = 1100    // never flash — a loader that blinks reads as a glitch
const MAX_MS = 6000    // never hang on one slow asset either
const PANELS = 5       // curtain slats, lifted in sequence on exit
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/* One column of an odometer: the 0-9 strip slides so the wanted digit lands in
   the window. Columns run at different speeds — units snappy, hundreds slow —
   which is what stops it reading like three numbers changing at once. */
function Digit({ value, speed }) {
    return (
        <span className="ld-digit">
            <span className="ld-roll" style={{ transform: `translateY(${-value * 10}%)`, '--spd': speed }}>
                {DIGITS.map((n) => <b key={n}>{n}</b>)}
            </span>
        </span>
    )
}

export default function Loader() {
    const [pct, setPct] = useState(0)
    const [out, setOut] = useState(false)
    const [gone, setGone] = useState(() => {
        try { return sessionStorage.getItem(SEEN) === '1' } catch { return false }
    })

    useEffect(() => {
        // already played this session — don't lock scroll, don't animate
        try { if (sessionStorage.getItem(SEEN) === '1') return } catch { /* private mode */ }

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const t0 = performance.now()
        let raf = 0, alive = true
        let fontsDone = false, loadDone = document.readyState === 'complete'

        document.fonts?.ready.then(() => { fontsDone = true }).catch(() => { fontsDone = true })
        const onLoad = () => { loadDone = true }
        window.addEventListener('load', onLoad)

        document.body.style.overflow = 'hidden'

        // real progress where we can measure it, floored by a time ramp so the
        // number always moves even when everything is cached
        const readTarget = () => {
            const imgs = [...document.images]
            const ready = imgs.filter((i) => i.complete && i.naturalWidth > 0).length
            const assets = (imgs.length ? ready / imgs.length : 1) * 0.7 + (fontsDone ? 0.3 : 0)
            const ramp = Math.min(0.92, (performance.now() - t0) / 2000)
            return Math.max(assets, ramp)
        }

        let shown = 0
        const tick = () => {
            if (!alive) return
            const elapsed = performance.now() - t0
            const finished = (loadDone && fontsDone && elapsed > MIN_MS) || elapsed > MAX_MS
            const target = finished ? 1 : Math.min(readTarget(), 0.97)

            shown += (target - shown) * (reduce ? 1 : 0.07)
            const next = Math.min(100, Math.round(shown * 100))
            setPct(next)

            if (finished && next >= 100) {
                setOut(true)
                try { sessionStorage.setItem(SEEN, '1') } catch { /* private mode */ }
                // ScrollTrigger measured the page while it was covered — nudge it
                // to re-read now that the layout is actually visible
                setTimeout(() => {
                    if (!alive) return
                    document.body.style.overflow = ''
                    window.dispatchEvent(new Event('resize'))
                    setGone(true)
                }, reduce ? 0 : 1180)
                return
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)

        return () => {
            alive = false
            cancelAnimationFrame(raf)
            window.removeEventListener('load', onLoad)
            document.body.style.overflow = ''
        }
    }, [])

    if (gone) return null

    const [h, t, u] = String(pct).padStart(3, '0').split('').map(Number)

    return (
        <div className={`ld ${out ? 'is-out' : ''}`} role="status" aria-live="polite">
            {/* the ground is the curtain itself: slats lift in sequence rather
                than the whole panel sliding as one slab */}
            <div className="ld-curtain" aria-hidden="true">
                {Array.from({ length: PANELS }, (_, i) => (
                    <span className="ld-panel" key={i} style={{ '--i': i }} />
                ))}
            </div>

            <div className="ld-inner">
                <img
                    className="ld-logo"
                    src="/brand/logo-full-white-trim.png"
                    alt="The Creative Sphere"
                    style={{ filter: `drop-shadow(0 0 ${18 * (pct / 100)}px rgba(91,157,255,${0.5 * (pct / 100)}))` }}
                />

                {/* hairline opens from the centre as the number climbs */}
                <span className="ld-rule" aria-hidden="true">
                    <i style={{ transform: `scaleX(${pct / 100})` }} />
                </span>

                <div className="ld-count" aria-hidden="true">
                    <Digit value={h} speed="0.9s" />
                    <Digit value={t} speed="0.62s" />
                    <Digit value={u} speed="0.38s" />
                    <span className="ld-pct">%</span>
                </div>
            </div>

            <span className="ld-tag" aria-hidden="true">Strategy, design and story</span>
            <span className="ld-sr">Loading, {pct} percent</span>
        </div>
    )
}
