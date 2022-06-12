import { ICommand, CommandUtils } from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../data/types';
import LangUtils from '../utils/language';
import TimeUtils from '../utils/time';

export default class PingCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, path.parse(__filename).name);
    }

    readonly dm_permission: boolean = true;
    readonly description = 'Test whether the bot is responsive.';

    run(interaction: types.Interaction): types.CommandResponse {
        const pongMessage = this.getPongMessage(interaction.locale);
        return this.respond(interaction, pongMessage).then(() => {
            return this.roundtripCallback.bind(this)(interaction, Date.now());
        }).catch(this.handleAPIError.bind(this));
    }

    roundtripCallback(interaction: types.Interaction, startTimestamp: number) {
        const millis = TimeUtils.sinceMillis(startTimestamp);
        return this.bot.api.interaction.editResponse(interaction, {
            content: this.getPongMessage(interaction.locale, millis)
        });
    }

    getPongMessage(locale?: types.Locale, roundtripMillis?: number) {
        const millis = this.bot.gateway.ping.toLocaleString(locale);
        if (roundtripMillis) {
            return LangUtils.getAndReplace('PONG_ROUNDTRIP', {
                millis, 
                roundtrip: roundtripMillis.toLocaleString(locale)
            }, locale);
        }
        return LangUtils.getAndReplace('PONG_API', { millis }, locale);
    }
}
