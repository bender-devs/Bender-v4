import * as types from '../data/types';
import Bot from './bot';

export default class Gateway {
    ws: WebSocket | null = null;
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    connect(gateway_url: types.URL) {
        this.ws = new WebSocket(gateway_url);
    }
}