import * as dotenv from "dotenv";
import Bot from "./structures/bot";

dotenv.config();

// TODO: process cli arguments
process.env.TOKEN = process.env.TOKEN_PRODUCTION;

const bot = new Bot();