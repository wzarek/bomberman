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
            <form onSubmit={e => createGame(e)} action="">
                <input type="text" id='game-name'></input>
                <button>create</button>
            </form>
        </main>
    )
}

export default Dashboard
