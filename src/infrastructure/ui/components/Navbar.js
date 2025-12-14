import { bindSmoothLinks, smoothScrollTo } from '../utils/Scroll.js';

export class Navbar {
    init() {
        this.desktopNav = document.querySelector('#desktopNav');
        this.mobileNav = document.querySelector('#mobileNav');
        this.menuToggle = document.querySelector('#menuToggle');
        this.navShell = document.querySelector('#navShell');

        this.updateHeaderState();
        window.addEventListener('scroll', () => this.updateHeaderState(), { passive: true });

        if (this.desktopNav && this.mobileNav && this.menuToggle) {
            this.setupMobileNav();
        }
    }

    updateHeaderState() {
        if (!this.navShell) return;
        const scrolled = window.scrollY > 12;
        this.navShell.classList.toggle('site-header__shell--scrolled', scrolled);
    }

    setupMobileNav() {
        // Clone desktop nav to mobile
        const navClone = this.desktopNav.cloneNode(true);
        navClone.removeAttribute('id');
        navClone.querySelectorAll('a').forEach((link) => {
            delete link.dataset.smoothBound;
        });
        this.mobileNav.append(navClone);
        bindSmoothLinks(navClone);

        const closeMobileNav = () => {
            this.menuToggle.setAttribute('aria-expanded', 'false');
            this.mobileNav.classList.remove('is-active');
            this.mobileNav.setAttribute('hidden', '');
        };

        this.menuToggle.addEventListener('click', () => {
            const isExpanded = this.menuToggle.setAttribute('aria-expanded') === 'true'; // Bug in original? it was getAttribute
            // Original: const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            const currentExpanded = this.menuToggle.getAttribute('aria-expanded') === 'true';
            const nextState = !currentExpanded;
            this.menuToggle.setAttribute('aria-expanded', String(nextState));
            if (nextState) {
                this.mobileNav.classList.add('is-active');
                this.mobileNav.removeAttribute('hidden');
            } else {
                closeMobileNav();
            }
        });

        this.mobileNav.addEventListener('click', (event) => {
            const target = event.target instanceof HTMLElement ? event.target.closest('a[href^="#"]') : null;
            if (!target) return;
            event.preventDefault();
            smoothScrollTo(target.getAttribute('href'));
            closeMobileNav();
        });
    }

    getNavEntries() {
        // Exposed for CommandPalette
        if (!this.desktopNav) return [];
        return Array.from(this.desktopNav.querySelectorAll('a[href^="#"]')).map((link) => {
            const clone = link.cloneNode(true);
            clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
            const rawLabel = clone.textContent ? clone.textContent.replace(/\s+/g, ' ').trim() : '';
            return {
                href: link.getAttribute('href') || '',
                label: rawLabel,
            };
        });
    }
}
