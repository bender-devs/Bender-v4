import * as superagent from 'superagent';

export type RequestOptions = {
    data?: Record<string, unknown>;
    headers?: Record<string, string>;
    query?: Record<string, string | number | null | undefined>;
    retries?: number;
    responseTimeout?: number;
    deadlineTimeout?: number;
};

export type RequestResponse = Promise<superagent.Response | Error>;

export type BanData = {
    reason?: string;
    delete_message_days?: number;
};

export type GuildData = Record<string, any>;

export type RoleData = Record<string, any>;

export type MemberData = Record<string, any>;

export type MessageData = Record<string, any>;