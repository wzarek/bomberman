import BombModel from "./BombModel"
import GameModel from "./GameModel"

class PlayerModel {
    private socket: any
    private id: string
    private gameModel: GameModel;
    private canInteract: boolean = false
    private gameStarted: boolean = false

    private currentPlayer: boolean
    private position: number
    private color: string = 'blue'
    private playerElement: HTMLElement

    private collisionGap: number = 0.25

    private playerSpeed: number
    private bombCooldown: number
    private canBomb: boolean = true
    private lives: number
    private damageTimer: any = null

    private gameElement: any = null // TODO - na konstruktorze dodajemy element gry, nie ustawiamy go sztywno w kodzie
    private listElement: HTMLElement
    private playerInListElement: HTMLElement | null = null

    private keyPressed: { [name: string]: boolean } = {}

    constructor(gameModel_: GameModel, id_: string, position_: number, currentPlayer_: boolean = false, socket_: any = null, playerSpeed_: number = 1, lives_: number = 3) {
        this.socket = socket_
        this.id = id_
        this.gameModel = gameModel_

        this.currentPlayer = currentPlayer_
        this.position = position_

        this.playerSpeed = playerSpeed_
        this.bombCooldown = 3
        this.lives = lives_

        this.listElement = document.querySelector('.game-playerlist') as HTMLElement
        this.appendPlayerInList()

        let player = document.createElement('div')
        player.classList.add('player')
        this.playerElement = player

        if (currentPlayer_) {
            document.addEventListener('keydown', (evt) => this.handleKeyDown(evt as KeyboardEvent))
            document.addEventListener('keypress', (evt) => this.handleKeyPress(evt as KeyboardEvent))
            document.addEventListener('keyup', (evt) => this.handleKeyUp(evt as KeyboardEvent))
        }
    }

    private appendPlayerInList() {
        let playerInList = document.createElement('div')
        playerInList.classList.add('playerlist-player')
        if (this.currentPlayer) playerInList.classList.add('current')

        let playerImage = document.createElement('div')
        playerImage.classList.add('playerlist-image')
        playerInList.appendChild(playerImage)

        let playerName = document.createElement('div')
        playerName.classList.add('playerlist-name')
        playerName.textContent = this.id
        playerInList.appendChild(playerName)

        let playerLives = document.createElement('div')
        playerLives.classList.add('playerlist-lives')
        playerLives.textContent = `Lives: ${this.lives}`
        playerInList.appendChild(playerLives)

        this.listElement.appendChild(playerInList)
        this.playerInListElement = playerInList
    }

    private appendCooldownsAndBonuses() {
        const playerCooldownsAndBonuses = document.querySelector('.game-player-info') as HTMLElement

        let playerInfo = document.createElement('p')
        playerInfo.textContent = 'Your info:'
        playerCooldownsAndBonuses.appendChild(playerInfo)

        let bombCdElement = document.createElement('div')
        bombCdElement.classList.add('bomb-cooldown-container')
        playerCooldownsAndBonuses.appendChild(bombCdElement)

        let bombCdAnimation = document.createElement('div')
        bombCdAnimation.classList.add('bomb-cooldown-animation')
        bombCdElement.appendChild(bombCdAnimation)

        let bombCdImage = document.createElement('div')
        bombCdImage.classList.add('bomb-cooldown-image')
        bombCdImage.setAttribute('data-color', this.color)
        bombCdElement.appendChild(bombCdImage)

        let playerSpeedContainer = document.createElement('div')
        playerSpeedContainer.classList.add('player-speed-container')
        playerCooldownsAndBonuses.appendChild(playerSpeedContainer)

        let playerSpeedValue = document.createElement('div')
        playerSpeedValue.classList.add('player-speed-value')
        playerSpeedContainer.appendChild(playerSpeedValue)
        playerSpeedValue.textContent = `Speed: ${this.playerSpeed}`

        let playerSpeedImage = document.createElement('div')
        playerSpeedImage.classList.add('player-speed-image')
        playerSpeedContainer.appendChild(playerSpeedImage)
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
        this.socket.emit('player-moved', { top: this.playerElement.style.top, left: this.playerElement.style.left })
    }

    private isColliding(direction: string) {
        const gameColliders = document.querySelectorAll('.game-block.wall, .game-block.bonus')
        let colliding = false
        gameColliders.forEach((collider) => {
            if (this.isCollidingWithElement(this.playerElement, collider as HTMLElement, direction)) {
                colliding = true
                console.log(collider)
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
                if (this.canMove('left')) {
                    let leftPosition = window.getComputedStyle(this.playerElement).getPropertyValue('left')
                    this.playerElement.style.left = `calc(${leftPosition} - ${this.playerSpeed * 0.25}vw)`
                }
                break
            case 'right':
                if (this.canMove('right')) {
                    let leftPosition = window.getComputedStyle(this.playerElement).getPropertyValue('left')
                    this.playerElement.style.left = `calc(${leftPosition} + ${this.playerSpeed * 0.25}vw)`
                }
                break
            case 'up':
                if (this.canMove('up')) {
                    let topPosition = window.getComputedStyle(this.playerElement).getPropertyValue('top')
                    this.playerElement.style.top = `calc(${topPosition} - ${this.playerSpeed * 0.25}vw)`
                }
                break
            case 'down':
                if (this.canMove('down')) {
                    let topPosition = window.getComputedStyle(this.playerElement).getPropertyValue('top')
                    this.playerElement.style.top = `calc(${topPosition} + ${this.playerSpeed * 0.25}vw)`
                }
                break
        }

        this.updatePosition()
    }

    private putBomb(position: { [name: string]: string }) {
        let bomb = new BombModel(this.gameModel, position, this.color, this.currentPlayer)

        this.socket.emit('player-bombed', position, this.color)
    }

    private tryBomb() {
        if (this.canBomb) {
            let cd = this.bombCooldown
            this.canBomb = false

            const cdAnimation = document.querySelector('.bomb-cooldown-animation') as HTMLElement
            const cdImage = document.querySelector('.bomb-cooldown-image') as HTMLElement

            cdAnimation.classList.add('cooldown-waiting-visible')
            cdImage.classList.add('cooldown-wait')

            let now = new Date().getTime()
            let countTo = now + (cd * 1000)
            let interval = setInterval(() => {
                now = new Date().getTime()
                let counter = (countTo - now) / 1000
                let counterForAnimation = 360 - (counter / cd) * 360
                cdAnimation.style.transform = `rotate(${counterForAnimation}deg)`
            }, 100)

            setTimeout(() => {
                this.canBomb = true
                clearInterval(interval)
                cdAnimation.classList.remove('cooldown-waiting-visible')
                cdImage.classList.remove('cooldown-wait')
            }, cd * 1000)

            this.putBomb({ top: this.playerElement.style.top, left: this.playerElement.style.left })
        }
    }

    private handleMoving() {
        if (this.keyPressed['ArrowLeft']) {
            this.startMoving('left')
        }
        if (this.keyPressed['ArrowRight']) {
            this.startMoving('right')
        }
        if (this.keyPressed['ArrowUp']) {
            this.startMoving('up')
        }
        if (this.keyPressed['ArrowDown']) {
            this.startMoving('down')
        }
    }

    private handleKeyDown(evt: KeyboardEvent) {
        if (!this.canInteract) return

        evt = evt || window.event
        this.keyPressed[evt.key] = true
        this.handleMoving()
    }

    private handleKeyUp(evt: KeyboardEvent) {
        if (!this.canInteract) return

        evt = evt || window.event
        delete this.keyPressed[evt.key]
        this.handleMoving()
    }

    private handleKeyPress(evt: KeyboardEvent) {
        if (!this.canInteract) return

        evt = evt || window.event
        if (evt.key === ' ') this.tryBomb()
    }


    private handleDead() {
        this.playerInListElement?.classList.add('dead')
        let playerLives = this.playerInListElement?.querySelector('.playerlist-lives') as HTMLElement
        playerLives.textContent = 'dead'
        this.removePlayerModel()
        if (this.currentPlayer) this.socket.emit('player-dead')
    }

    public startGame() {
        this.canInteract = true
        this.gameStarted = true
        if (this.currentPlayer) this.appendCooldownsAndBonuses()
    }

    public preventInteraction() {
        this.canInteract = false
    }

    public removeLife() {
        if (this.damageTimer == null) {
            const animKeframes = [
                { opacity: 0.25 },
                { opacity: 0.5 },
                { opacity: 0.25 },
                { opacity: 0.5 },
                { opacity: 0.25 },
                { opacity: 1 }
            ]
            const animTiming = {
                duration: 1000,
                iterations: 1,
            }
            this.playerElement.animate(animKeframes, animTiming)

            this.lives -= 1
            this.damageTimer = setTimeout(() => this.damageTimer = null, 1000)

            let playerLives = this.playerInListElement?.querySelector('.playerlist-lives') as HTMLElement
            playerLives.textContent = `Lives: ${this.lives}`

            if (this.currentPlayer) this.socket.emit('player-lost-hp')

            if (this.lives <= 0) this.handleDead()
        }
    }

    public removePlayerModel() {
        this.playerElement.remove()
    }

    public getPlayer() {
        return this.playerElement
    }

    public setBombCooldown(cd: number) {
        this.bombCooldown = cd
    }

    public increaseSpeed() {
        if (this.playerSpeed >= this.gameModel.getGameSpeed() + 2) return
        this.playerSpeed += 0.5
        const playerSpeedValue = document.querySelector('.player-speed-value') as HTMLElement
        playerSpeedValue.textContent = `Speed: ${this.playerSpeed}`
    }

    public decreaseBombCooldown() {
        if (this.bombCooldown <= 0.5) return
        this.setBombCooldown(this.bombCooldown - 0.5)
        console.log(this.bombCooldown)
    }

    public getPlayerLives() {
        return this.lives
    }

    public getPlayerId() {
        return this.id
    }

    public getPlayerStartingPosition() {
        return this.position
    }

    public setPlayerColor(colorToSet: string) {
        this.color = colorToSet
        this.playerElement.setAttribute('data-color', colorToSet)

        let playerImage = this.playerInListElement?.querySelector('.playerlist-image')
        playerImage?.setAttribute('data-color', colorToSet)
    }

    public setPlayerPosition(value: { [name: string]: string }) {
        this.playerElement.style.top = value['top']
        this.playerElement.style.left = value['left']
    }

    public isCurrent() {
        return this.currentPlayer
    }

    public emitBonus(el: HTMLElement, bonus: string) {
        let index = el.getAttribute('data-index')
        this.socket.emit('player-bonus', index, bonus)
    }

    public emitBonusCollision(index: string) {
        this.socket.emit('player-got-bonus', index)
    }

    public handleRemovePlayer() {
        let playerInfo = this.playerInListElement?.querySelector('.playerlist-lives') as HTMLElement
        playerInfo.textContent = 'disconnected'
        setTimeout(() => {
            this.playerInListElement?.remove()
        }, 1000)

        this.removePlayerModel()
    }
}

export default PlayerModel