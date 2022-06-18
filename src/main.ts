import 'dotenv/config';
import Bot from './structures/bot';
import { SHARDED, SHARD_COUNT, CONNECT_DATA, EXIT_CODE_NO_RESTART } from './data/constants';
import ShardManager from './structures/shardManager';
import { IdentifyData } from './types/gatewayTypes';
import LanguageUtils from './utils/language';

process.on('unhandledRejection', error => {
    console.error('Unhandled rejection before bot was spawned:', error);
});

const TOKEN = process.env[`TOKEN_${process.env.RUNTIME_MODE}`];

if (!TOKEN) {
    console.error('ERROR: No token provided.');
    process.exit(EXIT_CODE_NO_RESTART);
}

const connectionData: IdentifyData = Object.assign({}, CONNECT_DATA, { token: TOKEN });

if (process.env.SHARD_ID && process.env.SHARD_COUNT) {
    const id = parseInt(process.env.SHARD_ID);
    const count = parseInt(process.env.SHARD_COUNT);
    const bot = new Bot([id, count]);

    // TODO: call bot.init() first
    bot.connect(connectionData);
} else if (SHARDED) {
    const shardManager = new ShardManager(SHARD_COUNT);

    console.log('Starting Bender with mode: ' + process.env.RUNTIME_MODE);
    LanguageUtils.logLocalizationSupport(shardManager.logger);

    shardManager.spawnProcesses();
} else {
    const bot = new Bot();

    console.log('Starting Bender with mode: ' + process.env.RUNTIME_MODE);
    LanguageUtils.logLocalizationSupport(bot.logger);

    // TODO: call bot.init() first
    bot.connect(connectionData);
}