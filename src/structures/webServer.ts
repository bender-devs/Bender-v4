import ShardManager from '../utils/shardManager';
import * as express from 'express';
import Logger from './logger';
import { WEBSERVER_PORT, PUBLIC_KEY } from '../data/constants';
import * as nacl from 'tweetnacl';

export default class WebServer {
    shardManager: ShardManager
    app: express.Application;
    logger: Logger;
    initialized = false;

    constructor(shardManager: ShardManager) {
        this.shardManager = shardManager;
        this.logger = new Logger();
        this.app = express();
    }

    init() {
        this.app.post('/receive_interaction', (req: express.Request, res: express.Response) => {
            if (!this.validateHeaders(req)) {
                this.logger.debug('webServer POST /receive_interaction - INVALID REQUEST', req);
                return res.status(401).send('Invalid interaction.');
            }
            return this.shardManager.dispatchInteraction(req.body).then(response => res.status(200).send(response));
        });

        this.app.get('/shard_stats', (req: express.Request, res: express.Response) => {
            return this.shardManager.getStats(req.body?.shards || 'ALL').then(values => res.status(200).send(values)).catch(err => {
                this.logger.handleError('webServer GET /shard_stats', err);
                return res.status(500).send(err);
            });
        })

        this.app.listen(WEBSERVER_PORT, () => {
            this.logger.debug(`Bot webserver listening on port ${WEBSERVER_PORT}`);
            this.initialized = true;
        })
    }

    // https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization
    validateHeaders(request: express.Request) {
        const signature = request.get('X-Signature-Ed25519');
        const timestamp = request.get('X-Signature-Timestamp');
        let body = '';
        try {
            body = JSON.stringify(request.body);
        } catch(err) {
            this.logger.handleError('webServer validateHeaders', err);
        }

        if (!signature || !timestamp || !body) {
            return false;
        }

        return nacl.sign.detached.verify(
            Buffer.from(timestamp + body),
            Buffer.from(signature, 'hex'),
            Buffer.from(PUBLIC_KEY, 'hex')
        );
    }
}