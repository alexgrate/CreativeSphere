import Header from "../ui/Header"
import Footer from "../ui/Footer"
import ServiceList from "../ui/ServiceList"
import Gallery from "../ui/Gallery"
import Extras from "../ui/Extras"
import Capabilities from "../ui/Capabilities"
import CTA from "../ui/CTA"
import { useSmoothScroll } from "../hooks/useSmoothScroll"
import { useReveal } from "../hooks/useReveal"

export default function ServicesPage() {
    useSmoothScroll()
    useReveal()
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
