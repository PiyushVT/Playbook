const MraidBridge = (() => {

    const hasMraid = () => typeof window.mraid !== 'undefined';

    /**
     * Returns a Promise that resolves once the MRAID SDK fires 'ready'
     * (or immediately if it is already ready / not present).
     */
    function waitForReady() {
        return new Promise((resolve) => {
            if (!hasMraid()) {
                console.warn('[MraidBridge] mraid not found — running in dev mode.');
                return resolve();
            }

            if (window.mraid.isReady()) {
                return resolve();
            }

            const onReady = () => {
                window.mraid.removeEventListener('ready', onReady);
                resolve();
            };
            window.mraid.addEventListener('ready', onReady);
        });
    }

    /**
     * Returns a Promise that resolves once the ad unit is viewable.
     * Must be called after waitForReady() has resolved.
     */
    function waitForViewable() {
        return waitForReady().then(() => {
            return new Promise((resolve) => {
                if (!hasMraid()) {
                    // Dev fallback — treat as immediately viewable
                    return resolve();
                }

                // Already viewable — resolve straight away
                if (window.mraid.isViewable()) {
                    console.log('[MraidBridge] Ad is viewable — starting game.');
                    return resolve();
                }

                const onViewableChange = (viewable) => {
                    if (viewable) {
                        console.log('[MraidBridge] viewableChange → true — starting game.');
                        window.mraid.removeEventListener('viewableChange', onViewableChange);
                        resolve();
                    }
                };
                window.mraid.addEventListener('viewableChange', onViewableChange);
            });
        });
    }

    /**
     * Navigate to a URL via mraid.open().
     * Falls back to window.open() when MRAID is not present.
     * @param {string} url
     */
    function open(url) {
        if (hasMraid()) {
            console.log('[MraidBridge] mraid.open() →', url);
            window.mraid.open(url);
        } else {
            console.warn('[MraidBridge] Fallback — window.open() →', url);
            window.open(url, '_blank');
        }
    }
    return { waitForViewable, open };
})();

export default MraidBridge;
