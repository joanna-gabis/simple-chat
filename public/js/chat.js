const socket = io();

// socket.on('countUpdated', count => {
//   console.log('The count has been updated', count);
// });

// document.getElementById('increment').addEventListener('click', () => {
//   console.log('clicked');
//   socket.emit('increment');
// });

socket.on('renderMessage', message => console.log(message));

document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    let message = e.target.elements.message.value;
    socket.emit('sendMessage', message, () =>
        console.log('The message was delivered')
    );
});

document.getElementById('sendLocation').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Your browser does not support geolocation');
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            socket.emit('sendLocation', {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            });
        },
        e => console.log(e),
        {
            enableHighAccuracy: true,
            timeout: 20000
        }
    );
});
