import GameModel from "./GameModel"

class BombModel {
    private gameModel: GameModel
    private location: HTMLElement = document.querySelector('#game-container') as HTMLElement

    private color: string
    private position: { [name: string]: string }

    private fromCurrentPlayer: boolean

    private timeToExplode: number // sec

    private bombElement: HTMLElement | null = null

    /**
     * Creates a bomb in specified location
     * @param gameModel_ is a game model needed for bomb-game communication
     * @param position_ is a bomb position(player position when he put a bomb)
     * @optional @param timeToExplode_ is a time value in seconds, after which bomb will explode
     */
    constructor(gameModel_: GameModel, position_: { [name: string]: string }, color_: string, fromCurrentPlayer_: boolean = false, timeToExplode_: number = 3) {
        this.gameModel = gameModel_
        this.position = position_
        this.color = color_
        this.fromCurrentPlayer = fromCurrentPlayer_
        this.timeToExplode = timeToExplode_

        this.spawnBomb()
    }

    private spawnBomb() {
        this.bombElement = document.createElement('div')
        this.bombElement.classList.add('bomb')
        this.location.appendChild(this.bombElement)
        this.bombElement.style.top = this.position['top']
        this.bombElement.style.left = this.position['left']
        this.bombElement.setAttribute('data-color', this.color)

        setTimeout(() => this.explode(), this.timeToExplode * 1000)
    }

    private explode() {
        this.bombElement?.remove()

        this.createFlames()
    }

    private areColliding(el1: HTMLElement, el2: HTMLElement) {
        let elVal1 = el1.getBoundingClientRect()
        let elVal2 = el2.getBoundingClientRect()

        return !((elVal1.bottom <= elVal2.top) ||
            (elVal1.top >= elVal2.bottom) ||
            (elVal1.right <= elVal2.left) ||
            (elVal1.left >= elVal2.right))
    }

    private checkFlamesCollision(flames: HTMLElement) {
        const bonuses = document.querySelectorAll('.game-block.bonus')
        bonuses.forEach((bonus) => {
            if (this.areColliding(flames, bonus as HTMLElement)) this.gameModel.handleBonus(bonus as HTMLElement)
        })
    }

    private createFlames() {
        let flames = document.createElement('div')
        flames.classList.add('flames')
        flames.style.width = '6em'
        flames.style.height = '6em'
        flames.style.top = `calc(${this.position['top']} - 2.5em)`
        flames.style.left = `calc(${this.position['left']} - 2.5em)`

        const animKeframes = [
            { transform: 'scale(0)' },
            { transform: 'scale(1)' }
        ]
        const animTiming = {
            duration: 100,
            iterations: 1,
        }

        this.location.appendChild(flames)
        flames.animate(animKeframes, animTiming)

        let flamesInterval: any = null

        if (this.fromCurrentPlayer) {
            flamesInterval = setInterval(() => {
                this.checkFlamesCollision(flames)
            }, 10)
        }

        setTimeout(() => {
            this.removeFlames(flames)
            flamesInterval && clearInterval(flamesInterval)
        }, 1000)

    }

    private removeFlames(flames: HTMLElement) {
        const animKeframes = [
            { opacity: 1 },
            { opacity: 0 }
        ]
        const animTiming = {
            duration: 100,
            iterations: 1,
        }
        flames.animate(animKeframes, animTiming)
        flames.remove()
    }
}

export default BombModel