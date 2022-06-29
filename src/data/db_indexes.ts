// Where indexes should be created so that these fields can be quickly accessed.

import { CreateIndexesOptions } from 'mongodb';

type ComplexIndex = {
    name: string;
    options: CreateIndexesOptions;
};

type Indexes = Record<'bot_settings' | 'premium' | 'user_settings' | 'user_reminders' | 'bot_status' | 'oauth_keys' | 'commands' | 'guild_commands', (string | ComplexIndex)[]>;

const DB_INDEXES: Indexes = {
    bot_settings: [
        { name: 'guild', options: { unique: true } },
        'agreement.channel', // for message, guildMemberAdd, checkups.agreement
        'agreement.emoji', // for message, messageReactionAdd
        'agreement.emojiMsg', // for message, messageReactionAdd
        'agreement.enabled', // for message, guildMemberAdd, checkups.agreement, modLog
        'agreement.kick', // for message
        'agreement.message', // for message, guildMemberAdd, checkups.agreement
        'agreement.noLogs', // for modLog
        'agreement.preMsg', // for message
        'agreement.postMsg', // for message, messageReactionAdd
        'agreement.role', // for message, guildMemberAdd, checkups.agreement
        'agreement.wait', // for message, messageReactionAdd
        'agreement.warn', // for message
        'aliases', // for message
        'automod', // for message, automod
        'automod.minAge', // for guildMemberAdd
        'automod.minAgeAction', // for guildMemberAdd
        'autopurge', // for checkups.autopurge
        'autorole', // for guildMemberAdd, agreement, messageReactionAdd
        'blacklist', // for message
        'config.replyDM', // for message
        'config.permMsgs', // for message
        'cperms', // for hasPermission
        'customcommands', // for message
        'filter.enabled', // for message, automod
        'filter.patterns', // for message, automod
        'filter.flags', // for message, automod
        'filter.message', // for message, automod
        'filter.action1', // for message, automod
        'filter.action2', // for message, automod
        'filter.action3', // for message, automod
        'filter.msgTimeout', // for message, automod
        'gamenews', // for postAllNews
        'giveaways', // for checkups.giveaways
        'gperms', // for hasPermission
        'ignore', // for message, automod
        'lockdowns', // for checkups.lockdowns
        'logging.edited', // for message
        'logging.channel', // for message
        'logging.customCommands', // for message
        'logging.deleted', // for messageDelete
        'memberLog.join-dm', // for guildMemberAdd
        'memberLog.join', // for guildMemberAdd
        'memberLog.channel', // for guildMemberAdd, guildMemberRemove
        'mentionables', // for message
        'mutes', // for guildMemberAdd, checkups.mutes
        'mutes.default', // for modLog, ;mute
        'mutes.role', // for message, ;mute
        'namefilter', // for guildMemberAdd, guildMemberUpdate, userUpdate
        'nicknames', // for guildMemberUpdate, userUpdate
        'perms', // for hasPermission
        'prefix', // for message
        'reactionRoles', // for messageReactionAdd, messageReactionRemove
        'starboard', // for messageReactionAdd
        'tags', // for message
        'temproles', // for guildMemberAdd, checkups.temproles
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