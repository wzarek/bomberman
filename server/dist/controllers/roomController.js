"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Room {
    constructor(name_, playerID_, gameParameters_) {
        this.inGame = false;
        this.playerCounter = 0;
        this.players = [];
        this.name = name_;
        this.players.push(playerID_);
        this.playerCounter++;
        this.gameParameters = gameParameters_;
    }
    getName() {
        return this.name;
    }
    getNumberOfPlayers() {
        return this.playerCounter;
    }
    addPlayer(socket) {
        if (this.inGame)
            return { error: 'Game has started' };
        this.players.push(socket.id);
        this.playerCounter++;
    }
    removePlayer(socket) {
        this.players = this.players.filter((playerID) => { playerID !== socket.id; });
        this.playerCounter--;
    }
    setInGame() {
        this.inGame = true;
    }
    getInGame() {
        return this.inGame;
    }
}
exports.default = Room;
