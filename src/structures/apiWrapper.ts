import * as CONSTANTS from '../data/constants.json';
import * as superagent from 'superagent';
import Client from './client';

export default class APIWrapper {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    static reformatResponse(response_data: Record<string, any>) {
        return response_data;
    }

    static makeRequest(method: string, path: string, options: Record<string, any>): Record<string, any> {
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
        });
    }

    guild = {
        fetchMembers(guild_id: string, after: string, limit = 1000) {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/members`, { 
                query: { after, limit },
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        fetchAllMembers(guild_id: string) {
            // TODO: call fetchMembers in a loop to get all guild members
        },
        fetchBans(guild_id: string) {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/bans`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        ban(guild_id: string, user_id: string, ban_data: Record<string, string | number>) {
            return APIWrapper.makeRequest('PUT', `/guilds/${guild_id}/bans/${user_id}`, { 
                data: ban_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        unban(guild_id: string, user_id: string) {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/bans/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        update(guild_id: string, guild_data: Record<string, any>) {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}`, { 
                data: guild_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        }
    }

    static role = {
        create(guild_id: string, role_data: Record<string, any>) {
            return APIWrapper.makeRequest('POST', `/guilds/${guild_id}/roles`, {
                data: role_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        update(guild_id: string, role_id: string, role_data: Record<string, any>) {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}/roles/${role_id}`, {
                data: role_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        delete(guild_id: string, role_id: string) {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/roles/${role_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
    }

    static member = {
        fetch(guild_id: string, user_id: string) {
            return APIWrapper.makeRequest('GET', `/guilds/${guild_id}/members/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        addRole(guild_id: string, user_id: string, role_id: string) {
            return APIWrapper.makeRequest('PUT', `/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        removeRole(guild_id: string, user_id: string, role_id: string) {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        setRoles(guild_id: string, user_id: string, role_id_array: Array<string>) {
            return this.update(guild_id, user_id, { 
                data: { roles: role_id_array },
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        update(guild_id: string, user_id: string, member_data: Record<string, any>) {
            return APIWrapper.makeRequest('PATCH', `/guilds/${guild_id}/members/${user_id}`, { 
                data: member_data,
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        },
        kick(guild_id: string, user_id: string) {
            return APIWrapper.makeRequest('DELETE', `/guilds/${guild_id}/members/${user_id}`, {
                headers: { authorization: `Bot ${process.env.TOKEN}` }
            });
        }
    }

    static user = {
        fetch(user_id: string) {

        },
        send(user_id: string, message_data: Record<string, any>) {

        }
    }
}