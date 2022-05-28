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
            socket.emit('join-room', params.id)
            socket.emit('player-ready', params.id)
        })

        socket.on('player-position', (position: number) => {
            game.addPlayer(new PlayerModel(game, socket.id, true, position))
        })

        socket.on('players-in-room', (players: Array<Array<any>>) => {
            if (players.length > 0) {
                players.forEach((player: Array<any>) => {
                    game.addPlayer(new PlayerModel(game, player[0], false, player[1]))
                })
                console.log(game)
            }
        })

        socket.on('player-joined', (id: string, position: number) => {
            game.addPlayer(new PlayerModel(game, id, false, position))
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
            // TODO - alert o tym, ze przekroczona zostala ilosc graczy w grze(chociaz to bedzie w lobby raczej w pozniejszej fazie)
            // ale za to mozna alert o tym, ze gracz nie nalezy do danego pokoju, wiec nie mozemy go dodac do gry
            // i dwa buttony - 'zostan i ogladaj gre', 'wyszukiwarka gier'
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
