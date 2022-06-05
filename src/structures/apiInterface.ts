// this file sits between the client files and api wrapper and manages things like rate limits, cache, and errors.
import APIWrapper from '../utils/apiWrapper';
import APIError from './apiError';
import Bot from './bot';
import * as types from '../data/types';

export default class APIInterface {
    bot: Bot;
    cacheEnabled: boolean;

    constructor(bot: Bot, cache: boolean) {
        this.bot = bot;
        this.cacheEnabled = cache;
    }

    handleError(error: types.ResponseError): null {
        const apiError = APIError.parseError(error.response?.body);
        if (apiError) {
            this.bot.logger.debug('API ERROR', apiError);
            throw APIError;
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

    channel = {
        send: async (channel_id: types.Snowflake, message_data: types.MessageData) => {
            // TODO: apply default options (i.e. allowed_mentions)
            return APIWrapper.message.create(channel_id, message_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    message = {
        edit: async (message: types.Message, message_data: types.MessageData) => {
            // TODO: apply default options (i.e. allowed_mentions)
            return APIWrapper.message.edit(message.channel_id, message.id, message_data)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    user = {
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
        list: async () => {
            return APIWrapper.globalCommand.list(this.bot.user.id)
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
            // make a copy of the commands and strip the 'bot' property so we don't send TMI to Discord
            const strippedCommands: types.CommandCreateData[] = [];
            commands_data.forEach(command => {
                const newCommand = Object.assign({}, command, { bot: undefined });
                strippedCommands.push(newCommand);
            })
            this.bot.logger.debug('UPDATE COMMAND LIST', strippedCommands);

            return APIWrapper.globalCommand.replaceAll(this.bot.user.id, strippedCommands)
                .then(res => res.body).catch(this.handleError.bind(this));
        }
    }

    // TODO: lots of missing methods here
}