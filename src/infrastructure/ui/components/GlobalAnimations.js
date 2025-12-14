import { matchesReducedMotion, isMobile } from '../utils/Environment.js';
import { bindSmoothLinks } from '../utils/Scroll.js';

export class GlobalAnimations {
    init() {
        this.bindSmoothLinksGlobally();
        this.runNavReveal();
        this.initIntersectionObserver();
        this.initCursorLabel();
        this.setYear();
    }

    bindSmoothLinksGlobally() {
        bindSmoothLinks(document);
    }

    setYear() {
        const yearTarget = document.querySelector('#current-year');
        if (yearTarget) {
            yearTarget.textContent = String(new Date().getFullYear());
        }
    }

    runNavReveal() {
        if (document.body.classList.contains('nav-animated')) return;
        if (matchesReducedMotion()) {
            document.body.classList.add('nav-animated');
            return;
        }
        document.body.classList.add('nav-animating');
        window.requestAnimationFrame(() => {
            document.body.classList.add('nav-animated');
            window.setTimeout(() => {
                document.body.classList.remove('nav-animating');
            }, 900);
        });
    }

    initIntersectionObserver() {
        const animatedItems = document.querySelectorAll('[data-animate]');
        if (!animatedItems.length) return;

        const parseTimeValue = (value) => {
            if (!value) return null;
            const trimmed = value.trim();
            if (trimmed.endsWith('ms')) {
                const numeric = Number(trimmed.slice(0, -2));
                return Number.isFinite(numeric) ? numeric : null;
            }
            if (trimmed.endsWith('s')) {
                const numeric = Number(trimmed.slice(0, -1));
                return Number.isFinite(numeric) ? numeric * 1000 : null;
            }
            return null;
        };

        const applyTimingVariables = (element) => {
            if (!(element instanceof HTMLElement)) return;
            const delay = parseTimeValue(element.getAttribute('data-animate-delay'));
            if (delay !== null) {
                element.style.setProperty('--animate-delay', `${delay}ms`);
            }
        };

        const showElement = (element) => {
            element.classList.add('is-visible');
        };

        if (!matchesReducedMotion() && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        showElement(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            animatedItems.forEach((item) => {
                applyTimingVariables(item);
                observer.observe(item);
            });
        } else {
            animatedItems.forEach((item) => {
                applyTimingVariables(item);
                showElement(item);
            });
        }
    }

    initCursorLabel() {
        const cursorLabel = document.querySelector('.cursor-label');
        if (cursorLabel && !isMobile()) {
            let hideTimer = null;
            const showFor = 1200; // ms to keep visible after movement
            const updatePosition = (x, y) => {
                cursorLabel.style.left = `${x}px`;
                cursorLabel.style.top = `${y}px`;
            };
            const show = () => {
                cursorLabel.style.opacity = '1';
            };
            const hide = () => {
                cursorLabel.style.opacity = '0';
            };
            const onPointerMove = (event) => {
                const x = event.clientX ?? (event.touches && event.touches[0]?.clientX) ?? 0;
                const y = event.clientY ?? (event.touches && event.touches[0]?.clientY) ?? 0;
                updatePosition(x, y);
                show();
                if (hideTimer) window.clearTimeout(hideTimer);
                hideTimer = window.setTimeout(hide, showFor);
            };
            window.addEventListener('mousemove', onPointerMove, { passive: true });
            window.addEventListener('pointermove', onPointerMove, { passive: true });
            window.addEventListener('touchstart', onPointerMove, { passive: true });
            window.addEventListener('touchmove', onPointerMove, { passive: true });
            window.addEventListener('mouseleave', hide, { passive: true });
            // Initial ping to verify visibility after load
            window.requestAnimationFrame(() => {
                const cx = Math.round(window.innerWidth / 2);
                const cy = Math.round(window.innerHeight / 2);
                updatePosition(cx, cy);
                show();
                if (hideTimer) window.clearTimeout(hideTimer);
                hideTimer = window.setTimeout(hide, 1600);
            });
        }
    }
}
