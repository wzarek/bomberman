"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ioServer = void 0;
const socket_io_1 = require("socket.io");
const ServerGameModel_1 = __importDefault(require("./models/ServerGameModel"));
const roomController_1 = __importDefault(require("./controllers/roomController"));
const ioServer = (httpServer, corsConfig) => {
    const io = new socket_io_1.Server(httpServer, corsConfig);
    io.engine.on("initial_headers", (headers, req) => {
        if (req.cookieHolder) {
            headers["set-cookie"] = req.cookieHolder;
            delete req.cookieHolder;
        }
    });
    let matrixMap = new Map(); // map for room data (i.e. game matrix)
    let listOfRooms = [];
    io.on("connection", (socket) => {
        let currentRoom;
        socket.data.ready = false;
        socket.data.lastPosition = null;
        socket.data.reconnectTime = null;
        socket.data.dead = false;
        socket.data.inGame = false;
        // Utworzone zmienne socketowe (socket.data):
        // ready - gotowosc do gry (czy wczytal komponent Game)
        // position - [1, 2, 3, 4] - pozycja gracza (w ktorym rogu ma sie pojawic)
        // lastPosition - ostatnia pozycja gracza
        // reconnectTime - [null, settimeout] - timeout na usuniecie gracza jesli opuscil gre
        // dead - czy player zyje
        // inGame - czy to player z obecnej gry
        socket.on('connect', () => {
            console.log(`Socket: ${socket.id}}`);
        });
        socket.on('custom-message', (message) => {
            console.log(message);
        });
        socket.on('create-room-status', (name, gameParameters) => {
            const isExisting = listOfRooms.find(r => r.getName() === name ? true : false);
            if (isExisting)
                return socket.emit('send-information', { status: 'ERROR', error: 'That room already exists' });
            const room = new roomController_1.default(name, socket.request.session.user.username, gameParameters);
            listOfRooms.push(room);
            return socket.emit('send-information', { status: 'OK', message: 'Successfully created room' });
        });
        socket.on('join-room-status', (name) => {
            const isExisting = listOfRooms.find(r => r.getName() === name ? true : false);
            if (!isExisting)
                return socket.emit('send-information', { status: 'ERROR', error: 'Cannot join room that does not exist' });
            const room = listOfRooms.find(r => r.getName() === name);
            if ((room === null || room === void 0 ? void 0 : room.getNumberOfPlayers()) === 4)
                return socket.emit('send-information', { status: 'ERROR', error: 'Room is full' });
            if (room === null || room === void 0 ? void 0 : room.getInGame())
                return socket.emit('send-information', { status: 'ERROR', error: 'The game has already started' });
            return socket.emit('send-information', { status: 'OK', canJoin: true });
        });
        socket.on('test-join-room', (name) => {
            socket.join(name);
        });
        socket.on('leave-room', (name, socket) => {
            const room = listOfRooms.find(r => r.getName() === name);
            room === null || room === void 0 ? void 0 : room.removePlayer(socket);
            socket.leave(name);
            if ((room === null || room === void 0 ? void 0 : room.getNumberOfPlayers()) === 0)
                listOfRooms = listOfRooms.filter(r => r.getName() !== name);
        });
        socket.on('join-room', (room) => {
            var _a;
            if (matrixMap.has(`${room}-started`)) {
                socket.emit('cant-join-game');
                socket.data.inGame = false;
            }
            let roomSize = ((_a = io.sockets.adapter.rooms.get(room)) === null || _a === void 0 ? void 0 : _a.size) || 0;
            if (roomSize >= 4) {
                // TODO - zrobienie to bardziej pod ilosc graczy z lobby, zeby nikt potem nie dolaczyl, a nie na max ilosc, to ustawic w lobby
                socket.emit('max-players-reached');
            }
            else {
                socket.data.inGame = true;
                let playersInRoom = io.sockets.adapter.rooms.get(room);
                let playersArray = Array.from((playersInRoom === null || playersInRoom === void 0 ? void 0 : playersInRoom.values()) || []).map((player) => {
                    var _a;
                    if (player != socket.id) {
                        let playerSocket = io.sockets.sockets.get(player);
                        return [player, (_a = playerSocket === null || playerSocket === void 0 ? void 0 : playerSocket.data) === null || _a === void 0 ? void 0 : _a.position];
                    }
                });
                socket.emit('players-in-room', playersArray);
                socket.data.position = (playersInRoom === null || playersInRoom === void 0 ? void 0 : playersInRoom.size) + 1 || 1;
                socket.emit('player-position', socket.data.position);
                socket.join(room);
                currentRoom = room;
                console.log(`${socket.id} joined room ${room}`);
                if (matrixMap.has(room)) {
                    let gameModel = matrixMap.get(room);
                    socket.emit('game-matrix', gameModel.getMatrix());
                }
                else {
                    let gameModel = new ServerGameModel_1.default();
                    matrixMap.set(room, gameModel);
                    socket.emit('game-matrix', gameModel.getMatrix());
                }
            }
        });
        // GAME START
        socket.on('player-ready', (room) => {
            var _a, _b;
            if (!socket.data.inGame)
                return;
            console.log(`${socket.id} is ready`);
            socket.data.ready = true;
            socket.to(room).emit('player-joined', socket.id, (_a = socket === null || socket === void 0 ? void 0 : socket.data) === null || _a === void 0 ? void 0 : _a.position);
            let players = io.sockets.adapter.rooms.get(room);
            let playersCount = (players === null || players === void 0 ? void 0 : players.size) || 0;
            if (players) {
                let readyCount = 0;
                for (let player of players) {
                    let playerSocket = io.sockets.sockets.get(player);
                    if (((_b = playerSocket === null || playerSocket === void 0 ? void 0 : playerSocket.data) === null || _b === void 0 ? void 0 : _b.ready) == true)
                        readyCount++;
                }
                if (readyCount == 2) {
                    io.in(room).emit('start-game');
                    matrixMap.set(`${room}-started`, true);
                }
                // TODO - pobieranie ilosci wymaganych graczy z ilosci graczy w roomie(z lobby, z sesji) zamiast sztywnej wartosci
            }
        });
        socket.on('player-disconnect', (room) => {
            if (!socket.data.inGame)
                return;
            socket.to(room).emit('player-left', socket.id);
            // DONE - jesli gra sie rozpoczela, a player wyszedl to usuwamy go z mapy
            // TODO - jesli player sie zreconnectuje(musimy sprawdzic po connect czy gra sie rozpoczela) 
            // to wysylamy mu AKTUALNA pozycje graczy do poprawnego utworzenia PlayerModel
            // ale musimy sprawdzic tez, czy rzeczywiscie jest/byl w tym roomie, bo jak nie to moze tylko ogladac
            // czyli wtedy nie tworzymy modelu z CurrentUser, a kazdy inny obecny w grze(pierwsze X graczy z roomu, gdzie X - ilosc ludzi, ktorzy dolaczyli do gry z Lobby)
        });
        socket.on('player-moved', (position) => {
            if (!socket.data.inGame)
                return;
            socket.to(currentRoom).emit('move-player', socket.id, position);
            socket.data.lastPosition = position;
        });
        socket.on('player-bombed', (position, color) => {
            if (!socket.data.inGame)
                return;
            socket.to(currentRoom).emit('spawn-bomb', position, color);
            // TODO - co zrobic, zeby kazdemu zespawnowaly sie te same bonusy?
            // moze do BombModel dodac macierz gry + w macierzy przy dodawaniu elementow nadac im data-matrix="[i,j]" albo cos takiego
            // i dodac w BombModel bool currentPlayer albo handleCollisions - jesli true to ogarniamy na modelu kolizje flames z bonus, po generowaniu bonusu emit z data-matrix i jaki bonus
            console.log(`${socket.id} bombed`);
        });
        socket.on('player-bonus', (index, bonus) => {
            socket.to(currentRoom).emit('spawn-bonus', index, bonus);
        });
        socket.on('player-got-bonus', (index) => {
            socket.to(currentRoom).emit('remove-bonus', index);
        });
        socket.on('player-lost-hp', () => {
            if (!socket.data.inGame)
                return;
            socket.to(currentRoom).emit('remove-life', socket.id);
        });
        socket.on('player-dead', () => {
            var _a;
            if (!socket.data.inGame)
                return;
            socket.data.dead = true;
            console.log(`${socket.id} is dead`);
            let players = io.sockets.adapter.rooms.get(currentRoom);
            let playersCount = (players === null || players === void 0 ? void 0 : players.size) || 0;
            let playerSockets = [];
            if (players) {
                let deadCount = 0;
                for (let player of players) {
                    let playerSocket = io.sockets.sockets.get(player);
                    playerSockets.push(playerSocket);
                    if (((_a = playerSocket === null || playerSocket === void 0 ? void 0 : playerSocket.data) === null || _a === void 0 ? void 0 : _a.dead) == true)
                        deadCount++;
                }
                if (deadCount === playersCount - 1) {
                    let wonId = playerSockets.find((player) => { var _a; return !((_a = player === null || player === void 0 ? void 0 : player.data) === null || _a === void 0 ? void 0 : _a.dead); });
                    io.in(currentRoom).emit('pre-game-ended');
                    matrixMap.delete(`${currentRoom}-started`);
                }
            }
        });
        socket.on('end-game', () => {
            let players = io.sockets.adapter.rooms.get(currentRoom);
            io.in(currentRoom).emit('game-ended', socket.id);
            if (!players)
                return;
            for (let player of players) {
                let playerSocket = io.sockets.sockets.get(player);
                playerSocket === null || playerSocket === void 0 ? void 0 : playerSocket.leave(currentRoom);
            }
        });
        // GAME END
        socket.on('disconnect', () => {
            console.log(`Socket disconnect: ${socket.id}`);
            if (currentRoom)
                socket.to(currentRoom).emit('player-left', socket.id);
            let players = io.sockets.adapter.rooms.get(currentRoom);
            if ((players === null || players === void 0 ? void 0 : players.size) == 0 || !players) {
                matrixMap.delete(currentRoom);
                matrixMap.delete(`${currentRoom}-started`);
            }
            socket.removeAllListeners();
        });
    });
    return io;
};
exports.ioServer = ioServer;
