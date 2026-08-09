import { useLayoutEffect } from "react"
import gsap from 'gsap'
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)


const TARGETS = [
    '[data-reveal]',
    '.apr-title', '.apr-lead', '.apr-card',
    '.fmt-eyebrow', '.fmt-copy', '.fmt-btn', '.fmt-stage', '.fmt-nav',
    '.studio-top h2', '.studio-aside p', '.studio-actions', '.studio-shot',
    '.cta-title', '.cta-inner p', '.cta-btn',
    '.cta2-title', '.cta2-note', '.cta2-btn', '.cta2-icon',
    '.svc-title', '.svc-lead', '.svc-row', '.svc-note',
    '.acc-title', '.acc-lead', '.acc-item',
    '.cap-title', '.cap-col',
    '.ct-title', '.ct-lead', '.ct-office', '.ct-field',
    '.abt-title', '.st-eyebrow', '.st-sig', '.pr-eyebrow', '.pr-item',
    '.tl-head h2',
    '.nf-code', '.nf h1', '.nf p', '.nf-actions',
].join(',')

export function useReveal(key) {
    useLayoutEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduce) return
        const reveal = {}

        const ctx = gsap.context(() => {
            const targets = gsap.utils.toArray(TARGETS)
            const LINE = () => window.innerHeight * 0.92
            const hidden = targets.filter((el) => el.getBoundingClientRect().top > LINE())
            if (hidden.length) gsap.set(hidden, { opacity: 0, y: 56 })

            const settle = () => {
                const late = hidden.filter((el) => {
                    const r = el.getBoundingClientRect()
                    return r.top < LINE() && Number(gsap.getProperty(el, 'opacity')) < 0.9
                })
                if (late.length) gsap.set(late, { opacity: 1, y: 0 })
            }
            ScrollTrigger.addEventListener('refresh', settle)
            reveal.cleanup = () => ScrollTrigger.removeEventListener('refresh', settle)

            if (hidden.length) ScrollTrigger.batch(hidden, {
                start: 'top 95%',
                onEnter: (batch) => gsap.to(batch, {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'expo.out',
                    stagger: { each: 0.09, from: 'start' },
                    // 'auto' kills only the properties this tween touches.
                    // `true` killed every tween on the element, which silently
                    // destroyed the spark sweep on any heading that was also a
                    // reveal target — that is why only some headings shone.
                    overwrite: 'auto',
                }),
                onEnterBack: (batch) => gsap.to(batch, {
                    y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto',
                }),
            })

            gsap.utils.toArray('.spark:not(.ftr-word)').forEach((el) => {
                /* Titles whose words sit inside overflow:hidden masks carry the
                   gradient on each word instead of the heading — background-clip
                   cannot paint through the mask. Staggering them by position
                   makes the highlight travel across the line as one sweep
                   rather than every word lighting at once. */
                const line = el.closest('.spark-line')
                const step = line ? [...line.querySelectorAll('.spark')].indexOf(el) * 0.085 : 0
                const abovefold = el.getBoundingClientRect().top < window.innerHeight * 0.82

                const tl = gsap.timeline(abovefold ? { delay: 0.55 + step } : {
                    delay: step,
                    scrollTrigger: {
                        trigger: line || el,
                        start: 'top 82%',
                        toggleActions: 'restart none restart reset',
                    },
                })

                tl.fromTo(el,
                    { backgroundPosition: '100% 0' },
                    { backgroundPosition: '0% 0', duration: 1.6, ease: 'power3.inOut' }
                ).fromTo(el,
                    { filter: 'drop-shadow(0 0 0 rgba(78,155,255,0))' },
                    {
                        filter: 'drop-shadow(0 0 26px rgba(78,155,255,0.5))',
                        duration: 0.42, ease: 'sine.inOut', yoyo: true, repeat: 1,
                    },
                    0.52
                )
            })

            const wm = document.querySelector('.ftr-word')
            if (wm) {
                gsap.fromTo(wm,
                    { backgroundPosition: '100% 0' },
                    {
                        backgroundPosition: '0% 0',
                        duration: 2.6,
                        ease: 'power2.inOut',
                        scrollTrigger: {
                            trigger: '.ftr-spacer',
                            start: 'top 85%',
                            toggleActions: 'restart none restart reset',
                        },
                    }
                )
            }
        })

        const t = setTimeout(() => ScrollTrigger.refresh(), 400)
        return () => { clearTimeout(t); reveal.cleanup?.(); ctx.revert() }
    }, [key])
}
