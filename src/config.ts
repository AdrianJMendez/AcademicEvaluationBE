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

export const IMAGE_REPO_URL = process.env.IMAGE_REPO_URL!;
export const IMAGE_REPO_PRIVATE_KEY = process.env.IMAGE_REPO_PRIVATE_KEY!;
export const IMAGE_REPO_PUBLIC_KEY = process.env.IMAGE_REPO_PUBLIC_KEY!;

export const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_KEY
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10,
    rateDelta: 1000, 
    rateLimitDelay: 1000
};

export const emailDefaults = {
    from: `"Tu Aplicación" <${process.env.GMAIL_USER || 'tuemail@gmail.com'}>`,
    replyTo: process.env.GMAIL_REPLY_TO || 'soporte@tuaplicacion.com'
};