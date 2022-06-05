import { ICommand, CommandUtils } from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../data/types';
import LanguageUtils from '../utils/language';
import { COMMAND_OPTION_TYPES, INTERACTION_CALLBACK_FLAGS, INTERACTION_CALLBACK_TYPES } from '../data/numberTypes';
import APIError from '../structures/apiError';

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
        let millis = 0, startTimestamp = Date.now();
        if (!roundtrip) {
            millis = this.bot.gateway.ping;
        }
        const thenCallback = roundtrip ? this.roundtripCallback : () => null;
        return this.bot.api.interaction.sendResponse(interaction, {
            type: INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: this.getPongMessage(roundtrip, millis),
                flags: INTERACTION_CALLBACK_FLAGS.EPHEMERAL
            }
        }).then(() => thenCallback.bind(this)(interaction, startTimestamp)).catch((err: APIError) => {
            this.bot.logger.handleError('COMMAND FAILED: /ping', err);
            return null;
        });
    }

    runText(msg: types.Message, argString: string): types.CommandResponse {
        const roundtrip = argString.toLowerCase() !== 'api';
        let millis = 0, startTimestamp = Date.now();
        if (!roundtrip) {
            millis = this.bot.gateway.ping;
        }
        const thenCallback = roundtrip ? this.roundtripCallbackText : () => null;
        if (!msg.guild_id) {
            return this.bot.api.user.send(msg.author.id, {
                content: this.getPongMessage(roundtrip, millis)
            }).then(message => thenCallback.bind(this)(message, startTimestamp)).catch((err: APIError) => {
                this.bot.logger.handleError('COMMAND FAILED: ;ping', err);
                return null;
            });
        }
        return this.bot.api.channel.send(msg.channel_id, {
            content: this.getPongMessage(roundtrip, millis)
        }).then(message => thenCallback.bind(this)(message, startTimestamp)).catch((err: APIError) => {
            this.bot.logger.handleError('COMMAND FAILED: ;ping', err);
            return null;
        });
    }

    roundtripCallback(interaction: types.Interaction, startTimestamp: number) {
        const millis = Date.now() - startTimestamp;
        return this.bot.api.interaction.editResponse(interaction, {
            content: this.getPongMessage(true, millis)
        });
    }

    roundtripCallbackText(message: types.Message | null, startTimestamp: number) {
        if (!message) {
            return null;
        }
        const millis = Date.now() - startTimestamp;
        return this.bot.api.message.edit(message, {
            content: this.getPongMessage(true, millis)
        });
    }

    getPongMessage(roundtrip: boolean, millis?: number) {
        if (roundtrip && millis) {
            return LanguageUtils.getAndReplace('PONG_ROUNDTRIP', { millis: millis.toString() });
        } else if (roundtrip || !millis) {
            return LanguageUtils.get('PONG_BLANK');
        }
        return LanguageUtils.getAndReplace('PONG', { millis: millis.toString() });
    }
}