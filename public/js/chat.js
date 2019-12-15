const socket = io()

// Elements
const messageForm = document.getElementById('messageForm')
const messageInput = document.getElementById('messageInput')
const submitMessageButton = messageForm.querySelector('button[type="submit"]')
const sendLocationButton = document.getElementById('sendLocation')
const messagesContainer = document.getElementById('messagesContainer')
// Templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessageTemplate').innerHTML
const sidebarTemplate = document.getElementById('sidebarTemplate').innerHTML
// Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const autoscroll = () => {
    let newMessage = messagesContainer.lastElementChild
    let newMessageMargin = parseInt(getComputedStyle(newMessage).marginBottom)
    let newMessageHeight = newMessage.offsetHeight + newMessageMargin

    let visibleHeight = messagesContainer.offsetHeight
    let containerHeight = messagesContainer.scrollHeight

    let scrollOffset = messagesContainer.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
}

socket.on('renderMessage', message => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        timestamp: moment(message.createdAt).format('H:mm')
    })
    messagesContainer.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('renderLocation', ({ username, url }) => {
    const html = Mustache.render(locationMessageTemplate, {
        username,
        url,
        timestamp: moment(location.createdAt).format('H:mm')
    })
    messagesContainer.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById('sidebar').innerHTML = html
})

messageForm.addEventListener('submit', e => {
    e.preventDefault()
    submitMessageButton.setAttribute('disabled', 'disabled')
    let message = e.target.elements.message.value
    socket.emit('sendMessage', message, error => {
        submitMessageButton.removeAttribute('disabled')
        if (error) {
            console.log(error)
        } else {
            messageInput.value = ''
        }
    })
})

sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Your browser does not support geolocation')
    }

    sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition(
        position => {
            socket.emit(
                'sendLocation',
                {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                },
                () => {
                    sendLocationButton.removeAttribute('disabled')
                }
            )
        },
        e => console.log(e),
        {
            enableHighAccuracy: true,
            timeout: 20000
        }
    )
})

// execute on page load
socket.emit('join', { username, room }, error => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
