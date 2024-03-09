import type { CLIENT_STATE } from './numberTypes.js';
import type { Command, CommandCreateData, Snowflake, UnixTimestampMillis } from './types.js';

export type DatabaseResult = {
    changes: number;
    edits: number;
    insertions: number;
    deletions: number;
};

/*** modlog (cases) ***/

export type ModlogEntry = {
    id: number | `${number}`;
    action: ModlogAction;
    logMsg: Snowflake;
    logChan: Snowflake;
    moderator: Snowflake;
    target: Snowflake;
    timestamp: UnixTimestampMillis;
    extras?: ModlogExtras;
};

export type ModlogAction = `cmd-${
    | 'mute'
    | 'remute'
    | 'unmute'
    | 'ban'
    | 'tempban'
    | 'softban'
    | 'unban'
    | 'purge'
    | 'role'
    | 'clonerole'
    | 'warn'
    | 'kick'
    | 'lock'
    | 'unlock'}`;

export type ModlogExtras = {
    reason?: string;
    invalid?: boolean;
    dbFailure?: boolean;
    time?: number; // duration in ms
    updatedBy?: Snowflake;
    role?: Snowflake;
    notMember?: boolean;
};

export type ModlogFilter = {
    by?: Snowflake;
    for?: Snowflake;
    type?: ModlogAction;
    valid?: boolean;
};

/*** user settings ***/

export type UserSettings = {
    user_id: Snowflake;
    [key: string]: unknown;
};

/*** user reminders ***/

export type UserReminders = {
    user_id: Snowflake;
    reminders: Reminder[];
};

export type Reminder = {
    text: string;
    message: Snowflake;
    guild: Snowflake | null;
    setAt: UnixTimestampMillis;
    endsAt: UnixTimestampMillis;
};

/*** premium ***/

export type PremiumData = {
    ppid: string | Snowflake;
    discord_id?: Snowflake;
    plan?: PremiumPlan;
    guilds?: Snowflake[];
    txn_id?: string; // transaction ID
    txn_timestamp?: UnixTimestampMillis; // transaction timestamp
    payer_name?: string;
    payer_email?: string;
};
export type PremiumPlan = {
    is_active: boolean;
    is_yearly: boolean;
    num_guilds: number;
    amount: number; // the payment amount
    currency: string; // the payment currency
    valid_until: UnixTimestampMillis;
};

/*** commands ***/

export const COMPARE_COMMANDS_KEYS: (keyof CommandCreateData)[] = [
    'name',
    'name_localizations',
    'description',
    'description_localizations',
    'options',
    'default_member_permissions',
    'dm_permission',
    'type',
];

export type SavedCommand = Command & {
    application_id: never;
    version: never;
    bot: never;
};

// add metadata to global commands to see which are most popular
export type GlobalCommand = SavedCommand & {
    total_uses?: number;
};

// don't add this data to guild commands to preserve privacy
export type GuildCommand = SavedCommand;

export type GuildCommands = {
    [id: Snowflake]: GuildCommand;
};

export type GuildCommandsData = {
    guild_id: Snowflake;
    commands: GuildCommands;
};

// TODO: add "unsupported locales" counter per locale

/*** shard status ***/

export type ShardData = {
    shard_id: number;
    status: CLIENT_STATE;
    ping: number;
    roundtrip: number;
    lastUpdated: UnixTimestampMillis;
    guilds: number;
    guildsAvailable: number;
};

export type ShardOverallData =
    | {
          shard_id: 'OVERALL';
          sharded: true;
          shardCount: number;
          totalGuilds: number;
          totalUsers: number;
      }
    | {
          shard_id: 'OVERALL';
          sharded: false;
          status: CLIENT_STATE;
          ping: number;
          roundtrip: number;
          lastUpdated: UnixTimestampMillis;
          guilds: number;
          guildsAvailable: number;
          totalGuilds: number;
          totalUsers: number;
      };

/*** oauth keys ***/

export type OAuthServices = 'spotify';

/*** guild settings ***/

export type GuildSettingsMap = Record<Snowflake, GuildSettings>;

export type GuildTopLevelValue = GuildSettings[GuildKey];

type ObjectLevel1 = Record<string, unknown>;
type ObjectLevel2 = Record<string, ObjectLevel1>;
type NonObject = string | boolean | number | null | Array<unknown>;

// turbo nerd mode activated
type ObjectTypes<KeyMap extends ObjectLevel1> = {
    [Key in keyof KeyMap as KeyMap[Key] extends NonObject ? never : Key]: Key extends string
        ? KeyMap[Key] extends never
            ? never
            : KeyMap[Key]
        : never;
};

// tags and customcommands are indexed by any string; omit them to keep subkey typing
type GuildObjectTypes = ObjectTypes<Required<Omit<GuildSettings, 'tags' | 'customcommands'>>>;

type Subkeys<KeyMap extends ObjectLevel1> = {
    [Key in keyof KeyMap]: Key extends string
        ? KeyMap[Key] extends NonObject
            ? never
            : keyof KeyMap[Key]
        : never;
}[keyof KeyMap];

type SubkeysNested<KeyMap extends ObjectLevel2> = {
    [Key in keyof KeyMap]: Key extends string
        ? KeyMap[Key] extends NonObject
            ? never
            : Subkeys<Required<KeyMap[Key]>>
        : never;
}[keyof KeyMap];

type DotFormat<Key extends string, SubkeyMap extends ObjectLevel1> = keyof SubkeyMap extends string
    ? `${Key}.${keyof SubkeyMap}`
    : never;

type DotFormatKeys<KeyMap extends ObjectLevel2> = {
    [Key in keyof KeyMap]: Key extends string ? DotFormat<Key, KeyMap[Key]> : never;
}[keyof KeyMap];

type DotFormatKeysNested<KeyMap extends ObjectLevel2> = {
    [Key in keyof KeyMap]: Key extends string
        ? KeyMap[Key] extends ObjectLevel2
            ? `${Key}.${DotFormatKeys<KeyMap[Key]>}`
            : never
        : never;
}[keyof KeyMap];

export type GuildKey = keyof GuildSettings;
export type GuildSubkey = Subkeys<GuildObjectTypes>;
export type GuildSubSubkey = SubkeysNested<GuildObjectTypes>;

export type GuildDotFormatKey = GuildKey | DotFormatKeys<GuildObjectTypes> | DotFormatKeysNested<GuildObjectTypes>;

export const ALL_GUILD_KEYS: GuildKey[] = [
    'autorole',
    'config',
    'customcommands',
    'joinables',
    'logging',
    'memberLog',
    'minage',
    'reactionRoles',
    'starboard',
    'temproles',
];

// technically MongoDB would also support exclusive queries ({key: 0})
// but this ensures the amount of data returned is limited
export interface ProjectionObject extends Partial<Record<GuildDotFormatKey, 1>> {
    _id?: 0;
}

export type GuildSettings = {
    guild: Snowflake;
    antiadv?: AntiAdvertising;
    autopurge?: Autopurge;
    autorole?: Autorole;
    config?: Config;
    customcommands?: CustomCommands;
    gamenews?: GameNewsEntry[];
    giveaways?: Giveaways;
    joinables?: Joinables;
    lockdowns?: Lockdowns;
    logging?: Logging;
    memberLog?: MemberLog;
    mentionables?: Mentionables;
    minage?: MinAge;
    modlog?: ModlogEntry[];
    nicknames?: Nicknames;
    reactionRoles?: ReactionRoles;
    starboard?: Starboard;
    temproles?: TempRoles;
};

type AntiAdvertising = {
    noInvites?: boolean;
    noLinks?: boolean;
    action?: 'kick' | 'ban';
};

type Autopurge = {
    enabled?: boolean;
    channels?: Snowflake[];
    deletePinned?: boolean;
};

type Autorole = Snowflake | Snowflake[] | null;

type Config = {
    confirmBans?: boolean;
    maxWarnings?: number;
};

type CustomCommands = Record<string, CustomCommand>;
type CustomCommand = {
    actions: CustomCommandAction[];
    enabled: boolean;
    name: string;
    type: 'command' | 'responder';
    whitelist?: Snowflake[];
    blacklist?: Snowflake[];
};
type CustomCommandAction = {
    cmd: string; // TODO: replace with list of possible commands
    args: string;
};

type GameNewsEntry = {
    channel: Snowflake;
    game_id: string;
    timestamp?: UnixTimestampMillis;
};

type Giveaways = {
    [messageID: Snowflake]: Giveaway;
};
type Giveaway = {
    timestamp: UnixTimestampMillis;
    prize: string;
    winners: number;
    creator: Snowflake;
    channel: Snowflake;
    nextUpdate: UnixTimestampMillis;
};

type Joinables = {
    [roleID: Snowflake]: 'J' | 'L' | boolean;
};

type Lockdowns = {
    default?: number; // default lock duration
    [channelID: Snowflake]: Lockdown;
};
type Lockdown = {
    timestamp: UnixTimestampMillis;
    issuer: Snowflake;
    reason: string;
    message: Snowflake;
};

type LoggingSettingMessageBased = 'Deleted' | 'Edited' | 'Commands' | 'Automod' | 'CustomCommands';
type LoggingSettingChannel = LoggingSettingMessageBased | 'welcome' | 'accChanges';
type Logging = Partial<
    Record<ModlogAction, boolean> &
        Record<LoggingSettingChannel, Snowflake | boolean> &
        Record<`exclude${LoggingSettingMessageBased}`, Snowflake[]>
> & {
    channel?: Snowflake | null;
    cases?: boolean;
};

type MemberLog = {
    channel?: Snowflake | null;
    join?: string | null;
    leave?: string | null;
    ban?: string | null;
    joinDM?: string | null;
    banDM?: string | null;
    kickDM?: string | null;
};

type Mentionables = {
    [roleID: Snowflake]: MentionableCount | MentionableTime;
};
type MentionableBase = {
    id: Snowflake;
    mentionable: boolean;
};
type MentionableCount = MentionableBase & {
    type: 'count';
    count: number;
    usedCount?: number;
};
type MentionableTime = MentionableBase & {
    type: 'time';
    timestamp: UnixTimestampMillis;
};

export const MINAGE_ACTIONS = ['kick', 'ban'] as const;
export type MinAgeAction = (typeof MINAGE_ACTIONS)[number];
type MinAge = {
    duration?: number;
    enabled?: boolean;
    action?: MinAgeAction;
    message?: string;
};

type Nicknames = {
    [userID: Snowflake]: string[];
};

type ReactionRoles = {
    [roleID: Snowflake]: ReactionRoleEntry;
};
type ReactionRoleEntry = {
    channel: Snowflake;
    title: string;
    type: 'basic'; // more types planned
    roles: ReactionRole;
};
type ReactionRole = {
    id: Snowflake;
    name: string;
    emoji_name: string;
    emoji_id: Snowflake | null;
    emoji_anim: boolean;
};

type Starboard = {
    enabled?: boolean;
    channel?: Snowflake | null;
    emoji?: string; // snowflake or unicode emoji
    count?: number;
    blacklist?: Snowflake[];
    messages?: Record<Snowflake, Snowflake>; // map user message id => starboard message id
};

type TempRoles = {
    [roleID: Snowflake]: {
        [userID: Snowflake]: TempRoleEntry;
    };
};
type TempRoleEntry = {
    timestamp: 'forever' | UnixTimestampMillis;
    issuer: Snowflake;
    startTime: UnixTimestampMillis;
};
