import Bot from './bot';
import * as gatewayTypes from '../data/gatewayTypes';

import ready from '../events/ready';
import resumed from '../events/resumed';
// TODO: add remaining events

export default class EventManager {
    bot: Bot;
    ready: (event: gatewayTypes.ReadyData) => any;
    resumed: (event: gatewayTypes.ResumeData) => any;

    constructor(bot: Bot) {
        this.bot = bot;
        this.ready = ready.bind(this.bot);
        this.resumed = resumed.bind(this.bot);
    }

    // TODO: add helper function to check client status (?)
}