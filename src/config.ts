import dotenv from 'dotenv';
import { StringValue } from 'ms';
dotenv.config();

export const config = {
    DB_USER : process.env.DB_USER!,
    DB_PASSWORD : process.env.DB_PASSWORD!,
    DB_SERVER: process.env.DB_SERVER!,
    DB_INSTANCE: process.env.DB_INSTANCE || '',
    DB_NAME : process.env.DB_NAME!
};

export const SECRET_KEY = process.env.SECRET_KEY!;
export const TIME_OUT = process.env.TIME_OUT! as StringValue;