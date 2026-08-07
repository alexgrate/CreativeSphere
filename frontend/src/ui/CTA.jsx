import { useEffect, useState } from "react"
import { Sparkles, Star, Zap, Hand, Rocket, ArrowRight } from "lucide-react"

const MORPH = [Sparkles, Star, Zap, Hand, Rocket]
const EVERY = 2400

export default function CTA() {
    const [n, setN] = useState(0)

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const id = setInterval(() => setN((v) => (v + 1) % MORPH.length), EVERY)
        return () => clearInterval(id)
    }, [])

    return (
        <section className="cta2">
            <div className="cta2-inner">
                <h2 className="cta2-title">Let&rsquo;s work together!</h2>

                <span className="cta2-icon" aria-hidden="true">
                    {MORPH.map((Icon, i) => (
                        <Icon key={i} className={i === n ? 'is-on' : ''} size={56} strokeWidth={1.4} />
                    ))}
                </span>

                <p className="cta2-note">Get in touch with The Creative Sphere.</p>

                <a href="/contact" className="cta2-btn">
                    Contact us
                    <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
                </a>
            </div>
        </section>
    )
}
