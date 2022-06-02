import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useParams, useNavigate } from 'react-router-dom'

const Room = () => {
    const params = useParams()
    const socket = io('http://localhost:3000/')
    const navigate = useNavigate()

    useEffect(() => {
        socket.emit('join-room-status', params.name)
        socket.on('send-information', (response: { [key: string]: string }) => {
            if (response?.status === 'ERROR') { 
                navigate('/dashboard')
                return
            }

            socket.emit('test-join-room', params.name)
        })
    }, [])

    return (
        <main>
            <h1>Room {params.name}</h1>
        </main>
    )
}

export default Room