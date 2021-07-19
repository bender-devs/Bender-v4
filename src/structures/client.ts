import { EventEmitter } from 'stream';
import * as types from './types';

export default class Client extends EventEmitter {

    constructor() {
        super();
        this.removeAllListeners();
    }

    connect(options: types.ClientConnectionOptions) {
        
    }
}