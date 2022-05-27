import { useEffect, useState } from 'react'
import { io } from 'socket.io-client' 
import { useParams } from 'react-router-dom'

const Room = () => {
    const params = useParams()

    useEffect(() => {
        
    }, [])

    return <h1>Room { params.name }</h1>
}

export default Room