const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public/')

app.use(express.json())
// set up static directory
app.use(express.static(publicDirectoryPath))

// socket.emit - send event to a specific client
// io.emit - send event to every connected client
// socket.broadcast - send event to all other clients, except current
// io.to().emit - emit event to everyone in a specific room
// socket.broadcast.to().emit - send event to everyone in room except current client

io.on('connection', socket => {
    socket.on('join', (opt, callback) => {
        const { error, user } = addUser({ id: socket.id, ...opt })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('renderMessage', generateMessage('Admin', 'Welcome!'))

        socket.broadcast
            .to(user.room)
            .emit(
                'renderMessage',
                generateMessage(
                    user.username,
                    `${user.username} has joined the room`
                )
            )

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (messageToRender, callback) => {
        const filter = new Filter()
        if (filter.isProfane(messageToRender)) {
            return callback('Profanity is not allowed')
        }
        let user = getUser(socket.id)
        io.to(user.room).emit(
            'renderMessage',
            generateMessage(user.username, messageToRender)
        )
        callback()
    })

    socket.on('disconnect', () => {
        let user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit(
                'renderMessage',
                generateMessage(
                    user.username,
                    `${user.username} has left the room`
                )
            )
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (positionObject, callback) => {
        let user = getUser(socket.id)
        io.to(user.room).emit(
            'renderLocation',
            generateLocationMessage(
                user.username,
                `https://google.com/maps?q=${positionObject.lat},${positionObject.lon}`
            )
        )
        callback()
    })
})

server.listen(port, () => {
    console.log('server is up on port ' + port)
})
