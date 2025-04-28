const userSocketIds = new Map();

const getSockets = (users = []) => {
    const sockets = users.map((user) =>
        userSocketIds.get(user.id.toString()));
    return sockets;
}

module.exports = {
    userSocketIds,
    getSockets
};