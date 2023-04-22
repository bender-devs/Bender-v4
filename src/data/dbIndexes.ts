// Where indexes should be created so that these fields can be quickly accessed.

import { CreateIndexesOptions } from 'mongodb';
import { GuildDotFormatKey } from '../types/dbTypes.js';

type ComplexIndex = {
    name: string;
    options: CreateIndexesOptions;
};

type Indexes = Record<'premium' | 'user_settings' | 'user_reminders' | 'bot_status' | 'oauth_keys' | 'commands' | 'guild_commands', (string | ComplexIndex)[]> & {
    bot_settings: (GuildDotFormatKey | ComplexIndex)[];
};

const DB_INDEXES: Indexes = {
    bot_settings: [
        { name: 'guild', options: { unique: true } },
        // agreement checkup
        'agreement.channel',
        'agreement.enabled',
        'agreement.message',
        'agreement.role',
        'agreement.warn',
        'agreement.kick',
        // guildMemberAdd
        'automod.minAge',
        'automod.minAgeAction',
        // autopurge checkup
        'autopurge',
        // postAllNews checkup
        'gamenews',
        // giveaways checkup
        'giveaways',
        // lockdowns checkup
        'lockdowns',
        // mutes checkup
        'mutes',
        // temproles checkup
        'temproles',
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