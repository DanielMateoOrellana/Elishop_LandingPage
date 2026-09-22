import { useEffect, useState } from 'react';

const NAV_LINKS = [
    { id: 'catalog', label: 'Catálogo' },
    { id: 'tiktok', label: 'TikTok' },
];

const CONTACT_ID = 'contact';
const OBSERVED_SECTION_IDS = [...NAV_LINKS.map((link) => link.id), CONTACT_ID];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('catalog');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 24);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Marca como activa la sección que ocupa la franja central de la pantalla
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-45% 0px -50% 0px' },
        );

        OBSERVED_SECTION_IDS.forEach((id) => {
            const section = document.getElementById(id);
            if (section) {
                observer.observe(section);
            }
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isMenuOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen]);

    const handleNavClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className={`navbar ${isScrolled || isMenuOpen ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <a href="#catalog" className="nav-logo" onClick={handleNavClick} aria-label="EliShop, ir al catálogo">
                    <img src="/images/logo-elishop.jpg" alt="EliShop" className="nav-logo-image" />
                </a>

                <div id="nav-menu" className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.id}
                            href={`#${link.id}`}
                            className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
                            onClick={handleNavClick}
                        >
                            {link.label}
                        </a>
                    ))}
                    <a
                        href={`#${CONTACT_ID}`}
                        className={`nav-link nav-cta ${activeSection === CONTACT_ID ? 'active' : ''}`}
                        onClick={handleNavClick}
                    >
                        Contáctanos
                    </a>
                </div>

                <button
                    type="button"
                    className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={isMenuOpen}
                    aria-controls="nav-menu"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>
            </div>
        </nav>
    );
}
