const express = require('express')
const app = express()
const httpServer = require('http').createServer()

const io = require("socket.io")(httpServer, {
    cors: {
        origin: ['http://localhost:8080']
    }
})

io.on("connection", (socket) => {
    console.log(`user ${socket.id} connected`)
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)
    })

    socket.on('change-nick', (nick) => {
        socket.nick = nick;
        console.log(`${socket.id} changed his nick to ${socket.nick}`)
    })
    socket.on('join-room', (room) => {
        socket.join(room)
        console.log(`${socket.id} joined room ${room}`)
    })
})

httpServer.listen(3000, () => {
    console.log("Running")
})