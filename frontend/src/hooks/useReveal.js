import { useLayoutEffect } from "react"
import gsap from 'gsap'
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/* Hand-tagging data-reveal only ever covered 11 small text nodes on the home
   page, so the cards and headings — the things you actually watch — never moved.
   These selectors cover the blocks that matter; data-reveal still works for
   one-offs. The hero is deliberately absent: it runs its own load sequence. */
const TARGETS = [
    '[data-reveal]',
    '.apr-title', '.apr-lead', '.apr-card',
    '.fmt-eyebrow', '.fmt-copy', '.fmt-btn', '.fmt-stage', '.fmt-nav',
    '.studio-top h2', '.studio-aside p', '.studio-actions', '.studio-shot',
    '.cta-title', '.cta-inner p', '.cta-btn',
    '.svc-title', '.svc-lead', '.svc-row', '.svc-note',
    '.acc-title', '.acc-lead', '.acc-item',
    '.cap-title', '.cap-col',
    '.ct-title', '.ct-lead', '.ct-office', '.ct-field',
    '.abt-title', '.st-eyebrow', '.st-sig', '.pr-eyebrow', '.pr-item',
    '.tl-head h2',
].join(',')

export function useReveal() {
    useLayoutEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduce) return
        const reveal = {}

        const ctx = gsap.context(() => {
            const targets = gsap.utils.toArray(TARGETS)

            /* Only hide what is genuinely below the fold. Anything already on
               screen stays visible, which removes the stranded-element problem
               by construction: an element that was never hidden cannot be left
               invisible when its trigger is crossed without a scroll event. */
            const LINE = () => window.innerHeight * 0.92
            const hidden = targets.filter((el) => el.getBoundingClientRect().top > LINE())
            gsap.set(hidden, { opacity: 0, y: 56 })

            /* Safety for a refresh that lands past an element's line (the loader
               dispatches one when it lifts). Runs on refresh only — doing this
               per scroll frame re-fires the tween with overwrite and restarts
               the fade, which pinned elements at zero until they left the top
               of the screen. */
            const settle = () => {
                const late = hidden.filter((el) => {
                    const r = el.getBoundingClientRect()
                    return r.top < LINE() && Number(gsap.getProperty(el, 'opacity')) < 0.9
                })
                if (late.length) gsap.set(late, { opacity: 1, y: 0 })
            }
            ScrollTrigger.addEventListener('refresh', settle)
            reveal.cleanup = () => ScrollTrigger.removeEventListener('refresh', settle)

            ScrollTrigger.batch(hidden, {
                // earlier than the old 88% so the motion happens while the
                // element is arriving, not after it has settled mid-screen
                start: 'top 95%',
                onEnter: (batch) => gsap.to(batch, {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'expo.out',
                    stagger: { each: 0.09, from: 'start' },
                    overwrite: true,
                }),
                // anything already past the trigger when we refresh (e.g. a
                // reload part-way down the page) must not stay invisible
                onEnterBack: (batch) => gsap.to(batch, {
                    y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', overwrite: true,
                }),
            })

            gsap.utils.toArray('.spark:not(.ftr-word)').forEach((el) => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 82%',
                        toggleActions: 'restart none none reset',
                    },
                })
                tl.fromTo(el,
                    { backgroundPosition: '100% 0' },
                    { backgroundPosition: '0% 0', duration: 2, ease: 'power2.inOut' }
                ).fromTo(el,
                    { filter: 'drop-shadow(0 0 0 rgba(13,114,255,0))' },
                    {
                        filter: 'drop-shadow(0 0 20px rgba(13,114,255,0.45))',
                        duration: 1, ease: 'sine.inOut', yoyo: true, repeat: 1,
                    },
                    0
                )
            })

            // .ftr is position:fixed, so it never moves relative to the
            // viewport and can't trigger anything — the spacer stands in for it
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
                            toggleActions: 'restart none none reset',
                        },
                    }
                )
            }
        })

        const t = setTimeout(() => ScrollTrigger.refresh(), 400)
        return () => { clearTimeout(t); reveal.cleanup?.(); ctx.revert() }
    }, [])
}
