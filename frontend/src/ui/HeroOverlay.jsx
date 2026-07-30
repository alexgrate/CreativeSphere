import './hero.css'
import { SECTIONS, setSection, toggleSound, useApp } from '../stores/useApp'
import BrandLockup from './BrandLockup'


export default function HeroOverlay() {
    const phase = useApp((s) => s.phase)
    const section = useApp((s) => s.section)
    const sound = useApp((s) => s.sound)
    const stirred = useApp((s) => s.stirred)

    return (
        <div className={`hero ${phase === 'ready' ? '' : 'is-loading'} ${section > 0 ? 'is-away' : ''}`}>
            <button
                className={`sound-btn ${sound ? 'on' : ''}`}
                type="button"
                aria-label={sound ? 'Turn sound off' : 'Turn sound on'}
                aria-pressed={sound}
                onClick={toggleSound}
            >
                <span /><span /><span /><span />
            </button>

            <header className='hero-top'>
                <a
                    href="/"
                    className='wordmark'
                    onClick={(e) => {
                        e.preventDefault()
                        setSection(0)
                    }}
                >
                    <BrandLockup />
                </a>
            </header>

            <div className='hero-center'>
                <p className='label'>FULL-SERVICE CREATIVE &amp; DIGITAL AGENCY</p>
                <h1 className='headline'>Innovate. Create.<br /><em>Elevate.</em></h1>
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
                <span className={`unleash-cue ${stirred ? 'is-stirred' : ''}`}>CLICK TO STIR THE SPHERE</span>
            </footer>
        </div>
    )
}