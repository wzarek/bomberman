import { Server, Socket } from 'socket.io'
import { IncomingMessage } from "http"

import ServerGameModel from './models/ServerGameModel'
import Room from './controllers/roomController'

const ioServer = (httpServer: any, corsConfig: object) => {
    const io = new Server(httpServer, corsConfig)

    io.engine.on("initial_headers", (headers: { [key: string]: string }, req: IncomingMessage) => {
        if (req.cookieHolder) {
            headers["set-cookie"] = req.cookieHolder
            delete req.cookieHolder
        }
    })

    let matrixMap = new Map() // map for room data (i.e. game matrix)
    let listOfRooms: Array<Room> = []

    io.on("connection", (socket) => {
        let currentRoom: string;
        socket.data.ready = false
        socket.data.lastPosition = null
        socket.data.reconnectTime = null
        socket.data.dead = false
        socket.data.inGame = false

        // Utworzone zmienne socketowe (socket.data):
        // ready - gotowosc do gry (czy wczytal komponent Game)
        // position - [1, 2, 3, 4] - pozycja gracza (w ktorym rogu ma sie pojawic)
        // lastPosition - ostatnia pozycja gracza
        // reconnectTime - [null, settimeout] - timeout na usuniecie gracza jesli opuscil gre
        // dead - czy player zyje
        // inGame - czy to player z obecnej gry

        socket.on('connect', () => {
            console.log(`Socket: ${socket.id}}`)
        })

        socket.on('custom-message', (message: string) => {
            console.log(message)
        })

        socket.on('create-room-status', (name: string, gameParameters: { [key: string]: string | number }) => {
            const isExisting = listOfRooms.find(r => r.getName() === name ? true : false)

            if (isExisting) return socket.emit('send-information', { status: 'ERROR', error: 'That room already exists' })

            const room = new Room(name, socket.request.session.user.username, gameParameters)
            listOfRooms.push(room)

            return socket.emit('send-information', { status: 'OK', message: 'Successfully created room' })
        })

        socket.on('join-room-status', (name: string) => {
            const isExisting = listOfRooms.find(r => r.getName() === name ? true : false)

            if (!isExisting) return socket.emit('send-information', { status: 'ERROR', error: 'Cannot join room that does not exist' })

            const room = listOfRooms.find(r => r.getName() === name)

            if (room?.getNumberOfPlayers() === 4) return socket.emit('send-information', { status: 'ERROR', error: 'Room is full' })
            if (room?.getInGame()) return socket.emit('send-information', { status: 'ERROR', error: 'The game has already started' })

            return socket.emit('send-information', { status: 'OK', canJoin: true })
        })

        socket.on('test-join-room', (name: string) => {
            socket.join(name)
        })

        socket.on('leave-room', (name: string, socket: Socket) => {
            const room = listOfRooms.find(r => r.getName() === name)
            room?.removePlayer(socket)
            socket.leave(name)

            if (room?.getNumberOfPlayers() === 0) listOfRooms = listOfRooms.filter(r => r.getName() !== name)
        })

        socket.on('join-room', (room) => {
            if (matrixMap.has(`${room}-started`)) {
                socket.emit('cant-join-game')
                socket.data.inGame = false
            }

            let roomSize = io.sockets.adapter.rooms.get(room)?.size || 0

            if (roomSize >= 4) {
                // TODO - zrobienie to bardziej pod ilosc graczy z lobby, zeby nikt potem nie dolaczyl, a nie na max ilosc, to ustawic w lobby
                socket.emit('max-players-reached')
            } else {
                socket.data.inGame = true

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
            if (!socket.data.inGame) return

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
                if (readyCount == 2) {
                    io.in(room).emit('start-game')
                    matrixMap.set(`${room}-started`, true)
                }
                // TODO - pobieranie ilosci wymaganych graczy z ilosci graczy w roomie(z lobby, z sesji) zamiast sztywnej wartosci
            }
        })

        socket.on('player-disconnect', (room) => {
            if (!socket.data.inGame) return

            socket.to(room).emit('player-left', socket.id)
            // DONE - jesli gra sie rozpoczela, a player wyszedl to usuwamy go z mapy
            // TODO - jesli player sie zreconnectuje(musimy sprawdzic po connect czy gra sie rozpoczela) 
            // to wysylamy mu AKTUALNA pozycje graczy do poprawnego utworzenia PlayerModel
            // ale musimy sprawdzic tez, czy rzeczywiscie jest/byl w tym roomie, bo jak nie to moze tylko ogladac
            // czyli wtedy nie tworzymy modelu z CurrentUser, a kazdy inny obecny w grze(pierwsze X graczy z roomu, gdzie X - ilosc ludzi, ktorzy dolaczyli do gry z Lobby)
        })

        socket.on('player-moved', (position: { [name: string]: string }) => {
            if (!socket.data.inGame) return

            socket.to(currentRoom).emit('move-player', socket.id, position)
            socket.data.lastPosition = position
        })

        socket.on('player-bombed', (position: { [name: string]: string }, color: string) => {
            if (!socket.data.inGame) return

            socket.to(currentRoom).emit('spawn-bomb', position, color)
            // TODO - co zrobic, zeby kazdemu zespawnowaly sie te same bonusy?
            // moze do BombModel dodac macierz gry + w macierzy przy dodawaniu elementow nadac im data-matrix="[i,j]" albo cos takiego
            // i dodac w BombModel bool currentPlayer albo handleCollisions - jesli true to ogarniamy na modelu kolizje flames z bonus, po generowaniu bonusu emit z data-matrix i jaki bonus
            console.log(`${socket.id} bombed`)
        })

        socket.on('player-bonus', (index: string, bonus: string) => {
            socket.to(currentRoom).emit('spawn-bonus', index, bonus)
            // TODO - spawn bonusu nie dziala jak jest empty
            // TODO - zbieranie bonusow przez playera, zeby znikaly tez u innych
        })

        socket.on('player-lost-hp', () => {
            if (!socket.data.inGame) return

            socket.to(currentRoom).emit('remove-life', socket.id)
        })

        socket.on('player-dead', () => {
            if (!socket.data.inGame) return

            socket.data.dead = true
            console.log(`${socket.id} is dead`)
            let players = io.sockets.adapter.rooms.get(currentRoom);
            let playersCount = players?.size || 0
            if (players) {
                let deadCount = 0
                let wonId
                for (let player of players) {
                    let playerSocket = io.sockets.sockets.get(player)
                    if (playerSocket?.data?.dead == true) deadCount++
                    else wonId = playerSocket
                }
                if (deadCount === playersCount - 1) {
                    io.in(currentRoom).emit('game-ended', wonId)
                    for (let player of players) {
                        let playerSocket = io.sockets.sockets.get(player)
                        playerSocket?.leave(currentRoom)
                    }

                    matrixMap.delete(currentRoom)
                    matrixMap.delete(`${currentRoom}-started`)
                }
            }
        })

        // GAME END

        socket.on('disconnect', () => {
            console.log(`Socket disconnect: ${socket.id}`)
            if (currentRoom) socket.to(currentRoom).emit('player-left', socket.id)
            let players = io.sockets.adapter.rooms.get(currentRoom);
            if (players?.size == 0 || !players) {
                matrixMap.delete(currentRoom)
                matrixMap.delete(`${currentRoom}-started`)
            }
            socket.removeAllListeners()
        })

    })

    return io
}

export { ioServer }