import { CAPABILITIES } from "../content/site"

export default function Capabilities() {
    return (
        <section className="cap">
            <h2 className="cap-title spark">Capabilities</h2>

            <div className="cap-grid">
                {CAPABILITIES.map((c) => (
                    <div className="cap-col" key={c.id} data-reveal>
                        <h3 className="cap-head">{c.title}</h3>
                        <ul className="cap-list">
                            {c.items.map((i) => (
                                <li key={i}>{i}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    )
}
