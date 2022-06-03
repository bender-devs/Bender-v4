import Bot from './bot';
import * as types from '../data/types';

export default interface Command extends types.CommandCreateData {
    bot: Bot;
    dm_permission: boolean;

    run(interaction: types.Interaction): types.CommandResponse;
    runText(msg: types.Message, argString: string): types.CommandResponse;
}