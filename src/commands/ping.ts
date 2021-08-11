import Command from '../structures/command';
import * as path from 'path';
import Bot from '../structures/bot';
import * as types from '../structures/types';
import LanguageUtils from '../utils/language';

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

    run(interaction: types.Interaction, args: types.CommandOption[]): types.RequestResponse<types.CommandResponse> {
        const millis = args[0].choices?.[0].value === 'roundtrip' ? 420 : 69; // TODO: real numbers
        return this.bot.api.sendInteractionResponse(interaction, {
            type: 4,
            data: {
                content: this.getPongMessage(millis),
                flags: 64
            }
        });
    }

    runText(msg: types.Message, argString: string): types.RequestResponse<types.CommandResponse> {
        const millis = argString.toLowerCase() === 'roundtrip' ? 420 : 69; // TODO: real numbers
        if (!msg.guild_id) {
            return this.bot.api.dmUser(msg.author.id, {
                content: this.getPongMessage(millis)
            })
        }
        return this.bot.api.sendMessage(msg.channel_id, {
            content: this.getPongMessage(millis)
        })
    }

    getPongMessage(millis: number) {
        return LanguageUtils.getAndReplace('PONG', { millis: millis.toString() });
    }
}