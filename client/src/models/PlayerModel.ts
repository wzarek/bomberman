class PlayerModel {
    private id: number
    private currentPlayer: boolean
    private playerElement: HTMLElement
    private collisionGap: number = 0.25

    constructor(id_: number, currentPlayer_: boolean) {
        this.id = id_
        this.currentPlayer = currentPlayer_

        let player = document.createElement('div')
        player.classList.add('player')
        this.playerElement = player

        if (currentPlayer_) {
            document.addEventListener('keydown', (evt) => this.handleKeyDown(evt as KeyboardEvent))
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
        const gameCollidors = document.querySelectorAll('.game-block.wall, .game-block.bonus')
        let colliding = false
        gameCollidors.forEach((collidor) => {
            if (this.isCollidingWithElement(this.playerElement, collidor as HTMLElement, direction)) {
                colliding = true
                console.log(collidor)
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
                if (this.canMove('left')) this.playerElement.style.left = `calc(${this.playerElement.style.left} - 0.2vw)`
                break;
            case 'right':
                if (this.canMove('right')) this.playerElement.style.left = `calc(${this.playerElement.style.left} + 0.2vw)`
                break;
            case 'up':
                if (this.canMove('up')) this.playerElement.style.top = `calc(${this.playerElement.style.top} - 0.2vw)`
                break;
            case 'down':
                if (this.canMove('down')) this.playerElement.style.top = `calc(${this.playerElement.style.top} + 0.2vw)`
                break;
        }

        this.updatePosition()
    }

    private handleKeyDown(evt: KeyboardEvent) {
        evt = evt || window.event;
        switch (evt.key) {
            case 'ArrowLeft':
                this.startMoving('left')
                break;
            case 'ArrowRight':
                this.startMoving('right')
                break;
            case 'ArrowUp':
                this.startMoving('up')
                break;
            case 'ArrowDown':
                this.startMoving('down')
                break;
        }
    }

    public getPlayer() {
        return this.playerElement
    }
}

export default PlayerModel