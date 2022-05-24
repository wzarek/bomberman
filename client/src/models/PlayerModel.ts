class PlayerModel {
    private id: number
    private currentPlayer: boolean
    private playerElement: HTMLElement

    constructor(id_: number, currentPlayer_: boolean) {
        this.id = id_
        this.currentPlayer = currentPlayer_

        let player = document.createElement('div')
        player.classList.add('player')
        this.playerElement = player

        if (currentPlayer_) {
            document.addEventListener('keydown', (evt) => this.handleKeyDown(evt as KeyboardEvent))
            document.addEventListener('keyup', (evt) => this.handleKeyUp(evt as KeyboardEvent))
        }
    }

    private updatePosition() {

    }

    private canMove(direction: string) {
        let elVal1 = this.playerElement.getBoundingClientRect()
        let el2 = document.querySelector('#game-container') as HTMLElement
        let elVal2 = el2.getBoundingClientRect()
        switch (direction) {
            case 'left':
                return (elVal1.left >= elVal2.left)
            case 'right':
                return (elVal1.right <= elVal2.right)
            case 'up':
                return (elVal1.top >= elVal2.top)
            case 'down':
                return (elVal1.bottom <= elVal2.bottom)
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

    private handleKeyUp(evt: Event) {

    }

    public getPlayer() {
        return this.playerElement
    }
}

export default PlayerModel