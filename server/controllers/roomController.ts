import { Server, Socket } from 'socket.io'

export const getRooms = (io: Server) => {
    const rooms = Array.from(io.sockets.adapter.rooms).filter((r) => r[0].length <= 16)

    return rooms
}

export const inRoom = (socket: Socket) => {
    if (socket.request.session.user.room.length > 0) return true

    return false
} 

export const createRoom = (io: Server, socket: Socket, name: string) => {
    const rooms = getRooms(io)

    if (rooms.find(e => e[0] === name)) {
        return { error: 'That room already exists'}
    }

}

export const joinRoom = (io: Server, socket: Socket, name: string) => {
    const usersInRoom = io.sockets.adapter.rooms.get(name).size

    if (usersInRoom === 4) {
        return { error: "Room is full" }
    }

    if (inRoom(socket)) {
        const userRoom = socket.request.session.user.room
        socket.leave(userRoom)
    }

}

export const leaveRoom = (socket: Socket, name: string) =>  {
    socket.leave(name)
    socket.request.session.user.room = ''
}
