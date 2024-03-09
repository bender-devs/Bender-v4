import 'dotenv/config';
import { CONNECT_DATA, EXIT_CODE_NO_RESTART, SHARDED, SHARD_COUNT } from './data/constants.js';
import Bot from './structures/bot.js';
import ShardManager from './structures/shardManager.js';
import type { IdentifyData } from './types/gatewayTypes.js';
import LanguageUtils from './utils/language.js';

process.on('unhandledRejection', (error) => {
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
    const flushCache = !!process.env.FLUSH_CACHE;
    delete process.env.FLUSH_CACHE;

    bot.init(flushCache).then(() => {
        bot.connect(connectionData);
    });
} else if (SHARDED) {
    const shardManager = new ShardManager(SHARD_COUNT);

    console.log(`Starting Bender with mode: ${process.env.RUNTIME_MODE}`);
    LanguageUtils.logLocalizationSupport(shardManager.logger);

    shardManager.spawnProcesses();
} else {
    const bot = new Bot();

    console.log(`Starting Bender with mode: ${process.env.RUNTIME_MODE}`);
    LanguageUtils.logLocalizationSupport(bot.logger);

    bot.init(true).then(() => {
        bot.connect(connectionData);
    });
}
