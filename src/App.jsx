import './styles/index.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import Categories from './components/Categories';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import InfoSection from './components/InfoSection';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Products />
      <Categories />
      <Testimonials />
      <CTA />
      <InfoSection />
      <Contact />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

export default App;
