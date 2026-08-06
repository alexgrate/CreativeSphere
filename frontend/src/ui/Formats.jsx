import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FORMATS } from "../content/site";

const AUTO_MS = 5000

const len = FORMATS.length

export default function Formats() {
    const [i, setI] = useState(0)

    const go = (d) => setI(v => (v + d + len) % len)

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const t = setInterval(() => setI(v => (v + 1) % len), AUTO_MS)
        return () => clearInterval(t)
    }, [i])

    const big = FORMATS[i]
    const small = FORMATS[(i + 1) % len]

    return (
        <section className="fmt">
            <div className="fmt-copy">
                <span className="fmt-eyebrow" data-reveal>Campaigns &amp; brand</span>
                <h2 className="spark">Global formats.<br />Local brands.</h2>
                <p data-reveal>
                    Campaign systems, identity and content strategy for some of
                    Nigeria&rsquo;s most recognised brands.
                </p>
                <a href="/work" className="fmt-btn" data-reveal>See all campaigns</a>
            </div>

            <div className="fmt-stage">
                <div className="fmt-row">
                    <figure className="fmt-slot fmt-slot--big">
                        <img key={big.id} src={big.img} alt={big.alt} />
                    </figure>
                    <figure className="fmt-slot fmt-slot--small" aria-hidden="true">
                        <img key={small.id} src={small.img} alt="" />
                    </figure>
                </div>

                <div className="fmt-nav">
                    <button onClick={() => go(-1)} aria-label="Previous image">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => go(1)} aria-label="Next image">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    )
}
