import { ArrowRight } from "lucide-react"

export default function Studio() {
    return (
        <section className="studio">
            <div className="studio-copy">
                <h2>The studio behind<br />the work.</h2>
                <p>
                    Founded in Lagos in 2019, The Creative Sphere brings full-service
                    creative leadership to FMCG, banking, fintech and insurance brands
                    across Nigeria and beyond.
                </p>
                <div className="studio-actions">
                    <a href="/services" className="studio-btn">Explore services</a>
                    <a href="/work" className="studio-link">
                        Explore the work <ArrowRight size={17} />
                    </a>
                </div>
            </div>
            <div className="studio-portrait">
                <img src="/team/founder.webp" alt="Founder, The Creative Sphere" />
            </div>
        </section>
    )
}
