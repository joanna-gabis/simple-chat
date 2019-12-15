const users = [];

const addUser = ({ id, username, room }) => {
    // clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    // validate
    if (!username || !room) {
        return { error: 'Please provide username and room' };
    }
    // check for exisiting user
    let existingUser = users.find(
        user => user.room === room && user.username === username
    );
    if (existingUser) {
        return { error: 'Username is taken' };
    }
    // store user
    const user = { id, username, room };
    users.push(user);
    return { user };
};

const removeUser = id => {
    let index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = id => users.find(user => user.id === id);

const getUsersInRoom = room => {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
