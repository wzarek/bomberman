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

    useEffect(() => {
        let currGame = new GameModel()
        setGame(currGame)
        setPlayers([new PlayerModel(currGame as GameModel, 1235, true), new PlayerModel(currGame as GameModel, 1236, false)])
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
                Current lives: 3
            </p>
            <div id='game-container'>

            </div>
        </>
    )
}

export default Game
