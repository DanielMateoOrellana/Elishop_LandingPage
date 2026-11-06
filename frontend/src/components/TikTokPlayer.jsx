import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { getTikTokPlayerStatus } from '../data/tiktok';

const PLAYER_ORIGIN = 'https://www.tiktok.com';
const PLAYER_TIMEOUT = 20000;

export default function TikTokPlayer({ post, index }) {
    const cardRef = useRef(null);
    const playerRef = useRef(null);
    const [status, setStatus] = useState('waiting');
    const frameName = `__tt_embed__${post.id}`;
    const title = `${post.type === 'photo' ? 'Publicación' : 'Video'} ${index + 1} de EliShop`;

    useEffect(() => {
        // Request only visible cards, including horizontal scrolling.
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setStatus('loading');
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (status !== 'loading' && status !== 'ready') return;
        const timer = status === 'loading'
            ? window.setTimeout(() => setStatus('error'), PLAYER_TIMEOUT)
            : null;
        const handleMessage = (event) => {
            if (event.origin !== PLAYER_ORIGIN || event.source !== playerRef.current?.contentWindow) return;
            const nextStatus = getTikTokPlayerStatus(event.data, frameName);
            if (nextStatus) setStatus(nextStatus);
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('message', handleMessage);
        };
    }, [status, frameName]);

    return (
        <article className="tiktok-card" ref={cardRef}>
            <div className="tiktok-player" aria-busy={status === 'loading'}>
                {(status === 'loading' || status === 'ready') && (
                    <iframe
                        ref={playerRef}
                        name={frameName}
                        className={`tiktok-player-frame${status === 'ready' ? ' is-ready' : ''}`}
                        src={`${PLAYER_ORIGIN}/player/v1/${post.id}?autoplay=0&description=1&rel=0`}
                        title={title}
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        onError={() => setStatus('error')}
                    />
                )}
                {status !== 'ready' && (
                    <div className="tiktok-player-status">
                        <Play size={32} aria-hidden="true" />
                        {status === 'error' ? (
                            <>
                                <p>No pudimos cargar este video aquí.</p>
                                <a href={post.url} target="_blank" rel="noopener noreferrer">Ver en TikTok <ExternalLink size={16} aria-hidden="true" /></a>
                                <button type="button" onClick={() => setStatus('loading')}>Volver a intentar</button>
                            </>
                        ) : (
                            <p role="status">{status === 'loading' ? 'Cargando video…' : title}</p>
                        )}
                    </div>
                )}
            </div>
            <a className="tiktok-post-link" href={post.url} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${title.toLowerCase()} en TikTok`}>
                Ver en TikTok <ExternalLink size={16} aria-hidden="true" />
            </a>
        </article>
    );
}
