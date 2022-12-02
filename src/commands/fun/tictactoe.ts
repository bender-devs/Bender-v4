import { CommandOptionValue, Interaction, Snowflake } from '../../types/types';
import LangUtils from '../../utils/language';
import MiscUtils from '../../utils/misc';
import TextUtils from '../../utils/text';
import TicTacToeUtils, { TicTacToeBoard } from '../../utils/tictactoe';
import FunCommand from '../fun';

export default async function (this: FunCommand, interaction: Interaction, userString?: CommandOptionValue) {
    if (userString && typeof userString !== 'string') {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }
    const authorID = interaction.member?.user.id || interaction.user?.id;
    if (!authorID) {
        return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
    }
    let userID = userString ? userString as Snowflake : null;
    if (userID === this.bot.user.id) {
        userID = null;
    }

    const user = userID ? await this.bot.api.user.fetch(userID).catch(() => null) : null;

    if (userID && !user) {
        const response = LangUtils.get('USER_FETCH_FAILED', interaction.locale);
        return this.respond(interaction, response, 'WARNING')
            .catch(this.handleAPIError.bind(this));
    }

    if (user?.bot) {
        const response = LangUtils.getAndReplace('FUN_TTT_BOT', {
            bot: TextUtils.mention.parseUser(user.id)
        }, interaction.locale);
        return this.respond(interaction, response, 'BLOCKED')
            .catch(this.handleAPIError.bind(this));
    }

    const board: TicTacToeBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const botGoesFirst = !MiscUtils.randomInt(1);
    if (botGoesFirst && !userID) {
        board[MiscUtils.randomInt(8)] = 2;
    }

    let startText = LangUtils.get(`FUN_TTT_START_BOT${botGoesFirst ? '_FIRST' : ''}`, interaction.locale);
    if (userID) {
        startText = LangUtils.getAndReplace('FUN_TTT_START', {
            user: TextUtils.mention.parseUser(userID),
            first: TextUtils.mention.parseUser(botGoesFirst ? userID : authorID)
        }, interaction.locale);
    }

    return this.respond(interaction, {
        content: startText,
        components: TicTacToeUtils.getComponents(board, interaction.id),
    }, 'TIC_TAC_TOE', !userID).then(msg => {
        this.bot.interactionUtils.addItem({
            author: authorID,
            interaction,
            target: userID,
            board,
            targetTurn: userID ? botGoesFirst : false
        });
        return msg;
    });
}