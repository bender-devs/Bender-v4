import { INTERACTION_RESPONSE_TIMEOUT } from '../data/constants';
import Bot from '../structures/bot';
import { Interaction, Snowflake } from '../types/types';
import TicTacToeUtils, { TicTacToeBoard } from './tictactoe';

export type PendingInteractionBase = {
    author: Snowflake,
    interaction: Interaction,
    expireTimeout?: NodeJS.Timeout
}
export interface TicTacToeInteraction extends PendingInteractionBase {
    target: Snowflake | null,
    board: TicTacToeBoard,
    targetTurn: boolean
}
export type PendingInteraction = TicTacToeInteraction;

export default class PendingInteractionUtils {
    bot: Bot;
    pendingInteractions: Record<Snowflake, PendingInteraction>;
    tttUtils: TicTacToeUtils;

    constructor(bot: Bot) {
        this.bot = bot;
        this.pendingInteractions = {};
        this.tttUtils = new TicTacToeUtils(bot);
    }

    addItem(interactionData: PendingInteraction) {
        const id = interactionData.interaction.id;
        if (!id) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Cannot handle interaction without id:', interactionData.interaction);
            return;
        }
        interactionData.expireTimeout = setTimeout(() => this.deleteItem(id), INTERACTION_RESPONSE_TIMEOUT);
        this.pendingInteractions[id] = interactionData;
    }

    deleteItem(id: Snowflake) {
        delete this.pendingInteractions[id];
    }

    async processInteraction(interaction: Interaction) {
        if (!interaction.message?.id) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Cannot handle interaction without message:', interaction);
            return;
        }
        if (!interaction.data?.custom_id) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Cannot handle interaction without custom ID:', interaction);
            return;
        }
        const idPieces = interaction.data.custom_id.split('_');
        const initialInteractionID = idPieces[1];
        if (!initialInteractionID) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Interaction has invalid custom ID:', interaction.data.custom_id);
            return;
        }
        const interactionData = this.pendingInteractions[initialInteractionID as Snowflake];
        if (!interactionData) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Interaction doesn\'t correspond to pending interaction object:', interaction, this.pendingInteractions);
            return;
        }
        if (idPieces[0] === 'ttt') {
            return this.tttUtils.processPlayerMove(interactionData, interaction);
        }
    }
}