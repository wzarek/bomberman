import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const Dashboard = () => {

    const connect = () => {
        const socket = io('http://localhost:3000', {
            withCredentials: true
        })

        console.log(socket)
    }

    useEffect(() => {
        connect()
    }, [])

    return (
        <div className='dashboard'>
            <h1>Dashboard </h1>
        </div>
    )
}

export default Dashboard
