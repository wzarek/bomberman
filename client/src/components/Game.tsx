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
    const [waiting, setWaiting] = useState(true)
    const params = useParams()
    const socket = io('http://localhost:3000/')

    useEffect(() => {
        let game = new GameModel()

        socket.on('connect', () => {
            socket.emit('join-room', params.id)
        })

        // WAITING

        socket.on('game-matrix', (matrix: Array<Array<string>>) => {
            game.setGameMatrix(matrix)
        })

        socket.on('player-position', (position: number) => {
            game.addPlayer(new PlayerModel(game, socket.id, position, true, socket))
            socket.emit('player-ready', params.id)
        })

        socket.on('players-in-room', (players: Array<Array<any>>) => {
            if (players.length > 0) {
                players.forEach((player: Array<any>) => {
                    game.addPlayer(new PlayerModel(game, player[0], player[1]))
                })
                console.log(game)
            }
        })

        socket.on('player-joined', (id: string, position: number) => {
            game.addPlayer(new PlayerModel(game, id, position))
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
            setWaiting(false)
            game.initializeGame()
        })

        // GAME

        socket.on('move-player', (id: string, position: { [name: string]: string }) => {
            let playerToMove = game.getPlayerById(id)
            playerToMove?.setPlayerPosition(position)
        })

        // PLAYER NOT IN CURRENT GAME

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
                {waiting ? <h2>Waiting for players...</h2> : <></>}
            </div>
        </>
    )
}

export default Game
