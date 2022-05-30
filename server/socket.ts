import { Server, Socket } from 'socket.io'
import { IncomingMessage } from "http";

import { getRooms } from './controllers/roomController'
import ServerGameModel from './models/ServerGameModel';

const ioServer = (httpServer: any, corsConfig: object) => {
    const io = new Server(httpServer, corsConfig)

    io.engine.on("initial_headers", (headers: { [key: string]: string }, req: IncomingMessage) => {
        if (req.cookieHolder) {
            headers["set-cookie"] = req.cookieHolder;
            delete req.cookieHolder;
        }
    });

    let matrixMap = new Map() // map for room data (i.e. game matrix)

    io.on("connection", (socket) => {
        let currentRoom: string;
        socket.data.ready = false
        socket.data.lastPosition = null
        socket.data.reconnectTime = null

        // Utworzone zmienne socketowe (socket.data):
        // ready - gotowosc do gry (czy wczytal komponent Game)
        // position - [1, 2, 3, 4] - pozycja gracza (w ktorym rogu ma sie pojawic)
        // lastPosition - ostatnia pozycja gracza
        // reconnectTime - [null, settimeout] - timeout na usuniecie gracza jesli opuscil gre

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
                // TODO - zrobienie to bardziej pod ilosc graczy z lobby, zeby nikt potem nie dolaczyl, a nie na max ilosc, to ustawic w lobby
                socket.emit('max-players-reached')
            } else {
                let playersInRoom = io.sockets.adapter.rooms.get(room) as Set<string>
                let playersArray = Array.from(playersInRoom?.values() || []).map((player) => {
                    if (player != socket.id) {
                        let playerSocket = io.sockets.sockets.get(player)
                        return [player, playerSocket?.data?.position]
                    }
                })
                socket.emit('players-in-room', playersArray)

                socket.data.position = playersInRoom?.size + 1 || 1
                socket.emit('player-position', socket.data.position)

                socket.join(room)
                currentRoom = room
                console.log(`${socket.id} joined room ${room}`)

                if (matrixMap.has(room)) {
                    let gameModel = matrixMap.get(room) as ServerGameModel
                    socket.emit('game-matrix', gameModel.getMatrix())
                } else {
                    let gameModel = new ServerGameModel()
                    matrixMap.set(room, gameModel)
                    socket.emit('game-matrix', gameModel.getMatrix())
                }
            }
        })

        // GAME START

        socket.on('player-ready', (room) => {
            console.log(`${socket.id} is ready`)
            socket.data.ready = true
            socket.to(room).emit('player-joined', socket.id, socket?.data?.position)
            let players = io.sockets.adapter.rooms.get(room);
            let playersCount = players?.size || 0
            if (players) {
                let readyCount = 0
                for (let player of players) {
                    let playerSocket = io.sockets.sockets.get(player)
                    if (playerSocket?.data?.ready == true) readyCount++
                }
                if (readyCount == 1) io.in(room).emit('start-game')
                // TODO - pobieranie ilosci wymaganych graczy z ilosci graczy w roomie(z lobby, z sesji) zamiast sztywnej wartosci
            }
        })

        socket.on('player-disconnect', (room) => {
            socket.to(room).emit('player-left', socket.id)
            // DONE - jesli gra sie rozpoczela, a player wyszedl to usuwamy go z mapy
            // TODO - jesli player sie zreconnectuje(musimy sprawdzic po connect czy gra sie rozpoczela) 
            // to wysylamy mu AKTUALNA pozycje graczy do poprawnego utworzenia PlayerModel
            // ale musimy sprawdzic tez, czy rzeczywiscie jest/byl w tym roomie, bo jak nie to moze tylko ogladac
            // czyli wtedy nie tworzymy modelu z CurrentUser, a kazdy inny obecny w grze(pierwsze X graczy z roomu, gdzie X - ilosc ludzi, ktorzy dolaczyli do gry z Lobby)
        })

        socket.on('player-moved', (position: object) => {
            socket.to(currentRoom).emit('move-player', socket.id, position)
            socket.data.lastPosition = position
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
            let players = io.sockets.adapter.rooms.get(currentRoom);
            if (players?.size == 0 || !players) matrixMap.delete(currentRoom)
            socket.removeAllListeners()
        })

    })

    return io
}

export { ioServer }