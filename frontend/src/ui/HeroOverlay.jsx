import './hero.css'
import { SECTIONS, setSection, useApp } from '../stores/useApp'


export default function HeroOverlay() {
    const phase = useApp((s) => s.phase)
    const section = useApp((s) => s.section)

    return (
        <div className={`hero ${phase === 'ready' ? '' : 'is-loading'} ${section > 0 ? 'is-away' : ''}`}>
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
                    {SECTIONS.slice(1).map((id, n) => (
                        <a  
                            key={id}
                            href={`#${id}`}
                            className={section === n + 1 ? 'active' : ''}
                            onClick={(e) => { e.preventDefault(); setSection(n + 1) }}
                        >
                            {id.toUpperCase()}
                        </a>
                    ))}
                </nav>
                <span className='unleash-cue'>STIR THE SPHERE</span>
            </footer>
        </div>
    )
}