class BombModel {
    private location: HTMLElement
    private timeToExplode: number // sec
    private bombElement: HTMLElement | null = null

    /**
     * Creates a bomb in specified location
     * @param location_ is an element, where bomb will be put into
     * @optional @param timeToExplode_ is a time value in seconds, after which bomb will explode
     */
    constructor(location_: HTMLElement, timeToExplode_: number = 3) {
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

    private createFlames() {
        let flames = document.createElement('div')
        flames.classList.add('flames')
        flames.style.width = '6em'
        flames.style.height = '6em'
        this.location.appendChild(flames)
        setTimeout(() => {
            flames.remove()
        }, 1000)
    }
}

export default BombModel