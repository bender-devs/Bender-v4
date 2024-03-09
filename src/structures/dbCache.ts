import type { ObjectId } from 'mongodb';
import type {
    GuildKey,
    GuildSettings,
    PremiumData,
    Reminder,
    UserReminders,
    UserSettings,
} from '../types/dbTypes.js';
import type { Snowflake } from '../types/types.js';

type WrappedSettings<T> = {
    id: ObjectId;
    data: T;
};
type WrappedSettingsMap<T> = Record<Snowflake, WrappedSettings<T>>;

type GuildSettingsMap = WrappedSettingsMap<GuildSettings>;
type UserSettingsMap = WrappedSettingsMap<UserSettings>;
type UserRemindersMap = WrappedSettingsMap<Reminder[]>;
type PremiumDataMap = Record<string, WrappedSettings<PremiumData>>;

export default class DatabaseCacheHandler {
    #guildSettings: GuildSettingsMap;
    #userSettings: UserSettingsMap;
    #userReminders: UserRemindersMap;
    #premiumData: PremiumDataMap;

    constructor() {
        this.#guildSettings = {};
        this.#userSettings = {};
        this.#userReminders = {};
        this.#premiumData = {};
    }

    guilds = {
        get: (guildID: Snowflake) => {
            return this.#guildSettings[guildID]?.data || null;
        },

        set: (guildID: Snowflake, dbID: ObjectId, guildSettings: GuildSettings) => {
            this.#guildSettings[guildID] = {
                id: dbID,
                data: guildSettings,
            };
        },

        update: (guildID: Snowflake, updatedFields?: Partial<GuildSettings>, removedFields?: string[]) => {
            if (!this.#guildSettings[guildID]) {
                return;
            }
            if (updatedFields) {
                Object.assign(this.#guildSettings[guildID].data, updatedFields);
            }
            if (removedFields) {
                const removedGuildFields = removedFields as GuildKey[];
                for (const key of removedGuildFields) {
                    delete this.#guildSettings[guildID].data[key];
                }
            }
        },

        delete: (guildID: Snowflake) => {
            delete this.#guildSettings[guildID];
        },

        getIDFromObjectId: (id: ObjectId) => {
            let guildID: Snowflake;
            for (guildID in this.#guildSettings) {
                if (this.#guildSettings[guildID].id === id) {
                    return guildID;
                }
            }
            return null;
        },

        deleteByObjectId: (id: ObjectId) => {
            const guildID = this.guilds.getIDFromObjectId(id);
            if (guildID) {
                delete this.#guildSettings[guildID];
            }
        },
    };

    userSettings = {
        get: (userID: Snowflake) => {
            return this.#userSettings[userID]?.data || null;
        },

        set: (userID: Snowflake, dbID: ObjectId, userSettings: UserSettings) => {
            this.#userSettings[userID] = {
                id: dbID,
                data: userSettings,
            };
        },

        update: (userID: Snowflake, updatedFields?: Partial<UserSettings>, removedFields?: string[]) => {
            if (!this.#userSettings[userID]) {
                return;
            }
            if (updatedFields) {
                Object.assign(this.#userSettings[userID].data, updatedFields);
            }
            if (removedFields) {
                const removedUserFields = removedFields as (keyof UserSettings)[];
                for (const key of removedUserFields) {
                    delete this.#userSettings[userID].data[key];
                }
            }
        },

        delete: (userID: Snowflake) => {
            delete this.#userSettings[userID];
        },

        getIDFromObjectId: (id: ObjectId) => {
            let userID: Snowflake;
            for (userID in this.#userSettings) {
                if (this.#userSettings[userID].id === id) {
                    return userID;
                }
            }
            return null;
        },

        deleteByObjectId: (id: ObjectId) => {
            const userID = this.userSettings.getIDFromObjectId(id);
            if (userID) {
                delete this.#userSettings[userID];
            }
        },
    };

    userReminders = {
        get: (userID: Snowflake) => {
            return this.#userReminders[userID]?.data || null;
        },

        findByMessage: (userID: Snowflake, messageID: Snowflake) => {
            const reminders = this.userReminders.get(userID);
            return reminders?.find((r) => r.message === messageID) || null;
        },

        set: (userID: Snowflake, dbID: ObjectId, reminders: Reminder[]) => {
            this.#userReminders[userID] = {
                id: dbID,
                data: reminders,
            };
        },

        update: (userID: Snowflake, updatedFields?: Partial<UserReminders>, removedFields?: string[]) => {
            if (!this.#userReminders[userID]) {
                return;
            }
            if (updatedFields?.reminders) {
                this.#userReminders[userID].data = updatedFields.reminders;
            }
            if (removedFields?.includes('reminders')) {
                return this.userReminders.delete(userID);
            }
        },

        delete: (userID: Snowflake) => {
            delete this.#userReminders[userID];
        },

        getIDFromObjectId: (id: ObjectId) => {
            let userID: Snowflake;
            for (userID in this.#userReminders) {
                if (this.#userReminders[userID].id === id) {
                    return userID;
                }
            }
            return null;
        },

        deleteByObjectId: (id: ObjectId) => {
            const userID = this.userReminders.getIDFromObjectId(id);
            if (userID) {
                delete this.#userReminders[userID];
            }
        },
    };

    premium = {
        get: (ppid: string) => {
            return this.#premiumData[ppid]?.data || null;
        },

        set: (ppid: string, dbID: ObjectId, premiumData: PremiumData) => {
            this.#premiumData[ppid] = {
                id: dbID,
                data: premiumData,
            };
        },

        update: (ppid: string, updatedFields?: Partial<PremiumData>, removedFields?: string[]) => {
            if (!this.#premiumData[ppid]) {
                return;
            }
            if (updatedFields) {
                Object.assign(this.#premiumData[ppid].data, updatedFields);
            }
            if (removedFields) {
                const removedPremiumFields = removedFields as (keyof PremiumData)[];
                for (const key of removedPremiumFields) {
                    delete this.#premiumData[ppid].data[key];
                }
            }
        },

        delete: (ppid: string) => {
            delete this.#premiumData[ppid];
        },

        getPPIDFromObjectId: (id: ObjectId) => {
            for (const ppid in this.#premiumData) {
                if (this.#premiumData[ppid].id === id) {
                    return ppid;
                }
            }
            return null;
        },

        deleteByObjectId: (id: ObjectId) => {
            const ppid = this.premium.getPPIDFromObjectId(id);
            if (ppid) {
                delete this.#premiumData[ppid];
            }
        },
    };
}
