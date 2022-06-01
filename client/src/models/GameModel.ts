import PlayerModel from "./PlayerModel"

class GameModel {
    private width: number
    private height: number
    private gameContainer: HTMLElement
    private gameWrapper: HTMLElement = document.querySelector('.game-wrapper') as HTMLElement
    private playerList: HTMLElement = document.querySelector('.game-playerlist') as HTMLElement

    private gameStarted: boolean = false;

    private players: Array<PlayerModel> = []

    private tempMatrix: Array<Array<string>>
    private gameMatrix: Array<Array<HTMLElement>>

    private bombCooldown: number // sec

    /**
     * Generates a Game model
     * @optional @param width_  and
     * @param height_ are game dimensions (not working properly yet)
     * @param cooldown_ is a time value in seconds, bomb use cooldown for users
     * @param gameContainer_ is a selector for game main container
     */
    constructor(gameStarted_: boolean = false, players_: { [name: string]: string } = {}, width_: number = 30, height_: number = 15, cooldown_: number = 3, gameContainer_: string = "#game-container") {
        this.width = width_
        this.height = height_
        this.bombCooldown = cooldown_
        this.gameContainer = document.querySelector(gameContainer_) as HTMLElement // TODO - dla bezpieczenstwa stylizacji(element nie musi miec id game-container) dodajemy data-game='container' i po tym robimy cssa
        this.tempMatrix = new Array(height_).fill(0).map(() => new Array(width_).fill('empty'))
        this.gameMatrix = new Array(height_).fill(0).map(() => new Array(width_).fill(0))
    }

    private areColliding(el1: HTMLElement, el2: HTMLElement) {
        let elVal1 = el1.getBoundingClientRect()
        let elVal2 = el2.getBoundingClientRect()

        return !((elVal1.bottom <= elVal2.top) ||
            (elVal1.top >= elVal2.bottom) ||
            (elVal1.right <= elVal2.left) ||
            (elVal1.left >= elVal2.right))
    }

    private setBlocks() {
        this.gameContainer.style.setProperty('--grid-width', this.width.toString())
        this.gameContainer.style.setProperty('--grid-height', this.height.toString())
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let gameBlock = document.createElement('div')
                gameBlock.classList.add('game-block')
                gameBlock.classList.add(this.tempMatrix[i][j])
                this.gameContainer.append(gameBlock)
                this.gameMatrix[i][j] = gameBlock

                gameBlock.setAttribute('data-index', `[${i}, ${j}]`)

                if (i === 0 && j === 0) gameBlock.style.borderTopLeftRadius = '1em'
                else if (i === 0 && j === this.width - 1) gameBlock.style.borderTopRightRadius = '1em'
                else if (i === this.height - 1 && j === 0) gameBlock.style.borderBottomLeftRadius = '1em'
                else if (i === this.height - 1 && j === this.width - 1) gameBlock.style.borderBottomRightRadius = '1em'
            }
        }
    }

    private spawnPlayers() {
        let playerSize = '1.75em'
        this.players.forEach((player) => {
            let currentPlayer = player.getPlayer()
            this.gameContainer.append(currentPlayer)
            switch (player.getPlayerStartingPosition()) {
                case 1:
                    // top left
                    currentPlayer.style.top = '.5em'
                    currentPlayer.style.left = '.5em'
                    player.setPlayerColor('blue')
                    break
                case 2:
                    // bottom right
                    currentPlayer.style.top = `calc(100% - ${playerSize} - .5em)`
                    currentPlayer.style.left = `calc(100% - ${playerSize} - .5em)`
                    player.setPlayerColor('gold')
                    break
                case 3:
                    // top right
                    currentPlayer.style.top = '.5em'
                    currentPlayer.style.left = `calc(100% - ${playerSize} - .5em)`
                    player.setPlayerColor('green')
                    break
                case 4:
                    // bottom left
                    currentPlayer.style.top = `calc(100% - ${playerSize} - .5em)`
                    currentPlayer.style.left = '.5em'
                    player.setPlayerColor('red')
                    break
            }
        })
    }

    private getPlayerPosition() {
        let player = this.getCurrentPlayer() as PlayerModel
        let pl = player.getPlayer()
        this.gameMatrix.forEach((arr) => {
            arr.forEach((block) => {
                block?.classList?.toggle('colliding', this.areColliding(pl, block))
            })
        })

        const flames = document.querySelectorAll('.flames')
        flames.forEach((flame) => {
            this.areColliding(pl, flame as HTMLElement) && player.removeLife();
        })

        const bonuses = document.querySelectorAll('.bonus-for-player')
        bonuses.forEach((bonus) => {
            if (this.areColliding(pl, bonus as HTMLElement)) {
                if (bonus.classList.contains('bonus-speed')) {
                    player.increaseSpeed()
                    bonus.remove()
                }
                else if (bonus.classList.contains('bonus-cd')) {
                    player.decreaseBombCooldown()
                    bonus.remove()
                }
            }
        })
    }

    private startListeningToPlayerMoves() {
        setInterval(() => this.getPlayerPosition(), 100) // FOR DEBUGGING
    }

    private generateBonus() {
        let num = Math.random()

        if (num < 0.4) return 'empty' //probability 0.4
        else if (num < 0.7) return 'speed' // probability 0.3
        else return 'cooldown-reduction' //probability 0.3
    }

    public handleBonus(el: HTMLElement | string, bonus?: string) {
        if (typeof (el) === 'string') el = document.querySelector(`[data-index='${el}']`) as HTMLElement
        el.classList.remove('bonus')
        let bonusType = bonus || this.generateBonus()
        if (bonusType === 'empty') return

        let bonusElement = document.createElement('div')
        bonusElement.classList.add('bonus-for-player')

        switch (bonusType) {
            case 'speed':
                bonusElement.classList.add('bonus-speed')
                break;
            case 'cooldown-reduction':
                bonusElement.classList.add('bonus-cd')
                break;
        }
        el.appendChild(bonusElement)

        if (!bonus) this?.getCurrentPlayer()?.emitBonus(el, bonusType)
    }

    public initializeGame() {
        if (this.gameStarted) return

        // this.generateMatrix()
        this.setBlocks()
        this.spawnPlayers()
        this.startListeningToPlayerMoves()

        this.gameStarted = true
    }

    public getCurrentPlayer() {
        return this.players.find((player) => player.isCurrent())
    }

    public getPlayerById(id: string) {
        return this.players.find((player) => player.getPlayerId() === id)
    }

    public setGameMatrix(matrix: Array<Array<string>>) {
        this.tempMatrix = matrix
    }

    public addPlayer(player: PlayerModel) {
        if (this.gameStarted) return
        this.players.push(player)
    }

    public removePlayer(id: string) {
        this.players = this.players.filter((value: PlayerModel) => {
            if (value.getPlayerId() == id) value.handleRemovePlayer()
            return value.getPlayerId() != id
        })
    }

    public handleGameEnd(id: string) {
        let winner = this.getPlayerById(id)
        if (winner?.isCurrent()) alert(`You won! Game ended.`)
        else alert(`Player ${id} won! Game ended.`)
        this.gameWrapper.innerHTML = '<p>Game ended :( <a href="/">return to dashboard</a></p>'
        this.playerList?.remove()
    }
}

export default GameModel