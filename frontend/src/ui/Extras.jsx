import { useState } from "react"
import { CornerDownRight, Plus } from "lucide-react"
import { EXTRAS } from "../content/site"

export default function Extras() {
    const [open, setOpen] = useState(() => new Set())

    const toggle = (id) =>
        setOpen((cur) => {
            const next = new Set(cur)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })

    return (
        <section className="acc">
            <div className="acc-intro">
                <h2 className="acc-title spark">That&rsquo;s not all.</h2>
                <p className="acc-lead">Learn more about how we can help you.</p>
            </div>

            <ul className="acc-list">
                {EXTRAS.map((x) => {
                    const isOpen = open.has(x.id)
                    return (
                        <li className={`acc-item ${isOpen ? 'is-open' : ''}`} key={x.id}>
                            <button
                                type="button"
                                className="acc-head"
                                id={`acc-btn-${x.id}`}
                                aria-expanded={isOpen}
                                aria-controls={`acc-${x.id}`}
                                onClick={() => toggle(x.id)}
                            >
                                <CornerDownRight className="acc-mark" size={18} strokeWidth={2} aria-hidden="true" />
                                <span className="acc-label">{x.title}</span>
                                <Plus className="acc-sign" size={22} strokeWidth={1.5} aria-hidden="true" />
                            </button>

                            <div
                                className="acc-body"
                                id={`acc-${x.id}`}
                                role="region"
                                aria-labelledby={`acc-btn-${x.id}`}
                            >
                                <div className="acc-body-inner">
                                    <p>{x.body}</p>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
