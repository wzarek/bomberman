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
        <main id='dashboard'>
            <h1>Dashboard </h1>
        </main>
    )
}

export default Dashboard
