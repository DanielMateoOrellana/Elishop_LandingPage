import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';

const TikTokFeed = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const visibleCount = 3;

    useEffect(() => {
        const fetchTikToks = async () => {
            try {
                const { data } = await api.get('/tiktok');
                // Backend returns objects array { id, url, sortOrder }
                if (Array.isArray(data) && data.length > 0) {
                    setVideos(data.map(v => v.url));
                } else {
                    setVideos([
                        "https://www.tiktok.com/@elis_shop.ec/video/7604520250343902482",
                        "https://www.tiktok.com/@elis_shop.ec/video/7604517668057632007",
                        "https://www.tiktok.com/@elis_shop.ec/video/7604508393847524626",
                        "https://www.tiktok.com/@elis_shop.ec/video/7604503947918789895",
                        "https://www.tiktok.com/@elis_shop.ec/photo/7604257014038088968",
                    ]);
                }
            } catch (error) {
                console.error("Error fetching TikToks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTikToks();
    }, []);

    const maxIndex = Math.max(0, videos.length - visibleCount);

    useEffect(() => {
        if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
            const script = document.createElement('script');
            script.src = "https://www.tiktok.com/embed.js";
            script.async = true;
            document.body.appendChild(script);
        } else {
            // Recargar cuando los videos cambien
            setTimeout(() => {
                if (window.tiktok && window.tiktok.embed) {
                    window.tiktok.embed.load();
                }
            }, 500);
        }
    }, [videos]);

    const nextSlide = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    // Si está cargando o no hay videos, no renderizar nada
    if (loading || videos.length === 0) return null;

    return (
        <section className="tiktok-section">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">📱 Síguenos</span>
                    <h2 className="section-title">Nuestro Mundo en <span className="highlight">TikTok</span></h2>
                    <p className="section-description">Descubre tutoriales, novedades y el detrás de escena de Elishop.</p>
                </div>

                <div className="carousel-wrapper">
                    <button
                        onClick={prevSlide}
                        className={`nav-btn prev ${currentIndex === 0 ? 'disabled' : ''}`}
                        disabled={currentIndex === 0}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="carousel-viewport">
                        <div
                            className="carousel-track"
                            style={{
                                transform: `translateX(-${currentIndex * (325 + 32)}px)` // 325px width + 32px gap
                            }}
                        >
                            {videos.map((url, index) => {
                                let videoId = null;
                                if (url.includes('/video/')) {
                                    videoId = url.split('/video/')[1]?.split('?')[0];
                                } else if (url.includes('/photo/')) {
                                    videoId = url.split('/photo/')[1]?.split('?')[0];
                                }

                                if (!videoId) return null;

                                return (
                                    <div key={index} className="tiktok-card">
                                        <blockquote
                                            className="tiktok-embed"
                                            cite={url}
                                            data-video-id={videoId}
                                            style={{ maxWidth: '325px', minWidth: '325px' }}
                                        >
                                            <section>
                                                <a target="_blank" href={url} rel="noreferrer">
                                                    @{url.split('@')[1]?.split('/')[0]}
                                                </a>
                                            </section>
                                        </blockquote>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={nextSlide}
                        className={`nav-btn next ${currentIndex >= maxIndex ? 'disabled' : ''}`}
                        disabled={currentIndex >= maxIndex}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="follow-btn-container">
                    <a href="https://www.tiktok.com/@elis_shop.ec" target="_blank" rel="noopener noreferrer" className="tiktok-follow-btn">
                        Ver más en TikTok →
                    </a>
                </div>
            </div>

            <style>{`
                .tiktok-section { padding: 4rem 0; background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%); overflow: hidden; }
                .section-header { text-align: center; margin-bottom: 3rem; padding: 0 1rem; }
                .section-subtitle { text-transform: uppercase; letter-spacing: 2px; font-size: 0.85rem; color: var(--primary); font-weight: 700; display: block; margin-bottom: 0.5rem; }
                .section-title { font-size: 2.5rem; font-weight: 800; color: #111827; margin-bottom: 1rem; font-family: var(--font-display); }
                .highlight { background: linear-gradient(120deg, #ff0050 0%, #00f2ea 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .section-description { color: #6b7280; font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
                .carousel-wrapper { display: flex; align-items: center; justify-content: center; gap: 1rem; position: relative; max-width: 1200px; margin: 0 auto; }
                .carousel-viewport { overflow: hidden; width: calc(325px * 3 + 32px * 2); padding: 2rem 0.5rem; }
                .carousel-track { display: flex; gap: 32px; transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1); }
                .tiktok-card { flex: 0 0 auto; width: 325px; border-radius: 1rem; background: white; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; min-height: 580px; display: flex; align-items: center; justify-content: center; }
                .tiktok-card:hover { transform: translateY(-5px); box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1); }
                .nav-btn { width: 48px; height: 48px; border-radius: 50%; background: white; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.2s; z-index: 10; color: #111827; }
                .nav-btn:hover:not(.disabled) { transform: scale(1.1); background: #f9fafb; border-color: #d1d5db; }
                .nav-btn.disabled { opacity: 0.3; cursor: not-allowed; }
                .follow-btn-container { text-align: center; margin-top: 2rem; }
                .tiktok-follow-btn { display: inline-block; background: #111827; color: white; padding: 1rem 2rem; border-radius: 9999px; font-weight: 600; text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .tiktok-follow-btn:hover { background: black; transform: scale(1.05); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2); }
                @media (max-width: 1100px) { .carousel-viewport { width: calc(325px * 2 + 32px); } }
                @media (max-width: 768px) { .carousel-viewport { width: 100%; overflow-x: auto; padding: 1rem; } .carousel-track { transform: none !important; gap: 1rem; } .nav-btn { display: none; } .tiktok-card { width: 300px; min-height: 540px; } }
            `}</style>
        </section>
    );
};

export default TikTokFeed;
