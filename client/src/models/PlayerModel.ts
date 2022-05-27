import BombModel from "./BombModel"

class PlayerModel {
    private id: number
    private currentPlayer: boolean
    private playerElement: HTMLElement
    private collisionGap: number = 0.25
    private playerSpeed: number
    private bombCooldown: number = 3
    private bombTimeout: any = null
    private lives: number

    constructor(id_: number, currentPlayer_: boolean, playerSpeed_: number = 1, lives_: number = 3) {
        this.id = id_
        this.currentPlayer = currentPlayer_
        this.playerSpeed = playerSpeed_
        this.lives = lives_

        let player = document.createElement('div')
        player.classList.add('player')
        this.playerElement = player

        if (currentPlayer_) {
            document.addEventListener('keydown', (evt) => this.handleKeyDown(evt as KeyboardEvent))
            document.addEventListener('keypress', (evt) => this.handleKeyPress(evt as KeyboardEvent))
        }
    }

    private isCollidingWithElement(el1: HTMLElement, el2: HTMLElement, direction: string = '') {
        let elVal1 = el1.getBoundingClientRect()
        let elVal2 = el2.getBoundingClientRect()

        switch (direction) {
            case 'left':
                return ((elVal1.left <= elVal2.right) && (elVal1.right > elVal2.right) && (elVal1.bottom >= elVal2.top) && (elVal1.top <= elVal2.bottom))
            case 'right':
                return ((elVal1.right >= elVal2.left) && (elVal1.left < elVal2.left) && (elVal1.bottom >= elVal2.top) && (elVal1.top <= elVal2.bottom))
            case 'up':
                return ((elVal1.top <= elVal2.bottom) && (elVal1.bottom > elVal2.bottom) && (elVal1.left <= elVal2.right) && (elVal1.right >= elVal2.left))
            case 'down':
                return ((elVal1.bottom >= elVal2.top) && (elVal1.top < elVal2.top) && (elVal1.left <= elVal2.right) && (elVal1.right >= elVal2.left))
            default:
                return !((elVal1.bottom <= elVal2.top) ||
                    (elVal1.top >= elVal2.bottom) ||
                    (elVal1.right <= elVal2.left) ||
                    (elVal1.left >= elVal2.right))
        }
    }

    private updatePosition() {

    }

    private isColliding(direction: string) {
        const gameColliders = document.querySelectorAll('.game-block.wall, .game-block.bonus, .flames')
        let colliding = false
        gameColliders.forEach((collider) => {
            if (this.isCollidingWithElement(this.playerElement, collider as HTMLElement, direction)) {
                if (collider.classList.contains('flames')) {
                    this.removeLife()
                } else colliding = true
            }
        })
        return colliding
    }

    private canMove(direction: string) {
        let elVal1 = this.playerElement.getBoundingClientRect()
        let el2 = document.querySelector('#game-container') as HTMLElement
        let elVal2 = el2.getBoundingClientRect()
        switch (direction) {
            case 'left':
                return !this.isColliding(direction) && (elVal1.left >= elVal2.left)
            case 'right':
                return !this.isColliding(direction) && (elVal1.right <= elVal2.right)
            case 'up':
                return !this.isColliding(direction) && (elVal1.top >= elVal2.top)
            case 'down':
                return !this.isColliding(direction) && (elVal1.bottom <= elVal2.bottom)
        }
    }

    private startMoving(direction: string) {
        switch (direction) {
            case 'left':
                if (this.canMove('left')) this.playerElement.style.left = `calc(${this.playerElement.style.left} - ${this.playerSpeed * 0.25}vw)`
                break
            case 'right':
                if (this.canMove('right')) this.playerElement.style.left = `calc(${this.playerElement.style.left} + ${this.playerSpeed * 0.25}vw)`
                break
            case 'up':
                if (this.canMove('up')) this.playerElement.style.top = `calc(${this.playerElement.style.top} - ${this.playerSpeed * 0.25}vw)`
                break
            case 'down':
                if (this.canMove('down')) this.playerElement.style.top = `calc(${this.playerElement.style.top} + ${this.playerSpeed * 0.25}vw)`
                break
        }

        this.updatePosition()
    }

    private isOnBlock(pl: HTMLElement, el: HTMLElement) {
        let elVal = el.getBoundingClientRect()
        let playerVal = pl.getBoundingClientRect()
        return ((playerVal.bottom <= elVal.top) ||
            (playerVal.top >= elVal.bottom) ||
            (playerVal.right <= elVal.left) ||
            (playerVal.left >= elVal.right))
    }

    private whereToBomb() {
        const gameColliders = document.querySelectorAll('.game-block.empty.colliding') as NodeListOf<HTMLElement>
        let el = null
        gameColliders.forEach((collider) => {
            this.isOnBlock(this.playerElement, collider as HTMLElement) && (el = collider)
        })
        return el
    }

    private putBomb(el: HTMLElement) {
        let bomb = new BombModel(el)
    }

    private tryBomb() {
        if (!this.bombTimeout) {
            let block = this.whereToBomb()
            if (block) {
                this.putBomb(block as HTMLElement)
            }
            this.bombTimeout = setTimeout(() => this.bombTimeout = null, this.bombCooldown * 1000)
        }
    }

    private handleKeyDown(evt: KeyboardEvent) {
        evt = evt || window.event
        switch (evt.key) {
            case 'ArrowLeft':
                evt.preventDefault()
                this.startMoving('left')
                break
            case 'ArrowRight':
                evt.preventDefault()
                this.startMoving('right')
                break
            case 'ArrowUp':
                evt.preventDefault()
                this.startMoving('up')
                break
            case 'ArrowDown':
                evt.preventDefault()
                this.startMoving('down')
                break
        }
    }

    private handleKeyPress(evt: KeyboardEvent) {
        evt.stopImmediatePropagation();
        evt = evt || window.event
        switch (evt.key) {
            case ' ':
                evt.preventDefault()
                this.tryBomb()
                break
        }
    }

    private removeLife() {
        const animKeframes = [
            { opacity: 0.5 },
            { opacity: 0.75 },
            { opacity: 0.5 },
            { opacity: 0.75 },
            { opacity: 0.5 },
            { opacity: 1 }
        ]
        const animTiming = {
            duration: 1000,
            iterations: 1,
        }
        this.playerElement.animate(animKeframes, animTiming)
        if (this.lives > 0) {
            this.lives -= 1
        } else this.handleDead()
    }

    private handleDead() {
        alert(`Player ${this.id} lost!`)
    }

    public getPlayer() {
        return this.playerElement
    }

    public setBombCooldown(cd: number) {
        this.bombCooldown = cd
    }

    public getPlayerLives() {
        return this.lives
    }
}

export default PlayerModel