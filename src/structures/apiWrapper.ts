import * as CONSTANTS from '../data/constants.json';
import * as superagent from 'superagent';
import Client from './client';
import * as customTypes from '../data/customTypes';

export default class APIWrapper {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    static reformatResponse(response_data: superagent.Response) {
        return response_data;
    }

    static async makeRequest(method: string, path: string, options: customTypes.RequestOptions): customTypes.RequestResponse {
        path = CONSTANTS.API_BASE + path;
        const request = superagent(method.toLowerCase(), path);
        if (options.data)
            request.send(options.data);
        if (options.headers)
            request.set(options.headers);
        if (options.query)
            request.query(options.query);
        return request.retry(3).timeout({
            response: 60000,
            deadline: 120000
        }).then(APIWrapper.reformatResponse, (err: Error) => {
            console.error(err);
            // TODO: handle error properly
            return err;
        });
    }

    guild = {
        async fetchMembers(guild_id: string, limit = 1000, after?: string | undefined): customTypes.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/members`, { 
                query: { after, limit },
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async fetchAllMembers(guild_id: string): customTypes.RequestResponse {
            // TODO: call fetchMembers in a loop to get all guild members
            return this.fetchMembers(guild_id, 1000);
        },
        async fetchBans(guild_id: string): customTypes.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/bans`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async ban(guild_id: string, user_id: string, ban_data: customTypes.BanData): customTypes.RequestResponse {
            return APIWrapper.makeRequest('PUT', `/guilds/${guild_id}/bans/${user_id}`, { 
                data: ban_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async unban(guild_id: string, user_id: string): customTypes.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/bans/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async update(guild_id: string, guild_data: customTypes.GuildData): customTypes.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}`, { 
                data: guild_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        }
    }

    static role = {
        async create(guild_id: string, role_data: customTypes.RoleData): customTypes.RequestResponse {
            return APIWrapper.makeRequest('POST', `/guilds/${guild_id}/roles`, {
                data: role_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async update(guild_id: string, role_id: string, role_data: customTypes.RoleData): customTypes.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}/roles/${role_id}`, {
                data: role_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async delete(guild_id: string, role_id: string): customTypes.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/roles/${role_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
    }

    static member = {
        async fetch(guild_id: string, user_id: string): customTypes.RequestResponse {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/members/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async addRole(guild_id: string, user_id: string, role_id: string): customTypes.RequestResponse {
            return APIWrapper.makeRequest('PUT', `/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async removeRole(guild_id: string, user_id: string, role_id: string): customTypes.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async setRoles(guild_id: string, user_id: string, role_id_array: Array<string>): customTypes.RequestResponse {
            return this.update(guild_id, user_id, { 
                data: { roles: role_id_array },
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async update(guild_id: string, user_id: string, member_data: customTypes.MemberData): customTypes.RequestResponse {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}/members/${user_id}`, { 
                data: member_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async kick(guild_id: string, user_id: string): customTypes.RequestResponse {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/members/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        }
    }

    static user = {
        async fetch(user_id: string): customTypes.RequestResponse {
            return APIWrapper.makeRequest('GET', `/users/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        async send(user_id: string, message_data: customTypes.MessageData): customTypes.RequestResponse {
            // TODO: check channel cache for DM with this user
            // if not create it as below
            await APIWrapper.makeRequest('POST', `/users/@me/channels`, {
                data: { recipient_id: user_id },
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
            // handle the error or collect the channel ID above
            const channelID = '';
            return APIWrapper.channel.send(channelID, message_data);
        }
    }

    static channel = {
        async send(channel_id: string, message: customTypes.MessageData): customTypes.RequestResponse {
            return APIWrapper.makeRequest('POST', `/channels/${channel_id}/messages`, {
                data: message,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        }
    }
}