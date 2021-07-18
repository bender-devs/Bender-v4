import * as CONSTANTS from '../data/constants.json';
import * as superagent from 'superagent';
import Client from './client';
import * as types from '../data/customTypes';

export default class APIWrapper {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    static reformatResponse(response_data: superagent.Response) {
        return response_data;
    }

    static async makeRequest(method: string, path: string, options: types.RequestOptions): types.RequestResponse {
        path = CONSTANTS.API_BASE + path;
        const request = superagent(method.toLowerCase(), path);
        if (options.data)
            request.send(options.data);
        if (options.headers)
            request.set(options.headers);
        if (options.query)
            request.query(options.query);
        return request.retry(options.retries || 3).timeout({
            response: options.responseTimeout || 60000,
            deadline: options.deadlineTimeout || 120000
        }).then(APIWrapper.reformatResponse, (err: Error) => {
            console.error(err);
            // TODO: handle error properly
            return err;
        });
    }

    guild = {
        async fetch(guild_id: string, with_counts = true): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}`, { 
                query: { with_counts },
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async fetchMembers(guild_id: string, limit = 1000, after?: string | undefined): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/members`, { 
                query: { after, limit },
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async fetchBans(guild_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/bans`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async ban(guild_id: string, user_id: string, ban_data: types.BanData): types.RequestResponse {
            return APIWrapper.makeRequest('PUT', `/guilds/${guild_id}/bans/${user_id}`, { 
                data: ban_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async unban(guild_id: string, user_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/bans/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async update(guild_id: string, guild_data: types.Guild): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}`, { 
                data: guild_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        }
    }

    static role = {
        async create(guild_id: string, role_data: types.Role): types.RequestResponse {
            return APIWrapper.makeRequest('POST', `/guilds/${guild_id}/roles`, {
                data: role_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async update(guild_id: string, role_id: string, role_data: types.Role): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}/roles/${role_id}`, {
                data: role_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async delete(guild_id: string, role_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/roles/${role_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
    }

    static member = {
        async fetch(guild_id: string, user_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/members/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async addRole(guild_id: string, user_id: string, role_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('PUT', `/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async removeRole(guild_id: string, user_id: string, role_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async setRoles(guild_id: string, user_id: string, role_id_array: Array<string>): types.RequestResponse {
            return this.update(guild_id, user_id, { 
                data: { roles: role_id_array },
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async update(guild_id: string, user_id: string, member_data: types.Member): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}/members/${user_id}`, { 
                data: member_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async kick(guild_id: string, user_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/members/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        }
    }

    static emoji = {
        async list(guild_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/emojis`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async fetch(guild_id: string, emoji_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/emojis/${emoji_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async create(guild_id: string, emoji_data: types.EmojiData): types.RequestResponse {
            return APIWrapper.makeRequest('POST', `/guilds/${guild_id}/emojis/`, {
                data: emoji_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
    }

    static user = {
        async fetch(user_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/users/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async send(user_id: string, message_data: types.Message): types.RequestResponse {
            // TODO: check channel cache for DM with this user
            // if not create it as below
            await APIWrapper.makeRequest('POST', `/users/@me/channels`, {
                data: { recipient_id: user_id },
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
            // handle the error or collect the channel ID above
            const channelID = '';
            return APIWrapper.channel.send(channelID, message_data);
        },
        async modifySelf(user_data: types.User): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/users/@me`, { 
                data: user_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
    }

    static channel = {
        async fetch(channel_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/channels/${channel_id}`, { 
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async send(channel_id: string, message: types.Message): types.RequestResponse {
            return APIWrapper.makeRequest('POST', `/channels/${channel_id}/messages`, {
                data: message,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async edit(channel_id: string, channel_data: types.Channel): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/channels/${channel_id}`, {
                data: channel_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async delete(channel_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async setOverwrite(channel_id: string, overwrite_id: string, overwrite_data: types.PermissionOverwrites): types.RequestResponse {
            return APIWrapper.makeRequest('PUT', `/channels/${channel_id}/permissions/${overwrite_id}`, {
                data: overwrite_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async deleteOverwrite(channel_id: string, overwrite_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}/permissions/${overwrite_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
    }

    static message = {
        async fetchMany(channel_id: string, fetch_data: types.MessageFetchOptions): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/channels/${channel_id}`, {
                query: fetch_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async fetch(channel_id: string, message_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/channels/${channel_id}/messages/${message_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async edit(channel_id: string, message_id: string, message_data: types.Message): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/channels/${channel_id}/messages/${message_id}`, {
                data: message_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async delete(channel_id: string, message_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}/messages/${message_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async deleteMany(channel_id: string, message_ids: Array<string>): types.RequestResponse {
            return APIWrapper.makeRequest('POST', `/channels/${channel_id}/messages/bulk-delete`, {
                data: { messages: message_ids },
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
    }

    static reaction = {
        async add(channel_id: string, message_id: string, emoji_identifier: string): types.RequestResponse {
            return APIWrapper.makeRequest('PUT', `/channels/${channel_id}/messages/${message_id}/reactions/${emoji_identifier}/@me`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async removeSelf(channel_id: string, message_id: string, emoji_identifier: string): types.RequestResponse {
            return this.remove(channel_id, message_id, emoji_identifier, '@me');
        },
        async remove(channel_id: string, message_id: string, emoji_identifier: string, user_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}/messages/${message_id}/reactions/${emoji_identifier}/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async listUsers(channel_id: string, message_id: string, emoji_identifier: string, fetch_data: types.ReactionFetchOptions): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/channels/${channel_id}/messages/${message_id}/reactions/${emoji_identifier}`, {
                query: fetch_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async removeEmoji(channel_id: string, message_id: string, emoji_identifier: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}/messages/${message_id}/reactions/${emoji_identifier}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async removeAll(channel_id: string, message_id: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}/messages/${message_id}/reactions`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        }
    }

    static async fetchRegions(): types.RequestResponse {
        return APIWrapper.makeRequest('GET', `/voice/regions`, {
            headers: { authorization: `Bot ${process.env.TOKEN}` }
        });
    }
}