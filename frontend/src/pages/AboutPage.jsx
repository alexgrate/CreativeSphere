import Header from "../ui/Header";
import Footer from "../ui/Footer";
import AboutHero from "../ui/AboutHero"
import Impact from "../ui/Impact"
import { useSmoothScroll } from "../hooks/useSmoothScroll";
import { useReveal } from "../hooks/useReveal";
import { ABOUT_IMPACT } from "../content/site"
import Timeline from "../ui/Timeline";
import Studio from "../ui/Studio";
import StartProject from "../ui/StartProject";


export default function AboutPage() {
    useSmoothScroll()
    useReveal()
    return (
        <>
            <Header />
            <main className="shell">
                <AboutHero />
                <Impact
                    title={<>Pedigree meets<br />precision.</>}
                    lead="From first concept to full brand systems, we bring six years of Nigerian market fluency and international craft to every engagement."
                    items={ABOUT_IMPACT}
                />
                <Timeline />
                <Studio />
                <StartProject />
            </main>
            <div className="ftr-spacer" aria-hidden="true" />
            <Footer />
        </>
    )
}