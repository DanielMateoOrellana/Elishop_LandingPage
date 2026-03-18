import Navbar from '../../components/Navbar';
import CatalogScroll from '../../components/CatalogScroll';
import About from '../../components/About';
import CTA from '../../components/CTA';
import TikTokFeed from '../../components/TikTokFeed';
import Contact from '../../components/Contact';
import Footer from '../../components/Footer';
import WhatsAppFloat from '../../components/WhatsAppFloat';

const LandingPage = () => {
    return (
        <>
            <Navbar />
            <CatalogScroll />
            <About />
            <CTA />
            <TikTokFeed />
            <Contact />
            <Footer />
            <WhatsAppFloat />
        </>
    );
};

export default LandingPage;
