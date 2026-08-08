import Header from "../ui/Header";
import Footer from "../ui/Footer";
import AboutHero from "../ui/AboutHero"
import Statement from "../ui/Statement"
import { useSmoothScroll } from "../hooks/useSmoothScroll";
import { useReveal } from "../hooks/useReveal";
import Timeline from "../ui/Timeline";
import Principles from "../ui/Principles";


export default function AboutPage() {
    useSmoothScroll()
    useReveal()
    return (
        <>
            <Header />
            <main className="shell">
                <AboutHero />
                <Statement />
                <Timeline />
                <Principles />
            </main>
            <div className="ftr-spacer" aria-hidden="true" />
            <Footer />
        </>
    )
}