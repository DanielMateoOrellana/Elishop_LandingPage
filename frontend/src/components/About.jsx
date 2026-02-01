import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function About() {
    const [sectionRef, sectionVisible] = useScrollAnimation();
    const [imagesRef, imagesVisible] = useScrollAnimation({ threshold: 0.2 });
    const [textRef, textVisible] = useScrollAnimation();
    const [featuresRef, featuresVisible] = useScrollAnimation();

    return (
        <section className="about" id="about" ref={sectionRef}>
            <div className="container">
                <div className="about-content">
                    <div
                        className={`about-images animate-fade-in-left ${imagesVisible ? 'visible' : ''}`}
                        ref={imagesRef}
                    >
                        <div className="about-img-container img-1">
                            <img src="/images/WhatsApp Image 2026-01-17 at 18.42.30.jpeg" alt="Set Girasol Elishop" />
                        </div>
                        <div className="about-img-container img-2">
                            <img src="/images/WhatsApp Image 2026-01-17 at 18.42.37.jpeg" alt="Set Monsters Inc Elishop" />
                        </div>
                        <div className="about-img-container img-3">
                            <img src="/images/WhatsApp Image 2026-01-17 at 18.42.41.jpeg" alt="Collar Ying Yang Elishop" />
                        </div>
                    </div>
                    <div
                        className={`about-text animate-fade-in-right ${textVisible ? 'visible' : ''}`}
                        ref={textRef}
                    >
                        <span className="section-tag">💖 Nuestra Historia</span>
                        <h2 className="section-title">
                            Creando <span className="gradient-text">Momentos Mágicos</span>
                        </h2>
                        <p className="about-description">
                            <strong>Elishop</strong> nació de la pasión por crear accesorios únicos que celebran
                            el amor, la amistad y los momentos especiales de la vida. Cada pieza está
                            cuidadosamente seleccionada y presentada para convertirse en un regalo inolvidable.
                        </p>
                        <div
                            className={`about-features ${featuresVisible ? 'features-visible' : ''}`}
                            ref={featuresRef}
                        >
                            <Feature
                                icon="🎀"
                                title="Empaque Premium"
                                description="Cada producto viene bellamente empacado, listo para regalar"
                                delay={1}
                                visible={featuresVisible}
                            />
                            <Feature
                                icon="💝"
                                title="Tarjetas Personalizadas"
                                description="Mensajes especiales que acompañan cada accesorio"
                                delay={2}
                                visible={featuresVisible}
                            />
                            <Feature
                                icon="🚀"
                                title="Envío a Todo Ecuador"
                                description="Llevamos la magia de Elishop a cualquier parte del país"
                                delay={3}
                                visible={featuresVisible}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Feature({ icon, title, description, delay, visible }) {
    return (
        <div className={`feature animate-fade-in-up animate-delay-${delay} ${visible ? 'visible' : ''}`}>
            <div className="feature-icon">{icon}</div>
            <div className="feature-content">
                <h4>{title}</h4>
                <p>{description}</p>
            </div>
        </div>
    );
}
