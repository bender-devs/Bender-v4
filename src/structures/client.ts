import { EventEmitter } from 'stream';
import * as types from '../data/customTypes';

export default class Client extends EventEmitter {

    constructor() {
        super();
        this.removeAllListeners();
    }

    connect(options: types.ClientConnectionOptions) {
        
    }
}