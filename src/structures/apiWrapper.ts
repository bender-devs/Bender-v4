import * as CONSTANTS from '../data/constants.json';
import * as superagent from 'superagent';
//import Client from './client';
import * as types from '../data/customTypes';

const AUTH_HEADER: types.RequestHeaders = { authorization: `Bot ${process.env.TOKEN}` };

export default class APIWrapper {
    /*client: Client;

    constructor(client: Client) {
        this.client = client;
    }*/

    static reformatResponse(response_data: superagent.Response) {
        return response_data;
    }

    static addReasonHeader(headers: types.RequestHeaders, reason?: string): types.RequestHeaders {
        if (reason) {
            headers['X-Audit-Log-Reason'] = reason;
        }
        return headers;
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

    static guild = {
        async fetch(guild_id: types.Snowflake, with_counts = true): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}`, { 
                query: { with_counts },
                headers: AUTH_HEADER
            });
        },
        async edit(guild_id: types.Snowflake, guild_data: types.Guild, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}`, { 
                data: guild_data,
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async fetchPruneCount(guild_id: types.Snowflake, prune_count_data: types.PruneCountData): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/prune`, { 
                query: prune_count_data,
                headers: AUTH_HEADER
            });
        },
        async prune(guild_id: types.Snowflake, prune_data: types.PruneData, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/prune`, { 
                query: prune_data,
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        }
    }

    static ban = {
        async fetch(guild_id: types.Snowflake, user_id: types.Snowflake): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/bans/${user_id}`, { 
                headers: AUTH_HEADER
            });
        },
        async list(guild_id: types.Snowflake): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/bans`, { 
                headers: AUTH_HEADER
            });
        },
        async create(guild_id: types.Snowflake, user_id: types.Snowflake, delete_message_days = 0, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('PUT', `/guilds/${guild_id}/bans/${user_id}`, { 
                data: { delete_message_days },
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async delete(guild_id: types.Snowflake, user_id: types.Snowflake, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/bans/${user_id}`, {
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        }
    }

    static role = {
        async create(guild_id: types.Snowflake, role_data: types.Role, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('POST', `/guilds/${guild_id}/roles`, {
                data: role_data,
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async edit(guild_id: types.Snowflake, role_id: types.Snowflake, role_data: types.Role, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}/roles/${role_id}`, {
                data: role_data,
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async delete(guild_id: types.Snowflake, role_id: types.Snowflake, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/roles/${role_id}`, {
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async editPositions(guild_id: types.Snowflake, role_position_data: Array<types.RolePositionData>, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}/roles`, {
                data: role_position_data,
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        }
    }

    static member = {
        async fetch(guild_id: types.Snowflake, user_id: types.Snowflake): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/members/${user_id}`, {
                headers: AUTH_HEADER
            });
        },
        async list(guild_id: types.Snowflake, limit = 1000, after?: types.Snowflake | undefined): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/members`, { 
                query: { after, limit },
                headers: AUTH_HEADER
            });
        },
        async addRole(guild_id: types.Snowflake, user_id: types.Snowflake, role_id: types.Snowflake, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('PUT', `/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, {
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async deleteRole(guild_id: types.Snowflake, user_id: types.Snowflake, role_id: types.Snowflake, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, {
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async setRoles(guild_id: types.Snowflake, user_id: types.Snowflake, role_id_array: Array<types.Snowflake>, reason?: string): types.RequestResponse {
            return this.edit(guild_id, user_id, { roles: role_id_array }, reason);
        },
        async edit(guild_id: types.Snowflake, user_id: types.Snowflake, member_data: types.MemberData, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}/members/${user_id}`, { 
                data: member_data,
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async kick(guild_id: types.Snowflake, user_id: types.Snowflake, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/members/${user_id}`, {
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        }
    }

    static emoji = {
        async list(guild_id: types.Snowflake): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/emojis`, {
                headers: AUTH_HEADER
            });
        },
        async fetch(guild_id: types.Snowflake, emoji_id: types.Snowflake): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/emojis/${emoji_id}`, {
                headers: AUTH_HEADER
            });
        },
        async create(guild_id: types.Snowflake, emoji_data: types.EmojiData, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('POST', `/guilds/${guild_id}/emojis`, {
                data: emoji_data,
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async edit(guild_id: types.Snowflake, emoji_id: types.Snowflake, emoji_data: types.EmojiEditData, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}/emojis/${emoji_id}`, {
                data: emoji_data,
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
    }

    static user = {
        async fetch(user_id: types.Snowflake): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/users/${user_id}`, {
                headers: AUTH_HEADER
            });
        },
        async send(user_id: types.Snowflake, message_data: types.Message): types.RequestResponse {
            // TODO: check channel cache for DM with this user
            // if not create it as below
            await APIWrapper.makeRequest('POST', `/users/@me/channels`, {
                data: { recipient_id: user_id },
                headers: AUTH_HEADER
            });
            // TODO: handle the error or collect the channel ID above
            const channelID: types.Snowflake = '00000000000000000000';
            return APIWrapper.message.create(channelID, message_data);
        },
        async modifySelf(user_data: types.UserData): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/users/@me`, { 
                data: user_data,
                headers: AUTH_HEADER
            });
        }
    }

    static channel = {
        async fetch(channel_id: types.Snowflake): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/channels/${channel_id}`, { 
                headers: AUTH_HEADER
            });
        },
        async edit(channel_id: types.Snowflake, channel_data: types.ChannelData, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/channels/${channel_id}`, {
                data: channel_data,
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async delete(channel_id: types.Snowflake, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}`, {
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async setOverwrite(channel_id: types.Snowflake, overwrite_id: types.Snowflake, overwrite_data: types.PermissionOverwrites, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('PUT', `/channels/${channel_id}/permissions/${overwrite_id}`, {
                data: overwrite_data,
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async deleteOverwrite(channel_id: types.Snowflake, overwrite_id: types.Snowflake, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}/permissions/${overwrite_id}`, {
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        }
    }

    static message = {
        async fetchMany(channel_id: types.Snowflake, fetch_data: types.MessageFetchData): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/channels/${channel_id}`, {
                query: fetch_data,
                headers: AUTH_HEADER
            });
        },
        async fetch(channel_id: types.Snowflake, message_id: types.Snowflake): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/channels/${channel_id}/messages/${message_id}`, {
                headers: AUTH_HEADER
            });
        },
        async create(channel_id: types.Snowflake, message: types.Message): types.RequestResponse {
            return APIWrapper.makeRequest('POST', `/channels/${channel_id}/messages`, {
                data: message,
                headers: AUTH_HEADER
            });
        },
        async edit(channel_id: types.Snowflake, message_id: types.Snowflake, message_data: types.Message): types.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/channels/${channel_id}/messages/${message_id}`, {
                data: message_data,
                headers: AUTH_HEADER
            });
        },
        async delete(channel_id: types.Snowflake, message_id: types.Snowflake, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}/messages/${message_id}`, {
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async deleteMany(channel_id: types.Snowflake, message_ids: Array<types.Snowflake>, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('POST', `/channels/${channel_id}/messages/bulk-delete`, {
                data: { messages: message_ids },
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        }
    }

    static reaction = {
        async create(channel_id: types.Snowflake, message_id: types.Snowflake, emoji_identifier: string): types.RequestResponse {
            return APIWrapper.makeRequest('PUT', `/channels/${channel_id}/messages/${message_id}/reactions/${emoji_identifier}/@me`, {
                headers: AUTH_HEADER
            });
        },
        async listUsers(channel_id: types.Snowflake, message_id: types.Snowflake, emoji_identifier: string, fetch_data: types.ReactionFetchData): types.RequestResponse {
            return APIWrapper.makeRequest('GET', `/channels/${channel_id}/messages/${message_id}/reactions/${emoji_identifier}`, {
                query: fetch_data,
                headers: AUTH_HEADER
            });
        },
        async deleteSelf(channel_id: types.Snowflake, message_id: types.Snowflake, emoji_identifier: string, reason?: string): types.RequestResponse {
            return this.delete(channel_id, message_id, emoji_identifier, '@me', reason);
        },
        async delete(channel_id: types.Snowflake, message_id: types.Snowflake, emoji_identifier: string, user_id: types.Snowflake, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}/messages/${message_id}/reactions/${emoji_identifier}/${user_id}`, {
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async deleteEmoji(channel_id: types.Snowflake, message_id: types.Snowflake, emoji_identifier: string, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}/messages/${message_id}/reactions/${emoji_identifier}`, {
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        },
        async deleteAll(channel_id: types.Snowflake, message_id: types.Snowflake, reason?: string): types.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/channels/${channel_id}/messages/${message_id}/reactions`, {
                headers: APIWrapper.addReasonHeader(AUTH_HEADER, reason)
            });
        }
    }

    static async fetchRegions(): types.RequestResponse {
        return APIWrapper.makeRequest('GET', `/voice/regions`, {
            headers: AUTH_HEADER
        });
    }
}