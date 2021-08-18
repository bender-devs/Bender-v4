// this file sits between the client files and api wrapper and manages things like rate limits, cache, and errors.
import APIWrapper from '../utils/apiWrapper';
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
        if (error.status === 429) {

        }
        // TODO: finish this
        return this.bot.logger.handleError(error, null);
    }

    gateway = {
        getURL: async () => {
            return APIWrapper.gateway.fetchURL()
                .then(res => res.body).catch(this.handleError);
        },
        getBotInfo: async () => {
            return APIWrapper.gateway.fetchBotInfo()
                .then(res => res.body).catch(this.handleError);
        }
    }

    channel = {
        send: async (channel_id: types.Snowflake, message_data: types.MessageData) => {
            // TODO: apply default options (i.e. allowed_mentions)
            return APIWrapper.message.create(channel_id, message_data)
                .then(res => res.body).catch(this.handleError);
        }
    }

    user = {
        send: async (user_id: types.Snowflake, message_data: types.MessageData) => {
            let channelID = await this.bot.cache.dmChannels.get(user_id);
            if (!channelID) {
                const newChannel = await this.user.createDM(user_id).catch(this.handleError);
                if (!newChannel) {
                    this.bot.logger.debug('CREATE_DM_FAILED', user_id);
                    return null;
                }
                channelID = newChannel.id;
            }
            return APIWrapper.message.create(channelID, message_data)
                .then(res => res.body).catch(this.handleError);
        },
        createDM: async (user_id: types.Snowflake) => {
            return APIWrapper.user.createDM(user_id)
                .then(res => res.body).catch(this.handleError);
        }
    }

    interaction = {
        sendResponse: async (interaction: types.Interaction, interaction_response: types.InteractionResponse) => {
            return APIWrapper.interactionResponse.create(interaction.id, interaction.token, interaction_response)
                .then(res => res.body).catch(this.handleError);
        },
        getResponse: async (interaction: types.Interaction) => {
            return APIWrapper.interactionResponse.fetch(this.bot.user.id, interaction.token)
                .then(res => res.body).catch(this.handleError);
        },
        editResponse: async (interaction: types.Interaction, message_data: types.MessageData) => {
            return APIWrapper.interactionResponse.edit(this.bot.user.id, interaction.token, message_data)
                .then(res => res.body).catch(this.handleError);
        },
        deleteResponse: async (interaction: types.Interaction) => {
            return APIWrapper.interactionResponse.delete(this.bot.user.id, interaction.token)
                .then(res => res.body).catch(this.handleError);
        },

        sendFollowup: async (interaction: types.Interaction, message_data: types.MessageData) => {
            return APIWrapper.interactionFollowup.create(this.bot.user.id, interaction.token, message_data)
                .then(res => res.body).catch(this.handleError);
        },
        editFollowup: async (interaction: types.Interaction, message_id: types.Snowflake, message_data: types.MessageData) => {
            return APIWrapper.interactionFollowup.edit(this.bot.user.id, interaction.token, message_id, message_data)
                .then(res => res.body).catch(this.handleError);
        },
        deleteFollowup: async (interaction: types.Interaction, message_id: types.Snowflake) => {
            return APIWrapper.interactionFollowup.delete(this.bot.user.id, interaction.token, message_id)
                .then(res => res.body).catch(this.handleError);
        }
    }
}