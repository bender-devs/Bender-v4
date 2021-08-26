import Bot from './bot';
import * as gatewayTypes from '../data/gatewayTypes';
import { CLIENT_STATE } from '../data/numberTypes';
import events from '../data/eventTypes';
import { EventHandler, NON_WAITING_EVENTS } from '../data/types';

import application_command_create from '../events/application_command_create';
import application_command_delete from '../events/application_command_delete';
import application_command_update from '../events/application_command_update';
import channel_create from '../events/channel_create';
import channel_delete from '../events/channel_delete';
import channel_pins_update from '../events/channel_pins_update';
import channel_update from '../events/channel_update';
import guild_ban_add from '../events/guild_ban_add';
import guild_ban_remove from '../events/guild_ban_remove';
import guild_create from '../events/guild_create';
import guild_delete from '../events/guild_delete';
import guild_emojis_update from '../events/guild_emojis_update';
import guild_integrations_update from '../events/guild_integrations_update';
import guild_member_add from '../events/guild_member_add';
import guild_member_remove from '../events/guild_member_remove';
import guild_members_chunk from '../events/guild_members_chunk';
import guild_member_update from '../events/guild_member_update';
import guild_role_create from '../events/guild_role_create';
import guild_role_delete from '../events/guild_role_delete';
import guild_role_update from '../events/guild_role_update';
import guild_stickers_update from '../events/guild_stickers_update';
import guild_update from '../events/guild_update';
import integration_create from '../events/integration_create';
import integration_delete from '../events/integration_delete';
import integration_update from '../events/integration_update';
import interaction_create from '../events/interaction_create';
import invite_create from '../events/invite_create';
import invite_delete from '../events/invite_delete';
import message_create from '../events/message_create';
import message_delete from '../events/message_delete';
import message_delete_bulk from '../events/message_delete_bulk';
import message_reaction_add from '../events/message_reaction_add';
import message_reaction_remove from '../events/message_reaction_remove';
import message_reaction_remove_all from '../events/message_reaction_remove_all';
import message_reaction_remove_emoji from '../events/message_reaction_remove_emoji';
import message_update from '../events/message_update';
import presence_update from '../events/presence_update';
import stage_instance_create from '../events/stage_instance_create';
import stage_instance_delete from '../events/stage_instance_delete';
import stage_instance_update from '../events/stage_instance_update';
import ready from '../events/ready';
import resumed from '../events/resumed';
import thread_create from '../events/thread_create';
import thread_delete from '../events/thread_delete';
import thread_list_sync from '../events/thread_list_sync';
import thread_members_update from '../events/thread_members_update';
import thread_member_update from '../events/thread_member_update';
import thread_update from '../events/thread_update';
import typing_start from '../events/typing_start';
import user_update from '../events/user_update';
import voice_server_update from '../events/voice_server_update';
import voice_state_update from '../events/voice_state_update';
import webhooks_update from '../events/webhooks_update';

export default class EventManager {
    bot: Bot;
    application_command_create: application_command_create;
    application_command_delete: application_command_delete;
    application_command_update: application_command_update;
    channel_create: channel_create;
    channel_delete: channel_delete;
    channel_pins_update: channel_pins_update;
    channel_update: channel_update;
    guild_ban_add: guild_ban_add;
    guild_ban_remove: guild_ban_remove;
    guild_create: guild_create;
    guild_delete: guild_delete;
    guild_emojis_update: guild_emojis_update;
    guild_integrations_update: guild_integrations_update;
    guild_member_add: guild_member_add;
    guild_member_remove: guild_member_remove;
    guild_members_chunk: guild_members_chunk;
    guild_member_update: guild_member_update;
    guild_role_create: guild_role_create;
    guild_role_delete: guild_role_delete;
    guild_role_update: guild_role_update;
    guild_stickers_update: guild_stickers_update;
    guild_update: guild_update;
    integration_create: integration_create;
    integration_delete: integration_delete;
    integration_update: integration_update;
    interaction_create: interaction_create;
    invite_create: invite_create;
    invite_delete: invite_delete;
    message_create: message_create;
    message_delete: message_delete;
    message_delete_bulk: message_delete_bulk;
    message_reaction_add: message_reaction_add;
    message_reaction_remove: message_reaction_remove;
    message_reaction_remove_all: message_reaction_remove_all;
    message_reaction_remove_emoji: message_reaction_remove_emoji;
    message_update: message_update;
    presence_update: presence_update;
    stage_instance_create: stage_instance_create;
    stage_instance_delete: stage_instance_delete;
    stage_instance_update: stage_instance_update;
    ready: ready;
    resumed: resumed;
    thread_create: thread_create;
    thread_delete: thread_delete;
    thread_list_sync: thread_list_sync;
    thread_members_update: thread_members_update;
    thread_member_update: thread_member_update;
    thread_update: thread_update;
    typing_start: typing_start;
    user_update: user_update;
    voice_server_update: voice_server_update;
    voice_state_update: voice_state_update;
    webhooks_update: webhooks_update;

    constructor(bot: Bot) {
        this.bot = bot;
        this.application_command_create = new application_command_create(this.bot);
        this.application_command_delete = new application_command_delete(this.bot);
        this.application_command_update = new application_command_update(this.bot);
        this.channel_create = new channel_create(this.bot);
        this.channel_delete = new channel_delete(this.bot);
        this.channel_pins_update = new channel_pins_update(this.bot);
        this.channel_update = new channel_update(this.bot);
        this.guild_ban_add = new guild_ban_add(this.bot);
        this.guild_ban_remove = new guild_ban_remove(this.bot);
        this.guild_create = new guild_create(this.bot);
        this.guild_delete = new guild_delete(this.bot);
        this.guild_emojis_update = new guild_emojis_update(this.bot);
        this.guild_integrations_update = new guild_integrations_update(this.bot);
        this.guild_member_add = new guild_member_add(this.bot);
        this.guild_member_remove = new guild_member_remove(this.bot);
        this.guild_members_chunk = new guild_members_chunk(this.bot);
        this.guild_member_update = new guild_member_update(this.bot);
        this.guild_role_create = new guild_role_create(this.bot);
        this.guild_role_delete = new guild_role_delete(this.bot);
        this.guild_role_update = new guild_role_update(this.bot);
        this.guild_stickers_update = new guild_stickers_update(this.bot);
        this.guild_update = new guild_update(this.bot);
        this.integration_create = new integration_create(this.bot);
        this.integration_delete = new integration_delete(this.bot);
        this.integration_update = new integration_update(this.bot);
        this.interaction_create = new interaction_create(this.bot);
        this.invite_create = new invite_create(this.bot);
        this.invite_delete = new invite_delete(this.bot);
        this.message_create = new message_create(this.bot);
        this.message_delete = new message_delete(this.bot);
        this.message_delete_bulk = new message_delete_bulk(this.bot);
        this.message_reaction_add = new message_reaction_add(this.bot);
        this.message_reaction_remove = new message_reaction_remove(this.bot);
        this.message_reaction_remove_all = new message_reaction_remove_all(this.bot);
        this.message_reaction_remove_emoji = new message_reaction_remove_emoji(this.bot);
        this.message_update = new message_update(this.bot);
        this.presence_update = new presence_update(this.bot);
        this.stage_instance_create = new stage_instance_create(this.bot);
        this.stage_instance_delete = new stage_instance_delete(this.bot);
        this.stage_instance_update = new stage_instance_update(this.bot);
        this.ready = new ready(this.bot);
        this.resumed = new resumed(this.bot);
        this.thread_create = new thread_create(this.bot);
        this.thread_delete = new thread_delete(this.bot);
        this.thread_list_sync = new thread_list_sync(this.bot);
        this.thread_members_update = new thread_members_update(this.bot);
        this.thread_member_update = new thread_member_update(this.bot);
        this.thread_update = new thread_update(this.bot);
        this.typing_start = new typing_start(this.bot);
        this.user_update = new user_update(this.bot);
        this.voice_server_update = new voice_server_update(this.bot);
        this.voice_state_update = new voice_state_update(this.bot);
        this.webhooks_update = new webhooks_update(this.bot);
    }

    handleEvent(eventHandler: EventHandler, eventData: gatewayTypes.EventData, requireReadyState = true) {
        if (requireReadyState && this.bot.state !== CLIENT_STATE.ALIVE) {
            this.bot.logger.debug(eventHandler.name, 'skipped due to client not ready');
            return null;
        }
        this.bot.logger.debug(eventHandler.name, eventData);
        // TODO: handle caching here?
        return eventHandler.handler(eventData);
    }

    addAllListeners() {
        for (const eventName of events) { // add all events
            const lowercaseEventName = eventName.toLowerCase() as gatewayTypes.LowercaseEventName;
            const requireReadyState = !NON_WAITING_EVENTS.includes(eventName);
            this.bot.on(eventName, (eventData: gatewayTypes.EventData) => this.handleEvent(this[lowercaseEventName], eventData, requireReadyState))
        }
    }
}