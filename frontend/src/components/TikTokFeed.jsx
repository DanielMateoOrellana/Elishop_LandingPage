import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import '../styles/tiktok.css';

const FALLBACK_VIDEOS = [
    "https://www.tiktok.com/@elis_shop.ec/video/7604520250343902482",
    "https://www.tiktok.com/@elis_shop.ec/video/7604517668057632007",
    "https://www.tiktok.com/@elis_shop.ec/video/7604508393847524626",
    "https://www.tiktok.com/@elis_shop.ec/video/7604503947918789895",
    "https://www.tiktok.com/@elis_shop.ec/photo/7604257014038088968",
];

const CARD_WIDTH = 325;
const CARD_GAP = 28;
const PLACEHOLDER_COUNT = 3;

function getVideoId(url) {
    if (url.includes('/video/')) {
        return url.split('/video/')[1]?.split('?')[0];
    }
    if (url.includes('/photo/')) {
        return url.split('/photo/')[1]?.split('?')[0];
    }
    return null;
}

const TikTokFeed = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [headerRef, headerVisible] = useScrollAnimation();
    const visibleCount = 3;

    useEffect(() => {
        const fetchTikToks = async () => {
            try {
                const { data } = await api.get('/tiktok');
                // Backend returns objects array { id, url, sortOrder }
                if (Array.isArray(data) && data.length > 0) {
                    setVideos(data.map(v => v.url));
                } else {
                    setVideos(FALLBACK_VIDEOS);
                }
            } catch (error) {
                console.error("Error fetching TikToks", error);
                setVideos(FALLBACK_VIDEOS);
            } finally {
                setLoading(false);
            }
        };
        fetchTikToks();
    }, []);

    const maxIndex = Math.max(0, videos.length - visibleCount);

    useEffect(() => {
        if (videos.length === 0) return;

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

    return (
        <section className="tiktok-section" id="tiktok">
            <div className="container">
                <div className={`section-header ${headerVisible ? 'animate-visible' : ''}`} ref={headerRef}>
                    <span className="section-tag">Síguenos</span>
                    <h2 className="section-title">Nuestro mundo en <em>TikTok</em></h2>
                    <p className="section-description">Descubre novedades, ideas de regalo y el detrás de escena de Elishop.</p>
                </div>

                <div className="tiktok-carousel">
                    <button
                        type="button"
                        onClick={prevSlide}
                        className="tiktok-nav"
                        disabled={loading || currentIndex === 0}
                        aria-label="Videos anteriores"
                    >
                        <ChevronLeft size={22} />
                    </button>

                    <div className="tiktok-viewport">
                        <div
                            className="tiktok-track"
                            style={{
                                transform: `translateX(-${currentIndex * (CARD_WIDTH + CARD_GAP)}px)`
                            }}
                        >
                            {loading
                                ? Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
                                    <div key={index} className="tiktok-card is-placeholder" aria-hidden="true" />
                                ))
                                : videos.map((url, index) => {
                                    const videoId = getVideoId(url);
                                    if (!videoId) return null;

                                    return (
                                        <div key={index} className="tiktok-card">
                                            <blockquote
                                                className="tiktok-embed"
                                                cite={url}
                                                data-video-id={videoId}
                                                style={{ maxWidth: `${CARD_WIDTH}px`, minWidth: `${CARD_WIDTH}px` }}
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
                        type="button"
                        onClick={nextSlide}
                        className="tiktok-nav"
                        disabled={loading || currentIndex >= maxIndex}
                        aria-label="Videos siguientes"
                    >
                        <ChevronRight size={22} />
                    </button>
                </div>

                <div className="tiktok-follow">
                    <a href="https://www.tiktok.com/@elis_shop.ec" target="_blank" rel="noopener noreferrer" className="tiktok-follow-btn">
                        Ver más en TikTok <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default TikTokFeed;
