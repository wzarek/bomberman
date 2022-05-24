import PlayerModel from "./PlayerModel"

class GameModel {
    private width: number
    private height: number
    private gameContainer: HTMLElement
    private players: Array<PlayerModel>
    private gameMatrix: Array<Array<HTMLElement>>
    private bombCooldown: number // sec

    constructor(width_: number = 30, height_: number = 15, cooldown_: number = 3, gameContainer_: string = "#game-container") {
        this.width = width_
        this.height = height_
        this.bombCooldown = cooldown_
        this.gameContainer = document.querySelector(gameContainer_) as HTMLElement
        this.players = []
        this.gameMatrix = new Array(width_).fill(0).map(() => new Array(height_).fill(0));
    }

    private setBlocks() {
        this.gameContainer.style.setProperty('--grid-width', this.width.toString())
        this.gameContainer.style.setProperty('--grid-height', this.height.toString())
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let gameBlock = document.createElement('div')
                gameBlock.classList.add('game-block')
                this.gameContainer.append(gameBlock)
                this.gameMatrix[i][j] = gameBlock
            }
        }
    }

    private spawnPlayers() {
        this.players.forEach((player, i) => {
            let currentPlayer = player.getPlayer()
            this.gameContainer.append(currentPlayer)
            switch (i) {
                case 0:
                    currentPlayer.style.top = '.15vw' // top left
                    currentPlayer.style.left = '.15vw'
                    break
                case 1:
                    currentPlayer.style.top = 'calc(100% - .15vw)' // bottom right
                    currentPlayer.style.left = 'calc(100% - .15vw)'
                    break
                case 2:
                    currentPlayer.style.top = '.15vw' // top right
                    currentPlayer.style.left = 'calc(100% - .15vw)'
                    break
                case 3:
                    currentPlayer.style.top = 'calc(100% - .15vw)' // bottom left
                    currentPlayer.style.left = '.15vw'
                    break
            }
        })
    }

    private areColliding(el1: HTMLElement, el2: HTMLElement) {
        let elVal1 = el1.getBoundingClientRect()
        let elVal2 = el2.getBoundingClientRect()

        return !((elVal1.bottom <= elVal2.top) ||
            (elVal1.top >= elVal2.bottom) ||
            (elVal1.right <= elVal2.left) ||
            (elVal1.left >= elVal2.right))
    };

    private getPlayerPosition() {
        let pl = this.players[0].getPlayer()
        this.gameMatrix.forEach((arr) => {
            arr.forEach((block) => {
                block?.classList?.toggle('colliding', this.areColliding(pl, block))
            })
        })
    }

    private startListeningToPlayerMoves() {
        setInterval(() => this.getPlayerPosition(), 100)
    }

    public initializeGame() {
        this.setBlocks()
        this.spawnPlayers()
        this.startListeningToPlayerMoves();
    }



    public addPlayer(player: PlayerModel) {
        this.players.push(player)
    }
}

export default GameModel