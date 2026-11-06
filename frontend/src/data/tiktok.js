export const TIKTOK_HANDLE = 'elis_shop.ec6';
export const TIKTOK_PROFILE_URL = `https://www.tiktok.com/@${TIKTOK_HANDLE}`;

export function getTikTokPlayerStatus(value, frameName) {
    let message = value;
    if (typeof message === 'string') {
        try {
            message = JSON.parse(message);
        } catch {
            return null;
        }
    }
    if (!message || typeof message !== 'object') return null;

    // Named TikTok embeds report their rendered layout before media playback
    // initializes. This also works for video posters waiting for a user click.
    if (message.signalSource === frameName
        && Number.isFinite(message.width) && message.width > 0
        && Number.isFinite(message.height) && message.height > 0) {
        return 'ready';
    }

    if (message['x-tiktok-player'] !== true) return null;
    if (message.type === 'onPlayerReady') return 'ready';
    if (message.type === 'onPlayerError') {
        // Photo posts can try to play their soundtrack even with autoplay=0.
        // A browser denying autoplay leaves manual playback available.
        return message.value?.errorCode === 3002
            || message.value?.errorType === 'AUTOPLAY_ERROR' ? 'ready' : 'error';
    }
    // Ignore deprecated onError: TikTok emits its generic value=1 before the
    // specific onPlayerError, including recoverable autoplay restrictions.
    return null;
}

// Keep the stored post IDs when updating links to the current account.
export function getTikTokPost(value) {
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:' || !['www.tiktok.com', 'tiktok.com'].includes(url.hostname)) return null;
        const match = url.pathname.match(/^\/@([\w.]+)\/(video|photo)\/(\d+)\/?$/);
        if (!match) return null;
        const [, storedHandle, type, id] = match;
        const handle = storedHandle === 'elis_shop.ec' ? TIKTOK_HANDLE : storedHandle;
        return { id, type, url: `https://www.tiktok.com/@${handle}/${type}/${id}` };
    } catch {
        return null;
    }
}
