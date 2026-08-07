import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

const WORDMARK = 'thecreativesphere'

const AMP_RATIO = 0.11       
const REACH = 0.26          
const COL = 2              

export default function Footer() {
    const markRef = useRef(null)
    const wordRef = useRef(null)
    const canvasRef = useRef(null)
    const [liquid, setLiquid] = useState(false)


    const fit = useCallback(() => {
        const box = markRef.current
        const el = wordRef.current
        if (!box || !el) return
        const target = box.clientWidth
        if (!target) return

        el.style.fontSize = '100px'
        const natural = el.getBoundingClientRect().width
        if (!natural) return


        let size = (100 * target) / natural
        for (let i = 0; i < 5; i++) {
            el.style.fontSize = `${size}px`
            const w = el.getBoundingClientRect().width
            if (!w || Math.abs(w - target) <= 0.5) break
            size *= target / w
        }

        while (el.getBoundingClientRect().width > target && size > 1) {
            size *= 0.997
            el.style.fontSize = `${size}px`
        }
    }, [])

    useLayoutEffect(() => {
        fit()
        document.fonts?.ready.then(fit).catch(() => {})
        window.addEventListener('resize', fit)
        window.addEventListener('orientationchange', fit)
        return () => {
            window.removeEventListener('resize', fit)
            window.removeEventListener('orientationchange', fit)
        }
    }, [fit])

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const box = markRef.current
        const el = wordRef.current
        const cv = canvasRef.current
        const ctx = cv?.getContext('2d')
        if (!box || !el || !ctx) return

        const atlas = document.createElement('canvas')
        const actx = atlas.getContext('2d')
        if (!actx) return

        let raf = 0, alive = true
        let dpr = 1, W = 0, H = 0, PAD = 0, amp = 0, textH = 0, reach = 0
        let lastSweep = -1
        let px = 0, pxTarget = 0

        const readText = () => {
            const tt = getComputedStyle(el).textTransform
            const raw = (el.textContent || '').trim()
            return tt === 'uppercase' ? raw.toUpperCase()
                 : tt === 'lowercase' ? raw.toLowerCase() : raw
        }

        const paintAtlas = (sweep) => {
            const cs = getComputedStyle(el)
            const size = parseFloat(cs.fontSize)
            const targetW = el.getBoundingClientRect().width
            if (!size || !targetW) return false

            actx.setTransform(1, 0, 0, 1, 0, 0)
            actx.clearRect(0, 0, atlas.width, atlas.height)
            actx.scale(dpr, dpr)

            actx.fontStretch = 'condensed'
            actx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`
            actx.textBaseline = 'alphabetic'

            const text = readText()
            const measured = actx.measureText(text).width || targetW
            const asc = actx.measureText(text).actualBoundingBoxAscent || size * 0.73

            const g = actx.createLinearGradient(0, 0, targetW, 0)
            const p = sweep / 100          
            const at = (v) => Math.max(0, Math.min(1, v))
            const c = 1.5 - p * 1.6        
            g.addColorStop(0, '#fff')
            g.addColorStop(at(c - 0.18), '#fff')
            g.addColorStop(at(c - 0.07), '#7FB6FF')
            g.addColorStop(at(c), '#CFE4FF')
            g.addColorStop(at(c + 0.07), '#7FB6FF')
            g.addColorStop(at(c + 0.18), '#fff')
            g.addColorStop(1, '#fff')
            actx.fillStyle = g

            actx.translate(0, PAD + asc)
            actx.scale(targetW / measured, 1)
            actx.fillText(text, 0, 0)
            return true
        }

        const measure = () => {
            const rect = el.getBoundingClientRect()
            if (!rect.width || !rect.height) return false
            dpr = Math.min(window.devicePixelRatio || 1, 2)
            textH = rect.height
            amp = Math.max(7, Math.min(30, textH * AMP_RATIO))
            reach = Math.max(90, box.clientWidth * REACH)
            PAD = Math.ceil(amp * 1.8)
            W = Math.ceil(box.clientWidth)
            H = Math.ceil(textH + PAD * 2)

            for (const c of [atlas, cv]) {
                c.width = Math.ceil(W * dpr)
                c.height = Math.ceil(H * dpr)
            }
            cv.style.width = `${W}px`
            cv.style.height = `${H}px`
            cv.style.top = `${-PAD}px`
            return true
        }

        let level = 0, want = 0, pulse = 0, dirty = true

        const blitFlat = () => {
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.clearRect(0, 0, cv.width, cv.height)
            ctx.drawImage(atlas, 0, 0)
        }

        const frame = (now) => {
            if (!alive) { raf = 0; return }
            const t = now / 1000

            if (dirty) {

                const sweep = parseFloat(getComputedStyle(el).backgroundPosition) || 0
                if (paintAtlas(sweep)) lastSweep = sweep
                dirty = false
            }

            level += (want - level) * 0.09
            pulse *= 0.93
            const k = Math.min(2, level + pulse)

            if (k < 0.004 && want === 0) {
                blitFlat()        
                raf = 0
                return
            }

            px += (pxTarget - px) * 0.14

            // everything outside the ripple is untouched — one blit for the
            // whole word, then only the band under the cursor is redrawn
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.clearRect(0, 0, cv.width, cv.height)
            ctx.drawImage(atlas, 0, 0)

            const cx = px * dpr
            const rd = reach * dpr
            const x0 = Math.max(0, Math.floor(cx - rd))
            const x1 = Math.min(cv.width, Math.ceil(cx + rd))
            if (x1 > x0) {
                ctx.clearRect(x0, 0, x1 - x0, cv.height)
                const a = amp * k
                for (let x = x0; x < x1; x += COL) {
                    const d = (x + COL / 2 - cx) / dpr        // signed distance in CSS px
                    const nd = Math.abs(d) / reach
                    if (nd >= 1) continue
                    // cos² falls to zero at the rim, so the band rejoins the
                    // still text with no seam
                    const fall = Math.cos(nd * Math.PI / 2) ** 2
                    // vertical only. Displacing columns sideways as well pulls
                    // neighbours apart and combs 1px gaps through the letters.
                    const dy = a * fall * Math.sin(Math.abs(d) * 0.030 - t * 4.2)
                    // +1 so consecutive columns overlap and can't leave a seam
                    ctx.drawImage(
                        atlas, x, 0, COL + 1, cv.height,
                        x, dy * dpr, COL + 1, cv.height
                    )
                }
            }
            raf = requestAnimationFrame(frame)
        }

        const kick = () => { if (!raf && alive) raf = requestAnimationFrame(frame) }
        const at = (e) => {
            const r = cv.getBoundingClientRect()
            pxTarget = e.clientX - r.left
        }
        const enter = (e) => { at(e); px = pxTarget; want = 1; kick() }
        const move = (e) => { at(e); kick() }
        const leave = () => { want = 0; kick() }
        const press = (e) => { at(e); px = pxTarget; pulse = 0.9; kick() }   // tap too

        // GSAP writes background-position inline, so this fires exactly when the
        // spark moves — no polling the computed style every frame
        const mo = new MutationObserver(() => { dirty = true; kick() })

        const start = () => {
            if (!measure()) return false
            if (!paintAtlas(100)) return false
            setLiquid(true)
            dirty = false
            blitFlat()
            box.addEventListener('pointerenter', enter)
            box.addEventListener('pointermove', move)
            box.addEventListener('pointerleave', leave)
            box.addEventListener('pointerdown', press)
            mo.observe(el, { attributes: true, attributeFilter: ['style'] })
            return true
        }

        // wait for the webfont, or the atlas bakes in the fallback's shapes
        let retry = 0
        const boot = () => {
            if (!alive) return
            if (!start() && retry++ < 20) setTimeout(boot, 250)
        }
        document.fonts?.ready.then(boot).catch(boot) ?? boot()

        const onResize = () => { if (measure()) { lastSweep = -1; dirty = true; kick() } }
        window.addEventListener('resize', onResize)
        window.addEventListener('orientationchange', onResize)

        return () => {
            alive = false
            cancelAnimationFrame(raf)
            mo.disconnect()
            box.removeEventListener('pointerenter', enter)
            box.removeEventListener('pointermove', move)
            box.removeEventListener('pointerleave', leave)
            box.removeEventListener('pointerdown', press)
            window.removeEventListener('resize', onResize)
            window.removeEventListener('orientationchange', onResize)
            setLiquid(false)
        }
    }, [])

    return (
        <footer className="ftr" aria-label="Site footer">
            <div className="ftr-mark" ref={markRef} aria-hidden="true">
                <span
                    className={`ftr-word spark spark--light ${liquid ? 'is-quiet' : ''}`}
                    ref={wordRef}
                >
                    {WORDMARK}
                </span>
                <canvas className="ftr-liquid" ref={canvasRef} aria-hidden="true" />
            </div>

            <div className="ftr-row">
                <p className="ftr-line" data-reveal>
                    Strategy, design and story.<br />Working as one.
                </p>
                <nav className="ftr-links" data-reveal>
                    <a href="mailto:hello@thecreativesphere.com">HELLO@THECREATIVESPHERE.COM</a>
                    <a href="https://instagram.com/inthecrativesphere" target="_blank" rel="noreferrer">INSTAGRAM</a>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer">LINKEDIN</a>
                </nav>
            </div>

            <p className="ftr-copy">© {new Date().getFullYear()} The Creative Sphere. All rights reserved.</p>
        </footer>
    )
}
