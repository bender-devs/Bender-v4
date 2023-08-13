// Where indexes should be created so that these fields can be quickly accessed.

import type { CreateIndexesOptions } from 'mongodb';
import type { GuildDotFormatKey } from '../types/dbTypes.js';

type ComplexIndex = {
    name: string;
    options: CreateIndexesOptions;
};

type CollectionName = 'premium' | 'user_settings' | 'user_reminders' | 'bot_status' | 'oauth_keys' | 'commands' | 'guild_commands'; // don't export, as this is missing bot_settings
type Indexes = Record<CollectionName, (string | ComplexIndex)[]> & {
    bot_settings: (GuildDotFormatKey | ComplexIndex)[];
};

const DB_INDEXES: Indexes = {
    bot_settings: [
        { name: 'guild', options: { unique: true } },
        // guildMemberAdd
        'minage',
        // autopurge checkup
        'autopurge',
        // postAllNews checkup
        'gamenews',
        // giveaways checkup
        'giveaways',
        // lockdowns checkup
        'lockdowns',
        // temproles checkup
        'temproles'
    ],
    commands: [
        { name: 'id', options: { unique: true } },
        { name: 'name', options: { unique: true } },
    ],
    guild_commands: [
        { name: 'guild_id', options: { unique: true } }
    ],
    premium: [
        { name: 'ppid', options: { unique: true } },
        'discord_id', // for ;pro & db.premium checks
        'guilds', // for db.premium checks
        'plan.valid_until' // for db.premium checks
    ],
    user_settings: [
        { name: 'user_id', options: { unique: true } },
        'usernames', // for guildMemberAdd, guildMemberUpdate, userUpdate
        'noNameHistory', // for guildMemberAdd, guildMemberUpdate, userUpdate
        'nsfw' // for nsfw commands
    ],
    user_reminders: [
        { name: 'user_id', options: { unique: true } },
        'reminders' // for checkups.reminders
    ],
    bot_status: [
        { name: 'shard_id', options: { unique: true } }
    ],
    oauth_keys: [
        { name: 'service_name', options: { unique: true } },
        { name: 'expireAt', options: { expireAfterSeconds: 0 } }
    ]
}

export default DB_INDEXES;