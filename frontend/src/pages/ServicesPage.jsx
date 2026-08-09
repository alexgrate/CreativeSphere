import { usePageMeta } from "../hooks/usePageMeta"
import Header from "../ui/Header"
import Footer from "../ui/Footer"
import ServiceList from "../ui/ServiceList"
import Gallery from "../ui/Gallery"
import Extras from "../ui/Extras"
import Capabilities from "../ui/Capabilities"
import CTA from "../ui/CTA"

export default function ServicesPage() {
    usePageMeta({
        title: 'Services',
        description: 'Brand strategy, identity, campaign, film and social — built as one system '
                   + 'so the work holds together wherever it runs.',
        path: '/services',
    })

    return (
        <>
            <Header />
            <main className="shell">
                <ServiceList />
                <Gallery />
                <Extras />
                <Capabilities />
                <CTA />
            </main>
            <div className="ftr-spacer" aria-hidden="true" />
            <Footer />
        </>
    )
}
