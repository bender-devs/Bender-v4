import Command from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../data/types';
import LanguageUtils from '../utils/language';
import { INTERACTION_CALLBACK_FLAGS, INTERACTION_CALLBACK_TYPES } from '../data/numberTypes';

export default class PingCommand implements Command {
    bot: Bot;
    
    readonly name: string = path.parse(__filename).name;
    readonly guildOnly: boolean = false;
    readonly global: boolean = false;
    readonly default_permission: boolean = true;
    readonly options: types.CommandOption[] = [{
        type: 3,
        name: 'type',
        description: 'Whether to measure roundtrip or API ping. Default roundtrip.',
        choices: [
            { name: 'API', value: 'api' },
            { name: 'Roundtrip', value: 'roundtrip' }
        ],
    }];

    constructor (bot: Bot) {
        this.bot = bot;
    }

    run(interaction: types.Interaction, args: types.CommandOption[]): types.CommandResponse {
        const millis = args[0].choices?.[0].value === 'roundtrip' ? 420 : 69; // TODO: real numbers
        return this.bot.api.interaction.sendResponse(interaction, {
            type: INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: this.getPongMessage(millis),
                flags: INTERACTION_CALLBACK_FLAGS.EPHEMERAL
            }
        });
    }

    runText(msg: types.Message, argString: string): types.CommandResponse {
        const millis = argString.toLowerCase() === 'roundtrip' ? 420 : 69; // TODO: real numbers
        if (!msg.guild_id) {
            return this.bot.api.user.send(msg.author.id, {
                content: this.getPongMessage(millis)
            })
        }
        return this.bot.api.channel.send(msg.channel_id, {
            content: this.getPongMessage(millis)
        })
    }

    getPongMessage(millis: number) {
        return LanguageUtils.getAndReplace('PONG', { millis: millis.toString() });
    }
}