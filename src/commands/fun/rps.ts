import RPSUtils from '../../interactionUtils/rps.js';
import { CommandOptionValue, Interaction, Snowflake } from '../../types/types.js';
import LangUtils from '../../utils/language.js';
import MiscUtils from '../../utils/misc.js';
import TextUtils from '../../utils/text.js';
import FunCommand from '../fun.js';

export default async function (this: FunCommand, interaction: Interaction, show?: CommandOptionValue, userID?: CommandOptionValue) {
    const authorID = interaction.member?.user.id || interaction.user?.id;
    if (!authorID) {
        return this.handleUnexpectedError(interaction, 'AUTHOR_UNKNOWN');
    }
    if (show && userID) {
        const cheatMsg = LangUtils.getAndReplace('FUN_RPS_NO_CHEAT', {
            showOpt: LangUtils.get('FUN_RPS_OPTION', interaction.locale),
            userOpt: LangUtils.get('FUN_RPS_OPTION_USER', interaction.locale)
        }, interaction.locale)
        return this.respond(interaction, cheatMsg, 'WARNING')
            .catch(this.handleAPIError.bind(this));
    } else if (userID && typeof userID === 'string') {
        const user = userID ? interaction.data?.resolved?.users?.[userID as Snowflake] || null : null;

        if (userID && !user) {
            const response = LangUtils.get('USER_FETCH_FAILED', interaction.locale);
            return this.respond(interaction, response, 'WARNING')
                .catch(this.handleAPIError.bind(this));
        }

        if (user?.bot) {
            const response = LangUtils.getAndReplace('FUN_RPS_BOT', {
                bot: TextUtils.mention.parseUser(user.id)
            }, interaction.locale);
            return this.respond(interaction, response, 'BLOCKED')
                .catch(this.handleAPIError.bind(this));
        }

        const content = LangUtils.getAndReplace('FUN_RPS_START', {
            author: TextUtils.mention.parseUser(authorID),
            user: TextUtils.mention.parseUser(userID as Snowflake)
        }, interaction.locale);
        return this.respond(interaction, {
            content,
            components: RPSUtils.getComponents(interaction.id)
        }, undefined, false).then(msg => {
            this.bot.interactionUtils.addItem({
                author: authorID,
                interaction,
                target: userID as Snowflake
            });
            return msg;
        }).catch(this.handleAPIError.bind(this));
    }

    if (!show) {
        const showMsg = LangUtils.getAndReplace('FUN_RPS_NO_SHOW', {
            showOpt: LangUtils.get('FUN_RPS_OPTION', interaction.locale)
        }, interaction.locale)
        return this.respond(interaction, showMsg, 'WARNING')
            .catch(this.handleAPIError.bind(this));
    }
    if (typeof show !== 'string' || !['r', 'p', 's'].includes(show)) {
        return this.handleUnexpectedError(interaction, 'ARGS_INVALID_TYPE');
    }

    const botShow = MiscUtils.randomItem(['r', 'p', 's']);
    const choiceKey = botShow === 'r' ? 'ROCK' : botShow === 'p' ? 'PAPER' : 'SCISSORS';
    const choice = LangUtils.get(`FUN_RPS_${choiceKey}`, interaction.locale);
    let replyString = `${LangUtils.getAndReplace('FUN_RPS_CHOICE', { choice }, interaction.locale)} `;

    if (show === botShow) {
        replyString += LangUtils.get('FUN_RPS_TIE', interaction.locale);
    } else if (
        (botShow === 'p' && show === 'r') ||
        (botShow === 's' && show === 'p') ||
        (botShow === 'r' && show === 's')
    ) {
        replyString += LangUtils.get('FUN_RPS_WIN', interaction.locale);
    } else {
        replyString += LangUtils.get('FUN_RPS_LOSS', interaction.locale);
    }

    return this.respond(interaction, replyString, choiceKey)
        .catch(this.handleAPIError.bind(this));
}