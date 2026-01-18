import { useState, useEffect } from 'react';

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
                <a href="#hero" className="nav-logo">
                    <span className="logo-text">Eli</span>
                    <span className="logo-accent">Shop</span>
                </a>
                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <a href="#hero" className="nav-link" onClick={handleNavClick}>Inicio</a>
                    <a href="#about" className="nav-link" onClick={handleNavClick}>Nosotros</a>
                    <a href="#products" className="nav-link" onClick={handleNavClick}>Productos</a>
                    <a href="#categories" className="nav-link" onClick={handleNavClick}>Categorías</a>
                    <a href="#testimonials" className="nav-link" onClick={handleNavClick}>Testimonios</a>
                    <a href="#contact" className="nav-link nav-cta" onClick={handleNavClick}>Contáctanos</a>
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
