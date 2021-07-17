export default class Message {
    id!: string;
    content!: string;

    constructor(messageData: Record<string, any>) {
        Object.assign(this, messageData);
    }
}