import { ICommand, CommandUtils } from '../structures/command';
import Bot from '../structures/bot';
import { Bitfield, CommandOption, CommandResponse, Interaction } from '../types/types';
import LangUtils from '../utils/language';
import { ACTIVITY_TYPES, COMMAND_OPTION_TYPES, PERMISSIONS } from '../types/numberTypes';

export default class StatsCommand extends CommandUtils implements ICommand {
    constructor(bot: Bot) {
        super(bot, LangUtils.get('STATS_NAME'));
    }
    readonly name_localizations = LangUtils.getLocalizationMap('STATS_NAME');

    readonly description = LangUtils.get('STATS_DESCRIPTION');
    readonly description_localizations = LangUtils.getLocalizationMap('STATS_DESCRIPTION');

    readonly default_member_permissions = `${PERMISSIONS.KICK_MEMBERS}` as Bitfield;
    readonly dm_permission = false;

    readonly options: CommandOption[] = [{
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('STATS_SUBCOMMAND_INACTIVE'),
        name_localizations: LangUtils.getLocalizationMap('STATS_SUBCOMMAND_INACTIVE'),
        
        description: LangUtils.get('STATS_SUBCOMMAND_INACTIVE_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('STATS_SUBCOMMAND_INACTIVE_DESCRIPTION'),

        options: [{
            name: LangUtils.get('STATS_INACTIVE_OPTION_DAYS'),
            name_localizations: LangUtils.getLocalizationMap('STATS_INACTIVE_OPTION_DAYS'),

            description: LangUtils.get('STATS_INACTIVE_OPTION_DAYS_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('STATS_INACTIVE_OPTION_DAYS_DESCRIPTION'),

            type: COMMAND_OPTION_TYPES.INTEGER,
            min_value: 1,
            max_value: 30
        }]
    }, {
        type: COMMAND_OPTION_TYPES.SUB_COMMAND,

        name: LangUtils.get('STATS_SUBCOMMAND_PLAYING'),
        name_localizations: LangUtils.getLocalizationMap('STATS_SUBCOMMAND_PLAYING'),
        
        description: LangUtils.get('STATS_SUBCOMMAND_PLAYING_DESCRIPTION'),
        description_localizations: LangUtils.getLocalizationMap('STATS_SUBCOMMAND_PLAYING_DESCRIPTION'),

        options: [{
            name: LangUtils.get('STATS_PLAYING_OPTION_GAME'),
            name_localizations: LangUtils.getLocalizationMap('STATS_PLAYING_OPTION_GAME'),

            description: LangUtils.get('STATS_PLAYING_OPTION_GAME_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('STATS_PLAYING_OPTION_GAME_DESCRIPTION'),

            type: COMMAND_OPTION_TYPES.STRING
        }, {
            name: LangUtils.get('STATS_PLAYING_OPTION_EXACT'),
            name_localizations: LangUtils.getLocalizationMap('STATS_PLAYING_OPTION_EXACT'),

            description: LangUtils.get('STATS_PLAYING_OPTION_EXACT_DESCRIPTION'),
            description_localizations: LangUtils.getLocalizationMap('STATS_PLAYING_OPTION_EXACT_DESCRIPTION'),

            type: COMMAND_OPTION_TYPES.BOOLEAN
        }]
    }]

    async run(interaction: Interaction): CommandResponse {
        if (!interaction.guild_id) {
            return this.respondKeyReplace(interaction, 'GUILD_ONLY', { prefix: '/', command: this.name }, 'GUILD');
        }

        const args = interaction.data?.options;
        const subcommand = args?.[0]?.name;
        switch (subcommand) {
            case LangUtils.get('STATS_SUBCOMMAND_INACTIVE'): {
                const daysInput = args?.[0]?.options?.find(opt => opt.name === LangUtils.get('STATS_INACTIVE_OPTION_DAYS'))?.value;
                const days = daysInput && typeof daysInput === 'number' ? daysInput : 30;

                await this.ack(interaction);

                return this.bot.api.guild.fetchPruneCount(interaction.guild_id, days).then(result => {
                    const inactive = result?.pruned;
                    if (typeof inactive !== 'number') {
                        throw new Error(`fetchPruneCount failed; inactive = ${inactive}`);
                    }
                    const resultMessage = LangUtils.getAndReplace(`STATS_INACTIVE_RESULT${inactive === 1 ? '_SINGLE' : ''}`, { inactive, days });
                    return this.deferredResponse(interaction, resultMessage, 'INFO');
                }).catch(err => {
                    this.bot.logger.handleError('/stats inactive', err);
                    const failedMsg = LangUtils.get('STATS_INACTIVE_FETCH_FAILED', interaction.locale);
                    return this.deferredResponse(interaction, failedMsg, 'WARNING');
                })
            }
            case LangUtils.get('STATS_SUBCOMMAND_PLAYING'): {
                const gameInput = args?.[0]?.options?.find(opt => opt.name === LangUtils.get('STATS_PLAYING_OPTION_GAME'))?.value;
                const game = gameInput && typeof gameInput === 'string' ? gameInput : '';
                const exact = !!args?.[0]?.options?.find(opt => opt.name === LangUtils.get('STATS_PLAYING_OPTION_EXACT'))?.value;

                const count = this.bot.cache.members.filter(interaction.guild_id, member => {
                    const pres = this.bot.cache.presences.get(member.user.id);
                    if (!game) {
                        return !!pres?.activities?.find(activity => activity.type === ACTIVITY_TYPES.PLAYING);
                    } else if (exact) {
                        return !!pres?.activities?.find(activity => activity.type === ACTIVITY_TYPES.PLAYING && activity.name === game);
                    }
                    return !!pres?.activities?.find(activity => activity.type === ACTIVITY_TYPES.PLAYING && activity.name.includes(game));
                })?.length || 0;

                if (!count) {
                    return this.respondKeyReplace(interaction, `STATS_PLAYING_RESULT${game ? '' : '_GENERIC'}_EMPTY`, { game }, 'WARNING');
                } else if (count === 1) {
                    return this.respondKeyReplace(interaction, `STATS_PLAYING_RESULT${game ? '' : '_GENERIC'}_SINGLE`, { game }, 'INFO');
                }
                return this.respondKeyReplace(interaction, `STATS_PLAYING_RESULT${game ? '' : '_GENERIC'}`, { playing: count, game }, 'INFO');
            }
            default:
                return this.handleUnexpectedError(interaction, 'INVALID_SUBCOMMAND');
        }
    }
}
