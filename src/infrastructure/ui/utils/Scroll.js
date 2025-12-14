export const smoothScrollTo = (hash) => {
    if (!hash || !hash.startsWith('#')) return;
    const target = document.querySelector(hash);
    if (!target) return;
    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    const highlight = target.querySelector('[data-highlight]') || target;
    highlight.classList.add('is-highlighted');
    window.setTimeout(() => {
        highlight.classList.remove('is-highlighted');
    }, 1200);
};

export const bindSmoothLinks = (container) => {
    container.querySelectorAll('a[href^="#"]').forEach((link) => {
        if (link.dataset.smoothBound === 'true') return;
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href || href.length <= 1) return;
            event.preventDefault();
            smoothScrollTo(href);
        });
        link.dataset.smoothBound = 'true';
    });
};
