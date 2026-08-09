import { usePageMeta } from "../hooks/usePageMeta"
import Header from "../ui/Header"
import Footer from "../ui/Footer"
import Contact from "../ui/Contact"

export default function ContactPage() {
    usePageMeta({
        title: 'Contact',
        description: 'Tell us where you want to be and we will show you how to get there. '
                   + 'The Creative Sphere, 5B Adewumi Adu St, Abule-Egba, Lagos.',
        path: '/contact',
    })

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
