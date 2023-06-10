import * as mongodb from 'mongodb';
import { DB_RECONNECT_DELAY, EXIT_CODE_NO_RESTART, ID_REGEX_EXACT } from '../data/constants.js';
import DB_INDEXES from '../data/dbIndexes.js';
import * as dbTypes from '../types/dbTypes.js';
import { Command, CommandCreateData, Snowflake, UnixTimestampMillis } from '../types/types.js';
import Bot from './bot.js';
import { ICommand } from './command.js';
import DatabaseCacheHandler from './dbCache.js';

const WATCHER_OPTIONS = { maxAwaitTimeMS: 5000, batchSize: 69 };

export default class DatabaseManager {
    bot: Bot;
    cacheEnabled = true;
    cache: DatabaseCacheHandler;
    client!: mongodb.MongoClient;
    bender!: mongodb.Db;
    connected = false;
    ping = -1;
    #startTimestamp: UnixTimestampMillis = 0;
    #heartbeatTimestamp: UnixTimestampMillis = 0;

    #guildSettingsWatcher?: mongodb.ChangeStream;
    #userSettingsWatcher?: mongodb.ChangeStream;
    #userRemindersWatcher?: mongodb.ChangeStream;
    #premiumWatcher?: mongodb.ChangeStream;

    constructor(bot: Bot) {
        this.bot = bot;
        this.cache = new DatabaseCacheHandler();
    }

    /****************** Initialization functions *******************/
    /***************************************************************/

    async connect(autoInit = true) {
        if (!process.env.MONGODB_HOST || !process.env.MONGODB_PORT) {
            this.bot.logger.handleError('DATABASE ERROR', 'No database connection info provided.')
            process.exit(EXIT_CODE_NO_RESTART);
        }
        if (!process.env.MONGODB_USER || !process.env.MONGODB_PASS) {
            this.bot.logger.handleError('DATABASE ERROR', 'No database credentials provided.')
            process.exit(EXIT_CODE_NO_RESTART);
        }
        const authString = `${process.env.MONGODB_USER}:${encodeURIComponent(process.env.MONGODB_PASS)}`;
        const hostString = `${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}`;

        this.#startTimestamp = Date.now();
        this.client = await mongodb.MongoClient.connect(`mongodb://${authString}@${hostString}?authSource=bender`);
        this.bot.logger.debug('DATABASE', `Connected in ${Date.now() - this.#startTimestamp}ms`);
        this.bender = this.client.db('bender');
        this.connected = true;

        this.client.on('error', err => {
            this.bot.logger.handleError('DATABASE ERROR', err);
        });

        this.client.on('serverHeartbeatStarted', () => {
            //this.bot.logger.debug('DATABASE', 'Sending heartbeat...');
            this.#heartbeatTimestamp = Date.now();
        });

        this.client.on('serverHeartbeatSucceeded', () => {
            this.ping = Date.now() - this.#heartbeatTimestamp;
            //this.bot.logger.debug('DATABASE', `Heartbeat acked in ${this.ping}ms`);
        });

        this.client.on('serverHeartbeatFailed', () => {
            this.bot.logger.handleError('DATABASE', 'Heartbeat failed!');
        });

        this.client.on('close', () => {
            this.bot.logger.handleError('DATABASE', 'Disconnected!');
            setTimeout(() => this.bot.logger.debug('reconnected?'), DB_RECONNECT_DELAY);
            //setTimeout(() => this.connect(false), DB_RECONNECT_DELAY);
        })

        if (autoInit) {
            return this.init();
        }
    }
    async init() {
        if (!this.connected) {
            this.bot.logger.handleError('DATABASE ERROR', 'Tried to call init() before connected!');
            return;
        }
        // create all collections and indexes if they don't exist
        const collections = await this.bender.collections().then(colls => colls.map(coll => coll.collectionName));
        let collName: keyof typeof DB_INDEXES;
        for (collName in DB_INDEXES) {
            if (!collections.includes(collName)) {
                await this.bender.createCollection(collName);
            }
            const expectedIndexes = DB_INDEXES[collName];
            const indexes = await this.bender.collection(collName).indexes().then(ind => ind.filter(index => index?.key && Object.keys(index.key)[0]).map(index => Object.keys(index.key)[0]));
            for (const key of expectedIndexes) {
                if (typeof key === 'string') {
                    if (!indexes.includes(key)) {
                        await this.bender.createIndex(collName, key);
                    }
                } else {
                    if (!indexes.includes(key.name)) {
                        await this.bender.createIndex(collName, key.name, key.options);
                    }
                }
            }
        }

        if (this.cacheEnabled) {
            const guildSettings = this.bender.collection('bot_settings');
            this.#guildSettingsWatcher = guildSettings.watch(undefined, WATCHER_OPTIONS);
            this.#guildSettingsWatcher.on('change', this.processGuildChange.bind(this));
            const userSettings = this.bender.collection('user_settings');
            this.#userSettingsWatcher = userSettings.watch(undefined, WATCHER_OPTIONS);
            this.#userSettingsWatcher.on('change', this.processUserChange.bind(this));
            const userReminders = this.bender.collection('user_reminders');
            this.#userRemindersWatcher = userReminders.watch(undefined, WATCHER_OPTIONS);
            this.#userRemindersWatcher.on('change', event => this.processUserChange.bind(this)(event, true));
            const premiumSettings = this.bender.collection('premium');
            this.#premiumWatcher = premiumSettings.watch(undefined, WATCHER_OPTIONS);
            this.#premiumWatcher.on('change', this.processPremiumChange.bind(this));
        }
        return this.client;
    }


    /******************* Guild functions *******************/
    /*******************************************************/
    guild = {
        get: async (guildID: Snowflake, fields: dbTypes.ProjectionObject) => {
            const idObj: dbTypes.GuildSettings = { guild: guildID };
            const bs = this.bender.collection('bot_settings');
            const exists = await bs.countDocuments(idObj);
            if (!exists) {
                this.bot.logger.debug('DATABASE', '!exists: returning idObj:', idObj);
                return bs.insertOne(idObj).then(() => idObj);
            }

            const uncachedFields = Object.assign({}, fields); // make a copy so we keep the original query intact
            const cached: dbTypes.GuildSettings = Object.assign({}, idObj);
            if (this.cacheEnabled && this.cache.guilds.get(guildID)) {
                const cachedGuild = this.cache.guilds.get(guildID);
                for (const key in fields) {
                    if (key === '_id') {
                        continue;
                    }
                    let cachedValue: dbTypes.GuildSettings[dbTypes.GuildKey] | null = null;
                    if (key in cachedGuild) {
                        cachedValue = cachedGuild[key as dbTypes.GuildKey];
                    }
                    if (!cachedValue) {
                        continue;
                    }
                    const addToCache = DatabaseManager.expandDotFormat(key.split('.'), cachedValue);
                    Object.assign(cached, addToCache);

                    delete uncachedFields[key as dbTypes.GuildDotFormatKey]; // don't fetch this from the db
                    this.bot.logger.debug('DATABASE', 'found key in cache:', key);
                }
            }

            const cacheOnly = this.cacheEnabled && !Object.keys(uncachedFields).length;
            if (cacheOnly) {
                this.bot.logger.debug('DATABASE', 'cacheOnly: returning cached:', cached);
                return cached;
            }
            const freshData = await bs.findOne(idObj, { projection: fields });

            if (this.cacheEnabled) {
                // only cache full keys, i.e. 'automod' but not 'automod.enabled'
                for (const key in fields) {
                    if (key.indexOf('.') !== -1) {
                        continue;
                    }
                    const settingsKey = key as dbTypes.GuildKey; // no dot-format keys are possible so this is type-safe
                    if (cached[settingsKey]) {
                        this.cache.guilds.update(guildID, { [key]: cached[settingsKey] });
                    }
                }
            } else if (freshData) {
                this.bot.logger.debug('DATABASE', 'returning freshData + idObj:', {freshData, idObj});
                return Object.assign(freshData, idObj);
            } else {
                this.bot.logger.debug('DATABASE', 'returning idObj:', idObj);
                return idObj;
            }

            
            if (freshData) {
                this.bot.logger.debug('DATABASE', 'returning freshData + cached:', {freshData, cached});
                return Object.assign(freshData, cached);
            }
            this.bot.logger.debug('DATABASE', 'returning cached:', cached);
            return cached;
        },

        // only used for checkups
        getAll: async (guildIDs: Snowflake[], key: dbTypes.GuildKey) => {
            const bs = this.bender.collection('bot_settings');
            // TODO: note that cache is not used here - this may be an issue
            return bs.find({
                guild: { $in: guildIDs },
                [key]: { $exists: true }
            }).project({ _id: 0, guild: 1, [key]: 1 })
                .toArray().then(DatabaseManager.createDocumentMap);
        },

        // only used for user update check
        getActiveSettings: async (guildIDs: Snowflake[]) => {
            const bs = this.bender.collection('bot_settings');
            // TODO: note that cache is not used here - this may be an issue
            return bs.find({
                guild: { $in: guildIDs },
                $or: [
                    { 'logging.accChanges': { $regex: ID_REGEX_EXACT } },
                    { 'namefilter.enabled': true },
                    { 'namefilter.patterns': { $exists: true, $not: { $size: 0 } } }]
            }).project({ _id: 0, guild: 1, namefilter: 1, 'ignore.names': 1, 'logging.accChanges': 1 })
                .toArray().then(DatabaseManager.createDocumentMap);
        },

        replace: async (guildID: Snowflake, val: dbTypes.GuildSettings) => {
            const bs = this.bender.collection('bot_settings');
            return bs.replaceOne({ guild: guildID }, val, { upsert: true }).then(DatabaseManager.fixShittyReturnTypes);
        },

        set: async (guildID: Snowflake, key: dbTypes.GuildKey, val: dbTypes.GuildTopLevelValue) => {
            const idObj = { guild: guildID };
            const bs = this.bender.collection('bot_settings');
            const exists = await bs.countDocuments(idObj);
            if (!exists) {
                return bs.insertOne({ guild: guildID, [key]: val }).then(DatabaseManager.reformat);
            }

            return bs.updateOne(idObj, { $set: { [key]: val }, $currentDate: { lastModified: true } }).then(DatabaseManager.reformat);
        },

        update: async (guildID: Snowflake, key: dbTypes.GuildDotFormatKey, val: unknown) => {
            const bs = this.bender.collection('bot_settings');
            const exists = await bs.countDocuments({ guild: guildID });
            if (!exists) {
                return bs.insertOne({ guild: guildID, [key]: val }).then(DatabaseManager.reformat);
            }

            const obj = DatabaseManager.expandDotFormat(key.split('.'), val);
            if (Object.keys(obj).length === 0) {
                return DatabaseManager.reformat(null);
            }
            return bs.updateOne({ guild: guildID }, { $set: obj, $currentDate: { lastModified: true } }).then(DatabaseManager.reformat);
        },

        // nested update which checks for null values to avoid errors
        nestedUpdate: async (guildID: Snowflake, key: dbTypes.GuildKey, subkey: dbTypes.GuildSubkey, val: dbTypes.GuildSubSubkey | unknown, otherVal?: unknown) => {
            const hasSecondSubkey = !!otherVal && (typeof val === 'string' || typeof val === 'number');
            const baseObj = hasSecondSubkey ? { [subkey]: { [val]: otherVal } } : { [subkey]: val };

            const bs = this.bender.collection('bot_settings');
            const exists = await bs.countDocuments({ guild: guildID });
            if (!exists) {
                return this.guild.set(guildID, key, baseObj);
            }

            const keyExists = await bs.countDocuments({ guild: guildID, [key]: { $exists: true } });
            if (!keyExists) {
                return bs.updateOne({ guild: guildID }, { $set: { [key]: baseObj }, $currentDate: { lastModified: true } }).then(DatabaseManager.reformat);
            }

            if (hasSecondSubkey) {
                const subkeyExists = await bs.countDocuments({ guild: guildID, [`${key}.${subkey}`]: { $exists: true, $ne: null } });

                const setObj = subkeyExists ? { [`${key}.${subkey}.${val}`]: otherVal } : { [`${key}.${subkey}`]: { [val]: otherVal } };

                return bs.updateOne({ guild: guildID }, { $set: setObj, $currentDate: { lastModified: true } }).then(DatabaseManager.reformat);
            }

            return bs.updateOne({ guild: guildID }, { $set: { [`${key}.${subkey}`]: val }, $currentDate: { lastModified: true } }).then(DatabaseManager.reformat);
        },

        // should only be used for testing
        directUpdate: async (guildID: Snowflake, val: dbTypes.GuildSettings) => {
            const bs = this.bender.collection('bot_settings');
            return bs.updateOne({ guild: guildID }, Object.assign(val, { $currentDate: { lastModified: true } })).then(DatabaseManager.reformat);
        },

        deleteValue: async (guildID: Snowflake, dfKey: dbTypes.GuildDotFormatKey, index?: number) => {
            if (this.cacheEnabled) {
                const firstPiece = dfKey.split('.')[0];
                this.cache.guilds.update(guildID, undefined, [firstPiece]);
            }

            const bs = this.bender.collection('bot_settings');
            const obj = { $unset: { [`${dfKey}${typeof index === 'number' ? `.${index}` : ''}`]: '' }, $currentDate: { lastModified: true } };
            const r = await bs.updateOne({ guild: guildID }, obj).then(DatabaseManager.reformat);
            if (typeof index !== 'number') {
                return r;
            }
            return bs.updateOne({ guild: guildID }, { $pull: { [dfKey]: null }, $currentDate: { lastModified: true } }).then(DatabaseManager.reformat);
        },

        addToSet: async (guildID: Snowflake, dfKey: dbTypes.GuildDotFormatKey, arr: Array<unknown>) => {
            const bs = this.bender.collection('bot_settings');
            arr = arr.filter(item => item !== null)
            return bs.updateOne({ guild: guildID }, { $addToSet: { [dfKey]: { $each: arr } } }).then(DatabaseManager.reformat);
        },

        delete: async (guildID: Snowflake) => {
            if (this.cacheEnabled) {
                this.cache.guilds.delete(guildID);
            }

            const bs = this.bender.collection('bot_settings');
            return bs.deleteOne({ guild: guildID }).then(DatabaseManager.reformat);
        },

        /***** required utility functions not yet present *****
        // purge all guilds that Bender isn't in & settings haven't been updated in 30 days
        purgeInactive: async () => {
            const guildIDArray = await this.bot.getGuildList().catch(err => {
                this.bot.logger.handleError('DATABASE ERROR', err);
                return false;
            });
            if (!guildIDArray) {
                return;
            }
            const bs = this.bender.collection('bot_settings');
            // TODO: !!!IMPORTANT!!! check that timestamps work properly here
            return bs.deleteMany({ lastModified: { $lt: Date.now() - 1000 * 60 * 60 * 24 * 30 }, guild: { $nin: guildIDArray } }).then(DatabaseManager.#reformat);
        },*/

        needsCheckup: async (key: dbTypes.GuildKey): Promise<dbTypes.GuildSettings[]> => {
            const bs = this.bender.collection('bot_settings');

            const id_array = this.bot.cache.guilds.listIDs();
            const findObject = {
                [key]: { $type: 'object' },
                guild: { $in: id_array }
            };
            if (key === 'agreement') {
                Object.assign(findObject, {
                    ['agreement.enabled']: true,
                    ['agreement.role']: { $type: 'string' },
                    ['agreement.channel']: { $type: 'string' }
                });
            }
            return bs.find(findObject).project({ _id: 0, guild: 1, [key]: 1 }).toArray().then(DatabaseManager.asTypeArrayFiltered<dbTypes.GuildSettings>);
        }
    }


    /******************* Modlog functions *******************/
    /********************************************************/
    cases = {
        setup: async (guildID: Snowflake) => {
            const bs = this.bender.collection('bot_settings');
            const exists = await bs.countDocuments({ guild: guildID, modlog: { $type: 'array' } });
            return exists ? null : this.guild.set(guildID, 'modlog', []);
        },

        getCount: async (guildID: Snowflake) => {
            await this.cases.setup(guildID);
            const bs = this.bender.collection('bot_settings');
            const test = await bs.aggregate([
                { $match: { guild: guildID } },
                { $project: { count: { $size: '$modlog' } } }
            ]).toArray().then(arr => arr[0].count);

            return test || 0;
        },

        get: async (guildID: Snowflake, caseID: number) => {
            await this.cases.setup(guildID);
            const bs = this.bender.collection('bot_settings');
            const sets = await bs.findOne({ guild: guildID, modlog: { $elemMatch: { id: { $in: [caseID, caseID + ''] } } } }, { projection: { _id: 0, 'modlog.$': 1 } });
            return sets?.modlog?.[0] || null;
        },

        getMany: async (guildID: Snowflake, filter: dbTypes.ModlogFilter, page = 1) => {
            let filterObj = {};
            if (filter.by && filter.type) {
                filterObj = { $and: [{ $eq: ['$$item.moderator', filter.by] }, { $eq: ['$$item.action', filter.type] }] };
            }
            else if (filter.for && filter.type && filter.valid) { // only used for warns atm, may need to change in the future
                filterObj = { $and: [{ $eq: ['$$item.target', filter.for] }, { $eq: ['$$item.action', filter.type] }, { $ne: ['$$item.extras.invalid', false] }] };
            }
            else if (filter.for && filter.type) {
                filterObj = { $and: [{ $eq: ['$$item.target', filter.for] }, { $eq: ['$$item.action', filter.type] }] };
            }
            else if (filter.type) {
                filterObj = { $eq: ['$$item.action', filter.type] };
            }
            else if (filter.by) {
                filterObj = { $eq: ['$$item.moderator', filter.by] };
            }
            else if (filter.for) {
                filterObj = { $eq: ['$$item.target', filter.for] };
            }

            const count = await this.cases.getCount(guildID);
            const totalPages = Math.ceil(count / 20);
            if (page > totalPages) {
                page = totalPages;
            }

            const bs = this.bender.collection('bot_settings');
            const projFilter = { $filter: { input: '$modlog', as: 'item', cond: filterObj } };
            const projFilterSliced = { $slice: [projFilter, (page - 1) * 20, 20] };
            return bs.aggregate([
                { $match: { guild: guildID } },
                { $project: { entries: { $concatArrays: [[{ $size: projFilter }], projFilterSliced] } } }
            ]).toArray().then(arr => arr[0] ? arr[0].entries : []);
        },

        add: async (guildID: Snowflake, value: dbTypes.ModlogEntry) => {
            await this.cases.setup(guildID);

            const bs = this.bender.collection('bot_settings');
            return bs.updateOne({ guild: guildID }, { $addToSet: { modlog: value }, $currentDate: { lastModified: true } }).then(DatabaseManager.reformat);
        },

        update: async (guildID: Snowflake, caseID: number, value: dbTypes.ModlogEntry) => {
            if (isNaN(caseID) || caseID < 0) {
                return this.cases.add(guildID, value);
            }
            await this.cases.setup(guildID);
            const bs = this.bender.collection('bot_settings');
            return bs.updateOne({ guild: guildID, 'modlog.id': caseID }, { $set: { ['modlog.$']: value }, $currentDate: { lastModified: true } }).then(DatabaseManager.reformat);
        }
    }


    /******************* User functions *******************/
    /******************************************************/

    reminders = {
        getCount: async (user_id: Snowflake) => {
            const rs = this.bender.collection('user_reminders');
            const result = await rs.aggregate([
                { $match: { user_id } },
                { $project: { count: { $size: '$reminders' } } }
            ]).toArray().then(arr => arr.length ? arr[0].count : 0);

            return result || 0;
        },

        getAll: async (user_id: Snowflake) => {
            if (this.cacheEnabled) {
                const cachedReminders = this.cache.userReminders.get(user_id);
                if (cachedReminders?.length) {
                    return cachedReminders;
                }
            }

            const rs = this.bender.collection('user_reminders');
            const exists = await rs.countDocuments({ user_id });
            if (!exists) {
                return [];
            }
            return rs.findOne({ user_id }).then(result => {
                if (!result) {
                    return null;
                }
                const reminders = result.reminders || [];
                if (this.cacheEnabled) {
                    this.cache.userReminders.set(user_id, result._id, reminders);
                }
                return reminders;
            });
        },

        getByMessageID: async (user_id: Snowflake, message_id: Snowflake) => {
            if (this.cacheEnabled) {
                const reminder = this.cache.userReminders.findByMessage(user_id, message_id);
                if (reminder) {
                    return reminder;
                }
            }

            const rs = this.bender.collection('user_reminders');
            return rs.findOne({ user_id, 'reminders.message': message_id }, { projection: { _id: 0, ['reminders.$']: 1 } }).then(rm => rm?.reminders?.[0]);
        },

        getActive: async () => {
            // TODO: use cache for this?
            const rs = this.bender.collection('user_reminders');
            return rs.find({
                reminders: { $type: 'array', $not: { $size: 0 } },
                ['reminders.endsAt']: { $lte: Date.now() + 1000 * 60 }
            }, { projection: { reminders: 1, user_id: 1, _id: 0 } }).toArray();
        },

        update: async (user_id: Snowflake, message_id: Snowflake, data: dbTypes.Reminder) => {
            const rs = this.bender.collection('user_reminders');
            const exists = await rs.countDocuments({ user_id });
            if (!exists) {
                return this.reminders.add(user_id, data);
            }

            return rs.updateOne({ user_id, 'reminders.message': message_id }, { $set: { 'reminders.$': data } }, { upsert: true }).then(DatabaseManager.reformat);
        },

        deleteAll: async (user_id: Snowflake) => {
            const rs = this.bender.collection('user_reminders');
            const exists = await rs.countDocuments({ user_id });
            if (!exists) {
                return DatabaseManager.reformat(null);
            }

            return rs.deleteOne({ user_id }).then(DatabaseManager.reformat);
        },

        delete: async (user_id: Snowflake, index: number) => {
            const rs = this.bender.collection('user_reminders');
            const exists = await rs.countDocuments({ user_id });
            if (!exists) {
                return DatabaseManager.reformat(null);
            }

            return rs.updateOne({ user_id }, { $unset: { [`reminders.${index}`]: '' } }).then(dbResult => {
                const fResult = DatabaseManager.reformat(dbResult);
                if (!fResult.changes) {
                    return fResult;
                }
                return rs.updateOne({ user_id }, { $pull: { reminders: null } }).then(DatabaseManager.reformat);
            });
        },

        deleteByMessageID: async (user_id: Snowflake, message_id: Snowflake) => {
            const rs = this.bender.collection('user_reminders');
            const exists = await rs.countDocuments({ user_id });
            if (!exists) {
                return DatabaseManager.reformat(null);
            }

            return rs.updateOne({ user_id, 'reminders.message': message_id }, { $unset: { 'reminders.$': '' } }).then(dbResult => {
                const fResult = DatabaseManager.reformat(dbResult);
                if (!fResult.changes) {
                    return fResult;
                }
                // remove the reminders set to null by $unset
                return rs.updateOne({ user_id }, { $pull: { reminders: null } }).then(DatabaseManager.reformat);
            });
        },

        add: async (user_id: Snowflake, data: dbTypes.Reminder) => {
            const rs = this.bender.collection('user_reminders');
            const exists = await rs.countDocuments({ user_id });
            if (!exists) {
                return rs.insertOne({ user_id, reminders: [data] }).then(DatabaseManager.reformat)
            }

            // TODO: handle cache here rather than re-fetching it in the cache handler?

            return rs.updateOne({ user_id }, { $addToSet: { reminders: data } }).then(DatabaseManager.reformat);
        }
    }


    /******************* Premium functions *******************/
    /*********************************************************/

    premium = {
        get: async (ppid: string) => {
            // TODO: use cache?
            const p = this.bender.collection('premium');
            return p.findOne({ ppid }).then(DatabaseManager.asType<dbTypes.PremiumData>).catch(this.#handleError);
        },

        getFromUserID: async (discord_id: Snowflake) => {
            // TODO: use cache?
            const p = this.bender.collection('premium');
            return p.findOne({ $or: [{ discord_id, ['plan.valid_until']: { $gte: Date.now() } }, { ppid: discord_id, ['plan.valid_until']: { $gte: Date.now() } }] })
                .then(DatabaseManager.asType<dbTypes.PremiumData>).catch(this.#handleError);
        },

        getFromGuildID: async (guildID: Snowflake) => {
            // TODO: use cache?
            const p = this.bender.collection('premium');
            return p.findOne({ guilds: guildID, ['plan.valid_until']: { $gte: Date.now() } })
                .then(DatabaseManager.asType<dbTypes.PremiumData>).catch(this.#handleError);
        },

        set: async (ppid: string, data: dbTypes.PremiumData) => {
            const p = this.bender.collection('premium');
            return p.replaceOne({ ppid }, data, { upsert: true }).then(DatabaseManager.fixShittyReturnTypes); // TODO: use cache?
        },

        delete: async (ppid: string) => {
            const p = this.bender.collection('premium');
            return p.deleteOne({ ppid }).then(DatabaseManager.reformat); // TODO: use cache?
        },

        addGuild: async (ppid: string, guildID: Snowflake) => {
            const p = this.bender.collection('premium');
            return p.updateOne({ ppid }, { $addToSet: { guilds: guildID } }).then(DatabaseManager.reformat); // TODO: use cache?
        },

        removeGuild: async (ppid: string, guildID: Snowflake) => {
            const p = this.bender.collection('premium');
            return p.updateOne({ ppid }, { $pull: { guilds: guildID } }).then(DatabaseManager.reformat); // TODO: use cache?
        },

        findPPID: async (discord_id: Snowflake) => {
            // TODO: use cache?
            const p = this.bender.collection('premium');
            return p.findOne({ $or: [{ discord_id }, { ppid: discord_id }] }).then(result => result?.ppid || null);
        },

        includesUser: async (discord_id: Snowflake) => {
            // TODO: use cache?
            const p = this.bender.collection('premium');
            return p.findOne({ discord_id, ['plan.valid_until']: { $gte: Date.now() } }, { projection: {} }).then(data => !!data).catch(this.#handleErrorFalse);
        },

        includesGuild: async (guildID: Snowflake) => {
            // TODO: use cache?
            const p = this.bender.collection('premium');
            return p.findOne({ guilds: guildID, ['plan.valid_until']: { $gte: Date.now() } }, { projection: {} }).then(data => !!data).catch(this.#handleErrorFalse);
        },
    }

    /********************** Command functions **********************/
    /***************************************************************/

    command = {
        get: async (id: Snowflake) => {
            const c = this.bender.collection('commands');
            return c.findOne({ id }).then(DatabaseManager.asType<dbTypes.GlobalCommand>);
        },

        getByName: async (name: string) => {
            const c = this.bender.collection('commands');
            return c.findOne({ name }).then(DatabaseManager.asType<dbTypes.GlobalCommand>);
        },

        list: async () => {
            const c = this.bender.collection('commands');
            return c.find({}).toArray().then(doc => DatabaseManager.asTypeArrayFiltered<dbTypes.GlobalCommand>(doc));
        },

        create: async (command: Command) => {
            const savedCommand = DatabaseManager.convertCommand(command);
            const c = this.bender.collection('commands');
            return c.insertOne(savedCommand).then(DatabaseManager.fixShittyReturnTypes);
        },

        update: async (id: Snowflake, commandData: Partial<Command>) => {
            const c = this.bender.collection('commands');
            // remove unique keys to prevent duplicate key errors
            delete commandData.id;
            delete commandData.name;
            return c.updateOne({ id }, { $set: commandData }).then(DatabaseManager.reformat);
        },

        replace: async (id: Snowflake, command: dbTypes.GlobalCommand) => {
            const c = this.bender.collection('commands');
            return c.replaceOne({ id }, command).then(DatabaseManager.fixShittyReturnTypes);
        },

        replaceByName: async (name: string, command: dbTypes.GlobalCommand) => {
            const c = this.bender.collection('commands');
            return c.replaceOne({ name }, command).then(DatabaseManager.fixShittyReturnTypes);
        },

        replaceAll: async (commands: Command[]) => {
            const c = this.bender.collection('commands');
            return c.deleteMany({}).then(() => c.insertMany(commands)).then(DatabaseManager.reformat);
        },

        updateAll: async (commands: Command[]) => {
            const c = this.bender.collection('commands');
            return c.bulkWrite(commands.map(cmd => ({ updateOne: { filter: { name: cmd.name }, update: { $set: cmd } } }))).then(DatabaseManager.reformat);
        },

        delete: async (id: Snowflake) => {
            const c = this.bender.collection('commands');
            return c.deleteOne({ id }).then(DatabaseManager.reformat);
        },
    }


    /******************* Guild command functions *******************/
    /***************************************************************/

    guildCommand = {
        get: async (guildID: Snowflake, id: Snowflake) => {
            const gc = this.bender.collection('guild_commands');
            const exists = await gc.countDocuments({ guild_id: guildID });
            if (!exists) {
                return gc.insertOne({ guild_id: guildID, commands: [] }).then(() => null);
            }
            return gc.findOne(
                { guild_id: guildID, 'commands.id': id },
                { projection: { _id: 0, 'commands.$': 1 } }
            ).then(doc => DatabaseManager.asType<dbTypes.GuildCommand>(doc?.commands?.[0] || null));
        },

        getByName: async (guildID: Snowflake, name: string) => {
            const gc = this.bender.collection('guild_commands');
            const exists = await gc.countDocuments({ guild_id: guildID });
            if (!exists) {
                return gc.insertOne({ guild_id: guildID, commands: [] }).then(() => null);
            }
            return gc.findOne(
                { guild_id: guildID, 'commands.name': name },
                { projection: { _id: 0, 'commands.$': 1 } }
            ).then(doc => DatabaseManager.asType<dbTypes.GuildCommand>(doc?.commands?.[0] || null));
        },

        list: async (guildID: Snowflake) => {
            const gc = this.bender.collection('guild_commands');
            const exists = await gc.countDocuments({ guild_id: guildID });
            if (!exists) {
                return gc.insertOne({ guild_id: guildID, commands: [] }).then(() => []);
            }
            return gc.findOne({ guild_id: guildID }).then(doc => DatabaseManager.asTypeArrayFiltered<dbTypes.GuildCommand>(doc?.commands || null));
        },

        create: async (guildID: Snowflake, command: Command) => {
            const savedCommand = DatabaseManager.convertCommand(command);
            const gc = this.bender.collection('guild_commands');
            const exists = await gc.countDocuments({ guild_id: guildID });
            if (!exists) {
                return gc.insertOne({ guild_id: guildID, commands: [savedCommand] }).then(DatabaseManager.reformat);
            }
            return gc.updateOne({ guild_id: guildID }, { $addToSet: { commands: savedCommand } }).then(DatabaseManager.reformat);
        },

        update: async (guildID: Snowflake, id: Snowflake, commandData: CommandCreateData) => {
            const gc = this.bender.collection('guild_commands');
            const exists = await gc.countDocuments({ guild_id: guildID });
            if (!exists) {
                return DatabaseManager.reformat(null);
            }
            const updateObj = this.generateDotFormat('commands.$.', commandData);
            return gc.updateOne({ guild_id: guildID, 'commands.id': id }, { $set: updateObj }).then(DatabaseManager.reformat);
        },

        replace: async (guildID: Snowflake, id: Snowflake, command: dbTypes.GuildCommand) => {
            const gc = this.bender.collection('guild_commands');
            const exists = await gc.countDocuments({ guild_id: guildID });
            if (!exists) {
                return gc.insertOne({ guild_id: guildID, commands: [command] }).then(DatabaseManager.reformat);
            }
            return gc.updateOne({ guild_id: guildID, 'commands.id': id }, { $set: { 'commands.$': command } }).then(DatabaseManager.reformat);
        },

        replaceByName: async (guildID: Snowflake, name: string, command: dbTypes.GuildCommand) => {
            const gc = this.bender.collection('guild_commands');
            const exists = await gc.countDocuments({ guild_id: guildID });
            if (!exists) {
                return gc.insertOne({ guild_id: guildID, commands: [command] }).then(DatabaseManager.reformat);
            }
            return gc.updateOne({ guild_id: guildID, 'commands.name': name }, { $set: { 'commands.$': command } }).then(DatabaseManager.reformat);
        },

        replaceAll: async (guildID: Snowflake, commands: Command[]) => {
            const savedCommands = commands.map(DatabaseManager.convertCommand);
            const gc = this.bender.collection('guild_commands');
            const exists = await gc.countDocuments({ guild_id: guildID });
            if (!exists) {
                return gc.insertOne({ guild_id: guildID, commands: savedCommands }).then(DatabaseManager.reformat);
            }
            return gc.updateOne({ guild_id: guildID }, { $set: { commands: savedCommands } }).then(DatabaseManager.reformat);
        },

        delete: async (guildID: Snowflake, id: Snowflake) => {
            const gc = this.bender.collection('guild_commands');
            const exists = await gc.countDocuments({ guild_id: guildID });
            if (!exists) {
                return DatabaseManager.reformat(null);
            }

            return gc.updateOne({ guild_id: guildID, 'commands.id': id }, { $unset: { 'commands.$': '' } }).then(dbResult => {
                const fResult = DatabaseManager.reformat(dbResult);
                if (!fResult.changes) {
                    return fResult;
                }
                return gc.updateOne({ guild_id: guildID }, { $pull: { commands: null } }).then(DatabaseManager.reformat);
            });
        },
    }


    /******************** Shard stats functions ********************/
    /***************************************************************/

    shard = {
        getDead: async () => { // shards that haven't posted stats in 10 minutes
            const s = this.bender.collection('bot_status');
            return s.find({ lastUpdated: { $lt: Date.now() - 1000 * 60 * 10 } }).project({}).toArray();
        },

        update: async (data: dbTypes.ShardData): Promise<dbTypes.DatabaseResult> => {
            const s = this.bender.collection('bot_status');
            return s.replaceOne({ shard_id: data.shard_id }, data, { upsert: true }).then(DatabaseManager.fixShittyReturnTypes);
        },

        removeExtra: async (shard_count: number) => {
            const s = this.bender.collection('bot_status');
            return s.deleteMany({ $and: [{ shard_id: { $ne: 'OVERALL' } }, { shard_id: { $gte: shard_count } }] }).then(DatabaseManager.reformat);
        },
    }


    /****************** Key management functions *******************/
    /***************************************************************/

    oauthKeys = {
        get: async (type: dbTypes.OAuthServices): Promise<string> => {
            const o = this.bender.collection('oauth_keys');
            return o.findOne({ service_name: type }).then(result => result?.key);
        },
        set: async (type: dbTypes.OAuthServices, newKey: string, newExpiration: UnixTimestampMillis) => {
            const o = this.bender.collection('oauth_keys');
            return o.updateOne({ service_name: type }, { $set: { key: newKey, expiresAt: newExpiration } }, { upsert: true }).then(DatabaseManager.reformat);
        }
    }


    /********************** Utility functions **********************/
    /***************************************************************/

    static convertCommand(command: Command | ICommand): dbTypes.SavedCommand {
        const savedCommand: dbTypes.SavedCommand = Object.assign({}, command, {
            application_id: undefined,
            version: undefined,
            bot: undefined
        });
        delete savedCommand.application_id;
        delete savedCommand.version;
        delete savedCommand.bot;
        return savedCommand;
    }

    static asTypeArrayFiltered<T extends dbTypes.GuildTopLevelValue | dbTypes.SavedCommand>(value: (mongodb.Document | null)[]) {
        return DatabaseManager.asTypeArray<T>(value).filter(item => item !== null) as T[];
    }
    static asTypeArray<T extends dbTypes.GuildTopLevelValue | dbTypes.SavedCommand>(value: (mongodb.Document | null)[]) {
        return value.map(item => DatabaseManager.asType<T>(item));
    }
    static asType<T extends dbTypes.GuildTopLevelValue | dbTypes.SavedCommand>(value: mongodb.Document | null) {
        return value ? value as T : null;
    }

    generateDotFormat(prefix = '', value: CommandCreateData) {
        const resultObj: Record<string, unknown> = {};
        for (const key of Object.keys(value)) {
            resultObj[`${prefix}${key}`] = value[key as keyof CommandCreateData];
        }
        return resultObj;
    }

    static expandDotFormat(keyParts: string[], value: unknown, workingObject: Record<string, unknown> = {}) {
        const thisPart = keyParts.shift();
        if (!thisPart) {
            return workingObject;
        }
        if (!keyParts.length) {
            workingObject[thisPart] = value;
            return workingObject;
        }
        // TODO: not really type safe so idk if this will work right
        workingObject[thisPart] = DatabaseManager.expandDotFormat(keyParts, value, workingObject[thisPart] as Record<string, unknown>);
        return workingObject;
    }

    static reformat(commandResult: mongodb.UpdateResult | mongodb.DeleteResult | mongodb.InsertOneResult | mongodb.InsertManyResult | mongodb.BulkWriteResult | null) {
        const result: dbTypes.DatabaseResult = { edits: 0, changes: 0, insertions: 0, deletions: 0 };
        if (!commandResult) {
            return result;
        }

        if ('insertedId' in commandResult) {
            // InsertOneResult doesn't contain any useful info, so assume it was successful
            result.changes = 1;
            result.insertions = 1;
            return result;
        }

        if ('insertedCount' in commandResult) {
            result.insertions += commandResult.insertedCount;
            result.changes += commandResult.insertedCount;
        }

        if ('modifiedCount' in commandResult) {
            result.edits += commandResult.modifiedCount;
            result.changes += commandResult.modifiedCount;
        }

        if ('upsertedCount' in commandResult) {
            result.edits += commandResult.upsertedCount;
            result.insertions += commandResult.upsertedCount;
            result.changes += commandResult.upsertedCount;
        }

        if ('deletedCount' in commandResult) {
            result.deletions = commandResult.deletedCount;
            result.changes += commandResult.deletedCount;
        }

        return result;
    }

    static createDocumentMap(docs: mongodb.Document[]) {
        const result: dbTypes.GuildSettingsMap = {};
        for (const doc of docs) {
            const guildDoc = doc as dbTypes.GuildSettings;
            result[guildDoc.guild] = guildDoc;
        }
        return result;
    }

    static fixShittyReturnTypes(result: mongodb.UpdateResult | mongodb.Document) {
        // time for some really bad type checking because this can also return a Document for some idiotic reason
        if (
            typeof result.acknowledged !== 'boolean' ||
            typeof result.matchedCount !== 'number' ||
            typeof result.modifiedCount !== 'number' ||
            typeof result.upsertedCount !== 'number' ||
            !(result.upsertedId instanceof mongodb.ObjectId)
        ) {
            // result must be a Document; since this behavior isn't documented, assume the operation succeeded
            const dummyResult = DatabaseManager.reformat(null);
            dummyResult.changes = 1;
            dummyResult.edits = 1;
            return dummyResult;
        } else {
            // result must be an UpdateResult, but since Document is impossible to filter out, we have to use 'as'
            return DatabaseManager.reformat(result as mongodb.UpdateResult);
        }
    }

    #handleError(err: unknown) {
        this.bot.logger.handleError('DATABASE ERROR', err);
        return null;
    }
    #handleErrorFalse(err: unknown) {
        this.bot.logger.handleError('DATABASE ERROR', err);
        return false;
    }


    /*********************** Cache functions ***********************/
    /***************************************************************/

    async processUserChange(event: mongodb.ChangeStreamDocument, isReminders = false) {
        try {
            this.bot.logger.debug('DATABASE', 'Received user change event', event);

            if (event.operationType === 'invalidate') {
                this.bot.logger.handleError('DATABASE ERROR', `USER ${isReminders ? 'REMINDERS' : 'SETTINGS'} COLLECTION INVALIDATED! No more changes will be processed.`);
                if (isReminders) {
                    this.#userRemindersWatcher?.close();
                    this.#userRemindersWatcher = undefined;
                } else {
                    this.#userSettingsWatcher?.close();
                    this.#userSettingsWatcher = undefined;
                }
                return;
            }

            if (
                event.operationType !== 'insert' &&
                event.operationType !== 'update' &&
                event.operationType !== 'replace' &&
                event.operationType !== 'delete'
            ) {
                return; // other events are either irrelevant or will be handled by the 'invalidate' event
            }

            if (!event.ns || event.ns.db !== 'bender' || !event.documentKey || !event.documentKey._id) {
                return; // filter out invalid data, shouldn't be needed
            }

            if (isReminders && event.ns.coll === 'user_settings') {
                this.bot.logger.handleError('DATABASE ERROR', 'processUserChange: Invalid data! Sent user settings with isReminders = true.');
                isReminders = false;
            }
            if (!isReminders && event.ns.coll === 'user_reminders') {
                this.bot.logger.handleError('DATABASE ERROR', 'processUserChange: Invalid data! Sent reminders with isReminders = false.');
                isReminders = true;
            }

            const id = event.documentKey._id;

            if (event.operationType === 'delete') {
                if (isReminders) {
                    this.cache.userReminders.deleteByObjectId(id);
                } else {
                    this.cache.userSettings.deleteByObjectId(id);
                }
                return;
            }
            if (event.operationType === 'insert' || event.operationType === 'replace') {
                if (isReminders) {
                    // TODO: validate against schema?
                    const data = event.fullDocument as dbTypes.UserReminders;
                    this.cache.userReminders.set(data.user_id, id, data.reminders);
                } else {
                    // TODO: validate against schema?
                    const data = event.fullDocument as dbTypes.UserSettings;
                    this.cache.userSettings.set(data.user_id, id, data);
                }
                return;
            }
            // else the operation must be an update, process the changed fields

            const userID = isReminders ? this.cache.userReminders.getIDFromObjectId(id) : this.cache.userSettings.getIDFromObjectId(id);
            if (!userID) {
                return; // user isn't cached; there's nothing to update
            }

            const ud = event.updateDescription;
            if (!ud.updatedFields && !ud.removedFields && !ud.truncatedArrays) {
                return;
            }

            if (ud.truncatedArrays) {
                // in this case we don't know the new value of the array or which elements were removed, so the cache needs to be refreshed
                this.bot.logger.debug('DATABASE', `processUserChange: deleting user${isReminders ? 'Reminders' : 'Settings'}[${userID}] due to truncatedArrays`);
                // TODO: instead of deleting, update the cache with fetched values for said arrays
                if (isReminders) {
                    this.cache.userReminders.delete(userID);
                } else {
                    this.cache.userSettings.delete(userID);
                }
                return;
            }

            if (isReminders) {
                this.cache.userReminders.update(userID, ud.updatedFields, ud.removedFields);
            } else {
                this.cache.userSettings.update(userID, ud.updatedFields, ud.removedFields);
            }
        } catch (err) {
            this.bot.logger.handleError('DATABASE ERROR', err);
        }
    }

    async processPremiumChange(event: mongodb.ChangeStreamDocument) {
        try {
            this.bot.logger.debug('DATABASE', 'Received premium change event', event);

            if (event.operationType === 'invalidate') {
                this.bot.logger.handleError('DATABASE ERROR', `PREMIUM COLLECTION INVALIDATED! No more changes will be processed.`);
                this.#premiumWatcher?.close();
                this.#premiumWatcher = undefined;
                return;
            }

            if (
                event.operationType !== 'insert' &&
                event.operationType !== 'update' &&
                event.operationType !== 'replace' &&
                event.operationType !== 'delete'
            ) {
                return; // other events are either irrelevant or will be handled by the 'invalidate' event
            }

            if (!event.ns || event.ns.db !== 'bender' || !event.documentKey || !event.documentKey._id) {
                return; // filter out invalid data, shouldn't be needed
            }

            const id = event.documentKey._id;

            if (event.operationType === 'delete') {
                this.cache.premium.deleteByObjectId(id);
                return;
            }
            if (event.operationType === 'insert' || event.operationType === 'replace') {
                // TODO: validate against schema?
                const data = event.fullDocument as dbTypes.PremiumData;
                this.cache.premium.set(data.ppid, id, data);
                return;
            }
            // else the operation must be an update, process the changed fields

            const ppid = this.cache.premium.getPPIDFromObjectId(id);
            if (!ppid) {
                return; // user isn't cached; there's nothing to update
            }

            const ud = event.updateDescription;
            if (!ud.updatedFields && !ud.removedFields && !ud.truncatedArrays) {
                return;
            }

            if (ud.truncatedArrays) {
                // in this case we don't know the new value of the array or which elements were removed, so the cache needs to be refreshed
                this.bot.logger.debug('DATABASE', `processUserChange: deleting premium[${ppid}] due to truncatedArrays`);
                // TODO: instead of deleting, update the cache with fetched values for said arrays
                this.cache.premium.delete(ppid);
                return;
            }

            this.cache.premium.update(ppid, ud.updatedFields, ud.removedFields);
        } catch (err) {
            this.bot.logger.handleError('DATABASE ERROR', err);
        }
    }

    async processGuildChange(event: mongodb.ChangeStreamDocument) {
        try {
            this.bot.logger.debug('DATABASE', 'Received guild change event', event);

            if (event.operationType === 'invalidate') {
                this.bot.logger.handleError('DATABASE ERROR', 'GUILD SETTINGS COLLECTION INVALIDATED! No more changes will be processed.');
                this.#guildSettingsWatcher?.close();
                this.#guildSettingsWatcher = undefined;
                return;
            }

            if (
                event.operationType !== 'insert' &&
                event.operationType !== 'update' &&
                event.operationType !== 'replace' &&
                event.operationType !== 'delete'
            ) {
                return; // other events are either irrelevant or will be handled by the 'invalidate' event
            }

            if (!event.ns || event.ns.db !== 'bender' || !event.documentKey || !event.documentKey._id) {
                return; // filter out invalid data, shouldn't be needed
            }

            const id = event.documentKey._id;

            if (event.operationType === 'delete') {
                this.cache.guilds.deleteByObjectId(id);
                return;
            }
            if (event.operationType === 'insert' || event.operationType === 'replace') {
                // TODO: validate against schema?
                const data = event.fullDocument as dbTypes.GuildSettings;
                this.cache.guilds.set(data.guild, id, data);
                return;
            }
            // else the operation must be an update, process the changed fields

            const guildID = this.cache.guilds.getIDFromObjectId(id);
            if (!guildID) {
                return; // guild isn't cached; there's nothing to update
            }

            const ud = event.updateDescription;
            if (!ud.updatedFields && !ud.removedFields && !ud.truncatedArrays) {
                return;
            }

            if (ud.truncatedArrays) {
                // in this case we don't know the new value of the array or which elements were removed, so the cache needs to be refreshed
                this.bot.logger.debug('DATABASE', `processChange: deleting guildSettings[${guildID}] due to truncatedArrays`);
                // TODO: instead of deleting, update the cache with fetched values for said arrays
                this.cache.guilds.delete(guildID);
                return;
            }

            this.cache.guilds.update(guildID, ud.updatedFields, ud.removedFields);
        } catch (err) {
            this.bot.logger.handleError('DATABASE ERROR', err);
        }
    }
}