export class VideoCarousel {
    init() {
        const carousels = document.querySelectorAll('[data-video-carousel]');
        carousels.forEach((carousel) => this.initCarousel(carousel));
    }

    initCarousel(carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-video-slide]'));
        if (!slides.length) return;

        const viewport = carousel.querySelector('[data-video-viewport]');
        const prevBtn = carousel.querySelector('[data-video-prev]');
        const nextBtn = carousel.querySelector('[data-video-next]');
        const dotsHost = carousel.querySelector('[data-video-dots]');

        if (slides.length === 1) {
            carousel.dataset.carouselSingle = 'true';
        }

        const sanitizeSlide = (slide, index) => {
            slide.dataset.index = String(index);
            const iframe = slide.querySelector('iframe');
            const src = slide.dataset.videoSrc;
            if (iframe && src && index !== 0) {
                iframe.dataset.lazySrc = src;
                iframe.removeAttribute('src');
            }
        };

        slides.forEach(sanitizeSlide);

        let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
        if (activeIndex < 0) activeIndex = 0;

        const getIframe = (slide) => slide.querySelector('iframe');

        const ensureActiveSlideLoaded = (slide) => {
            const iframe = getIframe(slide);
            if (!iframe) return;
            const lazySrc = slide.dataset.videoSrc;
            if (!lazySrc) return;
            if (!iframe.src || iframe.dataset.lazySrc === lazySrc) {
                iframe.src = lazySrc;
                delete iframe.dataset.lazySrc;
            }
        };

        const resetSlide = (slide) => {
            const iframe = getIframe(slide);
            if (!iframe) return;
            const src = slide.dataset.videoSrc;
            if (!src) return;
            if (iframe.src && iframe.src !== 'about:blank') {
                iframe.dataset.lazySrc = src;
                iframe.src = 'about:blank';
            }
        };

        const updateDots = () => {
            if (!dotsHost) return;
            const dots = Array.from(dotsHost.querySelectorAll('[data-video-dot]'));
            dots.forEach((dot, index) => {
                dot.classList.toggle('is-active', index === activeIndex);
                dot.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false');
                dot.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
            });
        };

        const updateControls = () => {
            if (prevBtn) {
                prevBtn.disabled = slides.length <= 1 || activeIndex === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = slides.length <= 1 || activeIndex === slides.length - 1;
            }
            updateDots();
        };

        const updateActiveSlide = (nextIndex) => {
            if (nextIndex === activeIndex) return;
            const current = slides[activeIndex];
            const next = slides[nextIndex];
            if (!next) return;
            current?.classList.remove('is-active');
            if (slides.length > 1) resetSlide(current);
            next.classList.add('is-active');
            ensureActiveSlideLoaded(next);
            activeIndex = nextIndex;
            updateControls();
        };

        const goTo = (index) => {
            const clamped = Math.max(0, Math.min(index, slides.length - 1));
            updateActiveSlide(clamped);
        };

        const goNext = () => goTo(activeIndex + 1);
        const goPrev = () => goTo(activeIndex - 1);

        if (dotsHost) {
            dotsHost.innerHTML = '';
            slides.forEach((slide, index) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'video-carousel__dot';
                dot.dataset.videoDot = String(index);
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-controls', viewport?.id || '');
                dot.setAttribute('aria-label', `Ver vídeo ${index + 1}`);
                dot.addEventListener('click', () => goTo(index));
                dotsHost.append(dot);
            });
        }

        prevBtn?.addEventListener('click', goPrev);
        nextBtn?.addEventListener('click', goNext);

        carousel.addEventListener('keydown', (event) => {
            if (event.target.closest('[data-video-dot]')) return;
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goPrev();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                goNext();
            }
        });

        ensureActiveSlideLoaded(slides[activeIndex]);
        updateControls();
    }
}
