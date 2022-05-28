import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import GameModel from '../models/GameModel'
import PlayerModel from '../models/PlayerModel'

type Props = {
    size: number,
    cooldown: number
}

const Game = () => {
    const params = useParams()
    const socket = io('http://localhost:3000/')

    useEffect(() => {
        let game = new GameModel()

        socket.on('connect', () => {
            game.addPlayer(new PlayerModel(game, socket.id, true))
            socket.emit('join-room', params.id)
            socket.emit('player-ready', params.id)
        })

        socket.on('players-in-room', (players: Array<string>) => {
            if (players.length > 0) {
                players.forEach((player: string) => {
                    game.addPlayer(new PlayerModel(game, player, false))
                })
                console.log(game)
            }
        })

        socket.on('player-joined', (id: string) => {
            game.addPlayer(new PlayerModel(game, id, false))
            console.log(`${id} joined the game`)
            console.log(game)
        })

        socket.on('player-left', (id: string) => {
            game.removePlayer(id)
            console.log(`${id} left the game`)
            console.log(game)
        })

        socket.on('start-game', () => {
            console.log('starting...')
            game.initializeGame()
        })

        socket.on('max-players-reached', () => {
            alert('Sorry, max players reached in this game')
        })
    }, [])


    return (
        <>
            <p>
                Game: {params.id}
            </p>
            <div id='game-container'>

            </div>
        </>
    )
}

export default Game
