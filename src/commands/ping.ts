import { ICommand, CommandUtils } from '../structures/command';
import Bot from '../structures/bot';
import { CommandResponse, Interaction, Locale } from '../types/types';
import LangUtils from '../utils/language';
import TimeUtils from '../utils/time';

export default class PingCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('PING_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('PING_NAME');

    readonly description = LangUtils.get('PING_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('PING_DESCRIPTION');

    readonly dm_permission: boolean = true;

    run(interaction: Interaction): CommandResponse {
        const pongMessage = this.getPongMessage(interaction.locale);
        const startTimestamp = Date.now();
        return this.respond(interaction, pongMessage, 'PONG').then(() => {
            return this.roundtripCallback.bind(this)(interaction, startTimestamp);
        }).catch(this.handleAPIError.bind(this));
    }

    roundtripCallback(interaction: Interaction, startTimestamp: number) {
        const millis = TimeUtils.sinceMillis(startTimestamp);
        return this.editResponse(interaction, this.getPongMessage(interaction.locale, millis), 'PONG');
    }

    getPongMessage(locale?: Locale, roundtripMillis?: number) {
        if (roundtripMillis) {
            return LangUtils.getAndReplace('PONG_ROUNDTRIP', {
                millis: this.bot.gateway.ping,
                roundtrip: roundtripMillis
            }, locale);
        }
        return LangUtils.getAndReplace('PONG_API', { millis: this.bot.gateway.ping }, locale);
    }
}
