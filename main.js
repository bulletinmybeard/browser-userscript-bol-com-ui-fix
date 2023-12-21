// ==UserScript==
// @name        Bol.com - Disable marketing click-events on product links
// @namespace   https://rschu.me/
// @homepage    https://rschu.me/
// @source      https://github.com/bulletinmybeard/browser-userscript-bol-com-ui-fix
// @version     1.0.0
// @encoding    utf-8
// @description Bol.com - Disable marketing click-events on product links
// @author      Robin Schulz
// @match       *://*.bol.com/*
// @compatible  chrome
// @compatible  firefox
// @compatible  opera
// @compatible  safari
// @connect     bol.com
// @run-at      document-end
// ==/UserScript==

/**
 * Checks for 'searchtext' in the URL parameters and modifies the behavior of links with the class 'product-title'.
 * If 'searchtext' is present, it attaches click event listeners to each 'product-title' link.
 * These event listeners prevent the default action and open the link its href in a new tab.
 *
 * @return {void}
 */
const checkProductLinks = () => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    if (params.has('searchtext')) {
        document.querySelectorAll('a.product-title:not(.event-listener-attached)').forEach(element => {
            element.classList.add('event-listener-attached');
            element.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const href = element.getAttribute('href');
                if (href) {
                    window.open(href, '_blank').focus();
                }
            }, true);
        });
    }
};

/**
 * Sets up a popstate event listener and a mutation observer to detect changes in the DOM.
 * When changes are detected, it checks for 'product-title' links to modify their behavior
 * based on the presence of 'searchtext' in the URL.
 *
 * @async
 * @returns {Promise<void>}
 */
(async () => {
    window.addEventListener('popstate', () => checkProductLinks());

    let targetFound = false;
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            let element = mutation.target;
            while (element) {
                if (element.querySelectorAll('a.product-title:not(.event-listener-attached)')) {
                    if (!targetFound) {
                        targetFound = true;
                        checkProductLinks();
                        setTimeout(() => {
                            targetFound = false;
                        }, 1500);
                    }
                    break;
                }
                element = element.parentElement;
            }
        }
    })
        .observe(document.body, {
            childList: true,
            subtree: true
        });
})().catch(err => {
    console.error(err);
});
