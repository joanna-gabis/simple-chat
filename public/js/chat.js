const socket = io();

// Elements
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const submitMessageButton = messageForm.querySelector('button[type="submit"]');
const sendLocationButton = document.getElementById('sendLocation');
const messagesContainer = document.getElementById('messagesContainer');
// Templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const locationMessageTemplate = document.querySelector(
    '#locationMessageTemplate'
).innerHTML;

socket.on('renderMessage', message => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        timestamp: moment(message.createdAt).format('H:mm')
    });
    messagesContainer.insertAdjacentHTML('beforeend', html);
});

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

socket.on('renderLocation', location => {
    const html = Mustache.render(locationMessageTemplate, {
        url: location.url,
        timestamp: moment(location.createdAt).format('H:mm')
    });
    messagesContainer.insertAdjacentHTML('beforeend', html);
});
