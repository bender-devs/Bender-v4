import * as CONSTANTS from '../data/constants';
import superagent from 'superagent';
import Client from './client';

export default class APIWrapper {
    client: Client;

    constructor(client) {
        this.client = client;
    }
    static reformatResponse(response_data) {
        return response_data;
    }
    makeRequest(method, path, options) {
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
        }).then(APIWrapper.reformatResponse, err => {
            console.error(err);
        });
    }
    static guild = {
        fetchMembers(guild_id, after, limit = 1000) {
            return this.makeRequest('GET', `/guilds/${guild_id}/members`, { query: { after, limit } });
        },
        fetchAllMembers(guild_id) {

        },
        fetchBans(guild_id) {
            return this.makeRequest('GET', `/guilds/${guild_id}/bans`);
        },
        ban(guild_id, user_id, ban_data) {
            return this.makeRequest('PUT', `/guilds/${guild_id}/bans/${user_id}`, { data: ban_data });
        },
        unban(guild_id, user_id) {
            return this.makeRequest('DELETE', `/guilds/${guild_id}/bans/${user_id}`);
        },
        update(guild_id, guild_data) {
            return this.makeRequest('PATCH', `/guilds/${guild_id}`, { data: guild_data });
        }
    }
    static role = {
        create(guild_id, role_data) {
            return this.makeRequest('POST', `/guilds/${guild_id}/roles`, role_data);
        },
        update(guild_id, role_id, role_data) {
            return this.makeRequest('PATCH', `/guilds/${guild_id}/roles/${role_id}`, role_data);
        },
        delete(guild_id, role_id) {
            return this.makeRequest('DELETE', `/guilds/${guild_id}/roles/${role_id}`);
        },
    }
    static member = {
        fetch(guild_id, user_id) {
            return this.makeRequest('GET', `/guilds/${guild_id}/members/${user_id}`);
        },
        addRole(guild_id, user_id, role_id) {
            return this.makeRequest('PUT', `/guilds/${guild_id}/members/${user_id}/roles/${role_id}`,);
        },
        removeRole(guild_id, user_id, role_id) {
            return this.makeRequest('DELETE', `/guilds/${guild_id}/members/${user_id}/roles/${role_id}`,);
        },
        setRoles(guild_id, user_id, role_id_array) {
            return this.member.update(guild_id, user_id, { roles: role_id_array })
        },
        update(guild_id, user_id, member_data) {
            return this.makeRequest('PATCH', `/guilds/${guild_id}/members/${user_id}`, member_data);
        },
        kick(guild_id, user_id) {
            return this.makeRequest('DELETE', `/guilds/${guild_id}/members/${user_id}`);
        }
    }
    static user = {
        fetch(user_id) {

        },
        send(user_id, message_data) {

        }
    }
}