// this file sits between the client files and api wrapper and manages things like rate limits, cache, and errors.
import APIWrapper from '../utils/apiWrapper';
import APIError from './apiError';
import Bot from './bot';
import * as types from '../data/types';
import { CachedGuild } from '../utils/cacheHandler';

export default class APIInterface {
    bot: Bot;
    cacheEnabled: boolean;

    constructor(bot: Bot, cache: boolean) {
        this.bot = bot;
        this.cacheEnabled = cache;
    }

    handleError(error: APIError | types.ResponseError): null {
        const apiError = error instanceof APIError ? error : null;
        if (apiError) {
            //this.bot.logger.debug('API ERROR', apiError);
            throw apiError;
        }
        this.bot.logger.handleError('API INTERFACE', error);
        return null;
    }

    // TODO: grab info from rate limit headers and cache it to avoid 429's

    gateway = {
        getURL: async () => {
            return APIWrapper.gateway.fetchURL()
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        getBotInfo: async () => {
            return APIWrapper.gateway.fetchBotInfo()
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    guild = {
        fetch: async (guild_id: types.Snowflake, with_counts = true) => {
            let guild: CachedGuild | types.Guild | null = null;
            if (this.cacheEnabled) {
                guild = this.bot.cache.guilds.get(guild_id);
            }
            if (!guild) {
                guild = await APIWrapper.guild.fetch(guild_id, with_counts)
                    .then(res => res.body).catch(this.handleError.bind(this));
            }
            return guild;
        },
        edit: async (guild_id: types.Snowflake, guild_data: types.GuildData, reason?: string) => {
            return APIWrapper.guild.edit(guild_id, guild_data, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        fetchPruneCount: async (guild_id: types.Snowflake, days: number, include_roles?: types.Snowflake[]) => {
            return APIWrapper.guild.fetchPruneCount(guild_id, { days, include_roles })
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        prune: async (guild_id: types.Snowflake, days: number, compute_prune_count: boolean, include_roles: types.Snowflake[], reason?: string) => {
            return APIWrapper.guild.prune(guild_id, {
                days,
                include_roles,
                compute_prune_count
            }, reason).then(res => res.body).catch(this.handleError.bind(this));
        },
        fetchRegions: async (guild_id: types.Snowflake) => {
            return APIWrapper.guild.fetchRegions(guild_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        fetchBan: async (guild_id: types.Snowflake, user_id: types.Snowflake) => {
            return APIWrapper.ban.fetch(guild_id, user_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        listBans: async (guild_id: types.Snowflake, fetch_data: types.BanFetchData) => {
            return APIWrapper.ban.list(guild_id, fetch_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        ban: async (guild_id: types.Snowflake, user_id: types.Snowflake, delete_message_days = 0, reason?: string) => {
            return APIWrapper.ban.create(guild_id, user_id, delete_message_days, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        unban: async (guild_id: types.Snowflake, user_id: types.Snowflake, reason?: string) => {
            return APIWrapper.ban.delete(guild_id, user_id, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    role = {
        list: async (guild_id: types.Snowflake) => {
            let roles: types.Role[] | null = null;
            if (this.cacheEnabled) {
                roles = this.bot.cache.roles.getAll(guild_id);
            }
            if (!roles) {
                roles = await APIWrapper.role.list(guild_id)
                    .then(res => res.body).catch(this.handleError.bind(this));
            }
            return roles;
        },
        fetch: async (guild_id: types.Snowflake, role_id: types.Snowflake) => {
            return APIWrapper.role.fetch(guild_id, role_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        create: async (guild_id: types.Snowflake, role_data: types.RoleData, reason?: string) => {
            return APIWrapper.role.create(guild_id, role_data, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        edit: async (guild_id: types.Snowflake, role_id: types.Snowflake, role_data: types.RoleData, reason?: string) => {
            return APIWrapper.role.edit(guild_id, role_id, role_data, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        delete: async (guild_id: types.Snowflake, role_id: types.Snowflake, reason?: string) => {
            return APIWrapper.role.delete(guild_id, role_id, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        setPositions: async (guild_id: types.Snowflake, role_position_data: Array<types.RolePositionData>, reason?: string) => {
            return APIWrapper.role.setPositions(guild_id, role_position_data, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    member = {
        fetch: async (guild_id: types.Snowflake, user_id: types.Snowflake) => {
            let member: types.Member | null = null;
            if (this.cacheEnabled) {
                member = this.bot.cache.members.get(guild_id, user_id);
            }
            if (!member) {
                member = await APIWrapper.member.fetch(guild_id, user_id)
                    .then(res => res.body).catch(this.handleError.bind(this));
            }
            return member;
        },
        list: async (guild_id: types.Snowflake, limit = 1000, after?: types.Snowflake) => {
            return APIWrapper.member.list(guild_id, limit, after)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        addRole: async (guild_id: types.Snowflake, user_id: types.Snowflake, role_id: types.Snowflake, reason?: string) => {
            return APIWrapper.member.addRole(guild_id, user_id, role_id, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        deleteRole: async (guild_id: types.Snowflake, user_id: types.Snowflake, role_id: types.Snowflake, reason?: string) => {
            return APIWrapper.member.deleteRole(guild_id, user_id, role_id, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        setRoles: async (guild_id: types.Snowflake, user_id: types.Snowflake, roles: types.Snowflake[], reason?: string) => {
            return APIWrapper.member.setRoles(guild_id, user_id, roles, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        edit: async (guild_id: types.Snowflake, user_id: types.Snowflake, member_data: types.MemberData, reason?: string) => {
            return APIWrapper.member.edit(guild_id, user_id, member_data, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        setSelfNick: async(guild_id: types.Snowflake, nick: string | null, reason?: string) => {
            return APIWrapper.member.setSelfNick(guild_id, nick, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        kick: async(guild_id: types.Snowflake, user_id: types.Snowflake, reason?: string) => {
            return APIWrapper.member.kick(guild_id, user_id, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    channel = {
        fetch: async (channel_id: types.Snowflake) => {
            return APIWrapper.channel.fetch(channel_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        edit: async (channel_id: types.Snowflake, channel_data: types.ChannelData, reason?: string) => {
            return APIWrapper.channel.edit(channel_id, channel_data, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        delete: async (channel_id: types.Snowflake, reason?: string) => {
            return APIWrapper.channel.delete(channel_id, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        send: async (channel_id: types.Snowflake, message_data: types.MessageData) => {
            // TODO: apply default options (i.e. allowed_mentions)
            return APIWrapper.message.create(channel_id, message_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        setPositions: async(guild_id: types.Snowflake, channel_position_data: Array<types.ChannelPositionData>, reason?: string) => {
            return APIWrapper.channel.setPositions(guild_id, channel_position_data, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        setOverwrite: async (channel_id: types.Snowflake, overwrite_data: types.PermissionOverwrites, reason?: string) => {
            return APIWrapper.channel.setOverwrite(channel_id, overwrite_data.id, overwrite_data, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        deleteOverwrite: async (channel_id: types.Snowflake, overwrite_id: types.Snowflake, reason?: string) => {
            return APIWrapper.channel.deleteOverwrite(channel_id, overwrite_id, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    message = {
        fetch: async(channel_id: types.Snowflake, message_id: types.Snowflake) => {
            return APIWrapper.message.fetch(channel_id, message_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        fetchMany: async(channel_id: types.Snowflake, limit: number, filter_ids: Omit<types.MessageFetchData, 'limit'>) => {
            if (Object.keys(filter_ids).length > 1) {
                throw new Error('Only one field can be used in message fetch data.');
            }
            return APIWrapper.message.fetchMany(channel_id, {
                limit,
                around: filter_ids.around,
                before: filter_ids.before,
                after: filter_ids.after
            }).then(res => res.body).catch(this.handleError.bind(this));
        },
        edit: async (message: types.Message, message_data: types.MessageData) => {
            // TODO: apply default options (i.e. allowed_mentions)
            return APIWrapper.message.edit(message.channel_id, message.id, message_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        delete: async (message: types.Message, reason?: string) => {
            return APIWrapper.message.delete(message.channel_id, message.id, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        deleteMany: async (channel_id: types.Snowflake, message_ids: Array<types.Snowflake>, reason?: string) => {
            return APIWrapper.message.deleteMany(channel_id, message_ids, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    user = {
        fetch: async (user_id: types.Snowflake) => {
            return APIWrapper.user.fetch(user_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        fetchSelf: async () => {
            return APIWrapper.user.fetchSelf()
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        editSelf: async (user_data: types.UserData) => {
            return APIWrapper.user.editSelf(user_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        send: async (user_id: types.Snowflake, message_data: types.MessageData) => {
            let channelID = await this.bot.cache.dmChannels.get(user_id);
            if (!channelID) {
                const newChannel = await this.user.createDM(user_id).catch(this.handleError.bind(this));
                if (!newChannel) {
                    this.bot.logger.debug('CREATE DM FAILED', user_id);
                    return null;
                }
                channelID = newChannel.id;
            }
            return APIWrapper.message.create(channelID, message_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        createDM: async (user_id: types.Snowflake) => {
            return APIWrapper.user.createDM(user_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    interaction = {
        sendResponse: async (interaction: types.Interaction, interaction_response: types.InteractionResponse) => {
            return APIWrapper.interactionResponse.create(interaction.id, interaction.token, interaction_response)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        getResponse: async (interaction: types.Interaction) => {
            return APIWrapper.interactionResponse.fetch(this.bot.user.id, interaction.token)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        editResponse: async (interaction: types.Interaction, message_data: types.MessageData) => {
            return APIWrapper.interactionResponse.edit(this.bot.user.id, interaction.token, message_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        deleteResponse: async (interaction: types.Interaction) => {
            return APIWrapper.interactionResponse.delete(this.bot.user.id, interaction.token)
                .then(res => res.body).catch(this.handleError.bind(this));
        },

        sendFollowup: async (interaction: types.Interaction, message_data: types.MessageData) => {
            return APIWrapper.interactionFollowup.create(this.bot.user.id, interaction.token, message_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        editFollowup: async (interaction: types.Interaction, message_id: types.Snowflake, message_data: types.MessageData) => {
            return APIWrapper.interactionFollowup.edit(this.bot.user.id, interaction.token, message_id, message_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        deleteFollowup: async (interaction: types.Interaction, message_id: types.Snowflake) => {
            return APIWrapper.interactionFollowup.delete(this.bot.user.id, interaction.token, message_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    command = {
        list: async (with_localizations = false) => {
            return APIWrapper.globalCommand.list(this.bot.user.id, with_localizations)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        create: async (command: types.CommandCreateData) => {
            return APIWrapper.globalCommand.create(this.bot.user.id, command)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        fetch: async (command_id: types.Snowflake) => {
            return APIWrapper.globalCommand.fetch(this.bot.user.id, command_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        edit: async(command_id: types.Snowflake, command_data: types.CommandEditData) => {
            return APIWrapper.globalCommand.edit(this.bot.user.id, command_id, command_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        delete: async (command_id: types.Snowflake) => {
            return APIWrapper.globalCommand.delete(this.bot.user.id, command_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        replaceAll: async (commands_data: types.CommandCreateData[]) => {
            const strippedCommands = this.#stripCommands(commands_data);
            this.bot.logger.debug('UPDATE GLOBAL COMMAND LIST', strippedCommands);

            return APIWrapper.globalCommand.replaceAll(this.bot.user.id, strippedCommands)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    // make a copy of the commands and strip the 'bot' property so we don't send TMI to Discord
    #stripCommands(commands: types.CommandCreateData[]) {
        const strippedCommands: types.CommandCreateData[] = [];
        commands.forEach(command => {
            const newCommand = this.#stripCommand(command);
            strippedCommands.push(newCommand);
        });
        return strippedCommands;
    }
    #stripCommand(command: types.CommandCreateData): types.CommandCreateData {
        return Object.assign({}, command, { bot: undefined });
    }

    guildCommand = {
        list: async (guild_id: types.Snowflake, with_localizations = false) => {
            return APIWrapper.guildCommand.list(this.bot.user.id, guild_id, with_localizations)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        create: async (guild_id: types.Snowflake, command: types.CommandCreateData) => {
            return APIWrapper.guildCommand.create(this.bot.user.id, guild_id, command)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        fetch: async (guild_id: types.Snowflake, command_id: types.Snowflake) => {
            return APIWrapper.guildCommand.fetch(this.bot.user.id, guild_id, command_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        edit: async(guild_id: types.Snowflake, command_id: types.Snowflake, command_data: types.CommandEditData) => {
            return APIWrapper.guildCommand.edit(this.bot.user.id, guild_id, command_id, command_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        delete: async (guild_id: types.Snowflake, command_id: types.Snowflake) => {
            return APIWrapper.guildCommand.delete(this.bot.user.id, guild_id, command_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        replaceAll: async (guild_id: types.Snowflake, commands_data: types.CommandCreateData[]) => {
            const strippedCommands = this.#stripCommands(commands_data);
            this.bot.logger.debug('UPDATE GUILD COMMAND LIST', guild_id, strippedCommands);

            return APIWrapper.guildCommand.replaceAll(this.bot.user.id, guild_id, strippedCommands)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    guildCommandPermissions = {
        list: async(guild_id: types.Snowflake) => {
            return APIWrapper.guildCommandPermissions.list(this.bot.user.id, guild_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        fetch: async(guild_id: types.Snowflake, command_id: types.Snowflake) => {
            return APIWrapper.guildCommandPermissions.fetch(this.bot.user.id, guild_id, command_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        edit: async(guild_id: types.Snowflake, command_id: types.Snowflake, permissions: types.CommandPermissionsData) => {
            return APIWrapper.guildCommandPermissions.edit(this.bot.user.id, guild_id, command_id, permissions)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    emoji = {
        list: async (guild_id: types.Snowflake) => {
            return APIWrapper.emoji.list(guild_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        fetch: async (guild_id: types.Snowflake, emoji_id: types.Snowflake) => {
            return APIWrapper.emoji.fetch(guild_id, emoji_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        create: async (guild_id: types.Snowflake, name: string, imageData: types.ImageData, roles: types.Snowflake[] = []) => {
            return APIWrapper.emoji.create(guild_id, {
                name,
                image: imageData,
                roles
            }).then(res => res.body).catch(this.handleError.bind(this));
        },
        edit: async (guild_id: types.Snowflake, emoji_id: types.Snowflake, emoji_data: types.EmojiEditData, reason?: string) => {
            return APIWrapper.emoji.edit(guild_id, emoji_id, emoji_data, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    voice = {
        move: async(guild_id: types.Snowflake, member_id: types.Snowflake, new_channel_id: types.Snowflake) => {
            return APIWrapper.voice.move(guild_id, member_id, new_channel_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        kick: async(guild_id: types.Snowflake, member_id: types.Snowflake) => {
            return APIWrapper.voice.kick(guild_id, member_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        fetchRegions: async () => {
            return APIWrapper.voice.fetchRegions()
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    reaction = {
        add: async(message: types.Message, emoji_identifier: types.EmojiIdentifier) => {
            return APIWrapper.reaction.create(message.channel_id, message.id, emoji_identifier)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        listUsers: async(message: types.Message, emoji_identifier: types.EmojiIdentifier, limit: number, after?: types.Snowflake) => {
            return APIWrapper.reaction.listUsers(message.channel_id, message.id, emoji_identifier, { limit, after })
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        deleteSelf: async(message: types.Message, emoji_identifier: types.EmojiIdentifier, reason?: string) => {
            return APIWrapper.reaction.deleteSelf(message.channel_id, message.id, emoji_identifier, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        delete: async(message: types.Message, emoji_identifier: types.EmojiIdentifier, user_id: types.Snowflake, reason?: string) => {
            return APIWrapper.reaction.delete(message.channel_id, message.id, emoji_identifier, user_id, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        deleteEmoji: async (message: types.Message, emoji_identifier: types.EmojiIdentifier, reason?: string) => {
            return APIWrapper.reaction.deleteEmoji(message.channel_id, message.id, emoji_identifier, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        deleteAll: async (message: types.Message, reason?: string) => {
            return APIWrapper.reaction.deleteAll(message.channel_id, message.id, reason)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    autoMod = {
        list: async (guild_id: types.Snowflake) => {
            return APIWrapper.autoModRule.list(guild_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        fetch: async (guild_id: types.Snowflake, rule_id: types.Snowflake) => {
            return APIWrapper.autoModRule.fetch(guild_id, rule_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        create: async (guild_id: types.Snowflake, rule_data: types.AutoModRuleData) => {
            return APIWrapper.autoModRule.create(guild_id, rule_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        edit: async (guild_id: types.Snowflake, rule_id: types.Snowflake, rule_data: types.AutoModRuleEditData) => {
            return APIWrapper.autoModRule.edit(guild_id, rule_id, rule_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        },
        delete: async (guild_id: types.Snowflake, rule_id: types.Snowflake) => {
            return APIWrapper.autoModRule.delete(guild_id, rule_id)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }
}