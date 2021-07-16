import fs from 'fs';
import path from 'path';

export default class Client {
    utils: Record<string, any>;

    constructor() {
        this.loadUtils();
    }

    loadUtils() {
        this.utils = {};
        // load and validate utils
        const utilFiles = fs.readdirSync('./utils');
        for (const i in utilFiles) {
            if (!utilFiles[i].endsWith('.ts')) continue;
            let utilFile;
            const eName = utilFiles[i].replace(/\.ts$/, '');
            try {
                utilFile = require(path.join(__dirname, 'utils', eName));
                this.utils[eName] = utilFile;
            }
            catch (err) {
                console.error(`Failed to load util ${utilFiles[i]}: ${err}\n${err.stack}`);
            }
        }
    }
}