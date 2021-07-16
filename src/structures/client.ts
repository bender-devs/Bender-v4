import fs from 'fs';
import path from 'path';

export default class Client {
    utils: Record<string, any>;
    events: Record<string, any>;

    constructor() {
        this.utils = this.loadFiles('utils');
        this.events = this.loadFiles('events');
    }

    loadFiles(folderName, extension = 'ts') {
        const fileObj = {};
        const files = fs.readdirSync(`../${folderName}`);
        for (const i in files) {
            if (!files[i].endsWith(extension)) continue;
            let file;
            const extensionRegex = new RegExp(`\\.${extension}$`);
            const nameWithoutExtension = files[i].replace(extensionRegex, '');
            try {
                file = require(path.join(__dirname, 'utils', nameWithoutExtension));
                fileObj[nameWithoutExtension] = file;
            }
            catch (err) {
                console.error(`Failed to load ${folderName} file ${files[i]}: ${err}\n${err.stack}`);
            }
        }
        return fileObj;
    }
}