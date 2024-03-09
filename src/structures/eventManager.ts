import events from '../types/eventTypes.js';
import type * as gatewayTypes from '../types/gatewayTypes.js';
import { CLIENT_STATE } from '../types/numberTypes.js';
import type { EventHandler } from '../types/types.js';
import type Bot from './bot.js';

import dummy_event from '../events/_dummy.js';
import application_command_create from '../events/application_command_create.js';
import application_command_delete from '../events/application_command_delete.js';
import application_command_update from '../events/application_command_update.js';
import auto_moderation_action_execution from '../events/auto_moderation_action_execution.js';
import channel_create from '../events/channel_create.js';
import channel_delete from '../events/channel_delete.js';
import channel_update from '../events/channel_update.js';
import guild_audit_log_entry_create from '../events/guild_audit_log_entry_create.js';
import guild_ban_add from '../events/guild_ban_add.js';
import guild_create from '../events/guild_create.js';
import guild_delete from '../events/guild_delete.js';
import guild_emojis_update from '../events/guild_emojis_update.js';
import guild_member_add from '../events/guild_member_add.js';
import guild_member_remove from '../events/guild_member_remove.js';
import guild_member_update from '../events/guild_member_update.js';
import guild_members_chunk from '../events/guild_members_chunk.js';
import guild_role_create from '../events/guild_role_create.js';
import guild_role_delete from '../events/guild_role_delete.js';
import guild_role_update from '../events/guild_role_update.js';
import guild_update from '../events/guild_update.js';
import interaction_create from '../events/interaction_create.js';
import message_create from '../events/message_create.js';
import message_delete from '../events/message_delete.js';
import message_delete_bulk from '../events/message_delete_bulk.js';
import message_reaction_add from '../events/message_reaction_add.js';
import message_reaction_remove from '../events/message_reaction_remove.js';
import message_reaction_remove_all from '../events/message_reaction_remove_all.js';
import message_reaction_remove_emoji from '../events/message_reaction_remove_emoji.js';
import message_update from '../events/message_update.js';
import presence_update from '../events/presence_update.js';
import ready from '../events/ready.js';
import resumed from '../events/resumed.js';
import thread_create from '../events/thread_create.js';
import thread_delete from '../events/thread_delete.js';
import thread_list_sync from '../events/thread_list_sync.js';
import thread_member_update from '../events/thread_member_update.js';
import thread_members_update from '../events/thread_members_update.js';
import thread_update from '../events/thread_update.js';
import user_update from '../events/user_update.js';
import voice_state_update from '../events/voice_state_update.js';

export default class EventManager {
    bot: Bot;
    application_command_create: application_command_create;
    application_command_delete: application_command_delete;
    application_command_permissions_update: dummy_event<gatewayTypes.CommandPermissionsUpdateData>;
    application_command_update: application_command_update;
    auto_moderation_action_execution: auto_moderation_action_execution;
    auto_moderation_rule_create: dummy_event<gatewayTypes.AutoModUpdateData>;
    auto_moderation_rule_delete: dummy_event<gatewayTypes.AutoModUpdateData>;
    auto_moderation_rule_update: dummy_event<gatewayTypes.AutoModUpdateData>;
    channel_create: channel_create;
    channel_delete: channel_delete;
    channel_pins_update: dummy_event<gatewayTypes.ChannelPinsUpdateData>;
    channel_update: channel_update;
    guild_audit_log_entry_create: guild_audit_log_entry_create;
    guild_ban_add: guild_ban_add;
    guild_ban_remove: dummy_event<gatewayTypes.GuildBanEventData>;
    guild_create: guild_create;
    guild_delete: guild_delete;
    guild_emojis_update: guild_emojis_update;
    guild_integrations_update: dummy_event<gatewayTypes.GuildIntegrationsUpdateData>;
    guild_member_add: guild_member_add;
    guild_member_remove: guild_member_remove;
    guild_members_chunk: guild_members_chunk;
    guild_member_update: guild_member_update;
    guild_role_create: guild_role_create;
    guild_role_delete: guild_role_delete;
    guild_role_update: guild_role_update;
    guild_scheduled_event_create: dummy_event<gatewayTypes.GuildScheduledEventUpdateData>;
    guild_scheduled_event_delete: dummy_event<gatewayTypes.GuildScheduledEventUpdateData>;
    guild_scheduled_event_update: dummy_event<gatewayTypes.GuildScheduledEventUpdateData>;
    guild_scheduled_event_user_add: dummy_event<gatewayTypes.GuildScheduledEventUserUpdateData>;
    guild_scheduled_event_user_remove: dummy_event<gatewayTypes.GuildScheduledEventUserUpdateData>;
    guild_stickers_update: dummy_event<gatewayTypes.GuildStickersUpdateData>;
    guild_update: guild_update;
    integration_create: dummy_event<gatewayTypes.IntegrationUpdateData>;
    integration_delete: dummy_event<gatewayTypes.IntegrationDeleteData>;
    integration_update: dummy_event<gatewayTypes.IntegrationUpdateData>;
    interaction_create: interaction_create;
    invite_create: dummy_event<gatewayTypes.InviteCreateData>;
    invite_delete: dummy_event<gatewayTypes.InviteDeleteData>;
    message_create: message_create;
    message_delete: message_delete;
    message_delete_bulk: message_delete_bulk;
    message_reaction_add: message_reaction_add;
    message_reaction_remove: message_reaction_remove;
    message_reaction_remove_all: message_reaction_remove_all;
    message_reaction_remove_emoji: message_reaction_remove_emoji;
    message_update: message_update;
    presence_update: presence_update;
    stage_instance_create: dummy_event<gatewayTypes.StageInstanceUpdateData>;
    stage_instance_delete: dummy_event<gatewayTypes.StageInstanceUpdateData>;
    stage_instance_update: dummy_event<gatewayTypes.StageInstanceUpdateData>;
    ready: ready;
    resumed: resumed;
    thread_create: thread_create;
    thread_delete: thread_delete;
    thread_list_sync: thread_list_sync;
    thread_members_update: thread_members_update;
    thread_member_update: thread_member_update;
    thread_update: thread_update;
    typing_start: dummy_event<gatewayTypes.TypingStartData>;
    user_update: user_update;
    voice_server_update: dummy_event<gatewayTypes.VoiceServerUpdateData>;
    voice_state_update: voice_state_update;
    webhooks_update: dummy_event<gatewayTypes.WebhooksUpdateData>;

    constructor(bot: Bot) {
        this.bot = bot;
        this.application_command_create = new application_command_create(this.bot);
        this.application_command_delete = new application_command_delete(this.bot);
        this.application_command_permissions_update = new dummy_event(
            this.bot,
            'application_command_permissions_update'
        );
        this.application_command_update = new application_command_update(this.bot);
        this.auto_moderation_action_execution = new auto_moderation_action_execution(this.bot);
        this.auto_moderation_rule_create = new dummy_event(this.bot, 'auto_moderation_rule_create');
        this.auto_moderation_rule_delete = new dummy_event(this.bot, 'auto_moderation_rule_delete');
        this.auto_moderation_rule_update = new dummy_event(this.bot, 'auto_moderation_rule_update');
        this.channel_create = new channel_create(this.bot);
        this.channel_delete = new channel_delete(this.bot);
        this.channel_pins_update = new dummy_event(this.bot, 'channel_pins_update');
        this.channel_update = new channel_update(this.bot);
        this.guild_audit_log_entry_create = new guild_audit_log_entry_create(this.bot);
        this.guild_ban_add = new guild_ban_add(this.bot);
        this.guild_ban_remove = new dummy_event(this.bot, 'guild_ban_remove');
        this.guild_create = new guild_create(this.bot);
        this.guild_delete = new guild_delete(this.bot);
        this.guild_emojis_update = new guild_emojis_update(this.bot);
        this.guild_integrations_update = new dummy_event(this.bot, 'guild_integrations_update');
        this.guild_member_add = new guild_member_add(this.bot);
        this.guild_member_remove = new guild_member_remove(this.bot);
        this.guild_members_chunk = new guild_members_chunk(this.bot);
        this.guild_member_update = new guild_member_update(this.bot);
        this.guild_role_create = new guild_role_create(this.bot);
        this.guild_role_delete = new guild_role_delete(this.bot);
        this.guild_role_update = new guild_role_update(this.bot);
        this.guild_scheduled_event_create = new dummy_event(this.bot, 'guild_scheduled_event_create');
        this.guild_scheduled_event_delete = new dummy_event(this.bot, 'guild_scheduled_event_delete');
        this.guild_scheduled_event_update = new dummy_event(this.bot, 'guild_scheduled_event_update');
        this.guild_scheduled_event_user_add = new dummy_event(this.bot, 'guild_scheduled_event_user_add');
        this.guild_scheduled_event_user_remove = new dummy_event(this.bot, 'guild_scheduled_event_user_remove');
        this.guild_stickers_update = new dummy_event(this.bot, 'guild_stickers_update');
        this.guild_update = new guild_update(this.bot);
        this.integration_create = new dummy_event(this.bot, 'integration_create');
        this.integration_delete = new dummy_event(this.bot, 'integration_delete');
        this.integration_update = new dummy_event(this.bot, 'integration_update');
        this.interaction_create = new interaction_create(this.bot);
        this.invite_create = new dummy_event(this.bot, 'invite_create');
        this.invite_delete = new dummy_event(this.bot, 'invite_delete');
        this.message_create = new message_create(this.bot);
        this.message_delete = new message_delete(this.bot);
        this.message_delete_bulk = new message_delete_bulk(this.bot);
        this.message_reaction_add = new message_reaction_add(this.bot);
        this.message_reaction_remove = new message_reaction_remove(this.bot);
        this.message_reaction_remove_all = new message_reaction_remove_all(this.bot);
        this.message_reaction_remove_emoji = new message_reaction_remove_emoji(this.bot);
        this.message_update = new message_update(this.bot);
        this.presence_update = new presence_update(this.bot);
        this.stage_instance_create = new dummy_event(this.bot, 'stage_instance_create');
        this.stage_instance_delete = new dummy_event(this.bot, 'stage_instance_delete');
        this.stage_instance_update = new dummy_event(this.bot, 'stage_instance_update');
        this.ready = new ready(this.bot);
        this.resumed = new resumed(this.bot);
        this.thread_create = new thread_create(this.bot);
        this.thread_delete = new thread_delete(this.bot);
        this.thread_list_sync = new thread_list_sync(this.bot);
        this.thread_members_update = new thread_members_update(this.bot);
        this.thread_member_update = new thread_member_update(this.bot);
        this.thread_update = new thread_update(this.bot);
        this.typing_start = new dummy_event(this.bot, 'typing_start');
        this.user_update = new user_update(this.bot);
        this.voice_server_update = new dummy_event(this.bot, 'voice_server_update');
        this.voice_state_update = new voice_state_update(this.bot);
        this.webhooks_update = new dummy_event(this.bot, 'webhooks_update');
    }

    handleEvent(eventHandler: EventHandler<gatewayTypes.EventData>, eventData: gatewayTypes.EventData) {
        if (eventHandler.requiresReady && this.bot.state !== CLIENT_STATE.ALIVE) {
            this.bot.logger.debug(eventHandler.name, 'skipped due to client not ready');
            return null;
        }
        //this.bot.logger.debug(eventHandler.name, eventData);
        if (eventHandler.cacheHandler) {
            eventHandler.cacheHandler(eventData);
        }
        return eventHandler.handler(eventData);
    }

    addAllListeners() {
        for (const eventName of events) {
            // add all events
            const lowercaseEventName = eventName.toLowerCase() as gatewayTypes.LowercaseEventName;
            this.bot.on(eventName, (eventData: gatewayTypes.EventData) =>
                this.handleEvent(this[lowercaseEventName] as EventHandler<gatewayTypes.EventData>, eventData)
            );
        }
    }
}
