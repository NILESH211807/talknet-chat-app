const userSocketIDS = new Map();

const getSockets = (users = []) => {
    const socketIds = users
        .map((user) => userSocketIDS.get(user.toString()))
        .filter(socketId => socketId !== undefined);
    return socketIds;
}

module.exports = {
    userSocketIDS,
    getSockets
};