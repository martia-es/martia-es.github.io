import { isMobile, matchesReducedMotion } from '../utils/Environment.js';

export class IADock {
    init() {
        const iaDock = document.querySelector('[data-ia-dock]');
        const iaDockList = document.querySelector('[data-ia-dock-list]');
        const iaDockTemplate = document.querySelector('#iaDockTemplate');

        if (iaDock && iaDockList && iaDockTemplate) {
            const items = Array.from(iaDockTemplate.content.children).filter((n) => n.classList?.contains('ia-dock__item'));
            // If reduced motion or mobile, append all at once
            if (matchesReducedMotion() || isMobile()) {
                items.forEach((node) => {
                    const clone = node.cloneNode(true);
                    clone.classList.add('is-visible');
                    iaDockList.appendChild(clone);
                });
            } else {
                this.runDockAnimation(iaDock, iaDockList, items);
            }
        }
    }

    runDockAnimation(iaDock, iaDockList, items) {
        // Create simulated cursor
        const cursor = document.createElement('span');
        cursor.className = 'ia-dock__cursor';
        document.body.appendChild(cursor);

        // Create small context menu
        const menu = document.createElement('div');
        menu.className = 'ia-dock__menu';
        const paste = document.createElement('div');
        paste.className = 'ia-dock__menu-item is-accent';
        paste.textContent = 'Pegar';
        const sep = document.createElement('div');
        sep.className = 'ia-dock__menu-item';
        sep.textContent = 'Cancelar';
        menu.append(paste, sep);
        document.body.appendChild(menu);

        const moveCursorTo = (x, y) => {
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
        };

        const getDockTargetPoint = (index) => {
            const dockRect = iaDock.getBoundingClientRect();
            const startX = dockRect.left + dockRect.width / 2 - 20;
            const startY = dockRect.top + 32;
            const step = 52; // approximate per item slot height
            return { x: startX, y: startY + index * step };
        };

        let stepIndex = 0;
        const startPoint = { x: Math.round(window.innerWidth * 0.2), y: Math.round(window.innerHeight * 0.25) };
        moveCursorTo(startPoint.x, startPoint.y);
        cursor.style.opacity = '1';

        const animateTo = (to, duration = 250) => new Promise((resolve) => {
            const fromRect = cursor.getBoundingClientRect();
            const from = { x: fromRect.left, y: fromRect.top };
            const start = performance.now();
            const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const tick = (now) => {
                const p = Math.min(1, (now - start) / duration);
                const k = ease(p);
                moveCursorTo(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k);
                if (p < 1) {
                    requestAnimationFrame(tick);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(tick);
        });

        const placeNext = async () => {
            if (stepIndex >= items.length) {
                cursor.style.opacity = '0';
                menu.classList.remove('is-open');
                setTimeout(() => { cursor.remove(); menu.remove(); }, 400);
                return;
            }
            const target = getDockTargetPoint(stepIndex);
            await animateTo(target, 500);
            // Open menu near cursor
            const cRect = cursor.getBoundingClientRect();
            menu.style.left = `${Math.min(window.innerWidth - 160, cRect.left + 16)}px`;
            menu.style.top = `${Math.min(window.innerHeight - 80, cRect.top + 8)}px`;
            menu.classList.add('is-open');
            // Brief pause to mimic right-click
            await new Promise((r) => setTimeout(r, 100));
            // Click paste (auto)
            paste.classList.add('is-accent');
            await new Promise((r) => setTimeout(r, 90));
            menu.classList.remove('is-open');
            const clone = items[stepIndex].cloneNode(true);
            iaDockList.appendChild(clone);
            // allow layout then reveal
            requestAnimationFrame(() => {
                clone.classList.add('is-visible');
            });
            stepIndex += 1;
            setTimeout(placeNext, 130);
        };

        placeNext();
    }
}
