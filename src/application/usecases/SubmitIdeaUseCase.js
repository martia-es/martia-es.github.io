import { Idea } from '../../domain/entities/Idea.js';

export class SubmitIdeaUseCase {
    constructor(ideaRepository) {
        this.ideaRepository = ideaRepository;
    }

    async execute(ideaData, endpoint) {
        const idea = new Idea(ideaData);
        idea.validate();
        return await this.ideaRepository.submit(endpoint, idea);
    }
}
