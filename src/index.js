const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public/');

app.use(express.json());
// set up static directory
app.use(express.static(publicDirectoryPath));

// socket.emit - send event to a specific client
// io.emit - send event to every connected client
// socket.broadcast - send event to all other clients, except current
// io.to().emit - emit event to everyone in a specific room
// socket.broadcast.to().emit - send event to everyone in room except current client

io.on('connection', socket => {
    socket.on('join', ({ username, room }) => {
        socket.join(room);
        socket.emit('renderMessage', generateMessage('Welcome!'));
        socket.broadcast
            .to(room)
            .emit(
                'renderMessage',
                generateMessage(`${username} has joined the room`)
            );
    });

    socket.on('sendMessage', (messageToRender, callback) => {
        const filter = new Filter();
        if (filter.isProfane(messageToRender)) {
            return callback('Profanity is not allowed');
        }
        io.to().emit('renderMessage', generateMessage(messageToRender));
        callback();
    });

    socket.on('disconnect', () => {
        io.to().emit('renderMessage', generateMessage('user has left'));
    });

    socket.on('sendLocation', (positionObject, callback) => {
        socket
            .to()
            .emit(
                'renderLocation',
                generateLocationMessage(
                    `https://google.com/maps?q=${positionObject.lat},${positionObject.lon}`
                )
            );
        callback();
    });
});

server.listen(port, () => {
    console.log('server is up on port ' + port);
});
