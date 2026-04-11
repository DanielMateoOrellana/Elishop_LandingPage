import { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import CatalogScroll from '../../components/CatalogScroll';
import CTA from '../../components/CTA';
import TikTokFeed from '../../components/TikTokFeed';
import Contact from '../../components/Contact';
import Footer from '../../components/Footer';
import WhatsAppFloat from '../../components/WhatsAppFloat';

const LandingPage = () => {
    useEffect(() => {
        const previousScrollRestoration = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';

        const frameId = window.requestAnimationFrame(() => {
            document.getElementById('catalog')?.scrollIntoView({ block: 'start' });
        });

        return () => {
            window.cancelAnimationFrame(frameId);
            window.history.scrollRestoration = previousScrollRestoration;
        };
    }, []);

    return (
        <>
            <Navbar />
            <CatalogScroll />
            <CTA />
            <TikTokFeed />
            <Contact />
            <Footer />
            <WhatsAppFloat />
        </>
    );
};

export default LandingPage;
