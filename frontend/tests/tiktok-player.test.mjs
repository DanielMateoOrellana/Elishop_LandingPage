import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getTikTokPlayerStatus } from '../src/data/tiktok.js';

const frameName = '__tt_embed__7687406951499664658';
const event = (type, value) => ({ type, value, 'x-tiktok-player': true });

test('a rendered poster becomes visible before the media player initializes', () => {
    const layout = JSON.stringify({ signalSource: frameName, width: 325, height: 580 });
    assert.equal(getTikTokPlayerStatus(layout, frameName), 'ready');
    assert.equal(getTikTokPlayerStatus(JSON.parse(layout), frameName), 'ready');
    assert.equal(getTikTokPlayerStatus(event('onPlayerReady'), frameName), 'ready');
});

test('the real photo soundtrack autoplay failure sequence keeps manual playback available', () => {
    const messages = [event('onPlayerReady'), event('onError', 1), event('onPlayerError', { errorCode: 3002, errorType: 'AUTOPLAY_ERROR' })];
    let status = 'loading';
    for (const message of messages) status = getTikTokPlayerStatus(message, frameName) || status;
    assert.equal(status, 'ready');
});

test('unavailable, blocked and broken posts still report a real failure', () => {
    for (const errorCode of [1001, 1002, 2001, 2005, 3001]) {
        assert.equal(getTikTokPlayerStatus(event('onPlayerError', { errorCode }), frameName), 'error');
    }
});

test('unrelated or malformed messages cannot mark the embed ready', () => {
    for (const message of [null, 'not JSON', '[tea-sdk]ready', {}, { type: 'onPlayerReady' }, { signalSource: 'another-frame', width: 325, height: 580 }, { signalSource: frameName, width: 0, height: 580 }, { signalSource: frameName, width: 325, height: '580' }]) {
        assert.equal(getTikTokPlayerStatus(message, frameName), null);
    }
});
