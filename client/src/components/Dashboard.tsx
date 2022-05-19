import React, { FormEvent } from 'react'
import { Socket } from 'socket.io-client'

type Props = {
    socket: Socket
}



const Dashboard = ({ socket }: Props) => {
    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nick = document.querySelector('input#nick') as HTMLInputElement
        const room = document.querySelector('input#room') as HTMLInputElement

        socket.emit('change-nick', nick?.value)
        socket.emit('join-room', room?.value)
    }

    return (
        <div className='game-dashboard'>
            <form onSubmit={(e) => joinRoom(e)} action="">
                <label htmlFor="nick">nickname</label>
                <input type="text" name='nick' id='nick' required />
                <label htmlFor="room">room</label>
                <input type="text" name='room' id='room' required />
                <button type='submit'>join</button>
            </form>
        </div>
    )
}

export default Dashboard

