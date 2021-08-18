import { ReadyData } from "../data/gatewayTypes";
import { CLIENT_STATE } from "../data/numberTypes";
import Bot from "../structures/bot";

export default function handleReady(this: Bot, event: ReadyData) {
    this.state = CLIENT_STATE.ALIVE;
}