import * as dotenv from "dotenv";
import Client from "./structures/client";

dotenv.config();

// TODO: process cli arguments
process.env.TOKEN = process.env.TOKEN_PRODUCTION;

const client = new Client();