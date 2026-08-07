import Header from "../ui/Header"
import Footer from "../ui/Footer"
import Contact from "../ui/Contact"
import { useSmoothScroll } from "../hooks/useSmoothScroll"
import { useReveal } from "../hooks/useReveal"

export default function ContactPage() {
    useSmoothScroll()
    useReveal()
    return (
        <>
            <Header />
            <main className="shell">
                <Contact />
            </main>
            <div className="ftr-spacer" aria-hidden="true" />
            <Footer />
        </>
    )
}
