import { Guild, Member, Snowflake } from '../data/types';
import Bot from '../structures/bot';
import { CachedGuild } from './cacheHandler';

export default class Fetcher {
    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    async guild(guildID: Snowflake) {
        let guild: CachedGuild | Guild | null = this.bot.cache.guilds.get(guildID);
        if (!guild) {
            guild = await this.bot.api.guild.fetch(guildID, true).catch(err => {
                this.bot.logger.handleError('FETCH GUILD', err);
                return null;
            })
        }
        return guild;
    }

    async guildRoles(guildID: Snowflake) {
        let roles = this.bot.cache.roles.getAll(guildID);
        if (!roles) {
            roles = await this.bot.api.role.list(guildID).catch(err => {
                this.bot.logger.handleError('FETCH GUILD ROLES', err);
                return null;
            });
        }
        return roles;
    }

    async member(guildID: Snowflake, userID: Snowflake) {
        let member: Member | null = this.bot.cache.members.get(guildID, userID);
        if (!member) {
            member = await this.bot.api.member.fetch(guildID, userID).catch(err => {
                this.bot.logger.handleError('FETCH MEMBER', err);
                return null;
            })
        }
        return member;
    }
}