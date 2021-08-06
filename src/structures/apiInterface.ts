// this file sits between the client files and api wrapper and manages things like rate limits and errors.
import APIWrapper from './apiWrapper';
import Bot from './bot';
import * as types from './types';

export default class APIInterface {
    bot: Bot;
    user_id: types.Snowflake;

    constructor(bot: Bot) {
        this.bot = bot;
        this.user_id = bot.user.id;
    }

    handleError() {

    }

    async sendInteractionResponse(interaction: types.Interaction, interaction_response: types.InteractionResponse) {
        return APIWrapper.interactionResponse.create(interaction.id, interaction.token, interaction_response).catch(this.handleError);
    }

    async getInteractionResponse(interaction: types.Interaction) {
        return APIWrapper.interactionResponse.fetch(this.user_id, interaction.token).catch(this.handleError);
    }

    async editInteractionResponse(interaction: types.Interaction, message_data: types.MessageData) {
        return APIWrapper.interactionResponse.edit(this.user_id, interaction.token, message_data).catch(this.handleError);
    }

    async deleteInteractionResponse(interaction: types.Interaction) {
        return APIWrapper.interactionResponse.delete(this.user_id, interaction.token).catch(this.handleError);
    }

    async sendInteractionFollowup(interaction: types.Interaction, message_data: types.MessageData) {
        return APIWrapper.interactionFollowup.create(this.user_id, interaction.token, message_data).catch(this.handleError);
    }

    async editInteractionFollowup(interaction: types.Interaction, message_id: types.Snowflake, message_data: types.MessageData) {
        return APIWrapper.interactionFollowup.edit(this.user_id, interaction.token, message_id, message_data).catch(this.handleError);
    }

    async deleteInteractionFollowup(interaction: types.Interaction, message_id: types.Snowflake) {
        return APIWrapper.interactionFollowup.delete(this.user_id, interaction.token, message_id).catch(this.handleError);
    }
}