import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import About from '../../components/About';
import Products from '../../components/Products';
import Categories from '../../components/Categories';
import CTA from '../../components/CTA';
import InfoSection from '../../components/InfoSection';
import TikTokFeed from '../../components/TikTokFeed';
import Contact from '../../components/Contact';
import Footer from '../../components/Footer';
import WhatsAppFloat from '../../components/WhatsAppFloat';

const LandingPage = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <About />
            <Products />
            <Categories />
            <CTA />
            <InfoSection />
            <TikTokFeed />
            <Contact />
            <Footer />
            <WhatsAppFloat />
        </>
    );
};

export default LandingPage;
