import Bot from '../structures/bot';
import { BUTTON_STYLES, INTERACTION_CALLBACK_FLAGS, INTERACTION_CALLBACK_TYPES, MESSAGE_COMPONENT_TYPES } from '../types/numberTypes';
import { Interaction, MessageComponent, Snowflake } from '../types/types';
import { TicTacToeInteraction } from './pendingInteractions';
import LangUtils from './language';
import TextUtils from './text';

type Cell = 0 | 1 | 2; // 0 = empty, 1 = player 1, 2 = player 2 (bot or user chosen by player 1)
export type TicTacToeBoard = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

export default class TicTacToeUtils {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    static getComponents(board: TicTacToeBoard, id: Snowflake, win = false): MessageComponent[] {
        return [{
            type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
            components: [0, 1, 2].map(num => TicTacToeUtils.getComponent(num, board[num], id, win))
        }, {
            type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
            components: [3, 4, 5].map(num => TicTacToeUtils.getComponent(num, board[num], id, win))
        }, {
            type: MESSAGE_COMPONENT_TYPES.ACTION_ROW,
            components: [6, 7, 8].map(num => TicTacToeUtils.getComponent(num, board[num], id, win))
        }];
    }

    static getComponent(index: number, value: Cell, id: Snowflake, win = false): MessageComponent {
        return {
            type: MESSAGE_COMPONENT_TYPES.BUTTON,
            custom_id: `ttt_${id}_${index}`,
            style: BUTTON_STYLES.SECONDARY,
            emoji: { name: TicTacToeUtils.getCellEmoji(index, value), id: null },
            disabled: win || (value > 0)
        };
    }

    static getCellEmoji(index: number, value: Cell): string {
        if (!value) {
            return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'][index];
        } else if (value === 1) {
            return '❌';
        }
        return '⭕';
    }

    static checkForWin(board: TicTacToeBoard, score = false): number {
        if (
            (board[0] === board[1] && board[1] === board[2]) || // horizontal - left
            (board[0] === board[3] && board[3] === board[6])    //  vertical  - top
        ) {
            return score ? (board[0] === 2 ? 10 : -10) : board[0];
        }
        if (
            (board[3] === board[4] && board[4] === board[5]) || // horizontal - center
            (board[1] === board[4] && board[4] === board[7]) || //  vertical  - center
            (board[0] === board[4] && board[4] === board[8]) || //  diagonal  - top left
            (board[2] === board[4] && board[4] === board[6])    //  diagonal  - top right
        ) {
            return score ? (board[4] === 2 ? 10 : -10) : board[4];
        }
        if (
            (board[6] === board[7] && board[7] === board[8]) || // horizontal - bottom
            (board[2] === board[5] && board[5] === board[8])    //  vertical  - right
        ) {
            return score ? (board[8] === 2 ? 10 : -10) : board[8];
        }
        return 0;
    }
 
    // modified from demo code on https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-3-tic-tac-toe-ai-finding-optimal-move/
    static emptySpacesExist(board: TicTacToeBoard) {
        for (let i = 0; i < board.length; i++) {
            if (board[i] === 0) {
                return true;
            }
        }
        return false;
    }

    static minimax(board: TicTacToeBoard, isMax = false) {
        // if either maximizer or minimizer won, return that score
        const score = this.checkForWin(board, true);
        if (score == 10) {
            return score;
        }
        if (score == -10) {
            return score;
        }

        if (!this.emptySpacesExist(board)) {
            return 0;
        }

        if (isMax) { // it's the computer's move
            let best = -1000;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === 0) {
                    // check value of move, then undo
                    board[i] = 2;
                    best = Math.max(best, this.minimax(board, !isMax));
                    board[i] = 0;
                }
            }
            return best;
        } else { // guessing the player's move
            let best = 1000;
      
            for (let i = 0; i < board.length; i++) {
                if (board[i] === 0) {
                    // check value of move, then undo
                    board[i] = 1;
                    best = Math.min(best, this.minimax(board, !isMax));
                    board[i] = 0;
                }
            }
            return best;
        }
    }
    static findBestMove(board: TicTacToeBoard) {
        let bestVal = -1000;
        let bestMove = -1;

        for (let i = 0; i < board.length; i++) {
            if (board[i] == 0) {
                // check value of move, then undo
                board[i] = 2;
                const moveVal = this.minimax(board, false);
                board[i] = 0;

                if (moveVal > bestVal) {
                    bestMove = i;
                    bestVal = moveVal;
                }
            }
        }
        return bestMove;
    }

    checkWinAndReply(interactionData: TicTacToeInteraction, newInteraction: Interaction, author: Snowflake) {
        const win = TicTacToeUtils.checkForWin(interactionData.board);
        if (win === 1) {
            let winText = LangUtils.get('FUN_TTT_RESULT_USER', newInteraction.locale);
            if (interactionData.target) {
                winText = LangUtils.getAndReplace('FUN_TTT_RESULT', {
                    user: TextUtils.mention.parseUser(author)
                }, newInteraction.locale);
            }
            winText = `${this.bot.utils.getEmoji('TIC_TAC_TOE', newInteraction)} ${winText}`;
            return this.bot.api.interaction.editResponse(interactionData.interaction, {
                content: winText,
                components: TicTacToeUtils.getComponents(interactionData.board, interactionData.interaction.id, true)
            });
        } else if (win === 2) {
            let winText = LangUtils.get('FUN_TTT_RESULT_BOT', newInteraction.locale);
            if (interactionData.target) {
                winText = LangUtils.getAndReplace('FUN_TTT_RESULT', {
                    user: TextUtils.mention.parseUser(interactionData.target)
                }, newInteraction.locale);
            }
            winText = `${this.bot.utils.getEmoji('TIC_TAC_TOE', newInteraction)} ${winText}`;
            return this.bot.api.interaction.editResponse(interactionData.interaction, {
                content: winText,
                components: TicTacToeUtils.getComponents(interactionData.board, interactionData.interaction.id, true)
            });
        }
        const playable = TicTacToeUtils.emptySpacesExist(interactionData.board);
        if (!playable) {
            const tieText = `${this.bot.utils.getEmoji('TIC_TAC_TOE', newInteraction)} ${LangUtils.get('FUN_TTT_RESULT_TIE', newInteraction.locale)}`;
            return this.bot.api.interaction.editResponse(interactionData.interaction, {
                content: tieText,
                components: TicTacToeUtils.getComponents(interactionData.board, interactionData.interaction.id, true)
            });
        }
        return null;
    }

    async processPlayerMove(interactionData: TicTacToeInteraction, newInteraction: Interaction) {
        const author = newInteraction.member?.user.id || newInteraction.user?.id;
        if (!author) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Tic-tac-toe interaction has no author:', newInteraction);
            return;
        }
        if (author !== interactionData.author && author !== interactionData.target) {
            const failResponse = LangUtils.get('FUN_TTT_INTERACTION_UNINVITED', newInteraction.locale);
            return this.bot.api.interaction.sendResponse(newInteraction, {
                type: INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: failResponse,
                    flags: INTERACTION_CALLBACK_FLAGS.EPHEMERAL
                }
            });
        }
        if (
            (interactionData.targetTurn && author !== interactionData.target) ||
            (!interactionData.targetTurn && author !== interactionData.author)
        ) {
            const failResponse = LangUtils.get('FUN_TTT_OUT_OF_TURN', newInteraction.locale);
            return this.bot.api.interaction.sendResponse(newInteraction, {
                type: INTERACTION_CALLBACK_TYPES.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: failResponse,
                    flags: INTERACTION_CALLBACK_FLAGS.EPHEMERAL
                }
            });
        }
        if (!newInteraction.data?.custom_id) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Tic-tac-toe interaction is missing custom ID:', newInteraction);
            return;
        }
        const cellID = parseInt(newInteraction.data.custom_id.split('_')[2]);
        if (typeof cellID !== 'number' || isNaN(cellID)) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Tic-tac-toe interaction has an invalid custom ID:', newInteraction);
            return;
        }
        if (interactionData.board[cellID]) {
            this.bot.logger.debug('PENDING INTERACTIONS', 'Tic-tac-toe interaction was called for a filled cell:', interactionData);
            return;
        }
        interactionData.board[cellID] = author === interactionData.target ? 2 : 1;

        // ACK the current interaction
        await this.bot.api.interaction.sendResponse(newInteraction, { type: INTERACTION_CALLBACK_TYPES.DEFERRED_UPDATE_MESSAGE }).catch(err => {
            this.bot.logger.handleError('PENDING INTERACTIONS', err, 'Failed to ack interaction');
        });

        const id = interactionData.interaction.id;

        let winResult = this.checkWinAndReply(interactionData, newInteraction, author);
        if (winResult) {
            this.bot.interactionUtils.deleteItem(id);
            return winResult;
        }

        if (!interactionData.target) {
            // bot's move
            const index = TicTacToeUtils.findBestMove(interactionData.board);
            interactionData.board[index] = 2;

            winResult = this.checkWinAndReply(interactionData, newInteraction, author);
            if (winResult) {
                this.bot.interactionUtils.deleteItem(id);
                return winResult;
            }
        } else {
            interactionData.targetTurn = !interactionData.targetTurn;
        }

        let turnText = LangUtils.get('FUN_TTT_TURN_USER', newInteraction.locale);
        if (interactionData.target) {
            turnText = LangUtils.getAndReplace('FUN_TTT_TURN', {
                user: TextUtils.mention.parseUser(interactionData.targetTurn ? interactionData.target : interactionData.author)
            }, newInteraction.locale);
        }
        turnText = `${this.bot.utils.getEmoji('TIC_TAC_TOE', newInteraction)} ${turnText}`;

        return this.bot.api.interaction.editResponse(interactionData.interaction, {
            content: turnText,
            components: TicTacToeUtils.getComponents(interactionData.board, id)
        });
    }
}