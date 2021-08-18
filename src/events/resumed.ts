import { ResumeData } from "../data/gatewayTypes";
import { CLIENT_STATE } from "../data/numberTypes";
import Bot from "../structures/bot";

export default function handleReady(this: Bot, event: ResumeData) {
    this.state = CLIENT_STATE.ALIVE;
}