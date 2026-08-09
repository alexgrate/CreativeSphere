import { useCtaLogos } from "../lib/api"

export default function StartProject() {
    const { data: chips } = useCtaLogos()

    return (
        <section className="cta">
            {chips.map((l, n) => (
                <span
                    key={n}
                    className="cta-chip"
                    aria-hidden="true"
                    style={{
                        '--s': `${l.size}px`,
                        '--x': `${l.x}%`,
                        '--y': `${l.y}%`,
                        '--r': `${l.rot}deg`,
                    }}
                >
                    <img src={l.src} alt="" loading="lazy" />
                </span>
            ))}

            <div className="cta-inner">
                <h2 className="spark">Start your project</h2>
                <p data-reveal>
                    Let&rsquo;s build. Every standout brand begins with one conversation.
                    Tell us where you want to be, and we&rsquo;ll show you how to get there.
                </p>
                <a href="/contact" className="cta-btn" data-reveal>Let&rsquo;s talk</a>
            </div>
        </section>
    )
}
