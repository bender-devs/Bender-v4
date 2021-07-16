import { readdirSync } from 'fs';
import { join } from 'path';

export default class Client {
    utils: Record<string, any>;

    constructor() {
        this.utils = this.loadUtils();
    }

    loadUtils(): any {
        this.utils = {};
        // load and validate utils
        const utilFiles = readdirSync('./utils');
        for (const i in utilFiles) {
            if (!utilFiles[i].endsWith('.ts')) continue;
            const eName = utilFiles[i].replace(/\.ts$/, '');

            try {
                const utilFile = require(join(__dirname, 'utils', eName));
                this.utils[eName] = utilFile;
            }
            catch (err) {
                console.error(`Failed to load util ${utilFiles[i]}: ${err}\n${err.stack}`);
            }
        }
    }
}