import { useState } from "react"
import { Compass, Crosshair, Layers, TrendingUp } from "lucide-react"
import { APPROACH } from "../content/site"

const ICONS = {
    understand: Compass,
    position: Crosshair,
    make: Layers,
    grow: TrendingUp,
}

export default function Approach() {
    const [open, setOpen] = useState(null)

    return (
        <section className="apr">
            <div className="apr-head">
                <h2 className="apr-title spark">How we work.</h2>
                <p className="apr-lead" data-reveal>
                    Four stages, one team. No handoffs, no relay race between a strategy
                    shop, a design studio and a media agency.
                </p>
            </div>

            <div className="apr-grid">
                {APPROACH.map((a) => {
                    const Icon = ICONS[a.id]
                    return (
                        <article
                            className={`apr-card ${open === a.id ? 'is-open' : ''}`}
                            key={a.id}
                            onClick={() => setOpen((cur) => (cur === a.id ? null : a.id))}
                        >
                            <span className="apr-n">{a.n}.</span>

                            <div className="apr-media" aria-hidden="true">
                                <img src={a.img} alt={a.alt} loading="lazy" />
                            </div>

                            <p className="apr-body">{a.body}</p>

                            <div className="apr-foot">
                                <Icon size={26} strokeWidth={1.4} aria-hidden="true" />
                                <h3>{a.title}</h3>
                                <p className="apr-sub">{a.lead}</p>
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}
