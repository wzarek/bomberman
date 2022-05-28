import { Server, Socket } from 'socket.io'
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
        let currentRoom: string;
        socket.data.ready = false

        // TODO - generowanie macierzy dla mapy i wyslanie po polaczeniu

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

        socket.on('join-room', (room) => {
            let roomSize = io.sockets.adapter.rooms.get(room)?.size || 0
            if (roomSize >= 4) {
                socket.emit('max-players-reached')
            } else {
                let playersInRoom = io.sockets.adapter.rooms.get(room) as Set<String>
                socket.emit('players-in-room', Array.from(playersInRoom?.values() || []))
                socket.join(room)
                currentRoom = room
                console.log(`${socket.id} joined room ${room}`)
            }
        })

        // GAME START

        socket.on('player-ready', (room) => {
            console.log(`${socket.id} is ready`)
            socket.data.ready = true
            socket.to(room).emit('player-joined', socket.id)
            let players = io.sockets.adapter.rooms.get(room);
            let playersCount = players?.size || 0
            if (players) {
                let readyCount = 0
                for (let player of players) {
                    let playerSocket = io.sockets.sockets.get(player)
                    if (playerSocket?.data?.ready == true) readyCount++
                }
                if (readyCount == 3) io.in(room).emit('start-game')
                // TODO - pobieranie ilosci wymaganych graczy z ilosci graczy w roomie(z lobby, z sesji)
            }
        })

        socket.on('player-disconnect', (room) => {
            socket.to(room).emit('player-left', socket.id)
        })

        socket.on('player-moved', () => {
            console.log(`${socket.id} moved`)
        })

        socket.on('player-bombed', () => {
            console.log(`${socket.id} bombed`)
        })

        socket.on('player-lost-hp', () => {
            console.log(`${socket.id} lost hp`)
        })

        socket.on('player-dead', () => {
            console.log(`${socket.id} is dead`)
        })

        // GAME END

        socket.on('disconnect', () => {
            console.log(`Socket disconnect: ${socket.id}`)
            if (currentRoom) socket.to(currentRoom).emit('player-left', socket.id)
            socket.removeAllListeners()
        })

    })

    return io
}

export { ioServer }