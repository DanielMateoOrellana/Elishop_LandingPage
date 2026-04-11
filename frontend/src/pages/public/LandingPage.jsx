import { useLayoutEffect } from 'react';
import Navbar from '../../components/Navbar';
import CatalogScroll from '../../components/CatalogScroll';
import CTA from '../../components/CTA';
import TikTokFeed from '../../components/TikTokFeed';
import Contact from '../../components/Contact';
import Footer from '../../components/Footer';
import WhatsAppFloat from '../../components/WhatsAppFloat';

const LandingPage = () => {
    useLayoutEffect(() => {
        const previousScrollRestoration = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
        const nextUrl = `${window.location.pathname}${window.location.search}#catalog`;
        const restoreCatalogAtTop = () => {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        };

        window.history.replaceState(window.history.state, '', nextUrl);
        restoreCatalogAtTop();

        const frameIds = [
            window.requestAnimationFrame(restoreCatalogAtTop),
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(restoreCatalogAtTop);
            }),
        ];

        const timeoutIds = [
            window.setTimeout(restoreCatalogAtTop, 80),
            window.setTimeout(restoreCatalogAtTop, 220),
            window.setTimeout(restoreCatalogAtTop, 500),
        ];

        const handlePageShow = () => {
            restoreCatalogAtTop();
        };

        window.addEventListener('pageshow', handlePageShow);
        window.addEventListener('load', handlePageShow);

        return () => {
            frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId));
            timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
            window.removeEventListener('pageshow', handlePageShow);
            window.removeEventListener('load', handlePageShow);
            window.history.scrollRestoration = previousScrollRestoration;
        };
    }, []);

    return (
        <>
            <Navbar />
            <CatalogScroll />
            <TikTokFeed />
            <Contact />
            <CTA />
            <Footer />
            <WhatsAppFloat />
        </>
    );
};

export default LandingPage;
