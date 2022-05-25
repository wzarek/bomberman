import React, { useEffect, useState } from 'react'
import GameModel from '../models/GameModel'
import PlayerModel from '../models/PlayerModel'

type Props = {
    size: number,
    cooldown: number
}

const Game = () => {
    const [game, setGame]: [GameModel | undefined, any] = useState()
    const [players, setPlayers]: [Array<PlayerModel> | undefined, any] = useState()

    const currPlayer = new PlayerModel(1235, true)

    useEffect(() => {
        setGame(new GameModel())
        setPlayers([currPlayer, new PlayerModel(1236, false)])
    }, [])

    useEffect(() => {
        players?.forEach((player) => {
            game?.addPlayer(player)
        })
        const unsubscribe = game?.initializeGame()
        return unsubscribe
    }, [game, players])


    return (
        <>
            <p>
                Current lives: {currPlayer.getPlayerLives()}
            </p>
            <div id='game-container'>

            </div>
        </>
    )
}

export default Game
