import { Server, Socket } from 'socket.io'

class Room {
    private name: string
    private inGame: boolean = false
    private playerCounter: number = 0
    private players: Array<string> = []
    private gameParameters: { [name: string]: string | number }

    constructor(name_ : string, playerID_: string, gameParameters_: {[name: string]: string | number}) {
        this.name = name_
        this.players.push(playerID_)
        this.gameParameters = gameParameters_
    }

    public getName() {
        return this.name
    }

    public getNumberOfPlayers() {
        return this.playerCounter
    }

    public addPlayer(socket: Socket) {
        if (this.inGame) return { error: 'Game has started'}

        this.players.push(socket.request.session.user.username)
        this.playerCounter++
    }

    public removePlayer(socket: Socket) {
        this.players = this.players.filter((playerID: string) => { playerID !== socket.request.session.user.username })
        this.playerCounter--
    }

    public setInGame() {
        this.inGame = true
    }

    public getInGame() {
        return this.inGame
    }

}

export default Room 