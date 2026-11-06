export const TIKTOK_HANDLE = 'elis_shop.ec6';
export const TIKTOK_PROFILE_URL = `https://www.tiktok.com/@${TIKTOK_HANDLE}`;

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
