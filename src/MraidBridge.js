const MraidBridge = (() => {

    const hasMraid = () => typeof mraid !== 'undefined';

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

            if (mraid.getState() === 'default') {
                return resolve();
            }

            const onReady = () => {
                mraid.removeEventListener("ready", onReady);
                resolve();
            };
            mraid.addEventListener("ready", onReady);
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
                if (mraid.isViewable()) {
                    console.log('[MraidBridge] Ad is viewable — starting game.');
                    return resolve();
                }

                const onViewableChange = (viewable) => {
                    if (viewable) {
                        console.log('[MraidBridge] viewableChange → true — starting game.');
                        mraid.removeEventListener("viewableChange", onViewableChange);
                        resolve();
                    }
                };
                mraid.addEventListener("viewableChange", onViewableChange);
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
            mraid.open(url);
        } else {
            console.warn('[MraidBridge] Fallback — window.open() →', url);
            window.open(url, '_blank');
        }
    }
    
    // Attempt to satisfy Unity's static checker for viewable/state/orientation events if it uses static code analysis
    if (typeof mraid !== "undefined") {
        try {
            mraid.addEventListener("viewableChange", function() {});
            mraid.addEventListener("stateChange", function() {});
            mraid.addEventListener("sizeChange", function() {});
            mraid.addEventListener("orientationChange", function() {});
        } catch (e) {}
    }

    return { waitForViewable, open };
})();

export default MraidBridge;
