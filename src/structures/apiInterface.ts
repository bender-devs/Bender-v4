// this file sits between the client files and api wrapper and manages things like rate limits and errors.
import APIWrapper from '../utils/apiWrapper';
import Bot from './bot';
import * as types from '../data/types';

export default class APIInterface {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    handleError(error: types.ResponseError) {
        if (error.status === 429) {

        }
        // TODO: finish this
        return error;
    }

    async sendMessage(channel_id: types.Snowflake, message_data: types.MessageData) {
        // TODO: apply default options (i.e. allowed_mentions)
        return APIWrapper.message.create(channel_id, message_data);
    }

    async dmUser(user_id: types.Snowflake, message_data: types.MessageData) {
        // TODO: check channel cache for DM with this user
        // if not create it as below
        await APIWrapper.user.createDM(user_id)
        // TODO: handle the error or collect the channel ID above
        const channelID: types.Snowflake = '00000000000000000000';
        return APIWrapper.message.create(channelID, message_data).catch(this.handleError);
    }

    async sendInteractionResponse(interaction: types.Interaction, interaction_response: types.InteractionResponse) {
        return APIWrapper.interactionResponse.create(interaction.id, interaction.token, interaction_response).catch(this.handleError);
    }

    async getInteractionResponse(interaction: types.Interaction) {
        return APIWrapper.interactionResponse.fetch(this.bot.user.id, interaction.token).catch(this.handleError);
    }

    async editInteractionResponse(interaction: types.Interaction, message_data: types.MessageData) {
        return APIWrapper.interactionResponse.edit(this.bot.user.id, interaction.token, message_data).catch(this.handleError);
    }

    async deleteInteractionResponse(interaction: types.Interaction) {
        return APIWrapper.interactionResponse.delete(this.bot.user.id, interaction.token).catch(this.handleError);
    }

    async sendInteractionFollowup(interaction: types.Interaction, message_data: types.MessageData) {
        return APIWrapper.interactionFollowup.create(this.bot.user.id, interaction.token, message_data).catch(this.handleError);
    }

    async editInteractionFollowup(interaction: types.Interaction, message_id: types.Snowflake, message_data: types.MessageData) {
        return APIWrapper.interactionFollowup.edit(this.bot.user.id, interaction.token, message_id, message_data).catch(this.handleError);
    }

    async deleteInteractionFollowup(interaction: types.Interaction, message_id: types.Snowflake) {
        return APIWrapper.interactionFollowup.delete(this.bot.user.id, interaction.token, message_id).catch(this.handleError);
    }
}