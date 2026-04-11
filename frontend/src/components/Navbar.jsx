import { useEffect, useState } from 'react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <a href="#catalog" className="nav-logo" onClick={handleNavClick}>
                    <img src="/images/logo.png" alt="EliShop" className="nav-logo-image" />
                </a>

                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <a href="#catalog" className="nav-link" onClick={handleNavClick}>Inicio</a>
                    <a href="#catalog" className="nav-link" onClick={handleNavClick}>Productos</a>
                    <a href="#catalog" className="nav-link" onClick={handleNavClick}>Categorías</a>
                    <a href="#contact" className="nav-link nav-cta" onClick={handleNavClick}>Contactanos</a>
                </div>

                <div
                    className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </div>
        </nav>
    );
}
