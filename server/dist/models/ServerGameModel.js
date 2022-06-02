"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServerGameModel {
    /**
     * Generates a Game model
     * @optional @param width_  and
     * @param height_ are game dimensions (not working properly yet)
     * @param cooldown_ is a time value in seconds, bomb use cooldown for users
     */
    constructor(width_ = 30, height_ = 15, cooldown_ = 3, playerSpeed_ = 1) {
        this.width = width_;
        this.height = height_;
        this.bombCooldown = cooldown_;
        this.playerSpeed = playerSpeed_;
        this.gameMatrix = new Array(height_).fill(0).map(() => new Array(width_).fill('empty'));
        this.generateMatrix();
    }
    getRandomBlock() {
        let num = Math.random();
        if (num < 0.75)
            return 'empty'; //probability 0.75
        else if (num < 0.95)
            return 'wall'; // probability 0.2
        else
            return 'bonus'; //probability 0.05
    }
    generateMatrix() {
        for (let i = 1; i < this.height - 1; i++) {
            for (let j = 1; j < this.width - 1; j++) {
                this.gameMatrix[i][j] = this.getRandomBlock();
            }
        }
    }
    getMatrix() {
        return this.gameMatrix;
    }
}
exports.default = ServerGameModel;
