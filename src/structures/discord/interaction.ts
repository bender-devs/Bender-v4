export default class Interaction {
    guild_id!: string;

    constructor(interactionData: Record<string, any>) {
        Object.assign(this, interactionData);
    }
}