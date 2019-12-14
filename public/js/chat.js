const socket = io();

const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const submitMessageButton = messageForm.querySelector('button[type="submit"]');
const sendLocationButton = document.getElementById('sendLocation');

socket.on('renderMessage', message => console.log(message));

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    submitMessageButton.setAttribute('disabled', 'disabled');
    let message = e.target.elements.message.value;
    socket.emit('sendMessage', message, error => {
        submitMessageButton.removeAttribute('disabled');
        if (error) {
            console.log(error);
        } else {
            messageInput.value = '';
            console.log('The message was delivered');
        }
    });
});

sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Your browser does not support geolocation');
    }

    sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(
        position => {
            socket.emit(
                'sendLocation',
                {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                },
                () => {
                    sendLocationButton.removeAttribute('disabled');
                    console.log('Location shared');
                }
            );
        },
        e => console.log(e),
        {
            enableHighAccuracy: true,
            timeout: 20000
        }
    );
});
