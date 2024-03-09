import type Bot from '../structures/bot.js';
import type { AuditLogEntry } from '../types/types.js';
import { EventHandler } from '../types/types.js';

export default class GuildAuditLogHandler extends EventHandler<AuditLogEntry> {
    constructor(bot: Bot) {
        super('guild_audit_log_entry_create', bot);
    }

    cacheHandler = (/*eventData: AuditLogEntry*/) => {
        // TODO: cache entry for message delete events?
    };

    handler = (/*eventData: AuditLogEntry*/) => {
        // TODO: logging moderations actions not done via Bender?
    };
}
