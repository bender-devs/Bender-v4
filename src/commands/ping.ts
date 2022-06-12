import { ICommand, CommandUtils } from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../data/types';
import LanguageUtils from '../utils/language';
import { COMMAND_OPTION_TYPES } from '../data/numberTypes';
import TimeUtils from '../utils/time';

export default class PingCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, path.parse(__filename).name);
    }

    readonly dm_permission: boolean = true;
    readonly description = 'Test whether the bot is responsive.';
    readonly options: types.CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.STRING,
        name: 'type',
        description: 'Whether to measure roundtrip or API ping. Default roundtrip.',
        choices: [
            { name: 'API', value: 'api' },
            { name: 'Roundtrip', value: 'roundtrip' }
        ],
    }];

    run(interaction: types.Interaction): types.CommandResponse {
        const args = interaction.data?.options;
        const roundtrip = args?.[0]?.value !== 'api';
        let millis = 0;
        if (!roundtrip) {
            millis = this.bot.gateway.ping;
        }
        const thenCallback = roundtrip ? this.roundtripCallback : () => null;
        const startTimestamp = Date.now();
        const pongMessage = this.getPongMessage(roundtrip, interaction.locale, millis);
        return this.respond(interaction, pongMessage).then(() => thenCallback.bind(this)(interaction, startTimestamp)).catch(this.handleAPIError.bind(this));
    }

    roundtripCallback(interaction: types.Interaction, startTimestamp: number) {
        const millis = TimeUtils.sinceMillis(startTimestamp);
        return this.bot.api.interaction.editResponse(interaction, {
            content: this.getPongMessage(true, interaction.locale, millis)
        });
    }

    getPongMessage(roundtrip: boolean, locale?: types.Locale, millis?: number) {
        if (roundtrip && millis) {
            return LanguageUtils.getAndReplace('PONG_ROUNDTRIP', { millis: millis.toString() }, locale);
        } else if (roundtrip || !millis) {
            return LanguageUtils.getAndReplace('PONG_BLANK', {}, locale);
        }
        return LanguageUtils.getAndReplace('PONG', { millis: millis.toString() }, locale);
    }
}
