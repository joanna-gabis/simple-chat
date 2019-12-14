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

io.on('connection', socket => {
    socket.emit('renderMessage', generateMessage('Welcome!'));
    socket.broadcast.emit(
        'renderMessage',
        generateMessage('New user has joined')
    );

    socket.on('sendMessage', (messageToRender, callback) => {
        const filter = new Filter();
        if (filter.isProfane(messageToRender)) {
            return callback('Profanity is not allowed');
        }
        io.emit('renderMessage', generateMessage(messageToRender));
        callback();
    });

    socket.on('disconnect', () => {
        io.emit('renderMessage', generateMessage('user has left'));
    });

    socket.on('sendLocation', (positionObject, callback) => {
        socket.emit(
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
