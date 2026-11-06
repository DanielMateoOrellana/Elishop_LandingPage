import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import { getTikTokPost, TIKTOK_HANDLE, TIKTOK_PROFILE_URL } from '../data/tiktok';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import TikTokPlayer from './TikTokPlayer';
import '../styles/tiktok.css';

const TikTokFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [canScroll, setCanScroll] = useState({ previous: false, next: false });
    const viewportRef = useRef(null);
    const [headerRef, headerVisible] = useScrollAnimation();

    useEffect(() => {
        const controller = new AbortController();
        const fetchTikToks = async () => {
            try {
                const { data } = await api.get('/tiktok', { signal: controller.signal, timeout: 10000 });
                if (!controller.signal.aborted && Array.isArray(data)) {
                    const unique = new Map();
                    data.forEach(video => {
                        const post = getTikTokPost(video.url);
                        if (post) unique.set(post.id, post);
                    });
                    setPosts([...unique.values()]);
                }
            } catch (error) {
                if (!controller.signal.aborted) console.error('Error fetching TikToks', error);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        fetchTikToks();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const updateNavigation = () => setCanScroll({
            previous: viewport.scrollLeft > 1,
            next: viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1,
        });
        const observer = new ResizeObserver(updateNavigation);
        observer.observe(viewport);
        viewport.addEventListener('scroll', updateNavigation, { passive: true });
        updateNavigation();
        return () => {
            observer.disconnect();
            viewport.removeEventListener('scroll', updateNavigation);
        };
    }, [loading, posts]);

    const scroll = (direction) => {
        const viewport = viewportRef.current;
        const card = viewport?.querySelector('.tiktok-card');
        if (!card) return;
        const gap = parseFloat(getComputedStyle(viewport.querySelector('.tiktok-track')).gap) || 0;
        viewport.scrollBy({
            left: direction * (card.getBoundingClientRect().width + gap),
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
    };

    return (
        <section className="tiktok-section" id="tiktok">
            <div className="container">
                <div className={`section-header ${headerVisible ? 'animate-visible' : ''}`} ref={headerRef}>
                    <span className="section-tag">Síguenos</span>
                    <h2 className="section-title">Nuestro mundo en <em>TikTok</em></h2>
                    <p className="section-description">Descubre novedades, ideas de regalo y el detrás de escena de Elishop.</p>
                </div>

                {loading ? (
                    <p className="tiktok-notice" role="status">Cargando videos…</p>
                ) : posts.length > 0 ? (
                    <div className="tiktok-carousel">
                        <button type="button" onClick={() => scroll(-1)} className="tiktok-nav" disabled={!canScroll.previous} aria-label="Videos anteriores">
                            <ChevronLeft size={22} />
                        </button>
                        <div className="tiktok-viewport" ref={viewportRef} tabIndex={0} role="region" aria-label="Videos de EliShop en TikTok">
                            <div className="tiktok-track">
                                {posts.map((post, index) => <TikTokPlayer key={post.id} post={post} index={index} />)}
                            </div>
                        </div>
                        <button type="button" onClick={() => scroll(1)} className="tiktok-nav" disabled={!canScroll.next} aria-label="Videos siguientes">
                            <ChevronRight size={22} />
                        </button>
                    </div>
                ) : (
                    <p className="tiktok-notice">Mira nuestras últimas publicaciones en @{TIKTOK_HANDLE}.</p>
                )}

                <div className="tiktok-follow">
                    <a href={TIKTOK_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="tiktok-follow-btn">
                        Ver más en TikTok <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default TikTokFeed;
