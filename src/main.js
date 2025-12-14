import { FormspreeIdeaRepository } from './infrastructure/repositories/FormspreeIdeaRepository.js';
import { SubmitIdeaUseCase } from './application/usecases/SubmitIdeaUseCase.js';
import { Navbar } from './infrastructure/ui/components/Navbar.js';
import { Hero } from './infrastructure/ui/components/Hero.js';
import { VideoCarousel } from './infrastructure/ui/components/VideoCarousel.js';
import { IdeasForm } from './infrastructure/ui/components/IdeasForm.js';
import { IADock } from './infrastructure/ui/components/IADock.js';
import { CommandPalette } from './infrastructure/ui/components/CommandPalette.js';
import { GlobalAnimations } from './infrastructure/ui/components/GlobalAnimations.js';

const initApp = () => {
    // 1. Core/Infrastructure
    const ideaRepository = new FormspreeIdeaRepository();
    const submitIdeaUseCase = new SubmitIdeaUseCase(ideaRepository);

    // 2. UI Components
    const globalAnimations = new GlobalAnimations();
    const navbar = new Navbar();
    const hero = new Hero();
    const videoCarousel = new VideoCarousel();
    const ideasForm = new IdeasForm(submitIdeaUseCase);
    const iaDock = new IADock();

    // Initialize components
    globalAnimations.init();
    navbar.init();
    hero.init();
    videoCarousel.init();
    ideasForm.init();
    iaDock.init();

    // CommandPalette depends on Navbar being initialized (having the DOM ready/parsed)
    // and potentially providing the nav entries.
    const commandPalette = new CommandPalette(navbar.getNavEntries());
    commandPalette.init();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
    initApp();
}
