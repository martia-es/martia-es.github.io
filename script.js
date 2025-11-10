export const initPageInteractions = () => {
  const smoothScrollTo = (hash) => {
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

  const bindSmoothLinks = (container) => {
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

  bindSmoothLinks(document);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 720;

  const runNavReveal = () => {
    if (document.body.classList.contains('nav-animated')) return;
    if (prefersReducedMotion) {
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
  };

  const desktopNav = document.querySelector('#desktopNav');
  const mobileNav = document.querySelector('#mobileNav');
  const menuToggle = document.querySelector('#menuToggle');
  const navShell = document.querySelector('#navShell');
  const typedTarget = document.querySelector('#typedText');
  const yearTarget = document.querySelector('#current-year');
  const commandPalette = document.querySelector('[data-command-palette]');
  const commandList = commandPalette ? commandPalette.querySelector('[data-command-list]') : null;
  const commandBackdrop = commandPalette ? commandPalette.querySelector('[data-command-dismiss]') : null;

  let isCommandPaletteOpen = false;
  let lastFocusedElement = null;

  if (yearTarget) {
    yearTarget.textContent = String(new Date().getFullYear());
  }

  const updateHeaderState = () => {
    if (!navShell) return;
    const scrolled = window.scrollY > 12;
    navShell.classList.toggle('site-header__shell--scrolled', scrolled);
  };

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  if (desktopNav && mobileNav && menuToggle) {
    const navClone = desktopNav.cloneNode(true);
    navClone.removeAttribute('id');
    navClone.querySelectorAll('a').forEach((link) => {
      delete link.dataset.smoothBound;
    });
    mobileNav.append(navClone);
    bindSmoothLinks(navClone);

    const closeMobileNav = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('is-active');
      mobileNav.setAttribute('hidden', '');
    };

    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      const nextState = !isExpanded;
      menuToggle.setAttribute('aria-expanded', String(nextState));
      if (nextState) {
        mobileNav.classList.add('is-active');
        mobileNav.removeAttribute('hidden');
      } else {
        closeMobileNav();
      }
    });

    mobileNav.addEventListener('click', (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest('a[href^="#"]') : null;
      if (!target) return;
      event.preventDefault();
      smoothScrollTo(target.getAttribute('href'));
      closeMobileNav();
    });
  }

  // Build IA Dock with simulated cursor
  const iaDock = document.querySelector('[data-ia-dock]');
  const iaDockList = document.querySelector('[data-ia-dock-list]');
  const iaDockTemplate = document.querySelector('#iaDockTemplate');
  if (iaDock && iaDockList && iaDockTemplate) {
    const items = Array.from(iaDockTemplate.content.children).filter((n) => n.classList?.contains('ia-dock__item'));
    // If reduced motion or mobile, append all at once
    if (prefersReducedMotion || isMobile) {
      items.forEach((node) => {
        const clone = node.cloneNode(true);
        clone.classList.add('is-visible');
        iaDockList.appendChild(clone);
      });
    } else {
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

  const navEntries = desktopNav
    ? Array.from(desktopNav.querySelectorAll('a[href^="#"]')).map((link) => {
        const clone = link.cloneNode(true);
        clone.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
        const rawLabel = clone.textContent ? clone.textContent.replace(/\s+/g, ' ').trim() : '';
        return {
          href: link.getAttribute('href') || '',
          label: rawLabel,
        };
      })
    : [];

  const getPaletteOptions = () => {
    if (!commandList) return [];
    return Array.from(commandList.querySelectorAll('button.command-palette__option'));
  };

  const renderCommandPalette = () => {
    if (!commandList || navEntries.length === 0) return;
    commandList.innerHTML = '';
    navEntries.forEach((entry) => {
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
        closeCommandPalette();
        smoothScrollTo(entry.href);
      });
      listItem.append(button);
      commandList.append(listItem);
    });
  };

  const focusCommandOption = (index) => {
    const options = getPaletteOptions();
    if (!options.length) return;
    const targetIndex = Math.max(0, Math.min(index, options.length - 1));
    options[targetIndex].focus();
  };

  const stepFocus = (delta) => {
    const options = getPaletteOptions();
    if (!options.length) return;
    const currentIndex = options.indexOf(document.activeElement);
    const baseIndex = currentIndex === -1 ? (delta > 0 ? -1 : 0) : currentIndex;
    const nextIndex = (baseIndex + delta + options.length) % options.length;
    options[nextIndex].focus();
  };

  const isEditableElement = (element) => {
    if (!(element instanceof HTMLElement)) return false;
    const tag = element.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || element.isContentEditable || element.getAttribute('role') === 'textbox';
  };

  const openCommandPalette = () => {
    if (!commandPalette || isCommandPaletteOpen || navEntries.length === 0) return;
    renderCommandPalette();
    isCommandPaletteOpen = true;
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    commandPalette.setAttribute('aria-hidden', 'false');
    commandPalette.removeAttribute('hidden');
    document.body.classList.add('is-command-open');
    window.requestAnimationFrame(() => {
      const options = getPaletteOptions();
      if (options.length) {
        options[0].focus();
      }
    });
  };

  const closeCommandPalette = () => {
    if (!commandPalette || !isCommandPaletteOpen) return;
    isCommandPaletteOpen = false;
    commandPalette.setAttribute('aria-hidden', 'true');
    commandPalette.setAttribute('hidden', '');
    document.body.classList.remove('is-command-open');
    if (lastFocusedElement) {
      window.requestAnimationFrame(() => {
        lastFocusedElement?.focus?.();
        lastFocusedElement = null;
      });
    }
  };

  const handlePaletteKeydown = (event) => {
    if (!isCommandPaletteOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCommandPalette();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      stepFocus(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      stepFocus(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusCommandOption(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusCommandOption(getPaletteOptions().length - 1);
    }
  };

  if (commandPalette) {
    commandPalette.addEventListener('keydown', handlePaletteKeydown);
  }

  if (commandBackdrop) {
    commandBackdrop.addEventListener('click', () => {
      closeCommandPalette();
    });
  }

  const handleGlobalKeydown = (event) => {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape' && isCommandPaletteOpen) {
      event.preventDefault();
      closeCommandPalette();
      return;
    }
    if (isEditableElement(event.target)) return;
    const isSlashTrigger = (event.key === 'm');
    if (!isSlashTrigger) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    if (isCommandPaletteOpen) {
      closeCommandPalette();
    } else {
      openCommandPalette();
    }
  };

  document.addEventListener('keydown', handleGlobalKeydown);

  runNavReveal();

  const phrases = [
    "'usa estas 500 herramientas IA' con las 3 que importan de verdad",
    "'copia este prompt mágico' con diseño de arquitectura cognitiva real",
    "'monta tu chatbot en 5 minutos' con sistemas listos para producción",
    "'mira qué fácil es hacer RAG' con indexación y chunking bien hechos",
  ];

  if (typedTarget) {
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

    if (prefersReducedMotion) {
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

  const animatedItems = document.querySelectorAll('[data-animate]');
  if (animatedItems.length) {
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

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
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
  
  // Global cursor-following label: "human"
  const cursorLabel = document.querySelector('.cursor-label');
  if (cursorLabel && !isMobile) {
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
  
  // Ideas form handling
  const ideasForm = document.querySelector('[data-ideas-form]');
  if (ideasForm) {
    const endpoint = ideasForm.getAttribute('data-form-endpoint') || ideasForm.getAttribute('action') || '';
    const statusEl = ideasForm.querySelector('[data-status]');
    const submitBtn = ideasForm.querySelector('[data-submit]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    const hpField = ideasForm.querySelector('input[name="website"]');
    const setStatus = (msg, cls) => {
      if (!statusEl) return;
      statusEl.textContent = msg || '';
      statusEl.classList.remove('is-success', 'is-error');
      if (cls) statusEl.classList.add(cls);
    };
    ideasForm.addEventListener('submit', async (event) => {
      // Only intercept if we have a likely-valid HTTPS endpoint
      if (!endpoint || !/^https?:\/\//i.test(endpoint)) return;
      event.preventDefault();
      if (hpField && hpField.value) {
        // spam honeypot filled
        return;
      }
      const formData = new FormData(ideasForm);
      const payload = Object.fromEntries(formData.entries());
      // Minimal client-side required check
      if (!payload.idea || String(payload.idea).trim().length < 5) {
        setStatus('Añade un poco más de contexto a la idea.', 'is-error');
        return;
      }
      setStatus('Enviando…');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';
      }
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          setStatus('¡Gracias! Me ha llegado. Suelo responder/usar ideas en pocos días.', 'is-success');
          ideasForm.reset();
        } else {
          setStatus('No he podido enviar tu idea. Prueba de nuevo o escribe al correo.', 'is-error');
        }
      } catch {
        setStatus('Hubo un problema de red. Inténtalo de nuevo más tarde.', 'is-error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }

  const initVideoCarousels = () => {
    const carousels = document.querySelectorAll('[data-video-carousel]');
    carousels.forEach((carousel) => {
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
    });
  };

  initVideoCarousels();
};
