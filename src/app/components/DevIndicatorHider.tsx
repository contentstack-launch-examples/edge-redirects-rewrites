'use client';

import { useEffect } from 'react';

export default function DevIndicatorHider() {
  useEffect(() => {
    const hideIndicators = () => {
      const selectors = [
        '[data-nextjs-turbopack-indicator]',
        '#__next-build-watcher',
        '[data-nextjs-dialog-overlay]',
        '[data-nextjs-dialog]',
        '.__next-dev-tools',
        '.__next-build-status'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none';
          }
        });
      });
    };

    hideIndicators();

    const observer = new MutationObserver(hideIndicators);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
