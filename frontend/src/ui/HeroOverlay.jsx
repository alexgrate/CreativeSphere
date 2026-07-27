import './hero.css'
import { useApp } from '../stores/useApp'


export default function HeroOverlay() {
    const phase = useApp((s) => s.phase)
    return (
        <div className={`hero ${phase === 'ready' ? '' : 'is-loading'}`}>
            <header className='hero-top'>
                <span className='wordmark'>THE CREATIVE-SPHERE</span>
            </header>

            <div className='hero-center'>
                <p className='label'>FULL-SERVICE CREATIVE &amp; DIGITAL AGENCY</p>
                <h1 className='headline'>Innovate. Create.<br />Elevate.</h1>
                <p className='subline'>TURNING IDEAS INTO POWERFUL BRANDS</p>
            </div>

            <div className='scroll-cue'>SCROLL</div>

            <footer className='hero-bottom'>
                <span className='brand'>EST. NIGERIA — WORKING WORLDWIDE</span>
                <nav className='index'>
                    <a href="#services">SERVICES</a>
                    <a href="#work">WORK</a>
                    <a href="#impact">IMPACT</a>
                    <a href="#about">ABOUT</a>
                    <a href="#contact">CONTACT</a>
                </nav>
                <span className='unleash-cue'>STIR THE SPHERE</span>
            </footer>
        </div>
    )
}