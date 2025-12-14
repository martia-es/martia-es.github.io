export class IdeasForm {
    constructor(submitIdeaUseCase) {
        this.submitIdeaUseCase = submitIdeaUseCase;
        this.form = document.querySelector('[data-ideas-form]');
    }

    init() {
        if (!this.form) return;

        const endpoint = this.form.getAttribute('data-form-endpoint') || this.form.getAttribute('action') || '';
        const statusEl = this.form.querySelector('[data-status]');
        const submitBtn = this.form.querySelector('[data-submit]');
        const originalBtnText = submitBtn ? submitBtn.textContent : '';
        const hpField = this.form.querySelector('input[name="website"]');

        const setStatus = (msg, cls) => {
            if (!statusEl) return;
            statusEl.textContent = msg || '';
            statusEl.classList.remove('is-success', 'is-error');
            if (cls) statusEl.classList.add(cls);
        };

        this.form.addEventListener('submit', async (event) => {
            if (!endpoint || !/^https?:\/\//i.test(endpoint)) return;
            event.preventDefault();

            if (hpField && hpField.value) return; // honeypot

            const formData = new FormData(this.form);
            const payload = Object.fromEntries(formData.entries());

            setStatus('Enviando…');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando…';
            }

            try {
                await this.submitIdeaUseCase.execute(payload, endpoint);
                setStatus('¡Gracias! Me ha llegado. Suelo responder/usar ideas en pocos días.', 'is-success');
                this.form.reset();
            } catch (error) {
                // If validation error or fetch error
                const isValidationError = error.message.includes('Añade un poco más');
                setStatus(isValidationError ? error.message : 'No he podido enviar tu idea. Prueba de nuevo o escribe al correo.', 'is-error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }
}
