import { useEffect, useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'

const Dashboard = () => {
    const [rooms, setRooms] = useState([])
    const navigate = useNavigate()

    const socket = io('http://localhost:3000', {
        withCredentials: true
    })

    const createGame = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const name = document.querySelector('input#game-name') as HTMLInputElement

        socket.emit('create-room-status', name?.value, { asd: 'a', ddd: 'a' })
        socket.on('send-information', (response: { [key: string]: string }) => {
            console.log(response)
            if (response?.status === 'OK') {
                navigate(`/room/${name?.value}`)
            }
        })
    }

    return (
        <main id='dashboard'>
            <h1>Dashboard </h1>
            <form onSubmit={e => createGame(e)} action="" className='create-room-form'>
                <h2>create room</h2>
                <div className='create-room-form-input'>
                    <label htmlFor="game-name">room name</label>
                    <input type="text" id='game-name' required></input>
                </div>
                <div className='create-room-form-input'>
                    <h3>choose game type</h3>
                    <div className="create-room-form-radio">
                        <input type="radio" id='normal' name='game-type' checked />
                        <label htmlFor="normal">normal</label>
                    </div>
                    <div className="create-room-form-radio">
                        <input type="radio" id='speed' name='game-type' />
                        <label htmlFor="speed">increased player speed</label>
                    </div>
                    <div className="create-room-form-radio">
                        <input type="radio" id='cooldown' name='game-type' />
                        <label htmlFor="cooldown">decreased bomb cooldown</label>
                    </div>
                    <div className="create-room-form-radio">
                        <input type="radio" id='fast' name='game-type' />
                        <label htmlFor="fast">fast game(increased speed, decreased cooldown)</label>
                    </div>
                </div>
                <button>create</button>
            </form>
            <div className="room-list">
                <h2>join room</h2>
                <div className="room-list-container">
                    <div className="room-list-single">
                        <a className='room-link' href="">
                            123
                        </a>
                        <span className='room-status'>
                            2/4
                        </span>
                    </div>
                    <div className="room-list-single">
                        <a className='room-link' href="">
                            abcd
                        </a>
                        <span className='room-status'>
                            1/4
                        </span>
                    </div>
                    <div className="room-list-single">
                        <a className='room-link' href="">
                            def
                        </a>
                        <span className='room-status'>
                            3/4
                        </span>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Dashboard
