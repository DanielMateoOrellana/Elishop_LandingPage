import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function InfoSection() {
    const [headerRef, headerVisible] = useScrollAnimation();
    const [mainRef, mainVisible] = useScrollAnimation();
    const [card1Ref, card1Visible] = useScrollAnimation();
    const [card2Ref, card2Visible] = useScrollAnimation();
    const [card3Ref, card3Visible] = useScrollAnimation();

    return (
        <section className="info-section" id="info">
            <div className="container">
                <div
                    className={`section-header ${headerVisible ? 'animate-visible' : ''}`}
                    ref={headerRef}
                >
                    <span className="section-tag">📋 Información Importante</span>
                    <h2 className="section-title">
                        Lo Que <span className="gradient-text">Debes Saber</span>
                    </h2>
                </div>

                <div className="info-grid">
                    <div
                        className={`info-main animate-fade-in-left ${mainVisible ? 'visible' : ''}`}
                        ref={mainRef}
                    >
                        <h3>¡Importante!</h3>
                        <p>
                            <strong>Elis_shop</strong> es una tienda online con <strong>4 años de experiencia</strong>
                            en envíos seguros y confiables a todo el país, especializada en detalles y
                            accesorios hechos con amor 💖
                        </p>

                        <div className="info-locations">
                            <h4>📍 Ubicaciones con productos disponibles:</h4>
                            <p><strong>Quito - Sangolquí</strong> y <strong>Zaruma (El Oro)</strong></p>
                        </div>

                        <div className="info-locations" style={{ background: '#fff3e0' }}>
                            <h4>⚠️ Solo para Zaruma:</h4>
                            <p>
                                Los pedidos personalizados a partir del <strong>13 de febrero SE ENTREGAN</strong>.
                                ¡Personaliza con tiempo!
                            </p>
                        </div>

                        <div className="info-highlight">
                            <p>📞 Si tienes dudas puedes escribirnos a través de nuestras redes sociales o número de teléfono</p>
                            <span className="phone">0967074437</span>
                            <p className="update-notice">📦 ¡ACTUALIZAMOS EL CATÁLOGO CADA SEMANA!</p>
                        </div>
                    </div>

                    <div className="info-details">
                        <div
                            className={`info-card animate-fade-in-right animate-delay-1 ${card1Visible ? 'visible' : ''}`}
                            ref={card1Ref}
                        >
                            <h4>🚚 Envíos</h4>
                            <ul>
                                <li>Los envíos se realizan mediante <strong>Servientrega</strong>, con un rango de 1 a 2 días hábiles para llegar al destino, dependiendo de la distancia y ubicación del cliente.</li>
                                <li>En <strong>Sangolquí: entregas GRATIS EN LA ESPE</strong> 📍</li>
                                <li>En <strong>Zaruma</strong> pueden pedir que se les envíe por cooperativa o delivery dependiendo de su distancia.</li>
                                <li>También disponible: <strong>ENVÍOS POR DELIVERY 🏍️</strong></li>
                            </ul>
                        </div>

                        <div
                            className={`info-card animate-fade-in-right animate-delay-2 ${card2Visible ? 'visible' : ''}`}
                            ref={card2Ref}
                        >
                            <h4>💳 Forma de Pago</h4>
                            <p>Para la confirmación del pedido, el cliente deberá realizar un <strong>anticipo equivalente al 50%</strong> del valor total del detalle.</p>
                            <p style={{ marginTop: '12px' }}>El monto restante deberá ser cancelado <strong>un día antes de la entrega</strong> o envío del producto.</p>
                            <p style={{ marginTop: '12px', color: '#c62828', fontWeight: 600 }}>⚠️ EL ANTICIPO NO SERÁ REEMBOLSABLE EN CASO DE CANCELACIÓN DEL PEDIDO.</p>
                        </div>

                        <div
                            className={`info-card animate-fade-in-right animate-delay-3 ${card3Visible ? 'visible' : ''}`}
                            ref={card3Ref}
                        >
                            <h4>🎁 Entregas Gratis</h4>
                            <p>Te recordamos que tenemos <strong>entregas gratis en la ESPE</strong> 📍</p>
                            <p style={{ marginTop: '8px' }}><strong>SANGOLQUÍ - QUITO</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
