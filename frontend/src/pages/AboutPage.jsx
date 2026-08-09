import { usePageMeta } from "../hooks/usePageMeta";
import Header from "../ui/Header";
import Footer from "../ui/Footer";
import AboutHero from "../ui/AboutHero"
import Statement from "../ui/Statement";;
import Timeline from "../ui/Timeline";
import Principles from "../ui/Principles";


export default function AboutPage() {
    usePageMeta({
        title: 'About',
        description: 'Craft, leadership and consequence. The Creative Sphere is a Lagos studio '
                   + 'of strategists, designers and producers working in one room rather than three agencies.',
        path: '/about',
    })

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