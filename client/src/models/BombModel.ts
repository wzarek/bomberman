import GameModel from "./GameModel"

class BombModel {
    private gameModel: GameModel
    private location: HTMLElement
    private timeToExplode: number // sec
    private bombElement: HTMLElement | null = null

    /**
     * Creates a bomb in specified location
     * @param gameModel_ is a game model needed for bomb-game communication
     * @param location_ is an element, where bomb will be put into
     * @optional @param timeToExplode_ is a time value in seconds, after which bomb will explode
     */
    constructor(gameModel_: GameModel, location_: HTMLElement, timeToExplode_: number = 3) {
        this.gameModel = gameModel_
        this.location = location_
        this.timeToExplode = timeToExplode_

        this.spawnBomb()
    }

    private spawnBomb() {
        this.bombElement = document.createElement('div')
        this.bombElement.classList.add('bomb')
        this.location.appendChild(this.bombElement)
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
        this.location.appendChild(flames)
        setTimeout(() => {
            flames.remove()
        }, 1000)
        this.checkFlamesCollision(flames)
    }
}

export default BombModel