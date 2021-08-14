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

    handleError(error: types.ResponseError) {
        if (error.status === 429) {

        }
        // TODO: finish this
        return error;
    }

    // in case any transformations need to be applied later
    reformatResponse(response: types.TypedResponse<unknown>) {
        return response.body;
    }

    gateway = {
        getURL: async () => {
            return APIWrapper.gateway.fetchURL()
                .then(this.reformatResponse).catch(this.handleError);
        },
        getBotInfo: async () => {
            return APIWrapper.gateway.fetchBotInfo()
                .then(this.reformatResponse).catch(this.handleError);
        }
    }

    channel = {
        send: async (channel_id: types.Snowflake, message_data: types.MessageData) => {
            // TODO: apply default options (i.e. allowed_mentions)
            return APIWrapper.message.create(channel_id, message_data)
                .then(this.reformatResponse).catch(this.handleError);
        }
    }

    user = {
        send: async (user_id: types.Snowflake, message_data: types.MessageData) => {
            // TODO: check channel cache for DM with this user
            // if not create it as below
            await APIWrapper.user.createDM(user_id)
            // TODO: handle the error or collect the channel ID above
            const channelID: types.Snowflake = '00000000000000000000';
            return APIWrapper.message.create(channelID, message_data)
                .then(this.reformatResponse).catch(this.handleError);
        }
    }

    interaction = {
        sendResponse: async (interaction: types.Interaction, interaction_response: types.InteractionResponse) => {
            return APIWrapper.interactionResponse.create(interaction.id, interaction.token, interaction_response)
                .then(this.reformatResponse).catch(this.handleError);
        },
        getResponse: async (interaction: types.Interaction) => {
            return APIWrapper.interactionResponse.fetch(this.bot.user.id, interaction.token)
                .then(this.reformatResponse).catch(this.handleError);
        },
        editResponse: async (interaction: types.Interaction, message_data: types.MessageData) => {
            return APIWrapper.interactionResponse.edit(this.bot.user.id, interaction.token, message_data)
                .then(this.reformatResponse).catch(this.handleError);
        },
        deleteResponse: async (interaction: types.Interaction) => {
            return APIWrapper.interactionResponse.delete(this.bot.user.id, interaction.token)
                .then(this.reformatResponse).catch(this.handleError);
        },

        sendFollowup: async (interaction: types.Interaction, message_data: types.MessageData) => {
            return APIWrapper.interactionFollowup.create(this.bot.user.id, interaction.token, message_data)
                .then(this.reformatResponse).catch(this.handleError);
        },
        editFollowup: async (interaction: types.Interaction, message_id: types.Snowflake, message_data: types.MessageData) => {
            return APIWrapper.interactionFollowup.edit(this.bot.user.id, interaction.token, message_id, message_data)
                .then(this.reformatResponse).catch(this.handleError);
        },
        deleteFollowup: async (interaction: types.Interaction, message_id: types.Snowflake) => {
            return APIWrapper.interactionFollowup.delete(this.bot.user.id, interaction.token, message_id)
                .then(this.reformatResponse).catch(this.handleError);
        }
    }
}