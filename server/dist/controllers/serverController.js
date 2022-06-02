"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = exports.sessionMiddleware = void 0;
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const path = __importStar(require("path"));
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const expire = parseInt(process.env.COOKIE_MAX_AGE);
const redisClient = new ioredis_1.default(17218, 'redis-17218.c135.eu-central-1-1.ec2.cloud.redislabs.com', { password: '0rsCU0n98ZftpbfaM7bqDawLixaoJiGI', username: 'default' });
const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
const sessionMiddleware = (0, express_session_1.default)({
    name: 'sid',
    secret: (_a = process.env.COOKIE_SECRET) !== null && _a !== void 0 ? _a : 'my-secret',
    store: new RedisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.ENVIRONMENT === 'production',
        httpOnly: true,
        maxAge: expire,
        sameSite: process.env.ENVIRONMENT === 'production' ? 'none' : 'lax'
    }
});
exports.sessionMiddleware = sessionMiddleware;
const corsConfig = {
    allowRequest: (req, callback) => {
        const fakeRes = {
            getHeader() {
                return [];
            },
            setHeader(key, values) {
                req.cookieHolder = values[0];
            },
            writeHead() { },
        };
        sessionMiddleware(req, fakeRes, () => {
            if (req.session) {
                fakeRes.writeHead();
                req.session.save();
            }
            callback(null, true);
        });
    },
    cors: {
        origin: ['*'],
        credentials: true
    },
};
exports.corsConfig = corsConfig;
