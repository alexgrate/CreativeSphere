import { ArrowRight } from "lucide-react"

export default function Studio() {
    return (
        <section className="studio">
            <div className="studio-top">
                <h2 className="spark">The studio behind<br />the work.</h2>

                <div className="studio-aside">
                    <p data-reveal>
                        Founded in Lagos in 2019, The Creative Sphere brings full-service
                        creative leadership to FMCG, banking, fintech and insurance brands
                        across Nigeria and beyond.
                    </p>
                    <div className="studio-actions" data-reveal>
                        <a href="/services" className="studio-btn">Explore services</a>
                        <a href="/work" className="studio-link">
                            Explore the work <ArrowRight size={17} />
                        </a>
                    </div>
                </div>
            </div>

            <figure className="studio-shot" data-reveal>
                <img
                    src="/team/creativespace.webp"
                    alt="The Creative Sphere studio in Lagos"
                    width="1800"
                    height="704"
                    loading="lazy"
                />
            </figure>
        </section>
    )
}
