import PlayerModel from "./PlayerModel"

class GameModel {
    private width: number
    private height: number
    private gameContainer: HTMLElement
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
    constructor(width_: number = 30, height_: number = 15, cooldown_: number = 3, gameContainer_: string = "#game-container") {
        this.width = width_
        this.height = height_
        this.bombCooldown = cooldown_
        this.gameContainer = document.querySelector(gameContainer_) as HTMLElement
        this.tempMatrix = new Array(height_).fill(0).map(() => new Array(width_).fill('empty'));
        this.gameMatrix = new Array(height_).fill(0).map(() => new Array(width_).fill(0));
    }

    private areColliding(el1: HTMLElement, el2: HTMLElement) {
        let elVal1 = el1.getBoundingClientRect()
        let elVal2 = el2.getBoundingClientRect()

        return !((elVal1.bottom <= elVal2.top) ||
            (elVal1.top >= elVal2.bottom) ||
            (elVal1.right <= elVal2.left) ||
            (elVal1.left >= elVal2.right))
    }

    private getRandomBlock() {
        let num = Math.random();
        if (num < 0.75) return 'empty';  //probability 0.75
        else if (num < 0.95) return 'wall'; // probability 0.2
        else return 'bonus'; //probability 0.05
    }

    private generateMatrix() {
        for (let i = 1; i < this.height - 1; i++) {
            for (let j = 1; j < this.width - 1; j++) {
                this.tempMatrix[i][j] = this.getRandomBlock()
            }
        }
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
                    currentPlayer.style.top = 'calc(100% - 1.90vw)' // bottom right
                    currentPlayer.style.left = 'calc(100% - 1.90vw)'
                    break
                case 2:
                    currentPlayer.style.top = '.15vw' // top right
                    currentPlayer.style.left = 'calc(100% - 1.90vw)'
                    break
                case 3:
                    currentPlayer.style.top = 'calc(100% - 1.90vw)' // bottom left
                    currentPlayer.style.left = '.15vw'
                    break
            }
        })
    }

    private getPlayerPosition() {
        let pl = this.players[0].getPlayer()
        this.gameMatrix.forEach((arr) => {
            arr.forEach((block) => {
                block?.classList?.toggle('colliding', this.areColliding(pl, block))
            })
        })

        const flames = document.querySelectorAll('.flames')
        flames.forEach((flame) => {
            this.areColliding(pl, flame as HTMLElement) && this.players[0].removeLife();
        })

        const bonuses = document.querySelectorAll('.bonus-for-player')
        bonuses.forEach((bonus) => {
            if (this.areColliding(pl, bonus as HTMLElement)) {
                if (bonus.classList.contains('bonus-speed')) {
                    this.players[0].increaseSpeed()
                    bonus.remove()
                }
                else if (bonus.classList.contains('bonus-cd')) {
                    this.players[0].decreaseBombCooldown()
                    bonus.remove()
                }
            }
        })
    }

    private startListeningToPlayerMoves() {
        setInterval(() => this.getPlayerPosition(), 100)
    }

    private generateBonus() {
        let num = Math.random();

        if (num < 0.4) return 'empty';  //probability 0.4
        else if (num < 0.7) return 'speed'; // probability 0.3
        else return 'cooldown-reduction'; //probability 0.3
    }

    public handleBonus(el: HTMLElement) {
        el.classList.remove('bonus')
        let bonusType = this.generateBonus()
        if (bonusType === 'empty') return;

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
    }

    public initializeGame() {
        this.generateMatrix()
        this.setBlocks()
        this.spawnPlayers()
        this.startListeningToPlayerMoves();

        this.gameStarted = true;
    }

    public addPlayer(player: PlayerModel) {
        if (this.gameStarted) return;
        this.players.push(player)
    }

    public removePlayer(id: string) {
        this.players = this.players.filter((value: PlayerModel) => (value.getPlayerId() != id))
    }
}

export default GameModel