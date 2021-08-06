import { EventEmitter } from 'stream';
import * as types from './types';
import APIInterface from './apiInterface';

export default class Bot extends EventEmitter {
    api: APIInterface;
    user!: types.User;

    constructor() {
        super();
        this.removeAllListeners();
        this.api = new APIInterface(this);
    }

    connect(options: types.ClientConnectionOptions) {
        
    }
}