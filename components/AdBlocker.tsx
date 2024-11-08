import { useEffect } from 'react';

interface Props {
    enabled: boolean;
}

export default function AdBlocker({ enabled }: Props) {
    useEffect(() => {
        if (!enabled) return;

        // Block all ad-related elements
        const blockAds = () => {
            // Extended list of ad selectors from uBlock Origin
            const adSelectors = [
                // StreamWish specific
                '[class*="wish-player"]',
                '[id*="wish-player"]',
                '[class*="wish-ads"]',
                '[id*="wish-ads"]',
                '[class*="player-ads"]',
                '[class*="player-overlay"]',
                '[class*="player-banner"]',
                '[class*="player-popup"]',
                '[class*="player-modal"]',
                '[class*="player-skip"]',
                '[class*="skip-button"]',
                // Common ad containers
                '[class*="ad-"]',
                '[id*="ad-"]',
                '[class*="ads-"]',
                '[id*="ads-"]',
                '[class*="advert"]',
                '[id*="advert"]',
                // Popups and overlays
                '[class*="popup"]',
                '[id*="popup"]',
                '[class*="modal"]',
                '[id*="modal"]',
                '[class*="overlay"]',
                '[id*="overlay"]',
                // Video player specific
                '.video-ads',
                '.videoAd',
                '.player-overlay',
                '.vast-blocker',
                '[class*="preroll"]',
                '[id*="preroll"]',
                // IFrames
                'iframe[src*="ads"]',
                'iframe[src*="advert"]',
                'iframe[src*="banner"]',
                'iframe[src*="pop"]',
                // Specific ad elements
                'ins.adsbygoogle',
                'div[data-ad]',
                'div[data-ads]',
                'div[data-adservice]',
                'div[data-adunit]',
                'div[data-adslot]',
                // Tracking pixels
                'img[src*="ads"]',
                'img[src*="track"]',
                'img[src*="pixel"]'
            ];

            // Block common ad scripts
            const scriptSelectors = [
                'script[src*="ads"]',
                'script[src*="analytics"]',
                'script[src*="tracker"]',
                'script[src*="clicktrack"]',
                'script[src*="popunder"]',
                'script[src*="pop-under"]',
                'script[src*="popover"]',
                'script[src*="pop-over"]'
            ];

            // Remove ad elements
            const removeElements = () => {
                // Remove ad elements
                adSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => {
                        el.remove();
                    });
                });

                // Remove ad scripts
                scriptSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => {
                        el.remove();
                    });
                });

                // Clean iframes
                document.querySelectorAll('iframe').forEach(iframe => {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                        if (iframeDoc) {
                            // Remove ad elements from iframe
                            adSelectors.forEach(selector => {
                                iframeDoc.querySelectorAll(selector).forEach(el => el.remove());
                            });
                            // Remove ad scripts from iframe
                            scriptSelectors.forEach(selector => {
                                iframeDoc.querySelectorAll(selector).forEach(el => el.remove());
                            });
                        }
                    } catch (error) {
                        // Cross-origin iframe, can't access content
                    }
                });
            };

            // Block popups and redirects
            const blockPopups = () => {
                // Override window.open
                window.open = function () { return null; };

                // Block clicks on ad elements
                document.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[class*="ads"]') ||
                        target.closest('[class*="banner"]') ||
                        target.closest('[class*="popup"]') ||
                        target.closest('[onclick*="window.open"]') ||
                        target.closest('[onclick*="location"]')) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }, true);

                // Block beforeunload events
                window.addEventListener('beforeunload', (e) => {
                    e.preventDefault();
                    e.returnValue = '';
                });
            };

            // Block network requests
            const blockNetworkRequests = () => {
                const originalFetch = window.fetch;
                const originalXHR = window.XMLHttpRequest.prototype.open;

                // Override fetch
                window.fetch = async function (...args) {
                    const url = args[0].toString();
                    if (url.includes('ads') ||
                        url.includes('analytics') ||
                        url.includes('tracker') ||
                        url.includes('pop') ||
                        url.includes('banner')) {
                        return new Response('', { status: 200 });
                    }
                    return originalFetch.apply(this, args);
                };

                // Override XMLHttpRequest with correct type definition
                XMLHttpRequest.prototype.open = function (
                    method: string,
                    url: string | URL,
                    async: boolean = true,
                    username?: string | null,
                    password?: string | null
                ) {
                    if (typeof url === 'string' && (
                        url.includes('ads') ||
                        url.includes('analytics') ||
                        url.includes('tracker') ||
                        url.includes('pop') ||
                        url.includes('banner')
                    )) {
                        return;
                    }
                    return originalXHR.apply(this, [method, url, async, username, password]);
                };
            };

            // Block iframe navigation
            const blockIframeNavigation = () => {
                document.querySelectorAll('iframe').forEach(iframe => {
                    try {
                        if (iframe.contentWindow) {
                            // Override window.open in iframe
                            iframe.contentWindow.open = function () { return null; };

                            // Override location in iframe
                            Object.defineProperty(iframe.contentWindow, 'location', {
                                get: function () {
                                    return iframe.contentWindow?.location;
                                },
                                set: function () {
                                    return iframe.contentWindow?.location;
                                }
                            });
                        }
                    } catch (error) {
                        // Cross-origin iframe, can't access content
                    }
                });
            };

            // Initial cleanup
            removeElements();

            // Watch for new elements
            const observer = new MutationObserver((mutations) => {
                removeElements();
                blockIframeNavigation();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Initialize all blockers
            blockPopups();
            blockNetworkRequests();
            blockIframeNavigation();

            return () => {
                observer.disconnect();
            };
        };

        // Start blocking
        const cleanup = blockAds();

        // Cleanup function
        return () => {
            if (cleanup) cleanup();
        };
    }, [enabled]);

    return null;
} 