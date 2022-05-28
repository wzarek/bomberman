import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const Room = () => {
    const params = useParams()
    const socket = io('http://localhost:3000/')

    useEffect(() => {
        socket.on('connect', () => { console.log(socket.connected) })
    }, [])

    return <h1>Room {params.name}</h1>
}

export default Room