import { matchesReducedMotion } from '../utils/Environment.js';

export class Hero {
    init() {
        const typedTarget = document.querySelector('#typedText');
        if (!typedTarget) return;

        const phrases = [
            "'usa estas 500 herramientas IA' con las 3 que importan de verdad",
            "'copia este prompt mágico' con diseño de arquitectura cognitiva real",
            "'monta tu chatbot en 5 minutos' con sistemas listos para producción",
            "'mira qué fácil es hacer RAG' con indexación y chunking bien hechos",
        ];

        const typedWrapper = typedTarget.parentElement;
        const longestPhrase = phrases.reduce((longest, phrase) => (phrase.length > longest.length ? phrase : longest), '');

        const updateTypedWidth = () => {
            if (!typedWrapper) return;
            const measurement = document.createElement('span');
            measurement.textContent = longestPhrase;
            measurement.className = typedTarget.className;
            measurement.style.position = 'absolute';
            measurement.style.left = '-9999px';
            measurement.style.whiteSpace = 'nowrap';
            typedWrapper.appendChild(measurement);
            const width = measurement.getBoundingClientRect().width;
            typedWrapper.style.width = `${Math.ceil(width)}px`;
            measurement.remove();
        };

        updateTypedWidth();
        window.addEventListener('resize', updateTypedWidth);

        if (matchesReducedMotion()) {
            typedTarget.textContent = phrases[0];
            return;
        }

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typeSpeed = 70;
        const deleteSpeed = 45;
        const holdTime = 1600;

        const type = () => {
            const currentPhrase = phrases[phraseIndex % phrases.length];
            if (!isDeleting && charIndex <= currentPhrase.length) {
                typedTarget.textContent = currentPhrase.slice(0, charIndex);
                charIndex += 1;
                setTimeout(type, typeSpeed);
            } else if (!isDeleting && charIndex > currentPhrase.length) {
                isDeleting = true;
                setTimeout(type, holdTime);
            } else if (isDeleting && charIndex >= 0) {
                typedTarget.textContent = currentPhrase.slice(0, charIndex);
                charIndex -= 1;
                setTimeout(type, deleteSpeed);
            } else {
                isDeleting = false;
                phraseIndex += 1;
                setTimeout(type, typeSpeed);
            }
        };

        setTimeout(type, 900);
    }
}
