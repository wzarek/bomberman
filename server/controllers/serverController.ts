import session from 'express-session'
import Redis from 'ioredis'
import connectRedis from 'connect-redis'
import * as path from 'path'

import { Request, Response } from "express";
import { Session } from 'express-session'

require('dotenv').config({ path: path.join(__dirname, '../.env') })

const expire: number = parseInt(process.env.COOKIE_MAX_AGE as string)

declare module 'express-session' {
    export interface SessionData {
        user: { [key: string]: any }
    }
}

declare module "http" {
    export interface IncomingMessage {
        cookieHolder?: string,
        session: Session & {
            user: { [key: string]: any }
        }
    }
}

const redisClient = new Redis(17218, 'redis-17218.c135.eu-central-1-1.ec2.cloud.redislabs.com', { password: '0rsCU0n98ZftpbfaM7bqDawLixaoJiGI', username: 'default' })
const RedisStore = connectRedis(session)

const sessionMiddleware = session({
    name: 'sid',
    secret: process.env.COOKIE_SECRET ?? 'my-secret',
    store: new RedisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.ENVIRONMENT === 'production',
        httpOnly: true,
        maxAge: expire,
        sameSite: process.env.ENVIRONMENT === 'production' ? 'none' : 'lax'
    }
})

const corsConfig = {
    allowRequest: (req: any, callback: any) => {
        const fakeRes = {
            getHeader() {
                return [];
            },
            setHeader(key: string, values: string[]) {
                req.cookieHolder = values[0];
            },
            writeHead() { },
        };
        sessionMiddleware(req as Request, fakeRes as unknown as Response, () => {
            if (req.session) {
                fakeRes.writeHead();
                req.session.save();
            }
            callback(null, true);
        });
    },
    cors: {
        origin: ['http://localhost:*', 'https://bomberman.wzarek.me:*'],
        credentials: true
    },
}

export { sessionMiddleware, corsConfig }