const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public/');

app.use(express.json());
// set up static directory
app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
    socket.emit('renderMessage', 'welcome');
    socket.broadcast.emit('renderMessage', 'New user has joined');

    socket.on('sendMessage', messageToRender => {
        io.emit('renderMessage', messageToRender);
    });

    socket.on('disconnect', () => {
        io.emit('renderMessage', 'user has left');
    });

    socket.on('sendLocation', positionObject => {
        socket.broadcast.emit(
            'renderMessage',
            `https://google.com/maps?q=${positionObject.lat},${positionObject.lon}`
        );
    });
});

server.listen(port, () => {
    console.log('server is up on port ' + port);
});
