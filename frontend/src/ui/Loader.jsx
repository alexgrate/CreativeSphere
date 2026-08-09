import { useEffect, useState } from "react"
import { lockScroll } from "../hooks/useSmoothScroll"

const SEEN = 'tcs:loaded'

const CRITICAL = [
    '/brand/logo-full-white-trim.png',  
    '/brand/logo-mark-white-trim.png',  
    '/video/poster.webp',            
]

const MIN_MS = 1100    
const MAX_MS = 11000  
const PANELS = 5      
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]


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
        try { if (sessionStorage.getItem(SEEN) === '1') return } catch { /* private mode */ }

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const t0 = performance.now()
        let raf = 0, alive = true
        let fontsDone = false

        document.fonts?.ready.then(() => { fontsDone = true }).catch(() => { fontsDone = true })


        document.documentElement.classList.add('is-loading')
        lockScroll(true)
        const relock = setTimeout(() => lockScroll(true), 60)   

        let ready = 0
        const decoded = () => { ready += 1 }
        for (const src of CRITICAL) {
            const im = new Image()
            im.onload = decoded
            im.onerror = decoded        
            im.src = src
        }


        let videoReady = false

        let waited = 0
        const watchVideo = () => {
            if (!alive) return
            const v = document.querySelector('.hero-media video')
            if (!v) {
                waited += 120
                if (waited > 1200) { videoReady = true; return }
                return setTimeout(watchVideo, 120)
            }
            if (v.readyState >= 2) { videoReady = true; return }
            const ok = () => { videoReady = true }
            v.addEventListener('loadeddata', ok, { once: true })
            v.addEventListener('canplay', ok, { once: true })
            setTimeout(ok, 3500)
        }
        watchVideo()

        let pageLoaded = document.readyState === 'complete'
        const onLoad = () => { pageLoaded = true }
        if (!pageLoaded) window.addEventListener('load', onLoad, { once: true })

        const imgShare = () => {
            const imgs = [...document.images].filter(
                (i) => (i.currentSrc || i.src) && i.loading !== 'lazy'
            )
            if (!imgs.length) return 1
            return imgs.filter((i) => i.complete).length / imgs.length
        }

        const assetsDone = () =>
            ready >= CRITICAL.length && fontsDone && videoReady && pageLoaded && imgShare() === 1

        const readTarget = () => {
            const real = (ready / CRITICAL.length) * 0.22
                       + (fontsDone ? 0.14 : 0)
                       + (videoReady ? 0.14 : 0)
                       + imgShare() * 0.3
                       + (pageLoaded ? 0.2 : 0)

            const creep = 0.86 * (1 - Math.exp(-(performance.now() - t0) / 2600))
            return Math.max(real, creep)
        }

        let shown = 0
        const tick = () => {
            if (!alive) return
            const elapsed = performance.now() - t0
            const finished = (assetsDone() && elapsed > MIN_MS) || elapsed > MAX_MS
            const target = finished ? 1 : Math.min(readTarget(), 0.97)

            shown += (target - shown) * (reduce ? 1 : finished ? 0.16 : 0.07)
            const next = Math.min(100, Math.round(shown * 100))
            setPct(next)

            if (finished && next >= 100) {
                setOut(true)
                try { sessionStorage.setItem(SEEN, '1') } catch { /* private mode */ }
                setTimeout(() => {
                    if (!alive) return
                    document.documentElement.classList.remove('is-loading')
                    lockScroll(false)
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
            clearTimeout(relock)
            window.removeEventListener('load', onLoad)
            document.documentElement.classList.remove('is-loading')
            lockScroll(false)
        }
    }, [])

    if (gone) return null

    const [h, t, u] = String(pct).padStart(3, '0').split('').map(Number)

    return (
        <div className={`ld ${out ? 'is-out' : ''}`} role="status" aria-live="polite">
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
