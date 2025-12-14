export class Idea {
    constructor({ name, email, canal, idea, mention }) {
        this.name = name;
        this.email = email;
        this.canal = canal;
        this.idea = idea;
        this.mention = mention;
    }

    validate() {
        if (!this.idea || this.idea.trim().length < 5) {
            throw new Error('Añade un poco más de contexto a la idea.');
        }
        return true;
    }
}
