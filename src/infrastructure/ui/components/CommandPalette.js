import { smoothScrollTo } from '../utils/Scroll.js';

export class CommandPalette {
    constructor(navEntries) {
        this.navEntries = navEntries || [];
        this.commandPalette = document.querySelector('[data-command-palette]');
        this.commandList = this.commandPalette ? this.commandPalette.querySelector('[data-command-list]') : null;
        this.commandBackdrop = this.commandPalette ? this.commandPalette.querySelector('[data-command-dismiss]') : null;
        this.isCommandPaletteOpen = false;
        this.lastFocusedElement = null;
    }

    init() {
        if (!this.commandPalette) return;

        this.commandPalette.addEventListener('keydown', (e) => this.handlePaletteKeydown(e));
        if (this.commandBackdrop) {
            this.commandBackdrop.addEventListener('click', () => this.closeCommandPalette());
        }

        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
    }

    getPaletteOptions() {
        if (!this.commandList) return [];
        return Array.from(this.commandList.querySelectorAll('button.command-palette__option'));
    }

    renderCommandPalette() {
        if (!this.commandList || this.navEntries.length === 0) return;
        this.commandList.innerHTML = '';
        this.navEntries.forEach((entry) => {
            if (!entry.href.startsWith('#')) return;
            const listItem = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'command-palette__option';
            button.dataset.commandTarget = entry.href;
            button.append(document.createTextNode(entry.label));
            const meta = document.createElement('span');
            meta.textContent = entry.href.slice(1);
            button.append(meta);
            button.addEventListener('click', () => {
                this.closeCommandPalette();
                smoothScrollTo(entry.href);
            });
            listItem.append(button);
            this.commandList.append(listItem);
        });
    }

    focusCommandOption(index) {
        const options = this.getPaletteOptions();
        if (!options.length) return;
        const targetIndex = Math.max(0, Math.min(index, options.length - 1));
        options[targetIndex].focus();
    }

    stepFocus(delta) {
        const options = this.getPaletteOptions();
        if (!options.length) return;
        const currentIndex = options.indexOf(document.activeElement);
        const baseIndex = currentIndex === -1 ? (delta > 0 ? -1 : 0) : currentIndex;
        const nextIndex = (baseIndex + delta + options.length) % options.length;
        options[nextIndex].focus();
    }

    openCommandPalette() {
        if (!this.commandPalette || this.isCommandPaletteOpen || this.navEntries.length === 0) return;
        this.renderCommandPalette();
        this.isCommandPaletteOpen = true;
        this.lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        this.commandPalette.setAttribute('aria-hidden', 'false');
        this.commandPalette.removeAttribute('hidden');
        document.body.classList.add('is-command-open');
        window.requestAnimationFrame(() => {
            const options = this.getPaletteOptions();
            if (options.length) {
                options[0].focus();
            }
        });
    }

    closeCommandPalette() {
        if (!this.commandPalette || !this.isCommandPaletteOpen) return;
        this.isCommandPaletteOpen = false;
        this.commandPalette.setAttribute('aria-hidden', 'true');
        this.commandPalette.setAttribute('hidden', '');
        document.body.classList.remove('is-command-open');
        if (this.lastFocusedElement) {
            window.requestAnimationFrame(() => {
                this.lastFocusedElement?.focus?.();
                this.lastFocusedElement = null;
            });
        }
    }

    handlePaletteKeydown(event) {
        if (!this.isCommandPaletteOpen) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            this.closeCommandPalette();
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.stepFocus(1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.stepFocus(-1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            this.focusCommandOption(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            this.focusCommandOption(this.getPaletteOptions().length - 1);
        }
    }

    handleGlobalKeydown(event) {
        if (event.defaultPrevented) return;
        if (event.key === 'Escape' && this.isCommandPaletteOpen) {
            event.preventDefault();
            this.closeCommandPalette();
            return;
        }

        const isEditableElement = (element) => {
            if (!(element instanceof HTMLElement)) return false;
            const tag = element.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA' || element.isContentEditable || element.getAttribute('role') === 'textbox';
        };

        if (isEditableElement(event.target)) return;
        const isSlashTrigger = (event.key === 'm');
        if (!isSlashTrigger) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        event.preventDefault();
        if (this.isCommandPaletteOpen) {
            this.closeCommandPalette();
        } else {
            this.openCommandPalette();
        }
    }
}
