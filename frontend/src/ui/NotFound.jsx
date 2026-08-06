import { Link, useLocation } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import Header from "./Header"

export default function NotFound() {
    const { pathname } = useLocation()

    return (
        <>
            <Header />
            <main className="shell">
                <section className="nf">
                    <span className="nf-code">404</span>
                    <h1 className="spark">This page is still in the studio.</h1>
                    <p>
                        We&rsquo;re building it. In the meantime, everything worth
                        seeing lives on the homepage &mdash; the work, the numbers
                        and the way we get there.
                    </p>

                    <div className="nf-actions">
                        <Link to="/" className="nf-btn">
                            <ArrowLeft size={17} /> Back to home
                        </Link>
                        <a href="tel:+2349057051623" className="nf-link">
                            Or call us &mdash; +234 900 00 0000
                        </a>
                    </div>

                    <span className="nf-path" aria-label="Requested address">{pathname}</span>
                </section>
            </main>
        </>
    )
}
