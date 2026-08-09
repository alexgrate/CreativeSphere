import Header from "../ui/Header"
import Footer from "../ui/Footer"
import Contact from "../ui/Contact"

export default function ContactPage() {
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
