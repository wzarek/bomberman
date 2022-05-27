import { Server } from 'socket.io'
import { IncomingMessage } from "http";

import { getRooms } from './controllers/roomController'

const ioServer = (httpServer: any, corsConfig: object) => {
    const io = new Server(httpServer, corsConfig)

    io.engine.on("initial_headers", (headers: { [key: string]: string }, req: IncomingMessage) => {
        if (req.cookieHolder) {
            headers["set-cookie"] = req.cookieHolder;
            delete req.cookieHolder;
        }
    });

    io.on("connection", (socket) => {
        socket.on('connect', () => {
            console.log(`Socket: ${socket.id}}`)
        })

        socket.on('custom-message', (message: string) => {
            console.log(message)
        })

        socket.on('get-rooms', () => {

        })

        socket.on('get-users-in-room', () => {
            
        })

        socket.on('create-room', () => {
            
        })

        socket.on('join-room', () => {
            
        })

        socket.on('disconnect', () => {
            console.log(`Socket disconnect: ${socket.id}`)
            socket.removeAllListeners()
        })

    })

    return io
}

export { ioServer }